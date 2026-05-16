import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FairDrive Auto",
  description: "AI-native auto insurance for new U.S. drivers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
