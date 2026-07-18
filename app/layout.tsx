import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kai – AI Work Passport",
  description: "A digital work passport for informal workers.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
