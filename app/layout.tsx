import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/context/I18nContext";
import { ConfirmProvider } from "@/context/ConfirmContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Digital Family Record Portal | Samaj Census",
  description: "Official census registry and verification portal for Shri Kutch Gurjar Kshatriya Samaj Mahasabha.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <I18nProvider>
          <ConfirmProvider>
            {children}
            <Toaster position="top-right" theme="light" />
          </ConfirmProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
