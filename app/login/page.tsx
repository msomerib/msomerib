import { redirect } from "next/navigation";
import { listUsers } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/");

  const names = (await listUsers()).map((u) => u.name);

  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl font-semibold text-center mb-1">Leitura em Família</h1>
        <p className="text-center text-stone-500 dark:text-stone-400 mb-8 text-sm">
          Escolha seu nome e digite seu PIN para entrar.
        </p>
        <LoginForm names={names} />
      </div>
    </div>
  );
}
