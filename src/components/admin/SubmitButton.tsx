"use client";

import { useFormStatus } from "react-dom";
import Spinner from "@/components/Spinner";

const DEFAULT_CLASS =
  "flex w-full items-center justify-center gap-2 rounded-md bg-red-700 py-2.5 font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70";

/**
 * Submit button for any admin form backed by a Server Action. While the action
 * runs it disables itself and shows a spinner (so the UI never looks frozen).
 *
 * - `overlay` also dims the whole screen with a centered spinner — use it for
 *   long operations like saving an article (which rehosts images).
 * - `confirm` shows a browser confirm() before submitting — use it for
 *   destructive actions like delete.
 * - `className` overrides the default primary-button styling so the same
 *   component can render inline text-style action buttons in tables.
 *
 * Must be rendered inside the `<form>` it submits (useFormStatus reads the
 * nearest parent form).
 */
export default function SubmitButton({
  children,
  pendingText,
  overlay = false,
  confirm,
  className = DEFAULT_CLASS,
  spinnerClassName = "h-4 w-4",
}: {
  children: React.ReactNode;
  pendingText?: string;
  overlay?: boolean;
  confirm?: string;
  className?: string;
  spinnerClassName?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        onClick={
          confirm
            ? (e) => {
                if (!window.confirm(confirm)) e.preventDefault();
              }
            : undefined
        }
        className={className}
      >
        {pending && <Spinner className={spinnerClassName} />}
        {pending && pendingText ? pendingText : children}
      </button>

      {overlay && pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 rounded-xl bg-white px-6 py-4 shadow-xl ring-1 ring-black/5">
            <Spinner className="h-6 w-6 text-red-700" />
            <span className="text-sm font-semibold text-neutral-700">{pendingText ?? "प्रोसेस हो रहा है…"}</span>
          </div>
        </div>
      )}
    </>
  );
}
