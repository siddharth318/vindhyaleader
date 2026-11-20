import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = { title: "गोपनीयता नीति" };

const LAST_UPDATED = "20 नवंबर 2026";

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-red-700 underline hover:text-red-800">
      {children}
    </a>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 text-lg font-bold text-neutral-900">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

/**
 * Includes the disclosures Google AdSense requires of publishers: third-party vendors (incl.
 * Google) use cookies to serve ads based on prior visits, Google's advertising cookies enable
 * interest-based ads, and how readers can opt out (Google Ads Settings / aboutads.info).
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 leading-relaxed text-neutral-700">
      <h1 className="mb-1 text-2xl font-black text-neutral-900">गोपनीयता नीति</h1>
      <p className="mb-6 text-sm text-neutral-500">अंतिम अद्यतन: {LAST_UPDATED}</p>

      <p className="mb-6">
        विंध्यलीडर (vindhyaleader.com) अपने पाठकों की गोपनीयता का सम्मान करता है। यह नीति बताती है कि जब आप हमारी
        वेबसाइट पर आते हैं तो कौन-सी जानकारी एकत्र होती है, उसका उपयोग कैसे होता है और आपके पास क्या विकल्प हैं।
      </p>

      <Section title="हम कौन-सी जानकारी एकत्र करते हैं">
        <p>
          खबरें पढ़ने के लिए आपको कोई खाता बनाने या व्यक्तिगत जानकारी देने की आवश्यकता नहीं है। वेबसाइट पर आने पर
          कुछ तकनीकी जानकारी अपने-आप दर्ज हो सकती है, जैसे ब्राउज़र का प्रकार, डिवाइस, अनुमानित स्थान (शहर/राज्य स्तर),
          देखे गए पेज और विज़िट का समय। यदि आप ईमेल या फोन से हमसे संपर्क करते हैं, तो आपके द्वारा भेजी गई जानकारी
          केवल आपको जवाब देने के लिए उपयोग की जाती है।
        </p>
      </Section>

      <Section title="कुकीज़">
        <p>
          कुकीज़ छोटी टेक्स्ट फ़ाइलें होती हैं जो आपके ब्राउज़र में सहेजी जाती हैं। हम और हमारे साझेदार कुकीज़ का उपयोग
          वेबसाइट को सही ढंग से चलाने, पाठकों की संख्या मापने और विज्ञापन दिखाने के लिए करते हैं। आप अपने ब्राउज़र की
          सेटिंग्स से कुकीज़ को हटा या ब्लॉक कर सकते हैं; ऐसा करने पर भी आप खबरें पढ़ सकेंगे।
        </p>
      </Section>

      <Section title="Google AdSense और विज्ञापन कुकीज़">
        <p>
          यह वेबसाइट विज्ञापन दिखाने के लिए Google AdSense का उपयोग करती है।
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Google सहित तीसरे पक्ष के विक्रेता (third-party vendors) कुकीज़ का उपयोग करके आपको इस वेबसाइट और इंटरनेट
            की अन्य वेबसाइटों पर आपकी पिछली विज़िट के आधार पर विज्ञापन दिखाते हैं।
          </li>
          <li>
            Google की विज्ञापन कुकीज़ (जैसे DoubleClick कुकी) के उपयोग से Google और उसके साझेदार आपको इस साइट और/या
            इंटरनेट की अन्य साइटों पर आपकी विज़िट के आधार पर विज्ञापन दिखा पाते हैं।
          </li>
          <li>
            आप <ExtLink href="https://adssettings.google.com">Google विज्ञापन सेटिंग्स (Ads Settings)</ExtLink> पर
            जाकर व्यक्तिगत (personalised) विज्ञापनों को बंद कर सकते हैं।
          </li>
          <li>
            तीसरे पक्ष के अन्य विक्रेताओं की कुकीज़ से व्यक्तिगत विज्ञापन बंद करने के लिए{" "}
            <ExtLink href="https://www.aboutads.info/choices/">www.aboutads.info/choices</ExtLink> पर जाएँ।
          </li>
        </ul>
        <p>
          Google आपके डेटा का उपयोग कैसे करता है, यह जानने के लिए देखें:{" "}
          <ExtLink href="https://policies.google.com/technologies/partner-sites">
            Google द्वारा साझेदार साइटों के डेटा का उपयोग
          </ExtLink>{" "}
          और <ExtLink href="https://policies.google.com/technologies/ads">Google विज्ञापन नीति</ExtLink>।
        </p>
        <p>
          इसके अलावा हमारी साइट पर स्थानीय विज्ञापनदाताओं के सीधे विज्ञापन भी दिखाए जाते हैं। इन पर क्लिक करने पर आप
          विज्ञापनदाता की वेबसाइट पर पहुँचते हैं, जिसकी अपनी गोपनीयता नीति लागू होती है।
        </p>
      </Section>

      <Section title="एनालिटिक्स">
        <p>
          हम यह समझने के लिए Google Analytics का उपयोग कर सकते हैं कि पाठक कौन-सी खबरें पढ़ते हैं और साइट का उपयोग कैसे
          करते हैं। यह जानकारी समेकित (aggregate) रूप में देखी जाती है। आप{" "}
          <ExtLink href="https://tools.google.com/dlpage/gaoptout">Google Analytics opt-out ऐड-ऑन</ExtLink> से इसे बंद
          कर सकते हैं।
        </p>
      </Section>

      <Section title="जानकारी साझा करना">
        <p>
          हम आपकी व्यक्तिगत जानकारी किसी को बेचते नहीं हैं। जानकारी केवल ऊपर बताए गए सेवा-प्रदाताओं (जैसे Google) के साथ,
          या कानूनन आवश्यक होने पर, साझा की जाती है।
        </p>
      </Section>

      <Section title="बाहरी लिंक और एम्बेड">
        <p>
          खबरों में YouTube, Facebook जैसी बाहरी साइटों के वीडियो या लिंक हो सकते हैं। इन्हें चलाने या खोलने पर वे साइटें
          अपनी कुकीज़ और गोपनीयता नीति के अनुसार जानकारी एकत्र कर सकती हैं।
        </p>
      </Section>

      <Section title="बच्चों की गोपनीयता">
        <p>हम जानबूझकर 13 वर्ष से कम आयु के बच्चों से व्यक्तिगत जानकारी एकत्र नहीं करते।</p>
      </Section>

      <Section title="नीति में बदलाव">
        <p>हम समय-समय पर इस नीति को अपडेट कर सकते हैं। बदलाव इसी पेज पर नई तारीख के साथ प्रकाशित किए जाएँगे।</p>
      </Section>

      <Section title="संपर्क">
        <p>
          इस नीति के बारे में किसी भी प्रश्न के लिए{" "}
          <Link href="/contact-us" className="text-red-700 underline hover:text-red-800">
            हमसे संपर्क करें
          </Link>{" "}
          या <a href="mailto:news@vindhyaleader.com" className="text-red-700 underline hover:text-red-800">news@vindhyaleader.com</a>{" "}
          पर ईमेल करें।
        </p>
      </Section>
    </div>
  );
}
