"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionState } from "@/app/actions";

type Props = {
  action: (state: ActionState, form: FormData) => Promise<ActionState>;
  submitLabel: string;
  className?: string;
  resetOnSuccess?: boolean;
  children: React.ReactNode;
};

/** Form dengan pesan sukses/gagal dari server action. */
export function ActionForm({ action, submitLabel, className, resetOnSuccess = true, children }: Props) {
  const [state, formAction, pending] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form ref={ref} action={formAction} className={className ?? "space-y-3"}>
      {children}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Menyimpan..." : submitLabel}
        </button>
        {state && (
          <p role="status" className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-700"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
