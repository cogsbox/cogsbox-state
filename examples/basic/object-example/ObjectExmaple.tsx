"use client";

import React from "react";
import type { StateObject } from "../../../src/CogsState";

import { createCogsState } from "../../../src/CogsState";
import DotPattern from "../DotWrapper";
import { FlashWrapper } from "../FlashOnUpdate";

// Define the types for our state
export type User = {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Member" | "Guest";
};

export type Task = {
  id: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  assigneeId: number | null;
};

// Define the full state object structure
export type ProjectDashboardState = {
  projectName: string;
  isActive: boolean;
  users: User[];
  tasks: Task[];
};

// Create the initial state
const initialState: ProjectDashboardState = {
  projectName: "Cogs State Demo",
  isActive: true,
  users: [
    { id: 1, name: "Alice", email: "alice@example.com", role: "Admin" },
    { id: 2, name: "Bob", email: "bob@example.com", role: "Member" },
  ],
  tasks: [
    {
      id: "t-1",
      description: "Set up project structure",
      status: "completed",
      assigneeId: 1,
    },
    {
      id: "t-2",
      description: "Implement array methods",
      status: "in-progress",
      assigneeId: 2,
    },
    {
      id: "t-3",
      description: "Write documentation",
      status: "pending",
      assigneeId: null,
    },
  ],
};

// Export the hook
export const { useCogsState } = createCogsState(
  {
    projectDashboard: initialState,
  },
  { validation: { key: "projectDashboard" } }
);
// --- Main Page Component ---
export default function ArrayMethodsPage() {
  const dashboardState = useCogsState("projectDashboard");
  const selectedUser = dashboardState.users.getSelected();
  const selectedTask = dashboardState.tasks.getSelected();

  return (
    <div className="flex gap-6 text-green-400 p-6 font-mono">
      {/* --- LEFT COLUMN (Master Lists & Controls) --- */}
      <div className="w-3/5 flex flex-col gap-4">
        <DotPattern>
          <div className="px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-200">
              Advanced Array Methods
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl">
              Select items from the lists to edit them. Notice how updates are
              granular, only re-rendering the necessary parts of the UI.
            </p>
          </div>
        </DotPattern>

        <ProjectDetails rootState={dashboardState} />

        <div className="grid grid-cols-2 gap-4">
          <ItemList
            title="Users"
            arrayState={dashboardState.users}
            onAddItem={() => {
              const newId =
                Math.max(0, ...dashboardState.users.get().map((u) => u.id)) + 1;
              dashboardState.users.insert({
                id: newId,
                name: `New User ${newId}`,
                email: `user${newId}@example.com`,
                role: "Guest",
              });
            }}
          />
          <ItemList
            title="Tasks"
            arrayState={dashboardState.tasks}
            onAddItem={() => {
              const newId = `t-${Date.now()}`;
              dashboardState.tasks.insert({
                id: newId,
                description: "A new unassigned task",
                status: "pending",
                assigneeId: null,
              });
            }}
          />
        </div>
      </div>

      {/* --- RIGHT COLUMN (Detail Editor) --- */}
      <div className="w-2/5 sticky top-6">
        <ItemDetailForm
          selectedUser={selectedUser}
          selectedTask={selectedTask}
        />
      </div>
    </div>
  );
}

// --- Left Column Components ---

function ProjectDetails({
  rootState,
}: {
  rootState: StateObject<ProjectDashboardState>;
}) {
  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4 flex flex-col gap-4">
        <h3 className="font-bold text-gray-200 text-lg">Project Settings</h3>
        <div className="flex items-center gap-4">
          <label className="text-gray-400 w-28">Project Name:</label>
          {rootState.projectName.formElement((obj) => (
            <input
              {...obj.inputProps}
              className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          ))}
        </div>
        <div className="flex items-center gap-4">
          <label className="text-gray-400 w-28">Is Active:</label>
          {rootState.isActive.formElement((obj) => (
            <input
              type="checkbox"
              className="w-5 h-5 bg-gray-800 border-gray-600 accent-green-500"
              checked={obj.get()}
              onChange={(e) => obj.set(e.target.checked)}
            />
          ))}
        </div>
      </div>
    </FlashWrapper>
  );
}

function ItemList({
  title,
  arrayState,
  onAddItem,
}: {
  title: string;
  arrayState: StateObject<User[]> | StateObject<Task[]>;
  onAddItem: () => void;
}) {
  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-3 flex flex-col gap-2 h-full">
        <h3 className="font-bold text-gray-300 text-base">{title}</h3>
        <div className="flex-grow space-y-1 overflow-y-auto pr-1">
          {arrayState.stateList((item: any, itemSetter) => (
            <FlashWrapper key={item.id}>
              <button
                onClick={() => itemSetter.setSelected(true)}
                className={`w-full text-left px-2 py-1 rounded text-sm transition-colors duration-150 ${
                  itemSetter._selected
                    ? "bg-green-800/80 text-white font-semibold ring-2 ring-green-500"
                    : "bg-gray-800 hover:bg-gray-700/70"
                }`}
              >
                {item.name || item.description}
              </button>
            </FlashWrapper>
          ))}
        </div>
        <div className="pt-2 border-t border-gray-700 flex gap-2">
          <button
            onClick={onAddItem}
            className="px-2 py-1 text-xs bg-green-900/80 text-green-200 rounded hover:bg-green-800"
          >
            Insert New
          </button>
          <button
            onClick={() => arrayState.cut()}
            className="px-2 py-1 text-xs bg-red-900/80 text-red-200 rounded hover:bg-red-800"
          >
            Cut Last
          </button>
        </div>
      </div>
    </FlashWrapper>
  );
}

// --- Right Column Component ---

function ItemDetailForm({
  selectedUser,
  selectedTask,
}: {
  selectedUser?: StateObject<User>;
  selectedTask?: StateObject<Task>;
}) {
  const itemState = selectedUser || selectedTask;
  console.log("itemState", itemState);
  return (
    <FlashWrapper>
      <div className="bg-[#1a1a1a] border border-gray-700/50 rounded-lg p-4 min-h-[300px]">
        <h3 className="font-bold text-gray-200 text-lg mb-4">
          Selected Item Editor
        </h3>
        {!itemState && (
          <div className="text-gray-500 text-center pt-10">
            Select an item from the left to edit its details.
          </div>
        )}

        {selectedUser && <UserForm userState={selectedUser} />}
        {selectedTask && <TaskForm taskState={selectedTask} />}
      </div>
    </FlashWrapper>
  );
}

// --- Specific Forms for User and Task ---

function UserForm({ userState }: { userState: StateObject<User> }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="font-semibold text-gray-500">
        Editing User:{" "}
        <span className="text-green-300">{userState.id.get()}</span>
      </div>
      {userState.name.formElement((obj) => (
        <div className="flex flex-col gap-1">
          <label>Name</label>
          <input {...obj.inputProps} className="form-input" />
        </div>
      ))}
      {userState.email.formElement((obj) => (
        <div className="flex flex-col gap-1">
          <label>Email</label>
          <input {...obj.inputProps} className="form-input" />
        </div>
      ))}
      {userState.role.formElement((obj) => (
        <div className="flex flex-col gap-1">
          <label>Role</label>
          <select
            value={obj.get()}
            onChange={(e) => obj.set(e.target.value as User["role"])}
            className="form-input"
          >
            <option>Admin</option>
            <option>Member</option>
            <option>Guest</option>
          </select>
        </div>
      ))}
      <FormActions
        itemState={userState}
        onClear={() => userState.setSelected(false)}
      />
    </div>
  );
}

function TaskForm({ taskState }: { taskState: StateObject<Task> }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="font-semibold text-gray-500">
        Editing Task:{" "}
        <span className="text-green-300">{taskState.id.get()}</span>
      </div>
      {taskState.description.formElement((obj) => (
        <div className="flex flex-col gap-1">
          <label>Description</label>
          <input {...obj.inputProps} className="form-input" />
        </div>
      ))}
      {taskState.status.formElement((obj) => (
        <div className="flex flex-col gap-1">
          <label>Status</label>
          <select
            value={obj.get()}
            onChange={(e) => obj.set(e.target.value as Task["status"])}
            className="form-input"
          >
            <option>pending</option>
            <option>in-progress</option>
            <option>completed</option>
          </select>
        </div>
      ))}
      <FormActions
        itemState={taskState}
        onClear={() => taskState.setSelected(false)}
      />
    </div>
  );
}

function FormActions({
  itemState,
  onClear,
}: {
  itemState: StateObject<any>;
  onClear: () => void;
}) {
  return (
    <div className="pt-4 mt-4 border-t border-gray-700 flex justify-between items-center">
      <button
        onClick={() => itemState.cut()}
        className="px-3 py-1 bg-red-900/80 text-red-200 rounded hover:bg-red-800 text-sm"
      >
        Cut This Item
      </button>
      <button
        onClick={onClear}
        className="px-3 py-1 bg-gray-600/80 text-gray-200 rounded hover:bg-gray-500 text-sm"
      >
        Deselect
      </button>
    </div>
  );
}
