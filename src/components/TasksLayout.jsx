import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext.jsx";

const linkClass = ({ isActive }) =>
  [
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary-100 text-primary-800"
      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
  ].join(" ");

export default function TasksLayout() {
  const { userRole, logout } = useAppContext();
  const navigate = useNavigate();

  const tasksPath = userRole === "admin" ? "/admin/tasks" : "/member/my-tasks";
  const tasksLabel = userRole === "admin" ? "Tasks" : "My Tasks";

  const handleLogout = async () => {
    const roleAtLogout = userRole;
    await logout();
    navigate(roleAtLogout === "admin" ? "/admin-login" : "/member-login", { replace: true });
  };

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col border-b border-gray-200 bg-white shadow-sm md:w-64 md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
            <span className="text-sm font-bold text-white">A</span>
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">Demo Approval App</div>
            <div className="text-xs text-gray-500">
              {userRole === "admin" ? "Administrator" : "Member"}
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <NavLink to={tasksPath} end={userRole === "admin"} className={linkClass}>
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
            {tasksLabel}
          </NavLink>
        </nav>

        <div className="border-t border-gray-100 p-4">
          <button type="button" onClick={handleLogout} className="btn-secondary w-full text-sm">
            Logout
          </button>
        </div>
      </aside>

      {/* Page content */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/80">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
