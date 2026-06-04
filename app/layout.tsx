import type { Metadata } from "next";
import "./globals.css";
import { Inter, Nunito } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito', weight: ['600'] });

export const metadata: Metadata = {
  title: "BruinFun",
  description: "A place for UCLA students to find fun.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable, nunito.variable)}>
      <body>{children}</body>
    </html>
  );
}
