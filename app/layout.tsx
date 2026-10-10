import type { Metadata } from "next";
import { Cinzel, Jost, Pinyon_Script } from "next/font/google";
import Link from "next/link";
import { BUSINESS } from "@/lib/config";
import { HeaderLogo } from "./components/Logo";
import ThemeToggle from "./components/ThemeToggle";
import "./globals.css";

const display = Cinzel({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-display" });
const script = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-script" });
const body = Jost({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Delish Town Car | Seattle House to Sea-Tac",
  description: "Flat-rate private car between Seattle House and Sea-Tac Airport. Sedan $110, Luxury SUV $135. Book and pay online.",
};

const THEME_SCRIPT = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${script.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply a saved light/night choice before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <header className="site-header">
          <div className="container header-row">
            <Link href="/" aria-label="Delish Town Car home">
              <HeaderLogo />
            </Link>
            <nav className="header-nav">
              <a href={`tel:${BUSINESS.phoneE164}`} className="header-phone">{BUSINESS.phone}</a>
              <ThemeToggle />
              <Link href="/book" className="btn btn-primary btn-small">Book a ride</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container footer-row">
            <div>
              <div className="footer-name">{BUSINESS.name}</div>
              <p>Private car service between {BUSINESS.home} ({BUSINESS.homeAddress}) and {BUSINESS.airport}.</p>
            </div>
            <div className="footer-contact">
              <a href={`tel:${BUSINESS.phoneE164}`}>{BUSINESS.phone}</a>
              <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
              <Link href="/policies">Cancellation policy, privacy &amp; terms</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
