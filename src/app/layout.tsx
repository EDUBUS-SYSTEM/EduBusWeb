import type { Metadata } from "next";
import { Roboto_Slab } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
});

export const metadata: Metadata = {
  title: "EduBus Admin - Management System",
  description: "Student transportation management system for administrators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${robotoSlab.variable} font-roboto-slab antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
