import type { Metadata } from "next";
import { Providers } from "../components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Orbrin | Focused team delivery",
    template: "%s | Orbrin",
  },
  description:
    "Orbrin gives project teams one clear workspace for planning, delivery, and collaboration.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
