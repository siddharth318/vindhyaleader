export const metadata = { title: "संपर्क करें" };

export default function ContactUsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-black">संपर्क करें</h1>
      <p className="mb-2 text-neutral-700">समाचार, सुझाव या शिकायत के लिए हमसे संपर्क करें:</p>
      <ul className="space-y-1 text-neutral-700">
        <li>ईमेल: <a href="mailto:news@vindhyaleader.com" className="text-red-700 hover:underline">news@vindhyaleader.com</a></li>
        <li>फोन: +91 88513 18981</li>
        <li>पता: सोनभद्र, उत्तर प्रदेश, भारत</li>
      </ul>
    </div>
  );
}
