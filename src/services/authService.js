import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../firebase/config.js";

class AuthServiceImpl {
  /**
   * If tenant was cleared from `auth` but still in storage (e.g. only `tenant_${uid}` set), restore it.
   * @param {string | undefined} uid
   */
  syncTenantFromStorage(uid) {
    if (auth.tenantId) return;
    try {
      if (typeof localStorage === "undefined") return;
      const fromUid = uid ? localStorage.getItem(`tenant_${uid}`) : null;
      const fromCurrent = localStorage.getItem("currentTenantId");
      const tid = fromUid || fromCurrent;
      if (tid) auth.tenantId = tid;
    } catch {
      /* ignore */
    }
  }

  async setTenant(tenantId) {
    auth.tenantId = tenantId ?? null;
    if (tenantId) {
      localStorage.setItem("currentTenantId", tenantId);
    } else {
      localStorage.removeItem("currentTenantId");
    }
  }

  async signIn(email, password, tenantId) {
    if (tenantId) {
      await this.setTenant(tenantId);
    } else {
      auth.tenantId = null;
      localStorage.removeItem("currentTenantId");
    }

    await setPersistence(auth, browserLocalPersistence);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (tenantId) {
      localStorage.setItem(`tenant_${userCredential.user.uid}`, tenantId);
    }

    try {
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem("authToken", idToken);
      localStorage.setItem("authTokenExpiry", String(Date.now() + 3600000));
    } catch (e) {
      console.error("Error storing auth token:", e);
    }

    return userCredential.user;
  }

  async signOutUser() {
    const uid = auth.currentUser?.uid;
    await signOut(auth);
    auth.tenantId = null;
    localStorage.removeItem("currentTenantId");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authTokenExpiry");
    if (uid) localStorage.removeItem(`tenant_${uid}`);
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  getCurrentUser() {
    return auth.currentUser;
  }

  async getIdToken(forceRefresh = false) {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(forceRefresh);
  }
}

export const authService = new AuthServiceImpl();
