import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StamPass VIP - Tarjetas de Fidelización Digitales",
  description: "Fidelización digital en Apple Wallet y Google Wallet para comercios y hostelería.",
  icons: {
    icon: "/stampass-icon-crown.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#0B0F19] text-white selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
