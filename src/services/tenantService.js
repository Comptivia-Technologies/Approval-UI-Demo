import { getClientApiBase } from "../lib/apiBase.js";

/**
 * @param {string} email
 */
export async function fetchTenantIdByEmail(email) {
  const base = getClientApiBase();
  try {
    const response = await fetch(`${base}/api/auth/lookup-tenant`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
      },
      cache: "no-store",
      body: JSON.stringify({ email: email.trim() }),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = text ? JSON.parse(text) : {};
      } catch {
        errorData = { error: "Unknown error", message: text || `HTTP ${response.status}` };
      }

      if (response.status === 502 || response.status === 503) {
        return {
          tenantId: null,
          exists: false,
        error:
          "API returned 502 (upstream error). If you use npm run dev:split, ensure port 5000 is free. Otherwise run npm run dev and check VITE_AUTH_API_URL in .env.",
        };
      }

      if (response.status === 403 || errorData.error === "Permission denied") {
        return {
          tenantId: null,
          exists: false,
          error:
            "Could not look up tenant (permission). You can enter your Tenant ID manually below.",
        };
      }

      if (response.status === 404) {
        return {
          tenantId: null,
          exists: false,
          error: "User not found. Please check your email address.",
        };
      }

      throw new Error(errorData.message || `Tenant lookup failed: ${response.status}`);
    }

    const responseData = await response.json();
    const apiData = responseData.data || responseData;

    if (!apiData.hasTenant) {
      return {
        tenantId: null,
        exists: true,
        error: "User found but does not belong to any tenant.",
      };
    }

    if (apiData.organizations?.length > 1) {
      const tenants = apiData.organizations.map((org) => ({
        tenantId: org.tenantId,
        displayName: org.organizationName,
      }));
      return {
        tenantId: null,
        exists: true,
        tenants,
        multipleTenants: true,
      };
    }

    if (apiData.tenantId) {
      return {
        tenantId: apiData.tenantId,
        exists: true,
        displayName: apiData.organizationName,
      };
    }

    if (apiData.organizations?.length === 1) {
      const org = apiData.organizations[0];
      return {
        tenantId: org.tenantId,
        exists: true,
        displayName: org.organizationName,
      };
    }

    return {
      tenantId: null,
      exists: true,
      error: "Tenant information not found in response.",
    };
  } catch (err) {
    const msg = String(err?.message || "");
    const isNetwork =
      err?.name === "TypeError" ||
      /failed to fetch|networkerror|load failed|network request failed/i.test(msg);
    if (isNetwork) {
      return {
        tenantId: null,
        exists: false,
        error:
          "Cannot reach the API. Run npm run dev and open http://localhost:3000 (API is on the same port under /api). If you set VITE_API_URL to another host, start that server (e.g. npm run dev:api on :5000).",
      };
    }
    return {
      tenantId: null,
      exists: false,
      error: msg || "Failed to fetch tenant. You can enter Tenant ID manually.",
    };
  }
}
