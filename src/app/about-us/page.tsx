import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "हमारे बारे में",
  description:
    "विंध्यलीडर — राबर्ट्सगंज, सोनभद्र से प्रकाशित क्षेत्रीय हिंदी समाचार पोर्टल। सोनभद्र व पूर्वांचल की स्थानीय खबरें, उत्तर प्रदेश और देश-दुनिया के समाचार।",
  path: "/about-us",
});

export default function AboutUsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-neutral-700">
      <h1 className="mb-4 text-2xl font-black text-neutral-900">हमारे बारे में</h1>

      <p className="mb-4">
        <strong>विंध्यलीडर (Vindhya Leader)</strong> राबर्ट्सगंज, सोनभद्र (उत्तर प्रदेश) से प्रकाशित एक क्षेत्रीय हिंदी
        समाचार पोर्टल है। हमारा उद्देश्य सोनभद्र और पूर्वांचल की स्थानीय खबरों को, उत्तर प्रदेश तथा देश-दुनिया के
        समाचारों के साथ, प्रामाणिक, निष्पक्ष और तेज़ी से पाठकों तक पहुँचाना है। हमारी टैगलाइन है — <em>आपकी अपनी आवाज़</em>।
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-neutral-900">हम क्या कवर करते हैं</h2>
      <ul className="mb-4 list-disc space-y-1 pl-5">
        <li>सोनभद्र और आसपास के जिलों की स्थानीय खबरें</li>
        <li>पूर्वांचल व उत्तर प्रदेश के समाचार</li>
        <li>राष्ट्रीय और अंतरराष्ट्रीय समाचार</li>
        <li>जनहित के मुद्दे, प्रशासन, शिक्षा, खेल और संस्कृति</li>
      </ul>

      <h2 className="mb-2 mt-6 text-lg font-bold text-neutral-900">संपादकीय नीति</h2>
      <p className="mb-4">
        हर खबर प्रकाशित करने से पहले हम तथ्यों की जाँच का प्रयास करते हैं और खबर के साथ लेखक का नाम व प्रकाशन समय
        दिखाते हैं। किसी खबर में त्रुटि दिखे तो हमें बताएँ — पुष्टि होने पर हम उसे जल्द से जल्द सुधारते हैं। विज्ञापन
        को हमेशा &quot;विज्ञापन&quot; के रूप में अलग से चिह्नित किया जाता है और वह संपादकीय सामग्री को प्रभावित नहीं करता।
      </p>

      <h2 className="mb-2 mt-6 text-lg font-bold text-neutral-900">संपर्क</h2>
      <address className="mb-4 not-italic">
        विंध्यलीडर, राबर्ट्सगंज, सोनभद्र, उत्तर प्रदेश – 231216
        <br />
        ईमेल:{" "}
        <a href="mailto:news@vindhyaleader.com" className="text-red-700 underline hover:text-red-800">
          news@vindhyaleader.com
        </a>
        <br />
        फोन: +91 88513 18981
      </address>
      <p>
        समाचार, सुझाव या शिकायत के लिए{" "}
        <Link href="/contact-us" className="text-red-700 underline hover:text-red-800">संपर्क पेज</Link> देखें। विज्ञापन के लिए{" "}
        <Link href="/advertise-with-us" className="text-red-700 underline hover:text-red-800">यहाँ संपर्क करें</Link>।
      </p>
    </div>
  );
}
