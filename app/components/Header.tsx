import Link from "next/link";
import { getSessionUser } from "@/lib/session";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const user = await getSessionUser();

  return (
    <header className="border-b border-stone-200 dark:border-stone-800">
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg font-semibold tracking-tight">
          Leitura em Família
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <Link
              href="/historico"
              className="text-sm text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
            >
              Histórico
            </Link>
            <span className="text-sm text-stone-500 dark:text-stone-400">{user.name}</span>
            <LogoutButton />
          </div>
        )}
      </div>
    </header>
  );
}
