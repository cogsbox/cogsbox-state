'use-client';

import {
  createCogsState,
  type StateObject,
} from '../../../../../src/CogsState';

import { FlashWrapper } from '../../FlashOnUpdate';
import DotPattern from '../../DotWrapper';
import { faker } from '@faker-js/faker';

import { useEffect, useState, memo, useRef } from 'react';

import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { CodeSnippetDisplay } from '../../CodeSnippet';

// =================================================================
// TYPES & MOCK API (No Changes Here)
// =================================================================

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

const fetchMessagesWithCursor = async ({
  pageParam = 0,
}): Promise<{ messages: Message[]; nextCursor: number; pageParam: number }> => {
  await new Promise((resolve) =>
    setTimeout(resolve, 150 + Math.random() * 200)
  );
  let newMessages: Message[] =
    pageParam === 0
      ? [...serverMessages]
      : serverMessages.filter((msg) => msg.timestamp > pageParam);
  const lastTimestamp =
    newMessages.length > 0
      ? Math.max(...newMessages.map((m) => m.timestamp))
      : pageParam;
  return {
    messages: newMessages,
    nextCursor: lastTimestamp,
    pageParam: pageParam,
  };
};

const addMessage = async (
  messageData: Omit<Message, 'id' | 'timestamp'>
): Promise<Message> => {
  await new Promise((resolve) =>
    setTimeout(resolve, 1200 + Math.random() * 300)
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
    const newMessage: Message = {
      id: messageIdCounter++,
      author: faker.helpers.arrayElement([
        'Alice',
        'Bob',
        'Charlie',
        'Diana',
        'Eve',
      ]),
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

// =================================================================
// COGSSTATE & DATA FETCHER (No Changes Here)
// =================================================================

const defaultState = {
  messages: [] as Message[],
};
export type ChatState = {
  messages: Message[];
};
export const { useCogsState } = createCogsState<ChatState>(defaultState, {
  validation: { key: 'chatApp' },
});

const fetchNewMessagesSince = async (timestamp: number): Promise<Message[]> => {
  return serverMessages.filter((msg) => msg.timestamp > timestamp);
};

function DataFetcher() {
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(0);
  const [serverState, setServerState] = useState<any>({});
  const { data: initialData, isSuccess: isInitialLoadSuccess } =
    useInfiniteQuery({
      queryKey: ['messages', 'history'],
      queryFn: fetchMessagesWithCursor,
      initialPageParam: 0,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    });

  const { data: newMessages } = useQuery({
    queryKey: ['messages', 'updates', lastSyncTimestamp],
    queryFn: () => fetchNewMessagesSince(lastSyncTimestamp),
    refetchInterval: 2000,
    enabled: isInitialLoadSuccess && lastSyncTimestamp > 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isInitialLoadSuccess && initialData) {
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

  useEffect(() => {
    if (newMessages && newMessages.length > 0) {
      setServerState({
        status: 'success',
        data: newMessages,
        merge: { strategy: 'append', key: 'id' },
      });
      const maxTimestamp = Math.max(...newMessages.map((m) => m.timestamp));
      setLastSyncTimestamp(maxTimestamp);
    }
  }, [newMessages]);

  useCogsState('messages', {
    serverState: serverState,
  });

  return null;
}

// =================================================================
// NEW SELF-CONTAINED INPUT COMPONENT (THE FIX)
// =================================================================

// This new component contains the mutation logic.
// It will re-render itself when the mutation is pending, but its parent won't.
function MessageInputWithMutation({
  scrollToBottom,
}: {
  scrollToBottom: (options?: any) => void;
}) {
  const [text, setText] = useState('');
  const messages = useCogsState('messages', { reactiveType: 'none' });

  const sendMessageMutation = useMutation({
    mutationFn: addMessage,
    onMutate: async (newMessageData: Omit<Message, 'id' | 'timestamp'>) => {
      const optimisticMessage = {
        ...newMessageData,
        id: `optimistic-${Date.now()}`,
        timestamp: Date.now(),
      };
      messages.insert(optimisticMessage);
      return { optimisticMessage };
    },
    onSuccess: (savedMessage, _variables, context) => {
      if (!context?.optimisticMessage) return;
      messages
        .stateFind((msg) => msg.id === context.optimisticMessage.id)
        ?.update(savedMessage)
        .synced();
    },
    onError: (_error, _variables, context) => {
      if (context?.optimisticMessage) {
        console.error('Failed to send message. Rolling back.');
        messages
          .stateFind((msg) => msg.id === context.optimisticMessage.id)
          ?.cut();
      }
    },
  });

  const handleSend = () => {
    if (!text.trim() || sendMessageMutation.isPending) return;

    sendMessageMutation.mutate({
      author: 'You',
      text: text.trim(),
      photo: null,
    });

    scrollToBottom({ behavior: 'smooth' });
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
          placeholder="Type a message..."
          disabled={sendMessageMutation.isPending}
        />
        <button
          onClick={handleSend}
          className="px-4 py-1.5 bg-green-800 text-white rounded hover:bg-green-700 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={sendMessageMutation.isPending}
        >
          {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

// =================================================================
// MAIN UI COMPONENTS (Refactored)
// =================================================================

const MemoizedChatWindow = memo(function ChatWindow() {
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
            {virtualState.stateList((setter) => (
              <FlashWrapper key={setter._path.join('.')} showCounter={true}>
                <MessageItem message={setter} />
              </FlashWrapper>
            ))}
          </div>
        </div>
      </div>
      {/* Use the new, self-contained component */}
      <MessageInputWithMutation scrollToBottom={scrollToBottom} />
    </>
  );
});

function MessageItem({ message }: { message: StateObject<Message> }) {
  // This component remains unchanged and performant
  const author = message.author.get();
  const isFromYou = author === 'You';
  const [isVisible, setIsVisible] = useState(false);

  const bubbleClasses = `flex flex-col max-w-[75%] px-3 py-2 rounded-lg shadow-md ${
    isFromYou
      ? message.getStatus() === 'dirty'
        ? 'bg-orange-800 rounded-br-none'
        : 'bg-green-800 rounded-br-none'
      : 'bg-gray-700 rounded-bl-none'
  }`;

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      className={`w-full flex items-end gap-2 ${
        isFromYou ? 'justify-end' : 'justify-start'
      } transition-opacity duration-100 ${
        isVisible ? 'opacity-100' : 'opacity-20'
      }
     `}
    >
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
          </p>{' '}
          {message.getStatus()}
        </div>
      </div>
    </div>
  );
}

export default function VirtualizedChatExample() {
  // This parent component is now STABLE. It has no knowledge of the mutation.
  const [autoMessagesEnabled, setAutoMessagesEnabled] = useState(true);

  useEffect(() => {
    if (autoMessagesEnabled) startAutoMessages(3000);
    return () => stopAutoMessages();
  }, [autoMessagesEnabled]);

  return (
    <>
      <FlashWrapper>
        <DataFetcher />
        <div className="gap-4 text-green-400 h-screen p-4">
          <DotPattern>
            <div className="px-8 py-4">
              <h1 className="text-2xl font-bold text-gray-200 mb-3">
                High-Performance Virtual Scrolling
              </h1>
              <div className="text-sm text-gray-200 pr-12 leading-relaxed space-y-2 max-w-4xl">
                <p>
                  This demonstration shows virtual scrolling that renders only
                  visible items from a slice of the full array, enabling smooth
                  performance with thousands of messages. The demo simulates
                  normal database operations using React Query using it's
                  optimisitic update pattern - new messages appear immediately
                  with temporary IDs, then get replaced when the server
                  responds. This approach maintains responsive UI interaction
                  while handling network latency. Using Cogsbox-sync would make
                  this process even easier.
                </p>
              </div>
            </div>
          </DotPattern>
          <div className="flex gap-4 mt-6">
            <div className="w-3/5 flex flex-col gap-3">
              <MemoizedChatWindow />
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
              </div>
            </div>
            <div className="w-2/5 space-y-4">
              {' '}
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
            </div>
          </div>
        </div>
      </FlashWrapper>
    </>
  );
}
