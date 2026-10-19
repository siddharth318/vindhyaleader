"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { createAdvertisementAction, type AdFormState } from "@/lib/actions/ad-actions";
import AdTargetFields from "@/components/admin/AdTargetFields";
import Spinner from "@/components/Spinner";

const inputClass = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm";

/**
 * "Add advertisement" form. Submitted by hand (not via <form action>) so that a rejected ad —
 * e.g. an image of the wrong size — shows its reason on screen WITHOUT React wiping what was
 * typed or picked. After a successful save the form is remounted (key) to start empty.
 */
export default function AdCreateForm({ slots }: { slots: { id: string; key: string }[] }) {
  const [state, formAction, pending] = useActionState<AdFormState, FormData>(createAdvertisementAction, {});
  const errorRef = useRef<HTMLDivElement>(null);

  // On a phone the error would otherwise appear off-screen next to the submit button.
  useEffect(() => {
    if (state.error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state]);

  return (
    <form
      key={state.nonce ?? 0}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <input name="name" placeholder="विज्ञापन नाम *" required className={inputClass} />
      <AdTargetFields slots={slots} />
      <input name="imageUrl" placeholder="या इमेज URL (अपलोड के बजाय)" className={inputClass} />
      <input name="linkUrl" placeholder="क्लिक लिंक URL" className={inputClass} />
      <textarea
        name="code"
        placeholder="AdSense/GPT/HTML कोड (वैकल्पिक)"
        rows={3}
        className={`${inputClass} sm:col-span-2 lg:col-span-3`}
      />
      <label className="text-sm text-neutral-600">
        शुरू तारीख
        <input type="date" name="startDate" className={`mt-1 block ${inputClass}`} />
      </label>
      <label className="text-sm text-neutral-600">
        अंत तारीख
        <input type="date" name="endDate" className={`mt-1 block ${inputClass}`} />
      </label>
      <label className="text-sm text-neutral-600">
        प्राथमिकता
        <input type="number" name="priority" defaultValue={0} className={`mt-1 block ${inputClass}`} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked /> सक्रिय
      </label>

      {state.error && (
        <div
          ref={errorRef}
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-800 ring-1 ring-red-200 sm:col-span-2 lg:col-span-3"
        >
          ❌ विज्ञापन नहीं जुड़ा: {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2 lg:col-span-1"
      >
        {pending ? (
          <>
            <Spinner className="h-4 w-4" /> जोड़ा जा रहा है…
          </>
        ) : (
          "+ विज्ञापन जोड़ें"
        )}
      </button>
    </form>
  );
}
