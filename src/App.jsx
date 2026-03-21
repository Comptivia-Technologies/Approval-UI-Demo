import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { useAppContext } from "./context/AppContext.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TasksLayout from "./components/TasksLayout.jsx";

import AdminLogin from "./pages/AdminLogin.jsx";
import MemberLogin from "./pages/MemberLogin.jsx";
import Landing from "./pages/Landing.jsx";
import AdminTasks from "./pages/AdminTasks.jsx";
import MemberTaskDetail from "./pages/MemberTaskDetail.jsx";
import MemberTasks from "./pages/MemberTasks.jsx";

export default function App() {
  const { authReady, userRole } = useAppContext();
  const location = useLocation();
  const isTaskPage =
    location.pathname === "/admin/tasks" || location.pathname === "/member/my-tasks";

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      {!isTaskPage && <Navbar />}
      <main
        className={
          isTaskPage
            ? "flex min-h-0 w-full flex-1 flex-col px-0 py-0"
            : "container mx-auto flex min-h-0 flex-1 flex-col px-4 py-8"
        }
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <Routes>
            <Route
              path="/"
              element={
                !authReady ? (
                  <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
                    Restoring session…
                  </div>
                ) : userRole === "admin" ? (
                  <Navigate replace to="/admin/tasks" />
                ) : userRole === "member" ? (
                  <Navigate replace to="/member/my-tasks" />
                ) : (
                  <Landing />
                )
              }
            />

            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/member-login" element={<MemberLogin />} />

            <Route
              path="/admin/tasks"
              element={
                <ProtectedRoute allowedRole="admin">
                  <TasksLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminTasks />} />
            </Route>

            <Route
              path="/member/my-tasks"
              element={
                <ProtectedRoute allowedRole="member">
                  <TasksLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<MemberTasks />} />
              <Route path=":taskId" element={<MemberTaskDetail />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
