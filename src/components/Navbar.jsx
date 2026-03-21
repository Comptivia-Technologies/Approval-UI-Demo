import React from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext.jsx";

export default function Navbar() {
  const { userRole, logout } = useAppContext();
  const navigate = useNavigate();

  const goToLogin = (role) => {
    navigate(role === "admin" ? "/admin-login" : "/member-login", { replace: true });
  };

  const handleLogout = async () => {
    const roleAtLogout = userRole;
    await logout();
    navigate(roleAtLogout === "admin" ? "/admin-login" : "/member-login", { replace: true });
  };

  const tasksPath = userRole === "admin" ? "/admin/tasks" : "/member/my-tasks";

  return (
    <nav className="border-b border-gray-200 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <span className="text-xl font-bold text-gray-800">Demo Approval App</span>
          </Link>

          <div className="flex items-center space-x-6">
            {userRole ? (
              <>
                <Link
                  to={tasksPath}
                  className="font-medium text-gray-700 transition-colors hover:text-primary-600"
                >
                  Tasks
                </Link>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {userRole === "admin" ? "Admin" : "Member"}
                  </span>
                  <button type="button" onClick={handleLogout} className="btn-secondary text-sm">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap items-center justify-end gap-3 sm:space-x-3 sm:gap-0">
                <details className="relative">
                  <summary className="list-none cursor-pointer font-medium text-gray-700 transition-colors hover:text-primary-600">
                    Login
                  </summary>
                  <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                    <button
                      type="button"
                      onClick={() => goToLogin("admin")}
                      className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100"
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => goToLogin("member")}
                      className="mt-1 w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100"
                    >
                      Member
                    </button>
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
