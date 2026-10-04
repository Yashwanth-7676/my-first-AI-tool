import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Yash AI — Anti-Gravity Platform",
  description: "Next-generation full-stack AI SaaS powered by Anti-Gravity architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
