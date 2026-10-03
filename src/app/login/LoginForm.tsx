"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/app/auth-actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, null);
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="label">Username</span>
        <input
          name="username"
          autoComplete="username"
          autoFocus
          required
          defaultValue={state?.username}
          className="input"
        />
      </label>
      <label className="block">
        <span className="label">Password</span>
        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className="input pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Sembunyikan password" : "Lihat password"}
            title={show ? "Sembunyikan password" : "Lihat password"}
            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-900"
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </label>
      {state?.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}
