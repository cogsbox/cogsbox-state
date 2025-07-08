'use client';

import {
  createCogsState,
  type StateObject,
} from '../../../../../src/CogsState';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FlashWrapper } from '../../FlashOnUpdate';
import DotPattern from '../../DotWrapper';
import { faker } from '@faker-js/faker';
import { useEffect, useState } from 'react';

import { CodeSnippetDisplay } from '../../CodeSnippet';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { getGlobalStore } from '../../../../../src/store';

type Message = {
  id: number | string;
  author: string;
  text: string;
  timestamp: number;
  photo: string | null;
};

// Mock server state
let serverMessages: Message[] = [];
let messageIdCounter = 1;
let autoMessageInterval: NodeJS.Timeout | null = null;

const generateMessages = (count: number): Message[] => {
  const messages: Message[] = [];
  const authors = Array.from({ length: 15 }, () => faker.person.firstName());
  for (let i = 0; i < count; i++) {
    messages.push({
      id: messageIdCounter++,
      author: faker.helpers.arrayElement(authors),
      text: faker.lorem.sentence({ min: 3, max: 25 }),
      photo: Math.random() > 0.8 ? faker.image.avatar() : null,
      timestamp: Date.now() - (count - i) * 60000,
    });
  }
  return messages;
};

// ========================================================================= //
// ========= MOCK API REFACTORED FOR CURSOR-BASED PAGINATION =============== //
// ========================================================================= //

/**
 * Mocks an API endpoint for fetching messages.
 * Works with a timestamp-based cursor for infinite loading.
 */
const fetchMessagesWithCursor = async ({
  pageParam = 0, // pageParam is our timestamp cursor. 0 means initial load.
}): Promise<{ messages: Message[]; nextCursor: number; pageParam: number }> => {
  // <-- Update the return type
  console.log(`Fetching messages with cursor (timestamp): ${pageParam}`);
  await new Promise((resolve) =>
    setTimeout(resolve, 150 + Math.random() * 200)
  );

  let newMessages: Message[];
  if (pageParam === 0) {
    // Initial fetch: return all existing messages.
    newMessages = [...serverMessages];
  } else {
    // Subsequent fetch: return only messages newer than the cursor.
    newMessages = serverMessages.filter((msg) => msg.timestamp > pageParam);
  }

  const lastTimestamp =
    newMessages.length > 0
      ? Math.max(...newMessages.map((m) => m.timestamp))
      : pageParam;

  return {
    messages: newMessages,
    nextCursor: lastTimestamp,
    pageParam: pageParam, // <-- ADD THIS. This makes the input cursor available in getNextPageParam
  };
};
// ========================================================================= //

const addMessage = async (
  messageData: Omit<Message, 'id' | 'timestamp'>
): Promise<Message> => {
  await new Promise((resolve) =>
    setTimeout(resolve, 200 + Math.random() * 300)
  );
  const newMessage: Message = {
    ...messageData,
    id: messageIdCounter++,
    timestamp: Date.now(),
  };
  serverMessages.push(newMessage);
  return newMessage;
};

const startAutoMessages = (interval: number) => {
  if (autoMessageInterval) clearInterval(autoMessageInterval);
  autoMessageInterval = setInterval(() => {
    const authors = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    const newMessage: Message = {
      id: messageIdCounter++,
      author: faker.helpers.arrayElement(authors),
      text: faker.lorem.sentence({ min: 3, max: 25 }),
      photo: Math.random() > 0.8 ? faker.image.avatar() : null,
      timestamp: Date.now(),
    };
    serverMessages.push(newMessage);
  }, interval);
};

const stopAutoMessages = () => {
  if (autoMessageInterval) {
    clearInterval(autoMessageInterval);
    autoMessageInterval = null;
  }
};

serverMessages = generateMessages(70);

const defaultState = {
  messages: [] as Message[],
};
export type ChatState = {
  messages: Message[];
};
export const { useCogsState } = createCogsState<ChatState>(defaultState, {
  validation: { key: 'chatApp' },
});
// ========================================================================= //
// ============ THE CORRECT, STANDARD HYBRID DATA FETCHER ================== //
// ========================================================================= //
const fetchNewMessagesSince = async (timestamp: number): Promise<Message[]> => {
  // No fake delay needed for this one, it should be fast.
  return serverMessages.filter((msg) => msg.timestamp > timestamp);
};
function DataFetcher() {
  // This state tracks the timestamp of the newest message we know about.
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(0);

  // --- JOB 1: Initial Load ---
  // useInfiniteQuery handles the one-time initial load. It has NO polling.
  const { data: initialData, isSuccess: isInitialLoadSuccess } =
    useInfiniteQuery({
      queryKey: ['messages', 'history'], // A different key to separate it from the poller
      queryFn: fetchMessagesWithCursor,
      initialPageParam: 0,
      // We only need the first page on load. This hook is now dormant.
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      // CRITICAL: We only want this to run ONCE on load.
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    });

  // --- JOB 2: Live Updates ---
  // A simple useQuery polls for ONLY new messages. It's lightweight.
  const { data: newMessages } = useQuery({
    queryKey: ['messages', 'updates', lastSyncTimestamp],
    queryFn: () => fetchNewMessagesSince(lastSyncTimestamp),
    // Standard polling. This is the correct tool for this job.
    refetchInterval: 2000,
    // Only run this query after the initial load has finished and set a timestamp.
    enabled: isInitialLoadSuccess && lastSyncTimestamp > 0,
    refetchOnWindowFocus: false,
  });

  // --- STATE SYNCHRONIZATION ---

  // Effect 1: Handle the initial data load.
  // This runs only ONCE after the `useInfiniteQuery` succeeds.
  useEffect(() => {
    if (isInitialLoadSuccess && initialData) {
      // Flatten the initial pages into a single array.
      const allInitialMessages = initialData.pages.flatMap((p) => p.messages);

      if (allInitialMessages.length > 0) {
        // Update our state with the initial batch.
        getGlobalStore.getState().setServerStateUpdate('messages', {
          status: 'success',
          data: allInitialMessages,
          merge: { strategy: 'replace', key: 'id' },
        });

        // IMPORTANT: Set the timestamp of the newest message. This "activates"
        // the polling `useQuery` to start checking for updates from this point forward.
        const maxTimestamp = Math.max(
          ...allInitialMessages.map((m) => m.timestamp)
        );
        setLastSyncTimestamp(maxTimestamp);
      }
    }
  }, [isInitialLoadSuccess, initialData]);

  // Effect 2: Handle appending live updates.
  // This runs whenever the polling `useQuery` successfully finds new messages.
  useEffect(() => {
    if (newMessages && newMessages.length > 0) {
      // Update our state by APPENDING the new messages.
      getGlobalStore.getState().setServerStateUpdate('messages', {
        status: 'success',
        data: newMessages, // Just the small array of new messages
        merge: { strategy: 'append', key: 'id' },
      });

      // Advance our timestamp so we don't fetch these messages again.
      const maxTimestamp = Math.max(...newMessages.map((m) => m.timestamp));
      setLastSyncTimestamp(maxTimestamp);
    }
  }, [newMessages]);

  return null;
}

export default function VirtualizedChatExample() {
  // UI controls state
  const [autoMessagesEnabled, setAutoMessagesEnabled] = useState(true);
  const [optimisticUpdates, setOptimisticUpdates] = useState(true);

  // Mutation is a user action, so it stays here.
  const sendMessageMutation = useMutation({ mutationFn: addMessage });

  // Auto messages for simulation
  useEffect(() => {
    if (autoMessagesEnabled) startAutoMessages(3000);
    return () => stopAutoMessages();
  }, [autoMessagesEnabled]);

  return (
    <>
      <DataFetcher />

      <div className="gap-4 text-green-400 h-screen p-4">
        <DotPattern>
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-200">
              Isolated Data Fetching Demo
            </h1>
            <p className="text-sm text-gray-400 pr-12 leading-relaxed">
              An invisible `<DataFetcher />` component fetches data and uses the
              `messages.insert()` method to surgically update the state store
              without re-rendering the main UI component.
            </p>
          </div>
        </DotPattern>

        <div className="flex gap-4">
          <div className="w-3/5 flex flex-col gap-3">
            <ChatWindow
              sendMessage={sendMessageMutation.mutate}
              optimisticUpdates={optimisticUpdates}
            />
          </div>
          <div className="w-2/5">
            {/* ShowState or other components go here */}
          </div>
        </div>
      </div>
    </>
  );
}

// --- Chat Window Component ---
function ChatWindow({
  sendMessage,
  optimisticUpdates,
}: {
  sendMessage: (data: Omit<Message, 'id' | 'timestamp'>) => void;
  optimisticUpdates: boolean;
}) {
  const messages = useCogsState('messages', { reactiveType: 'none' });
  const messageCount = messages.get().length;

  const { virtualState, virtualizerProps, scrollToBottom } =
    messages.useVirtualView({
      itemHeight: 65,
      overscan: 10,
      stickToBottom: true,
    });

  if (messageCount === 0 && !virtualizerProps) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>No messages yet. Start a conversation!</p>
      </div>
    );
  }

  return (
    <>
      <div
        {...virtualizerProps.outer}
        className="flex flex-col max-h-[800px] bg-[#1a1a1a] border border-gray-700 rounded overflow-hidden"
      >
        <div className="min-h-[600px]" style={virtualizerProps.inner.style}>
          <div
            style={virtualizerProps.list.style}
            className="px-4 space-y-4 pb-8"
          >
            {virtualState.stateList((setter) => {
              return (
                <FlashWrapper showCounter={true}>
                  <MessageItem key={setter._path.join('.')} message={setter} />
                </FlashWrapper>
              );
            })}
          </div>
        </div>
      </div>
      <MessageInput
        scrollToBottom={scrollToBottom}
        sendMessage={sendMessage}
        optimisticUpdates={optimisticUpdates}
      />
    </>
  );
}
// MessageItem component remains the same
function MessageItem({ message }: { message: StateObject<Message> }) {
  const author = message.author.get();
  const isFromYou = author === 'You';

  const [isVisible, setIsVisible] = useState(false);

  const containerClasses = `w-full flex items-end gap-2 ${
    isFromYou ? 'justify-end' : 'justify-start'
  } transition-opacity duration-100 ${
    isVisible ? 'opacity-100' : 'opacity-20'
  }`;

  const bubbleClasses = `flex flex-col max-w-[75%] px-3 py-2 rounded-lg shadow-md ${
    isFromYou ? 'bg-green-800 rounded-br-none' : 'bg-gray-700 rounded-bl-none'
  }`;

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={containerClasses}>
      {!isFromYou && (
        <div className="w-8 h-8 rounded-full bg-gray-600 text-gray-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {author.charAt(0)}
        </div>
      )}
      <div className={bubbleClasses}>
        {!isFromYou && (
          <p className="font-bold text-green-400 text-xs">{author}</p>
        )}
        <div className="flex items-center gap-2">
          <p className="text-gray-100 text-sm leading-snug">
            {message.text.get()}
          </p>
          <p
            className={`text-xs ${
              isFromYou ? 'text-green-200/60' : 'text-gray-400'
            } flex-shrink-0`}
          >
            {new Date(message.timestamp.get()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        {message.photo.get() && (
          <img
            src={message.photo.get()!}
            className="w-full rounded-lg max-h-[300px] object-cover"
          />
        )}
      </div>
    </div>
  );
}
// Updated MessageInput
function MessageInput({
  scrollToBottom,
  sendMessage,
  optimisticUpdates,
}: {
  scrollToBottom: (a?: any) => void;
  sendMessage: (data: Omit<Message, 'id' | 'timestamp'>) => void;
  optimisticUpdates: boolean;
}) {
  const [text, setText] = useState('');
  const messages = useCogsState('messages', { reactiveType: 'none' });

  const handleSend = async () => {
    if (!text.trim()) return;

    const messageData = {
      author: 'You',
      text: text.trim(),
      photo: null,
    };

    if (optimisticUpdates) {
      // Add to local state immediately (optimistic update)
      messages.insert(({ uuid }) => ({
        ...messageData,
        id: uuid,
        timestamp: Date.now(),
      }));
      scrollToBottom('instant');
    }

    setText('');
  };

  return (
    <div className="p-3 border-t border-gray-700 bg-black/20">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-grow px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder={`Type a message... (${optimisticUpdates ? 'Optimistic' : 'Server-first'} mode)`}
        />
        <button
          onClick={handleSend}
          className="px-4 py-1.5 bg-green-800 text-white rounded hover:bg-green-700 text-sm font-semibold transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
// Updated ShowState to show incremental sync info
function ShowState({
  layout = 'horizontal',
  isInitialLoading,
  isPolling,
  pollingInterval,
  optimisticMode,
  lastSync,
}: {
  layout?: 'horizontal' | 'vertical';
  isInitialLoading: boolean;
  isPolling: boolean;
  pollingInterval: number;
  optimisticMode: boolean;
  lastSync: number;
}) {
  const messages = useCogsState('messages');
  const status = messages.getStatus();

  const containerClasses =
    layout === 'vertical'
      ? 'flex flex-col h-full gap-4'
      : 'flex gap-4 items-center';

  return (
    <FlashWrapper>
      <div className={containerClasses}>
        <CodeSnippetDisplay
          code={`// Polling for new messages
  const { data: newMessages } = useQuery({
    queryKey: ['messages', 'new', ${lastSync}],
    queryFn: () => getMessagesSince(${lastSync}),
    refetchInterval: ${pollingInterval}
  });

  // Fire a global state event with a merge instruction
  if (newMessages) {
    getGlobalStore.getState().setServerStateUpdate('messages', {
      status: 'success',
      data: newMessages, // <-- ONLY the new data
      merge: {
        strategy: 'append',
        key: 'id'
      }
    });
  }`}
        />
        <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-gray-700 rounded p-3 overflow-hidden h-full">
          <h3 className="text-gray-400 uppercase tracking-wider text-xs pb-2 mb-2 border-b border-gray-700">
            Incremental Sync State
          </h3>
          <div className="flex-grow overflow-auto">
            <SyntaxHighlighter
              language="javascript"
              style={atomOneDark}
              customStyle={{ backgroundColor: 'transparent', fontSize: '12px' }}
            >
              {`// Incremental Update Pattern
  const messages = useCogsState('messages');

  // Current Status: ${status}
  // Message Count: ${messages.get().length}
  // Update Mode: ${optimisticMode ? 'OPTIMISTIC' : 'SERVER-FIRST'}
  // Polling Interval: ${pollingInterval}ms
  // Last Sync: ${lastSync ? new Date(lastSync).toLocaleTimeString() : 'Never'}

  // State: ${
    isInitialLoading
      ? 'Loading initial messages...'
      : isPolling
        ? 'Checking for new messages...'
        : 'Idle'
  }

  // How it works:
  // 1. Load all messages once on mount.
  // 2. Poll server for messages newer than lastSync.
  // 3. Dispatch a 'SERVER_STATE_UPDATE' event with a "merge" instruction.
  // 4. CogsState merges new data, avoiding a full re-render.
  // 5. State stays 'synced' - no dirty state!`}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
}
