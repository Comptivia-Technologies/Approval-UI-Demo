import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import CapexRequestForm from "../components/CapexRequestForm.jsx";
import { useAppContext } from "../context/AppContext.jsx";

export default function MemberTaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { tasks, tasksLoading, refreshTasks } = useAppContext();

  const task = tasks.find((t) => t.id === taskId);

  if (tasksLoading && !task) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="card text-center text-gray-600">Loading task…</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="card text-center">
          <p className="text-gray-700">Task not found or still loading.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => navigate("/member/my-tasks")} className="btn-primary">
              Back to tasks
            </button>
          </div>
        </div>
      </div>
    );
  }

  const defaultSubmitter = task.assigneeName?.trim() ? task.assigneeName : "";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <Link
          to="/member/my-tasks"
          className="text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          ← Back to tasks
        </Link>
      </div>

      <CapexRequestForm
        formKey={task.id}
        taskId={task.id}
        defaultSubmitter={defaultSubmitter}
        onStageCompleted={refreshTasks}
      />
    </div>
  );
}
