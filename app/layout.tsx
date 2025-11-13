import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solomon | Services",
  description: "Showcase of services with animated hero powered by Shadcn UI."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


