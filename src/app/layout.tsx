import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Menu } from "@/components/menu";
import "./globals.css";

const montserrat = Montserrat({ variable: "--font-montserrat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reactor de Clientes · Atom",
  description: "Buscá clientes, contactalos y seguí tus números desde un solo lugar.",
};

// Cada pantalla lee tu configuración y tu base en el momento.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans text-[15px] leading-normal md:flex-row">
        <Menu />
        <main className="flex min-w-0 flex-1 flex-col gap-6 px-5 py-8 md:px-10">{children}</main>
      </body>
    </html>
  );
}
