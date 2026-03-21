import React from "react";
import { Navigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext.jsx";

export default function ProtectedRoute({ allowedRole, children }) {
  const { authReady, userRole } = useAppContext();

  if (!authReady) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-12 text-gray-500">
        <span className="text-sm font-medium">Restoring session…</span>
      </div>
    );
  }

  if (!userRole) {
    return (
      <Navigate
        replace
        to={allowedRole === "admin" ? "/admin-login" : "/member-login"}
      />
    );
  }

  if (userRole !== allowedRole) {
    return <Navigate replace to={userRole === "admin" ? "/admin-login" : "/member-login"} />;
  }

  return children;
}

