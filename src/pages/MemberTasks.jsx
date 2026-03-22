import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import TaskList from "../components/TaskList.jsx";
import { useAppContext } from "../context/AppContext.jsx";

export default function MemberTasks() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tasks, tasksLoading, tasksError, refreshTasks } = useAppContext();

  const pendingPostSubmit = location.state?.refreshTasksAfterDelay === true;

  useEffect(() => {
    if (!pendingPostSubmit) return undefined;
    let cancelled = false;
    const delayMs = 2000 + Math.floor(Math.random() * 1001);

    (async () => {
      await new Promise((r) => setTimeout(r, delayMs));
      if (cancelled) return;
      await refreshTasks();
      navigate(location.pathname, { replace: true, state: {} });
    })();

    return () => {
      cancelled = true;
    };
  }, [pendingPostSubmit, location.pathname, navigate, refreshTasks]);

  if (pendingPostSubmit) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600">Tasks created by an admin appear here.</p>
        </div>
        <div className="card text-center text-gray-600">Loading your tasks…</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-600">Tasks created by an admin appear here.</p>
      </div>
      <TaskList tasks={tasks} loading={tasksLoading} error={tasksError} showViewColumn />
    </div>
  );
}
