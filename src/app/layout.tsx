import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jupyter File Explorer",
  description: "Browse and download files in a Jupyter Notebook-style interface",
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
