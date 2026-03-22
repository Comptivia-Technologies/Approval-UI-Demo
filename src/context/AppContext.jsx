import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authService } from "../services/authService.js";
import { clearSessionRole, readSessionRole } from "../services/productHubOrganization.js";
import {
  createTaskRemote,
  fetchMemberTasksForCurrentUser,
  fetchOrganizationTasks,
} from "../services/taskService.js";

const AppContext = createContext(undefined);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}

export function AppProvider({ children }) {
  const [authReady, setAuthReady] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState("");

  useEffect(() => {
    const unsub = authService.onAuthStateChange((user) => {
      if (user) {
        authService.syncTenantFromStorage(user.uid);
      }
      setAuthReady(true);

      if (!user) {
        setUserRole(null);
        // Do not clearSessionRole here — a null tick can run before Firebase restores the
        // session on refresh; clearing would wipe admin/member and look like "logout".
        // Role storage is cleared only in logout() with the known uid.
      } else {
        const r = readSessionRole(user.uid);
        if (r === "admin" || r === "member") {
          setUserRole(r);
        } else {
          setUserRole(null);
        }
      }
    });
    return unsub;
  }, []);

  const login = useCallback((role) => {
    setUserRole(role);
  }, []);

  const logout = useCallback(async () => {
    const uid = authService.getCurrentUser()?.uid;
    await authService.signOutUser();
    clearSessionRole(uid);
    setUserRole(null);
    setTasks([]);
    setTasksError("");
    setAuthReady(true);
  }, []);

  const refreshTasks = useCallback(async () => {
    if (!authService.getCurrentUser()) {
      setTasks([]);
      return;
    }
    setTasksLoading(true);
    setTasksError("");
    try {
      const list =
        userRole === "member"
          ? await fetchMemberTasksForCurrentUser()
          : await fetchOrganizationTasks();
      setTasks(list);
    } catch (e) {
      setTasksError(e?.message || "Failed to load tasks.");
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    if (userRole === "admin" || userRole === "member") {
      refreshTasks();
    } else {
      setTasks([]);
      setTasksError("");
    }
  }, [userRole, refreshTasks]);

  const addTask = useCallback(
    async ({ title, description, skipRefresh = false }) => {
      const trimmedTitle = title.trim();
      const trimmedDescription = (description || "").trim();
      if (!trimmedTitle) return;

      await createTaskRemote({
        taskName: trimmedTitle,
        description: trimmedDescription,
      });
      if (!skipRefresh) {
        await refreshTasks();
      }
    },
    [refreshTasks],
  );

  const value = useMemo(
    () => ({
      authReady,
      userRole,
      tasks,
      tasksLoading,
      tasksError,
      refreshTasks,
      login,
      logout,
      addTask,
    }),
    [authReady, userRole, tasks, tasksLoading, tasksError, refreshTasks, login, logout, addTask],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
