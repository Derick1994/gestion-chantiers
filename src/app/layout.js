import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/session";
import { logout } from "@/app/login/actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gestion des chantiers",
  description: "Suivi des dépenses par chantier",
};

export default async function RootLayout({ children }) {
  const session = await getSession();
  const isLoggedIn = Boolean(session.userId);
  const isAdmin = session.role === "ADMIN";

  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        {isLoggedIn && (
          <header className="bg-slate-900 text-white">
            <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <Link href="/chantiers" className="font-semibold tracking-tight">
                  🏗️ Gestion des chantiers
                </Link>
                <nav className="flex gap-4 text-sm text-slate-300">
                  <Link href="/chantiers" className="hover:text-white">
                    Chantiers
                  </Link>
                  <Link href="/depenses" className="hover:text-white">
                    Dépenses
                  </Link>
                  <Link href="/caisse" className="hover:text-white">
                    Caisse
                  </Link>
                  {isAdmin && (
                    <>
                      <Link href="/admin/utilisateurs" className="hover:text-white">
                        Utilisateurs
                      </Link>
                      <Link href="/admin/categories" className="hover:text-white">
                        Catégories
                      </Link>
                      <Link href="/admin/journal" className="hover:text-white">
                        Journal
                      </Link>
                    </>
                  )}
                </nav>
              </div>
              <form action={logout} className="flex items-center gap-3 text-sm text-slate-300">
                <span>{session.nom}</span>
                <button type="submit" className="hover:text-white underline">
                  Déconnexion
                </button>
              </form>
            </div>
          </header>
        )}
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
