import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SocketProvider } from "@/lib/socket";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hadi Hep Beraber - Türkiye'nin Okey Masası",
  description: "Dostlarınla buluş, rakiplerini yen! Gerçek oyuncularla anında eşleş ve Türkiye'nin en keyifli okey deneyimini yaşa.",
  keywords: ["okey", "online okey", "türk oyunu", "taş oyunu", "multiplayer", "hadi hep beraber"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SocketProvider>{children}</SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
