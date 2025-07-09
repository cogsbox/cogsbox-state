'use client';

import {
  createCogsState,
  type StateObject,
} from '../../../../../src/CogsState';

import { FlashWrapper } from '../../FlashOnUpdate';
import DotPattern from '../../DotWrapper';
import { faker } from '@faker-js/faker';
import { useEffect, useState } from 'react';

import { CodeSnippetDisplay } from '../../CodeSnippet';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';

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
  const [serverState, setServerState] = useState<any>({});
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
        setServerState({
          status: 'success',
          data: allInitialMessages,
          merge: { strategy: 'replace', key: 'id' },
        });

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
      setServerState({
        status: 'success',
        data: newMessages, // Just the small array of new messages
        merge: { strategy: 'append', key: 'id' },
      });
      // Advance our timestamp so we don't fetch these messages again.
      const maxTimestamp = Math.max(...newMessages.map((m) => m.timestamp));
      setLastSyncTimestamp(maxTimestamp);
    }
  }, [newMessages]);

  useCogsState('messages', {
    serverState: serverState,
  });

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
            <h1 className="text-2xl font-bold text-gray-200 mb-3">
              Virtual Scrolling with useVirtualView
            </h1>
            <div className="text-sm text-gray-400 pr-12 leading-relaxed space-y-3 max-w-4xl">
              <p>
                <span className="text-green-400 font-semibold">
                  useVirtualView
                </span>{' '}
                is a powerful hook built into CogsState that enables
                high-performance virtual scrolling for large lists. Unlike
                traditional rendering that creates DOM nodes for every item,
                virtual scrolling only renders what's visible in the viewport
                plus a small buffer.
              </p>
              <p>
                This demo showcases a chat application with{' '}
                <span className="text-green-400">thousands of messages</span>{' '}
                that:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Renders only ~15-20 messages at a time (visible + overscan)
                </li>
                <li>
                  Maintains smooth 60fps scrolling even with 10,000+ items
                </li>
                <li>
                  Auto-scrolls to bottom for new messages (with smart user
                  scroll detection)
                </li>
                <li>Handles dynamic item heights and image loading</li>
                <li>Works seamlessly with CogsState's reactive system</li>
              </ul>
              <p className="text-gray-500">
                Try sending messages or enabling auto-messages to see the
                virtualizer in action. Notice how only visible messages flash
                green when they update, demonstrating the efficiency of virtual
                rendering.
              </p>
            </div>
          </div>
        </DotPattern>

        <div className="flex gap-4 mt-6">
          <div className="w-3/5 flex flex-col gap-3">
            <ChatWindow
              sendMessage={sendMessageMutation.mutate}
              optimisticUpdates={optimisticUpdates}
            />

            {/* Controls */}
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2 text-gray-400">
                <input
                  type="checkbox"
                  checked={autoMessagesEnabled}
                  onChange={(e) => setAutoMessagesEnabled(e.target.checked)}
                  className="rounded"
                />
                Auto-generate messages
              </label>
              <label className="flex items-center gap-2 text-gray-400">
                <input
                  type="checkbox"
                  checked={optimisticUpdates}
                  onChange={(e) => setOptimisticUpdates(e.target.checked)}
                  className="rounded"
                />
                Optimistic updates
              </label>
            </div>
          </div>

          <div className="w-2/5 space-y-4">
            <CodeSnippetDisplay
              title="Basic Setup"
              code={`// 1. Create your state with an array
const { useCogsState } = createCogsState({
  messages: [] as Message[]
});

// 2. Use the virtual view hook
function ChatWindow() {
  const messages = useCogsState('messages');
  
  const { 
    virtualState,      // Virtual slice of your array
    virtualizerProps,  // Props for container elements
    scrollToBottom    // Utility function
  } = messages.useVirtualView({
    itemHeight: 65,     // Estimated height per item
    overscan: 10,       // Buffer items outside viewport
    stickToBottom: true // Auto-scroll behavior
  });

  return (
    <div {...virtualizerProps.outer}>
      <div {...virtualizerProps.inner}>
        <div {...virtualizerProps.list}>
          {virtualState.stateList((message) => (
            <MessageItem message={message} />
          ))}
        </div>
      </div>
    </div>
  );
}`}
            />

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
              <h4 className="text-green-400 font-semibold mb-2">
                Performance Benefits
              </h4>
              <div className="text-xs text-gray-400 space-y-1">
                <p>
                  • <span className="text-green-400">Memory:</span> Only ~20 DOM
                  nodes instead of thousands
                </p>
                <p>
                  • <span className="text-green-400">CPU:</span> React only
                  re-renders visible items
                </p>
                <p>
                  • <span className="text-green-400">Scrolling:</span> Native
                  browser performance
                </p>
                <p>
                  • <span className="text-green-400">Updates:</span> O(1)
                  instead of O(n) for new items
                </p>
              </div>
            </div>
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
        className="flex flex-col max-h-[600px] bg-[#1a1a1a] border border-gray-700 rounded overflow-hidden"
      >
        <div className="min-h-[500px]" style={virtualizerProps.inner.style}>
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
      messages.insert(({ uuid }) => ({
        ...messageData,
        id: uuid,
        timestamp: Date.now(),
      }));
      scrollToBottom('instant');
    } else {
      sendMessage(messageData);
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
          placeholder={`Type a message... `}
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
