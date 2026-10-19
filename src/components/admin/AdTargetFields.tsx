"use client";

import { useEffect, useRef, useState } from "react";
import { AD_SLOT_SPECS, recommendedSize, sizeError, type AdSize } from "@/lib/ad-sizes";

const inputClass = "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm";

/**
 * The slot / device / type / image part of the "add advertisement" form. Lives in one client
 * component because the required size depends on the chosen slot + device, and the picked image
 * is checked against it (and previewed) before upload. A wrong-size image also marks the file
 * input invalid, so the browser blocks the submit and shows the reason; the server re-checks.
 * Renders into the parent form's grid.
 */
export default function AdTargetFields({ slots }: { slots: { id: string; key: string }[] }) {
  const [slotId, setSlotId] = useState("");
  const [device, setDevice] = useState("ALL");
  const [picked, setPicked] = useState<{ url: string; size: AdSize; kb: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const slotKey = slots.find((s) => s.id === slotId)?.key ?? "";
  const spec = AD_SLOT_SPECS[slotKey];
  const wanted = slotKey ? recommendedSize(slotKey, device) : null;
  const problem = picked && slotKey ? sizeError(slotKey, device, picked.size) : null;

  // Block form submission (with the reason) while the picked image doesn't fit the slot.
  useEffect(() => {
    fileRef.current?.setCustomValidity(problem ?? "");
  }, [problem]);

  // Free the preview's blob URL when it is replaced or the form unmounts.
  useEffect(() => () => (picked ? URL.revokeObjectURL(picked.url) : undefined), [picked]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return setPicked(null);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setPicked({ url, size: { w: img.naturalWidth, h: img.naturalHeight }, kb: Math.round(file.size / 1024) });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setPicked(null);
    };
    img.src = url;
  }

  return (
    <>
      <select name="slotId" required value={slotId} onChange={(e) => setSlotId(e.target.value)} className={inputClass}>
        <option value="">-- स्लॉट चुनें --</option>
        {slots.map((s) => (
          <option key={s.id} value={s.id}>
            {s.key}
            {AD_SLOT_SPECS[s.key] ? ` — ${AD_SLOT_SPECS[s.key].where}` : ""}
          </option>
        ))}
      </select>
      <select name="device" value={device} onChange={(e) => setDevice(e.target.value)} className={inputClass}>
        <option value="ALL">सभी डिवाइस</option>
        <option value="DESKTOP">डेस्कटॉप</option>
        <option value="TABLET">टैबलेट</option>
        <option value="MOBILE">मोबाइल</option>
      </select>
      <select name="codeType" defaultValue="IMAGE" className={inputClass}>
        <option value="IMAGE">इमेज बैनर</option>
        <option value="ADSENSE">Google AdSense कोड</option>
        <option value="GPT">Google Ad Manager (GPT) कोड</option>
        <option value="HTML">कस्टम HTML/JS</option>
      </select>

      <div className="rounded-md bg-sky-50 p-3 text-sm text-sky-900 ring-1 ring-sky-100 sm:col-span-2 lg:col-span-3">
        {wanted ? (
          <>
            <p className="font-semibold">
              ज़रूरी साइज़: ठीक {wanted.w}×{wanted.h} px
              <span className="ml-1 font-normal text-sky-700">(JPG / PNG / WebP, 8MB तक)</span>
            </p>
            <p className="mt-1 text-xs text-sky-800">दूसरे साइज़ की इमेज अपलोड नहीं हो पाएगी।</p>
            {spec?.note && <p className="mt-1 text-xs leading-relaxed text-sky-800">{spec.note}</p>}
          </>
        ) : (
          <p>
            {slotKey
              ? "इस स्लॉट के लिए कोई तय साइज़ नहीं है — इमेज चौड़ाई के हिसाब से अपने-आप छोटी-बड़ी होगी।"
              : "स्लॉट चुनते ही यहाँ सही इमेज साइज़ दिखेगा।"}
          </p>
        )}
      </div>

      <div className="min-w-0 sm:col-span-2 lg:col-span-3">
        <label className="mb-1 block text-sm font-medium text-neutral-700">
          इमेज अपलोड करें <span className="font-normal text-neutral-500">(या नीचे इमेज URL डालें)</span>
        </label>
        <input
          ref={fileRef}
          type="file"
          name="imageFile"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onFile}
          className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-neutral-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        {picked && (
          <div className="mt-2 rounded-md border border-neutral-200 bg-neutral-50 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={picked.url} alt="चुनी हुई इमेज का प्रीव्यू" className="mx-auto max-h-40 w-auto max-w-full rounded" />
            <p className="mt-1 text-center text-xs text-neutral-600">
              {picked.size.w}×{picked.size.h} px · {picked.kb} KB
            </p>
            {slotKey && wanted && !problem && <p className="text-center text-xs font-semibold text-green-700">✅ साइज़ सही है</p>}
            {problem && <p className="mt-1 text-center text-xs font-semibold text-red-700">❌ {problem} यह इमेज अपलोड नहीं होगी।</p>}
          </div>
        )}
      </div>
    </>
  );
}
