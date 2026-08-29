"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FormField } from "@/components/ui/FormField";
import { extractErrorMessage, extractFieldErrors } from "@/lib/api/errors";

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await register(email, password, fullName);
    } catch (error) {
      setFieldErrors(extractFieldErrors(error));
      setFormError(extractErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          ExecFlow <span className="text-accent">AI</span>
        </h1>
        <p className="mt-1 text-sm text-muted">Create your workspace.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormField
            label="Full name"
            value={fullName}
            onChange={setFullName}
            error={fieldErrors.fullName}
            autoComplete="name"
            placeholder="Jordan Blake"
          />
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            error={fieldErrors.email}
            autoComplete="email"
            placeholder="you@company.com"
          />
          <FormField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />

          {formError && (
            <p className="rounded-md bg-priority-urgent/10 px-3 py-2 text-sm text-priority-urgent">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
