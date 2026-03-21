import React from "react";
import { Link } from "react-router-dom";

function displayName(task) {
  if (task.taskName) return task.taskName;
  if (task.title) return task.title;
  return "Untitled task";
}

function cellDash(value) {
  if (value == null || value === "") return "—";
  return value;
}

/** Tailwind classes for inline priority pill */
function priorityPillClass(priority) {
  const p = String(priority || "")
    .trim()
    .toLowerCase();
  if (p === "high" || p === "critical" || p === "urgent") {
    return "bg-rose-100 text-rose-900 ring-rose-200/70";
  }
  if (p === "medium" || p === "normal") {
    return "bg-amber-100 text-amber-950 ring-amber-200/80";
  }
  if (p === "low") {
    return "bg-primary-100 text-primary-900 ring-primary-300/60";
  }
  return "bg-slate-100 text-slate-700 ring-slate-200/80";
}

function PriorityPill({ priority }) {
  if (priority == null || String(priority).trim() === "") {
    return <span className="text-gray-400">—</span>;
  }
  const label = String(priority).trim();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ring-1 ring-inset ${priorityPillClass(label)}`}
    >
      {label}
    </span>
  );
}

/**
 * @param {{ tasks: unknown[]; loading?: boolean; error?: string; showStageColumn?: boolean; showViewColumn?: boolean; viewBasePath?: string }} props
 */
export default function TaskList({
  tasks,
  loading = false,
  error = "",
  showStageColumn = false,
  showViewColumn = false,
  viewBasePath = "/member/my-tasks",
}) {
  const tableMinWidth =
    showStageColumn && showViewColumn
      ? "min-w-[880px]"
      : showStageColumn || showViewColumn
        ? "min-w-[760px]"
        : "min-w-[640px]";
  if (loading) {
    return (
      <div className="card text-center text-gray-600" aria-busy="true">
        Loading tasks…
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 text-center text-red-800" role="alert">
        {error}
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="card text-center text-gray-600">
        No tasks found.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden border border-gray-200/90 p-0 shadow-lg shadow-gray-200/50 ring-1 ring-black/[0.03]">
      <div className="overflow-x-auto">
        <table className={`w-full ${tableMinWidth} border-collapse text-left text-sm`}>
          <thead>
            <tr className="border-b border-primary-200/50 bg-gradient-to-r from-primary-50/90 via-white to-gray-50/95">
              <th
                scope="col"
                className="whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-900/90"
              >
                Task name
              </th>
              <th
                scope="col"
                className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-900/90"
              >
                Description
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-900/90"
              >
                Status
              </th>
              {showStageColumn ? (
                <th
                  scope="col"
                  className="whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-900/90"
                >
                  Stage
                </th>
              ) : null}
              <th
                scope="col"
                className="whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-900/90"
              >
                Priority
              </th>
              <th
                scope="col"
                className="whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-900/90"
              >
                Assignee
              </th>
              {showViewColumn ? (
                <th
                  scope="col"
                  className="whitespace-nowrap px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-primary-900/90"
                >
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {tasks.map((task, i) => (
              <tr
                key={task.id}
                className={`transition-colors duration-150 hover:bg-primary-50/25 ${i % 2 === 1 ? "bg-gray-50/60" : ""}`}
              >
                <td className="whitespace-nowrap border-l-4 border-l-transparent px-5 py-3.5 pl-4 font-semibold text-gray-900 hover:border-l-primary-500">
                  {displayName(task)}
                </td>
                <td
                  className="max-w-xs px-5 py-3.5 text-gray-600 sm:max-w-md md:max-w-lg"
                  title={task.description || undefined}
                >
                  <span className="line-clamp-2 whitespace-pre-wrap break-words leading-relaxed">
                    {cellDash(task.description)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-5 py-3.5">
                  <span className="rounded-md bg-gray-100/90 px-2 py-1 text-xs font-medium text-gray-800">
                    {cellDash(task.status)}
                  </span>
                </td>
                {showStageColumn ? (
                  <td className="max-w-[12rem] px-5 py-3.5 text-gray-800" title={task.stageName || undefined}>
                    <span className="line-clamp-2">{cellDash(task.stageName)}</span>
                  </td>
                ) : null}
                <td className="whitespace-nowrap px-5 py-3.5">
                  <PriorityPill priority={task.priority} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-gray-800">
                  {cellDash(task.assigneeName)}
                </td>
                {showViewColumn ? (
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <Link
                      to={`${viewBasePath.replace(/\/$/, "")}/${encodeURIComponent(task.id)}`}
                      className="inline-flex items-center rounded-lg border border-primary-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary-700 shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50"
                    >
                      View
                    </Link>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
