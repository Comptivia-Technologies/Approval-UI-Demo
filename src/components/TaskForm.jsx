import React, { useState } from "react";

export default function TaskForm({
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  serverError = "",
  submitting = false,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setFormError("Task Title is required.");
      return;
    }
    setFormError("");

    try {
      await Promise.resolve(onSubmit({ title: trimmedTitle, description }));
      setTitle("");
      setDescription("");
    } catch {
      /* parent handles API errors */
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {serverError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      ) : null}
      {formError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {formError}
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="task-title">
          Task Title
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Approve budget"
          className="input-field"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Add a short description..."
          className="input-field"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitLabel}
        </button>

        {onCancel ? (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
