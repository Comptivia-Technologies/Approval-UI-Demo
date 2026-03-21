import React from "react";
import { Link } from "react-router-dom";

import { useAppContext } from "../context/AppContext.jsx";

const features = [
  {
    title: "Admin creates tasks",
    body: "Create approval tasks with a title and description. Everything stays in React Context for this demo.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    ),
  },
  {
    title: "Members review work",
    body: "Members sign in and see every task the admin created—same pattern as a shared inbox or queue.",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ),
  },
];

export default function Landing() {
  const { userRole } = useAppContext();

  return (
    <div className="mx-auto max-w-7xl">
      <div className="px-4 py-16 text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-900">
          Welcome to{" "}
          <span className="text-primary-600">Demo Approval App</span>
        </h1>
        <p className="mx-auto max-w-2xl text-xl text-gray-600">
          A minimal role-based task demo with the same look and feel as the QA
          demo website: clean cards, primary accents, and a simple navbar. Use{" "}
          <strong className="font-semibold text-gray-800">Login</strong> in the
          menu to sign in as Admin or Member.
        </p>
        {userRole ? (
          <div className="mt-8">
            <Link
              to={userRole === "admin" ? "/admin/tasks" : "/member/my-tasks"}
              className="btn-primary inline-block px-8 py-3 text-lg"
            >
              Go to Tasks
            </Link>
          </div>
        ) : null}
      </div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="card text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <svg
                className="h-8 w-8 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                {f.icon}
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">{f.title}</h3>
            <p className="text-gray-600">{f.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <h2 className="mb-4 text-3xl font-bold">Ready to try it?</h2>
          <p className="mb-6 text-lg text-primary-100">
            Use the navbar Login menu, or jump in with admin / member demo accounts.
          </p>
          {!userRole ? (
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/member-login"
                className="inline-block rounded-lg bg-white px-8 py-3 font-semibold text-primary-600 transition-colors hover:bg-gray-100"
              >
                Member Login
              </Link>
              <Link
                to="/admin-login"
                className="inline-block rounded-lg border-2 border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Admin Login
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
