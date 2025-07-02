"use client";

import { createCogsState } from "../../../src/CogsState";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { FlashWrapper } from "../FlashOnUpdate";

// State definition with array of objects
const todoArray = [
  { id: 1, title: "Learn React", completed: false, priority: "high" as const },
  { id: 2, title: "Build App", completed: false, priority: "medium" as const },
  { id: 3, title: "Deploy", completed: true, priority: "low" as const },
];

const allState = {
  todoArray,
};

export type ArrayStateObject = {
  todoArray: Array<{
    id: number;
    title: string;
    completed: boolean;
    priority: "high" | "medium" | "low";
  }>;
};

export const { useCogsState } = createCogsState<ArrayStateObject>(allState, {
  validation: { key: "todoArray" },
});

export default function ArrayReactivity() {
  return (
    // Main container creating the two-column layout and setting the retro theme
    <div className="flex gap-4 f text-green-400 min-h-screen p-4">
      {/* --- LEFT COLUMN --- */}
      <div className="w-3/5 flex flex-col gap-3">
        <h1 className="text-xl font-bold text-gray-300">Array Reactivity</h1>
        <p className="text-sm text-gray-500 mb-2">
          Each form element only updates its specific nested property.
        </p>

        <TodoListWithStateMap />
        <AddTodoButton />
      </div>

      {/* --- RIGHT COLUMN --- */}
      <div className="w-2/5">
        {/* Pass a prop to ShowArray to control its layout */}
        <ShowArray layout="vertical" />
      </div>
    </div>
  );
}

function TodoListWithStateMap() {
  const todos = useCogsState("todoArray", {
    reactiveType: "none",
  });

  return (
    <FlashWrapper>
      {/* Panel with less spacious styling */}
      <div className="bg-[#1a1a1a] border border-gray-700 rounded p-3">
        <h3 className="font-bold text-gray-400 mb-2 text-sm uppercase tracking-wider">
          Todo Items
        </h3>
        {/* Header Row */}
        <div className="grid grid-cols-[auto_1fr_90px_60px] gap-2 p-1 border-b border-gray-700 text-xs text-gray-500 font-semibold">
          <div>Done</div>
          <div>Title</div>
          <div>Priority</div>
          <div>Action</div>
        </div>
        {/* List of Todos - compact styling */}
        {todos.$stateMap((todo, todoSetter) => (
          <FlashWrapper key={todo.id}>
            <div className="grid grid-cols-[auto_1fr_90px_60px] gap-2 py-2 px-1 border-b bg-gray-300 last:border-b-0 items-center">
              {/* Checkbox */}
              {todoSetter.completed.formElement((obj) => (
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-gray-800 border-gray-600 accent-green-500"
                  checked={obj.get()}
                  onChange={(e) => obj.set(e.target.checked)}
                />
              ))}

              {/* Title Input */}
              {todoSetter.title.formElement((obj) => (
                <input
                  type="text"
                  className="px-2 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={obj.get()}
                  onChange={(e) => obj.set(e.target.value)}
                />
              ))}

              {/* Priority Select */}
              {todoSetter.priority.formElement((obj) => (
                <select
                  className="px-2 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={obj.get()}
                  onChange={(e) =>
                    obj.set(e.target.value as "high" | "medium" | "low")
                  }
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              ))}

              {/* Actions */}
              <button
                onClick={() => todoSetter.cut()}
                className="px-2 py-0.5 bg-red-900 text-red-200 text-xs rounded hover:bg-red-800"
              >
                Del
              </button>
            </div>
          </FlashWrapper>
        ))}{" "}
        {todos.stateList((todo, todoSetter) => (
          <FlashWrapper key={todo.id}>
            <div className="grid grid-cols-[auto_1fr_90px_60px] gap-2 py-1 px-1 border-b border-gray-800 bg-gray-300  last:border-b-0 items-center">
              {/* Checkbox */}
              {todoSetter.completed.formElement((obj) => (
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-gray-800 border-gray-600 accent-green-500"
                  checked={obj.get()}
                  onChange={(e) => obj.set(e.target.checked)}
                />
              ))}

              {/* Title Input */}
              {todoSetter.title.formElement((obj) => (
                <input
                  type="text"
                  className="px-2 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={obj.get()}
                  onChange={(e) => obj.set(e.target.value)}
                />
              ))}

              {/* Priority Select */}
              {todoSetter.priority.formElement((obj) => (
                <select
                  className="px-2 py-0.5 bg-gray-800 border border-gray-600 rounded text-xs w-full focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={obj.get()}
                  onChange={(e) =>
                    obj.set(e.target.value as "high" | "medium" | "low")
                  }
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              ))}

              {/* Actions */}
              <button
                onClick={() => todoSetter.cut()}
                className="px-2 py-0.5 bg-red-900 text-red-200 text-xs rounded hover:bg-red-800"
              >
                Del
              </button>
            </div>
          </FlashWrapper>
        ))}
      </div>
    </FlashWrapper>
  );
}

function AddTodoButton() {
  const todos = useCogsState("todoArray", { reactiveType: "none" });

  const addTodo = () => {
    const ids = todos.get().map((t) => t.id);
    const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;
    todos.insert({
      id: newId,
      title: `New Todo ${newId}`,
      completed: false,
      priority: "medium",
    });
  };

  return (
    <div className="mt-1">
      <button
        onClick={addTodo}
        className="px-3 py-1 bg-green-900 text-green-200 rounded hover:bg-green-800 text-sm"
      >
        Add New Todo
      </button>
    </div>
  );
}

// Modified ShowArray to accept a layout prop
function ShowArray({
  layout = "horizontal",
}: {
  layout?: "horizontal" | "vertical";
}) {
  const todos = useCogsState("todoArray");

  // Determine flex direction based on prop
  const containerClasses =
    layout === "vertical"
      ? "flex flex-col h-full gap-4"
      : "flex gap-4 items-center";

  return (
    <FlashWrapper>
      <div className={containerClasses}>
        {/* Code Block - set to be a flex item that can grow/shrink */}
        <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-gray-700 rounded p-3 overflow-hidden">
          <h3 className="text-gray-400 uppercase tracking-wider text-xs pb-2 mb-2 border-b border-gray-700">
            Code Snippet
          </h3>
          <div className="flex-grow overflow-auto">
            <SyntaxHighlighter
              language="javascript"
              style={atomOneDark}
              customStyle={{
                backgroundColor: "transparent",
                fontSize: "12px",
              }}
              codeTagProps={{ style: { fontFamily: "inherit" } }}
            >
              {`const todos = useCogsState("todoArray");`}
            </SyntaxHighlighter>
          </div>
        </div>

        {/* JSON block - set to be a flex item that can grow/shrink */}
        <div className="flex-1 flex flex-col bg-[#1a1a1a] border border-gray-700 rounded p-3 overflow-hidden">
          <h3 className="text-gray-400 uppercase tracking-wider text-xs pb-2 mb-2 border-b border-gray-700">
            Live Global State
          </h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(todos.get(), null, 2)}
          </pre>
        </div>
      </div>
    </FlashWrapper>
  );
}
