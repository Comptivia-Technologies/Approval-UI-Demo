import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAppContext } from "../context/AppContext.jsx";
import { authService } from "../services/authService.js";
import { fetchTenantIdByEmail } from "../services/tenantService.js";
import { persistSessionRole, readSessionRole } from "../services/productHubOrganization.js";

function IconEye({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconEyeSlash({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

/**
 * @param {{ expectedRole: "admin" | "member"; title: string; afterLoginPath: string; alternateLoginPath: string; alternateLabel: string }} props
 */
export default function ProductHubLoginForm({
  expectedRole,
  title,
  afterLoginPath,
  alternateLoginPath,
  alternateLabel,
}) {
  const navigate = useNavigate();
  const { login } = useAppContext();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingTenant, setFetchingTenant] = useState(false);
  const [tenantAutoDetected, setTenantAutoDetected] = useState(false);
  const [availableTenants, setAvailableTenants] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    const sessionRole =
      typeof sessionStorage !== "undefined"
        ? sessionStorage.getItem("workflow_demo_app_role")
        : null;
    if (user && (sessionRole === "admin" || sessionRole === "member") && sessionRole === expectedRole) {
      navigate(afterLoginPath, { replace: true });
    }
  }, [afterLoginPath, expectedRole, navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFetchingTenant(true);

    try {
      const result = await fetchTenantIdByEmail(email);

      if (result.multipleTenants && result.tenants?.length > 0) {
        setAvailableTenants(result.tenants);
        setTenantAutoDetected(false);
        setStep("tenant-selection");
        return;
      }

      if (result.tenantId) {
        setTenantId(result.tenantId);
        setTenantAutoDetected(true);
        await authService.setTenant(result.tenantId);
        setStep("password");
        return;
      }

      setTenantAutoDetected(false);
      if (result.error) {
        setError(result.error);
      } else if (result.exists) {
        setError(
          "Tenant ID not found for this email. Enter it manually on the next step if your account uses a tenant.",
        );
      } else {
        setError("User not found. Please check your email address.");
      }
      setStep("password");
    } catch (err) {
      setError(err?.message || "Failed to look up tenant. You can enter Tenant ID manually.");
      setStep("password");
    } finally {
      setFetchingTenant(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    setPassword("");
    setShowPassword(false);
    setError("");
    setTenantId("");
    setTenantAutoDetected(false);
    setAvailableTenants([]);
  };

  const handleTenantSelect = async (selectedTenantId) => {
    setTenantId(selectedTenantId || "");
    if (selectedTenantId) {
      setTenantAutoDetected(true);
      await authService.setTenant(selectedTenantId);
    }
    setStep("password");
  };

  const finishSignIn = async () => {
    const user = authService.getCurrentUser();
    persistSessionRole(expectedRole, user?.uid);
    login(expectedRole);
    navigate(afterLoginPath, { replace: true });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedTenant = tenantId.trim();

    try {
      if (!trimmedTenant) {
        try {
          await authService.signIn(email, password, undefined);
          await finishSignIn();
          return;
        } catch (err) {
          if (err?.code === "auth/invalid-credential") {
            setError(
              "Sign-in failed. If your account belongs to a tenant, enter your Tenant ID above and try again.",
            );
            setLoading(false);
            return;
          }
          throw err;
        }
      }

      await authService.signIn(email, password, trimmedTenant);
      await finishSignIn();
    } catch (err) {
      let errorMessage = err?.message || "Authentication failed. Please try again.";
      if (err?.code === "auth/invalid-credential") {
        errorMessage = trimmedTenant
          ? "Invalid email, password, or tenant ID."
          : "Invalid email or password.";
      } else if (err?.code === "auth/user-not-found") {
        errorMessage = "No user found with this email address.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const stepTitle =
    step === "email"
      ? title
      : step === "tenant-selection"
        ? "Select tenant"
        : "Enter password";

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card">
          <h2 className="mb-2 text-center text-3xl font-bold text-gray-900">{stepTitle}</h2>
          <p className="mb-6 text-center text-sm text-gray-500">
            Product Hub account — tenant lookup and Firebase sign-in
          </p>

          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          ) : null}

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label htmlFor="ph-email" className="mb-1 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="ph-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  disabled={fetchingTenant}
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={fetchingTenant || !email}>
                {fetchingTenant ? "Looking up tenant…" : "Continue"}
              </button>
            </form>
          ) : null}

          {step === "tenant-selection" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-gray-600">{email}</span>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="shrink-0 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Change
                </button>
              </div>
              <p className="text-sm text-gray-600">
                This email is linked to multiple tenants. Choose one to continue.
              </p>
              <div className="flex flex-col gap-2">
                {availableTenants.map((t, index) => (
                  <button
                    key={`${t.tenantId}-${index}`}
                    type="button"
                    onClick={() => handleTenantSelect(t.tenantId)}
                    className="rounded-lg border border-gray-200 px-4 py-3 text-left text-sm transition-colors hover:border-primary-300 hover:bg-gray-50"
                  >
                    <div className="font-medium text-gray-900">{t.displayName || "Tenant"}</div>
                    {t.tenantId ? (
                      <div className="mt-0.5 font-mono text-xs text-gray-500">{t.tenantId}</div>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === "password" ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm text-gray-600">{email}</span>
                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="shrink-0 text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Change
                </button>
              </div>

              {tenantAutoDetected && tenantId ? (
                <p className="rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800">
                  Tenant: <span className="font-mono">{tenantId}</span>
                </p>
              ) : null}

              {!tenantAutoDetected ? (
                <div>
                  <label htmlFor="ph-tenant" className="mb-1 block text-sm font-medium text-gray-700">
                    Tenant ID (if your org uses tenants)
                  </label>
                  <input
                    id="ph-tenant"
                    type="text"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="input-field font-mono text-sm"
                    placeholder="Paste tenant ID"
                    autoComplete="off"
                  />
                </div>
              ) : null}

              <div>
                <label htmlFor="ph-password" className="mb-1 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="ph-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field w-full pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3 text-gray-500 transition-colors hover:text-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary-500"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <IconEyeSlash className="h-5 w-5 shrink-0" />
                    ) : (
                      <IconEye className="h-5 w-5 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          ) : null}

          <p className="mt-6 text-center text-gray-600">
            {alternateLabel}{" "}
            <Link to={alternateLoginPath} className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
