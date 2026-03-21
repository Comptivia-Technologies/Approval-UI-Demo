import React, { useState } from "react";

import TaskForm from "../components/TaskForm.jsx";
import TaskList from "../components/TaskList.jsx";
import { useAppContext } from "../context/AppContext.jsx";

export default function AdminTasks() {
  const { tasks, tasksLoading, tasksError, addTask } = useAppContext();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Create and manage approval tasks for members.</p>
        </div>
        <button type="button" onClick={() => setIsCreateOpen(true)} className="btn-primary shrink-0">
          Create Task
        </button>
      </div>

      <TaskList tasks={tasks} loading={tasksLoading} error={tasksError} showStageColumn />

      {isCreateOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsCreateOpen(false);
          }}
        >
          <div className="card w-full max-w-md shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Create Task</h2>
            <TaskForm
              submitLabel={creating ? "Creating…" : "Create Task"}
              submitting={creating}
              serverError={createError}
              onCancel={() => {
                setCreateError("");
                setIsCreateOpen(false);
              }}
              onSubmit={async ({ title, description }) => {
                setCreateError("");
                setCreating(true);
                try {
                  await addTask({ title, description });
                  setIsCreateOpen(false);
                } catch (e) {
                  setCreateError(e?.message || "Failed to create task.");
                  throw e;
                } finally {
                  setCreating(false);
                }
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
