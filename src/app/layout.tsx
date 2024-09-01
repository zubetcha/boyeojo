import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "캐릭터 정보 보여조",
  description: "혈반 가호 잘 끼고 있나!",
  viewport: {
    width: "device-width", 
    initialScale: 1
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9638489162996299"
          crossOrigin="anonymous"></script>
      </head>
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
