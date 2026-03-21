import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Firebase Identity Platform: persisted sessions are tenant-scoped. If `tenantId` is not set
 * before auth restores, `currentUser` can stay null after refresh. `signIn` stores this in
 * `currentTenantId`; re-apply it as early as possible.
 */
try {
  if (typeof localStorage !== "undefined") {
    const tid = localStorage.getItem("currentTenantId");
    if (tid) auth.tenantId = tid;
  }
} catch {
  /* private / restricted storage */
}

export default app;
