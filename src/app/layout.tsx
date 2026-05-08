import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FireExtenguisher",
  description: "Fire suppression inspection reporting for growing contractors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
