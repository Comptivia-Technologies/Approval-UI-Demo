import React from "react";

import TaskList from "../components/TaskList.jsx";
import { useAppContext } from "../context/AppContext.jsx";

export default function MemberTasks() {
  const { tasks, tasksLoading, tasksError } = useAppContext();

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
