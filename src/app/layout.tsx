import type { Metadata } from "next";
import { DM_Sans, Newsreader, Noto_Sans_Thai, Noto_Serif_Thai } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSerifThai = Noto_Serif_Thai({
  variable: "--font-noto-serif-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600"],
});

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Books & Boardgame",
  description: "เช่าหนังสือและบอร์ดเกมในคอนโด/อพาร์ตเมนต์",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="th"
      className={`${newsreader.variable} ${dmSans.variable} ${notoSerifThai.variable} ${notoSansThai.variable} h-full antialiased`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
