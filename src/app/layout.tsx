import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "PrintQuote — Oferte 3D print pentru vânzători",
  description:
    "Transformă comenzile de printare 3D din WhatsApp în oferte clare și organizate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body className={inter.className}>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
