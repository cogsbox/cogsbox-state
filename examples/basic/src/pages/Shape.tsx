// src/pages/Shape.jsx

import { NavLink, Outlet } from 'react-router';

const shapeSections = [{ id: 'overview', name: 'Overview', path: '/shape' }];

export default function Shape() {
  return (
    <>
      <div className="flex items-center gap-1 bg-orange-500/10 rounded-full mb-6">
        <span className="text-[12px] font-mono text-orange-400 px-2 py-1 bg-orange-900/30 rounded-full border border-orange-500/20">
          cogsbox-shape
        </span>
        <div className="w-1" />
        {shapeSections.map((section) => (
          <NavLink
            key={section.id}
            to={section.path}
            end // Use 'end' to match only the exact path
            className={({ isActive }) =>
              `px-3 py-1.5 rounded text-sm transition-all cursor-pointer ${
                isActive
                  ? 'bg-orange-500 text-white'
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
