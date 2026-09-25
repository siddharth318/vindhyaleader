"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth-actions";
import Spinner from "@/components/Spinner";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">ईमेल</label>
        <input
          type="email"
          name="email"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-700"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-700">पासवर्ड</label>
        <input
          type="password"
          name="password"
          required
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-red-700"
        />
      </div>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-red-700 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60"
      >
        {pending && <Spinner className="h-4 w-4" />}
        {pending ? "लॉगिन हो रहा है..." : "लॉगिन करें"}
      </button>
    </form>
  );
}
