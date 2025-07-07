'use client';

import { createCogsState } from '../../../src/CogsState';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FlashWrapper } from '../FlashOnUpdate';
import DotPattern from '../DotWrapper';
import { faker } from '@faker-js/faker';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

// --- Data Generation & State Definition (No Changes Here) ---

type Message = {
  id: number;
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

const allState = {
  messages: generateMessages(500),
};

export type ChatState = {
  messages: Message[];
};

export const { useCogsState } = createCogsState<ChatState>(allState, {
  validation: { key: 'chatApp' },
});

// --- Main Application Component (No Changes Here) ---

export default function VirtualizedChatExample() {
  const messages = useCogsState('messages', { reactiveType: 'none' });
  const { ref, inView, entry } = useInView();
  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      const allMessages = messages.get();
      const newId = Math.max(...allMessages.map((m) => m.id)) + 1;

      messages.insert({
        id: newId,
        author: faker.person.firstName(),
        text: faker.lorem.sentence({ min: 3, max: 25 }),
        timestamp: Date.now(),
        photo: Math.random() > 0.8 ? faker.image.personPortrait() : null,
      });
    }, 2000 + Math.random() * 2.5); // Send a new message every 3 seconds

    return () => clearInterval(interval);
  }, [inView]);
  return (
    <div className="flex gap-4 text-green-400 h-screen p-4">
      <div className="w-3/5 flex flex-col gap-3">
        <DotPattern>
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-200">
              Virtualized Chat Log
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Correctly rendering thousands of items with a smooth, scrolling
              layout.
            </p>
          </div>
        </DotPattern>
        <div ref={ref}>
          <div className="flex flex-col  max-h-[800px] bg-[#1a1a1a] border border-gray-700 rounded overflow-hidden">
            <ChatWindow />
            <MessageInput />
          </div>{' '}
        </div>
      </div>

      <div className="w-2/5">
        <ShowState layout="vertical" />
      </div>
    </div>
  );
}

// --- Child Components ---

function ChatWindow() {
  const messages = useCogsState('messages', { reactiveType: 'none' });

  const { virtualState, virtualizerProps } = messages.useVirtualView({
    itemHeight: 65, // Adjusted estimated height for better spacing
    overscan: 10,
    stickToBottom: true,
  });
  console.log('relaoding');
  return (
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
  );
}

function MessageItem({ message }: { message: Message }) {
  const isFromYou = message.author === 'You';
  // 1. Use state to track visibility
  const [isVisible, setIsVisible] = useState(false);

  const containerClasses = `w-full flex items-end gap-2 ${
    isFromYou ? 'justify-end' : 'justify-start'
  } transition-opacity duration-100  ${
    // 2. Apply class based on state
    isVisible ? 'opacity-100' : 'opacity-20'
  }`;

  const bubbleClasses = `flex flex-col max-w-[75%] px-3 py-2 rounded-lg shadow-md ${
    isFromYou ? 'bg-green-800 rounded-br-none' : 'bg-gray-700 rounded-bl-none'
  }`;

  useEffect(() => {
    // We still need a tiny delay to give the browser time to paint the opacity-0 state first.
    const timeoutId = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timeoutId);
  }, []);
  return (
    <div className={containerClasses}>
      {!isFromYou && (
        <div className="w-8 h-8 rounded-full bg-gray-600 text-gray-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {message.author.charAt(0)}
        </div>
      )}
      <div className={bubbleClasses}>
        {!isFromYou && (
          <p className="font-bold text-green-400 text-xs ">{message.author}</p>
        )}
        <div className="flex items-center gap-2">
          <p className="text-gray-100 text-sm leading-snug">{message.text}</p>

          <p
            className={`text-xs ${
              isFromYou ? 'text-green-200/60' : 'text-gray-400'
            } flex-shrink-0`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        {message.photo && (
          <img
            src={message.photo}
            className="w-full  rounded-lg max-h-[300px] object-cover"
          />
        )}
      </div>
    </div>
  );
}
// MessageInput and ShowState components remain the same as the previous correct version.
// No changes needed for them.

function MessageInput() {
  const [text, setText] = useState('');
  const messages = useCogsState('messages', { reactiveType: 'none' });

  const handleSend = () => {
    if (!text.trim()) return;

    const allMessages = messages.get();
    const newId =
      allMessages.length > 0
        ? Math.max(...allMessages.map((m) => m.id)) + 1
        : 1;

    messages.insert({
      id: newId,
      author: 'You',
      text: text,
      timestamp: Date.now(),
      photo: null,
    });

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

function ShowState({
  layout = 'horizontal',
}: {
  layout?: 'horizontal' | 'vertical';
}) {
  const messages = useCogsState('messages');

  const containerClasses =
    layout === 'vertical'
      ? 'flex flex-col h-full gap-4'
      : 'flex gap-4 items-center';

  return (
    <FlashWrapper>
      <div className={containerClasses}>
        <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-gray-700 rounded p-3 overflow-hidden h-full">
          <h3 className="text-gray-400 uppercase tracking-wider text-xs pb-2 mb-2 border-b border-gray-700">
            Code Snippet
          </h3>
          <div className="flex-grow overflow-auto">
            <SyntaxHighlighter
              language="javascript"
              style={atomOneDark}
              customStyle={{ backgroundColor: 'transparent', fontSize: '12px' }}
            >
              {`// THE FIX: A wrapper div that handles the flexbox layout
<div className="flex-1 min-h-0">
  {/* The virtualizer now correctly fills its parent */}
  <div {...virtualizerProps.outer}>
    <div {...virtualizerProps.inner}>
      <div {...virtualizerProps.list} className="p-4 space-y-3">
        {/* ... items ... */}
      </div>
    </div>
  </div>
</div>`}
            </SyntaxHighlighter>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-gray-700 rounded p-3 overflow-hidden h-full">
          <h3 className="text-gray-400 uppercase tracking-wider text-xs pb-2 mb-2 border-b border-gray-700">
            Live Global State (Truncated)
          </h3>
          <pre className="text-xs overflow-auto">
            {`// Showing last 5 of ${messages.get().length} total messages\n\n`}
            {JSON.stringify(messages.get().slice(-5), null, 2)}
          </pre>
        </div>
      </div>
    </FlashWrapper>
  );
}
