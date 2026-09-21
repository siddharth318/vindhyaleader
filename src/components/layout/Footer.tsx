import Link from "next/link";
import { getAllActiveCategories } from "@/lib/data/categories";
import { LogoMark } from "@/components/Logo";

export default async function Footer() {
  const categories = await getAllActiveCategories();
  const districts = categories.filter((c) => c.parentId !== null);
  const topLevel = categories.filter((c) => c.parentId === null);

  return (
    <footer className="mt-8 border-t border-neutral-200 bg-neutral-900 text-neutral-300">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 text-sm md:grid-cols-4">
        <div>
          <div className="mb-1 flex items-center gap-2.5">
            <LogoMark className="h-9 w-9 shrink-0" instanceId="footer" />
            <h4 className="font-display text-2xl font-extrabold text-white">विंध्यलीडर</h4>
          </div>
          <p className="mb-3 text-xs font-semibold tracking-wide text-orange-400">आपकी अपनी आवाज़</p>
          <p className="text-neutral-400">
            विंध्य क्षेत्र और सोनभद्र की स्थानीय खबरों के साथ राष्ट्रीय व अंतरराष्ट्रीय समाचार — प्रामाणिक,
            निष्पक्ष और तेज़।
          </p>
        </div>
        <div>
          <h5 className="mb-2 font-bold text-white">श्रेणियाँ</h5>
          <ul className="space-y-1">
            {topLevel.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link href={`/${c.slug}`} className="hover:text-white">
                  {c.hindiName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="mb-2 font-bold text-white">अपना जिला</h5>
          <ul className="space-y-1">
            {districts.slice(0, 8).map((c) => (
              <li key={c.id}>
                <Link href={`/${c.slug}`} className="hover:text-white">
                  {c.hindiName}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="mb-2 font-bold text-white">महत्वपूर्ण लिंक</h5>
          <ul className="space-y-1">
            <li>
              <Link href="/contact-us" className="hover:text-white">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-white">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/advertise-with-us" className="hover:text-white">
                Advertise With Us
              </Link>
            </li>
            <li>
              <Link href="/admin/login" className="hover:text-white">
                Admin Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800 px-4 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} विंध्यलीडर | All rights reserved.
      </div>
    </footer>
  );
}
