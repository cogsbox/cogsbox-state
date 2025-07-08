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
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
} from '@tanstack/react-query';
import { getGlobalStore } from '../../../../../src/store'; // <-- IMPORT THIS

// --- Data Generation & State Definition ---

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

// NEW: Get initial messages (one time load)
const getInitialMessages = async (): Promise<Message[]> => {
  await new Promise((resolve) =>
    setTimeout(resolve, 100 + Math.random() * 200)
  );
  return [...serverMessages];
};

// NEW: Get only messages newer than a timestamp
const getMessagesSince = async (sinceTimestamp: number): Promise<Message[]> => {
  await new Promise((resolve) =>
    setTimeout(resolve, 100 + Math.random() * 100)
  );
  return serverMessages.filter((msg) => msg.timestamp > sinceTimestamp);
};

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

// Initialize server with some messages
serverMessages = generateMessages(70);

// Default state - empty or minimal data for instant render
const defaultState = {
  messages: [] as Message[],
};

export type ChatState = {
  messages: Message[];
};

export const { useCogsState } = createCogsState<ChatState>(defaultState, {
  validation: { key: 'chatApp' },
});
// --- Invisible Data Fetcher Component ---
// This component has its own `useCogsState` hook and is completely self-contained.
// --- Invisible Data Fetcher Component (CORRECTED) ---
// This component has its own `useCogsState` hook and is completely self-contained.

function DataFetcher() {
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(0);

  // QUERY 1: Initial load
  const { data: initialMessages, isSuccess: isInitialSuccess } = useQuery({
    queryKey: ['messages', 'initial'],
    queryFn: getInitialMessages,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // QUERY 2: Polling for new messages
  const { data: newMessages } = useQuery({
    queryKey: ['messages', 'new', lastSyncTimestamp],
    queryFn: () => getMessagesSince(lastSyncTimestamp),
    refetchInterval: 1000,
    enabled: lastSyncTimestamp > 0, // Correct: only poll after initial load
    refetchOnWindowFocus: false,
  });

  // EFFECT 1: Set the initial timestamp to enable polling
  useEffect(() => {
    // This runs only once after the initial data is successfully fetched.
    if (isInitialSuccess && initialMessages && lastSyncTimestamp === 0) {
      const maxTimestamp =
        initialMessages.length > 0
          ? Math.max(...initialMessages.map((m) => m.timestamp))
          : Date.now();
      setLastSyncTimestamp(maxTimestamp);
    }
  }, [initialMessages, isInitialSuccess, lastSyncTimestamp]);

  // EFFECT 2: Update the timestamp when new messages arrive from polling
  useEffect(() => {
    if (newMessages && newMessages.length > 0) {
      const maxTimestamp = Math.max(...newMessages.map((m) => m.timestamp));
      // Ensure we only move the timestamp forward
      if (maxTimestamp > lastSyncTimestamp) {
        setLastSyncTimestamp(maxTimestamp);
      }
    }
  }, [newMessages, lastSyncTimestamp]);

  useCogsState('messages', {
    reactiveType: 'none',
    // Handle the polled updates (incremental merge)
    serverState: {
      status: 'success',
      data: newMessages,
      merge: { strategy: 'append', key: 'id' }, // Use the library's merge feature
    },
  });

  // This component renders absolutely nothing.
  return null;
}
// --- Controls Panel Component (UNCHANGED) ---
function ControlsPanel({
  pollingInterval,
  setPollingInterval,
  autoMessagesEnabled,
  setAutoMessagesEnabled,
  autoMessageInterval,
  setAutoMessageInterval,
  optimisticUpdates,
  setOptimisticUpdates,
  status,
  messageCount,
  isInitialLoading,
  isPolling,
}: {
  pollingInterval: number;
  setPollingInterval: (value: number) => void;
  autoMessagesEnabled: boolean;
  setAutoMessagesEnabled: (value: boolean) => void;
  autoMessageInterval: number;
  setAutoMessageInterval: (value: number) => void;
  optimisticUpdates: boolean;
  setOptimisticUpdates: (value: boolean) => void;
  status: string;
  messageCount: number;
  isInitialLoading: boolean;
  isPolling: boolean;
}) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4">
      <h3 className="text-lg font-semibold text-gray-200 mb-3">Controls</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Polling Controls */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            Check for new messages: {pollingInterval}ms
          </label>
          <input
            type="range"
            min="500"
            max="5000"
            step="250"
            value={pollingInterval}
            onChange={(e) => setPollingInterval(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Auto Messages */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoMessagesEnabled}
              onChange={(e) => setAutoMessagesEnabled(e.target.checked)}
              className="rounded"
            />
            <label className="text-sm text-gray-400">Auto Messages</label>
          </div>
          {autoMessagesEnabled && (
            <div>
              <label className="text-xs text-gray-500">
                Interval: {autoMessageInterval}ms
              </label>
              <input
                type="range"
                min="1000"
                max="10000"
                step="500"
                value={autoMessageInterval}
                onChange={(e) => setAutoMessageInterval(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Message Mode */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={optimisticUpdates}
              onChange={(e) => setOptimisticUpdates(e.target.checked)}
              className="rounded"
            />
            <label className="text-sm text-gray-400">Optimistic Updates</label>
          </div>
          <div className="text-xs text-gray-500">
            {optimisticUpdates
              ? 'Messages appear immediately'
              : 'Wait for server confirmation'}
          </div>
        </div>
      </div>

      {/* Status Display */}
      <div className="mt-4 pt-3 border-t border-gray-700 flex justify-between items-center text-sm">
        <div className="flex gap-4">
          <span className="text-gray-400">
            Status: <span className="text-green-400">{status}</span>
          </span>
          <span className="text-gray-400">
            Messages: <span className="text-blue-400">{messageCount}</span>
          </span>
        </div>
        <div className="flex gap-2">
          {isInitialLoading && (
            <span className="text-yellow-400">🔄 Loading initial</span>
          )}
          {isPolling && (
            <span className="text-orange-400">👀 Checking for new</span>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Application Component ---

export default function VirtualizedChatExample() {
  // UI controls state
  const [autoMessagesEnabled, setAutoMessagesEnabled] = useState(true);
  const [optimisticUpdates, setOptimisticUpdates] = useState(true);

  // Just get the state object. The DataFetcher populates it.
  const messages = useCogsState('messages', { reactiveType: 'none' });

  // Mutation is a user action, so it stays here.
  const sendMessageMutation = useMutation({ mutationFn: addMessage });
  console.log('hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh');
  // Auto messages for simulation
  useEffect(() => {
    if (autoMessagesEnabled) startAutoMessages(3000);
    return () => stopAutoMessages();
  }, [autoMessagesEnabled]);

  const status = messages.getStatus();
  const messageCount = messages.get().length;

  // You need a top-level QueryClientProvider to make useQuery work anywhere

  return (
    <>
      {/* The DataFetcher is now just another component, not a parent. It has no UI. */}
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

        <ControlsPanel
          pollingInterval={1000}
          setPollingInterval={() => {}}
          autoMessagesEnabled={autoMessagesEnabled}
          setAutoMessagesEnabled={setAutoMessagesEnabled}
          autoMessageInterval={3000}
          setAutoMessageInterval={() => {}}
          optimisticUpdates={optimisticUpdates}
          setOptimisticUpdates={setOptimisticUpdates}
          status={status}
          messageCount={messageCount}
          isInitialLoading={messageCount === 0 && status !== 'synced'}
          isPolling={true}
        />

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

// --- Loading and Error States ---
function LoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading messages from server...</p>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-2">Failed to load messages</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
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
  console.log('messages', messages);
  const { virtualState, virtualizerProps, scrollToBottom } =
    messages.useVirtualView({
      itemHeight: 65,
      overscan: 10,
      stickToBottom: true,
    });

  if (messageCount === 0 && !virtualizerProps) {
    // Added guard for virtualizerProps
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
            {virtualState.stateList((setter, index, array) => {
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

    // Send to server via React Query mutation
    try {
      await sendMessage(messageData);
      if (!optimisticUpdates) {
        scrollToBottom('instant');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
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
