import type { Metadata } from "next";
import "./globals.css";
import NovaCareChat from "@/components/NovaCareChat";
import CursorTracker from "@/components/CursorTracker";

export const metadata: Metadata = {
  title: "MediNova AI - The Future of AI-Powered Healthcare",
  description:
    "MediNova AI is a premium AI-powered healthcare platform featuring clinical decision support, 3D anatomy, OCR report analysis, and NovaCare AI — your personal health intelligence assistant.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <CursorTracker />
        {/* NovaCare AI — Global floating health chatbot */}
        <NovaCareChat />
      </body>
    </html>
  );
}
