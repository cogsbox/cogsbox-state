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
import { useEffect, useLayoutEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { CodeSnippetDisplay } from '../../CodeSnippet';

// --- Data Generation & State Definition ---

type Message = {
  id: number | string;
  author: string;
  text: string;
  timestamp: number;
  photo: string | null;
};

const generateMessages = (count: number): Message[] => {
  const messages: Message[] = [];
  const authors = Array.from({ length: 15 }, () => faker.person.firstName());
  for (let i = 0; i < count; i++) {
    messages.push({
      id: i + 1,
      author: faker.helpers.arrayElement(authors),
      text: faker.lorem.sentence({ min: 3, max: 25 }),
      photo: Math.random() > 0.8 ? faker.image.personPortrait() : null,
      timestamp: Date.now() - (count - i) * 60000,
    });
  }
  return messages;
};

// Simulate server fetch
const fetchMessagesFromServer = async (): Promise<{
  data: Message[];
  timestamp: number;
}> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Generate the data "server-side"
  return {
    data: generateMessages(70),
    timestamp: Date.now(),
  };
};

// Default state - empty or minimal data for instant render
const defaultState = {
  messages: [] as Message[], // Start with empty array
};

export type ChatState = {
  messages: Message[];
};

export const { useCogsState } = createCogsState<ChatState>(defaultState, {
  validation: { key: 'chatApp' },
});

// --- Main Application Component ---

export default function VirtualizedChatExample() {
  const [serverData, setServerData] = useState<{
    status: 'loading' | 'success' | 'error';
    data?: Message[];
    timestamp?: number;
  }>({ status: 'loading' });

  // Fetch data on mount
  useEffect(() => {
    fetchMessagesFromServer()
      .then(({ data, timestamp }) => {
        setServerData({
          status: 'success',
          data,
          timestamp,
        });
      })
      .catch(() => {
        setServerData({ status: 'error' });
      });
  }, []);

  const messages = useCogsState('messages', {
    reactiveType: 'none',
    defaultState: defaultState.messages,
    serverState: serverData,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (!inView || serverData.status !== 'success') return;

    const interval = setInterval(
      () => {
        messages.insert(({ uuid }) => ({
          id: uuid,
          author: faker.person.firstName(),
          text: faker.lorem.sentence({ min: 3, max: 25 }),
          timestamp: Date.now(),
          photo:
            Math.random() > 0.8
              ? faker.image.personPortrait({ size: '128' as any })
              : null,
        }));
      },
      200 + Math.random() * 3000
    );

    return () => clearInterval(interval);
  }, [inView, serverData.status]);

  const status = messages.getStatus();

  return (
    <div className=" gap-4 text-green-400 h-screen p-4">
      <DotPattern>
        <div className="px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-200">
            Virtualized Chat Log
          </h1>
          <p className="text-sm text-gray-400 pr-12 leading-relaxed">
            With just a few lines of code,{' '}
            <code className="text-blue-400">useVirtualView</code> transforms
            complex virtualization into something remarkably straightforward.
            <br />
            <br />
            Instead of manually managing scroll positions, calculating visible
            ranges, or worrying about performance with thousands of messages,
            you simply call{' '}
            <code className="text-blue-400">messages.useVirtualView()</code> and
            spread the returned props.
            <br />
            <br />
            The virtualized list automatically:
          </p>
          <ul className="text-sm text-gray-400 mt-2 ml-8 list-disc space-y-1">
            <li>Stays pinned to the bottom for new messages</li>
            <li>Handles dynamic item heights</li>
            <li>Maintains smooth scrolling</li>
            <li>Renders only visible items plus a small buffer</li>
          </ul>
          <p className="text-sm text-gray-400 mt-4 pr-12">
            What would normally require hundreds of lines of scroll management
            code is reduced to a clean, declarative API.{' '}
            <span className="text-gray-500">
              Status:{' '}
              <span className="text-green-400 font-medium">{status}</span>
            </span>
          </p>
        </div>
      </DotPattern>
      <div className="flex gap-4">
        <div className="w-3/5 flex flex-col gap-3">
          <div ref={ref}>
            {serverData.status === 'loading' ? (
              <LoadingState />
            ) : serverData.status === 'error' ? (
              <ErrorState />
            ) : (
              <>
                <ChatWindow />
              </>
            )}
          </div>
        </div>

        <div className="w-2/5">
          <ShowState layout="vertical" serverStatus={serverData.status} />
        </div>
      </div>
    </div>
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

// --- Chat Window with Loading State ---

function ChatWindow() {
  const messages = useCogsState('messages', { reactiveType: 'none' });
  const messageCount = messages.get().length;

  const { virtualState, virtualizerProps, scrollToBottom } =
    messages.useVirtualView({
      itemHeight: 65,
      overscan: 10,
      stickToBottom: true,
    });

  if (messageCount === 0) {
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
        1231321
        <div style={virtualizerProps.inner.style}>
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
          </div>{' '}
        </div>{' '}
      </div>
      <MessageInput scrollToBottom={scrollToBottom} />
    </>
  );
}

// MessageItem component remains the same...
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

// MessageInput remains the same...
function MessageInput({
  scrollToBottom,
}: {
  scrollToBottom: (a?: any) => void;
}) {
  const [text, setText] = useState('');
  const messages = useCogsState('messages', { reactiveType: 'none' });

  const handleSend = () => {
    if (!text.trim()) return;

    const allMessages = messages.get();

    messages.insert(({ uuid }) => ({
      id: uuid,
      author: 'You',
      text: text,
      timestamp: Date.now(),
      photo: null,
    }));
    scrollToBottom('instant');
    setText('');
  };

  return (
    <div className="p-3 border-t border-gray-700 bg-black/20">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-grow px-3 py-1.5 bg-gray-800 border border-gray-600 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="px-4 py-1.5 bg-green-800 text-white rounded hover:bg-green-700 text-sm font-semibold transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

// Updated ShowState to show server status
function ShowState({
  layout = 'horizontal',
  serverStatus,
}: {
  layout?: 'horizontal' | 'vertical';
  serverStatus: string;
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
          code={`  const messages = useCogsState('messages', { reactiveType: 'none' }));
        
          const { virtualState, virtualizerProps } = messages.useVirtualView({
            itemHeight: 65, 
            overscan: 10,
            stickToBottom: true,
          });
        
          <div {...virtualizerProps.outer} className="flex-1 min-h-0">
              <div style={virtualizerProps.inner.style}>
                <div
                  style={virtualizerProps.list.style}
                  className="px-4  space-y-4 pb-8"
                >
                  {virtualState.stateList((setter, index, array) => {
                    return (
                      <MessageItem
                        key={setter._path.join('.')}
                        message={setter.get()}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          
          `}
        />
        <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-gray-700 rounded p-3 overflow-hidden h-full">
          <h3 className="text-gray-400 uppercase tracking-wider text-xs pb-2 mb-2 border-b border-gray-700">
            State Management Info
          </h3>
          <div className="flex-grow overflow-auto">
            <SyntaxHighlighter
              language="javascript"
              style={atomOneDark}
              customStyle={{ backgroundColor: 'transparent', fontSize: '12px' }}
            >
              {`// Server State Pattern
const messages = useCogsState('messages', { 
  defaultState: [], // Empty initial state
  serverState: {
    status: '${serverStatus}',
    data: [...], // 500 messages from server
    timestamp: ${Date.now()}
  },
  localStorage: {
    key: 'chat-messages'
  }
});

// Current Status: ${status}
// Message Count: ${messages.get().length}
// Source: ${
                status === 'synced'
                  ? 'Server'
                  : status === 'dirty'
                    ? 'Modified locally'
                    : 'Default'
              }`}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>
    </FlashWrapper>
  );
}
