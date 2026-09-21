import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const metadata = { title: "एडमिन लॉगिन", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-center text-2xl font-black text-red-700">विंध्यलीडर</h1>
        <p className="mb-6 text-center text-sm text-neutral-500">एडमिन पैनल लॉगिन</p>
        <LoginForm />
      </div>
    </div>
  );
}
