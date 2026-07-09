export default function GroupStatus({
  members,
}: {
  members: { name: string; confirmed: boolean; isMe: boolean }[];
}) {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-5">
      <p className="text-xs uppercase tracking-wide text-stone-500 dark:text-stone-400 font-medium mb-3">
        Quem já leu hoje
      </p>
      <ul className="flex flex-col gap-2">
        {members.map((m) => (
          <li key={m.name} className="flex items-center gap-2 text-sm">
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                m.confirmed
                  ? "bg-emerald-600 text-white"
                  : "bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400"
              }`}
            >
              {m.confirmed ? "✓" : ""}
            </span>
            <span className={m.isMe ? "font-medium" : ""}>
              {m.name}
              {m.isMe && " (você)"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
