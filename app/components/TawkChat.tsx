import Script from "next/script";

// tawk.to live chat bubble. Both IDs come from the tawk.to dashboard
// (Administration > Chat Widget): the embed link is
// https://embed.tawk.to/<property id>/<widget id>. Nothing loads until both are set.
const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID ?? "";
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID ?? "";

export const CHAT_ENABLED = /^[a-z0-9]+$/i.test(PROPERTY_ID) && /^[a-z0-9]+$/i.test(WIDGET_ID);

export default function TawkChat() {
  if (!CHAT_ENABLED) return null;
  return <Script id="tawk-to" src={`https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`} strategy="lazyOnload" crossOrigin="anonymous" />;
}
