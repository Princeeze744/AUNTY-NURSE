import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aunty Nurse",
  description:
    "Aunty Nurse dey for you. A licensed nurse-midwife you can reach from your phone, through pregnancy, birth and your baby's first weeks.",
};

export const viewport: Viewport = {
  themeColor: "#0b1712",
  width: "device-width",
  initialScale: 1,
};

/*
  The app keeps time with her. This runs before the first paint so a woman
  opening the app at 2am never sees a bright screen, even for a moment.
  Night is 7pm to 6am on her own phone's clock. Add ?time=day or ?time=night
  to any app address to preview either one.
*/
const keepTime = `(function(){try{var f=new URLSearchParams(location.search).get("time");var h=new Date().getHours();document.documentElement.dataset.time=(f==="night"||f==="day")?f:((h>=19||h<6)?"night":"day");}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: keepTime }} />
        {children}
      </body>
    </html>
  );
}
