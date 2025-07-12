// src/pages/State.jsx

import { NavLink, Outlet } from 'react-router';

const stateSections = [
  { id: 'reactivity', name: 'Reactivity', path: 'reactivity' },
  { id: 'basic', name: 'Basic Overview', path: 'basic-overview' },
  { id: 'form-bindings', name: 'Form Bindings', path: 'form-bindings' },
  { id: 'chat', name: 'Virtualized Chat', path: 'virtualized-chat' },
  { id: 'array', name: 'Array Methods', path: 'array-methods' },
];

export default function State() {
  return (
    <>
      <div className="flex items-center gap-1 bg-purple-500/10 rounded-full mb-6">
        <span className="text-[12px] font-mono text-purple-400 px-2 py-1 bg-purple-900/30 rounded-full border border-purple-500/20">
          cogsbox-state
        </span>
        <div className="w-1" />
        {stateSections.map((section) => (
          <NavLink
            key={section.id}
            to={section.path}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            {section.name}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </>
  );
}
