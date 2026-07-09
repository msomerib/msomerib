"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ConfirmButton({
  day,
  initiallyConfirmed,
}: {
  day: number;
  initiallyConfirmed: boolean;
}) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(initiallyConfirmed);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    const action = confirmed ? "unconfirm" : "confirm";
    const res = await fetch("/api/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day, action }),
    });
    if (res.ok) {
      setConfirmed(!confirmed);
      router.refresh();
    }
    setPending(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`w-full rounded-lg px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50 ${
        confirmed
          ? "bg-emerald-600 text-white hover:bg-emerald-700"
          : "bg-amber-600 text-white hover:bg-amber-700"
      }`}
    >
      {confirmed ? "✓ Leitura confirmada — desmarcar" : "Confirmar leitura de hoje"}
    </button>
  );
}
