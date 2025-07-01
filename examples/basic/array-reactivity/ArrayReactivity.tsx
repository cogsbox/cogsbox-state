"use client";

import type { OptionsType } from "@lib/CogsState";

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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Array Reactivity with Nested Updates
      </h1>
      <p className="text-gray-600 mb-8">
        This demonstrates granular reactivity within stateMap. Each form element
        will only update the specific nested property, showing granular updates.
      </p>

      <TodoListWithStateMap />
      <AddTodoButton />

      <div className="mt-8">
        <ShowArrayLength />
      </div>
    </div>
  );
}

function TodoListWithStateMap() {
  const todos = useCogsState("todoArray", {
    reactiveType: "deps",
    reactiveDeps: (state) => [state.length],
  });

  return (
    <FlashWrapper>
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="font-medium mb-3">
          Todo Items (stateMap with nested formElements)
        </h3>
        {todos.stateMap((todo, todoSetter, index) => (
          <FlashWrapper key={todo.id}>
            <div className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 items-center">
              {/* Completed Checkbox - only this should update when toggled */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Completed</label>
                <FlashWrapper>
                  {todoSetter.completed.formElement((obj) => (
                    <input
                      type="checkbox"
                      className="w-5 h-5"
                      checked={obj.get()}
                      onChange={(e) => obj.set(e.target.checked)}
                    />
                  ))}
                </FlashWrapper>
              </div>

              {/* Title Input - only this should update when title changes */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Title</label>
                <FlashWrapper>
                  {todoSetter.title.formElement((obj) => (
                    <input
                      type="text"
                      className="px-3 py-2 border rounded text-sm"
                      value={obj.get()}
                      onChange={(e) => obj.set(e.target.value)}
                    />
                  ))}
                </FlashWrapper>
              </div>

              {/* Priority Select - only this should update when priority changes */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Priority</label>
                <FlashWrapper>
                  {todoSetter.priority.formElement((obj) => (
                    <select
                      className="px-3 py-2 border rounded text-sm"
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
                </FlashWrapper>
              </div>

              {/* Actions */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Actions</label>
                <button
                  onClick={() => todoSetter.cut()}
                  className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
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
    const newId = Math.max(...todos.get().map((t) => t.id)) + 1;
    todos.insert({
      id: newId,
      title: `New Todo ${newId}`,
      completed: false,
      priority: "medium",
    });
  };

  return (
    <div className="mt-4">
      <button
        onClick={addTodo}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Add New Todo
      </button>
    </div>
  );
}

function ShowArrayLength() {
  const todos = useCogsState("todoArray", {
    reactiveType: "deps",
    reactiveDeps: (state) => [state.length],
  });

  return (
    <FlashWrapper>
      <div className="bg-blue-50 p-4 rounded border">
        <div className="font-medium text-blue-800 mb-2">
          Array Length (only updates when items added/removed):{" "}
          {todos.get().length}
        </div>
        <SyntaxHighlighter
          language="javascript"
          style={atomOneDark}
          customStyle={{
            margin: 0,
            height: "100px",
            fontSize: "12px",
            borderRadius: "4px",
          }}
        >
          {`// Only updates on length change
const todos = useCogsState("todoArray", {
  reactiveType: "deps",
  reactiveDeps: (state) => [state.length]
});`}
        </SyntaxHighlighter>
      </div>
    </FlashWrapper>
  );
}
