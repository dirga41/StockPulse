import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockPulse",
  description: "Pemantauan stok multi-cabang dengan alert stok kritis",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
