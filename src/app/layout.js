import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gestion des chantiers",
  description: "Suivi des dépenses par chantier",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <header className="bg-slate-900 text-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-6">
            <Link href="/chantiers" className="font-semibold tracking-tight">
              🏗️ Gestion des chantiers
            </Link>
            <nav className="flex gap-4 text-sm text-slate-300">
              <Link href="/chantiers" className="hover:text-white">
                Chantiers
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
