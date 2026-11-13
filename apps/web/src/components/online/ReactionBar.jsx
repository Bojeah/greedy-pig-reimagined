// The social feature: quick emoji reactions everyone in the room sees.
// This list must match REACTIONS in the server's roomService.js.
const EMOJIS = ["🐷", "😂", "🔥", "👏", "😮", "😭"];

export default function ReactionBar({ onReact, recent }) {
  return (
    <section
      aria-label="Reactions"
      className="flex flex-col items-center gap-2"
    >
      <div className="flex gap-2">
        {EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            aria-label={`Send ${emoji}`}
            className="rounded-full border border-[#ffffff40] bg-[#ffffff10] px-3 py-2 text-xl duration-200 hover:scale-110 hover:bg-[#ffffff30]"
          >
            {emoji}
          </button>
        ))}
      </div>
      <ul
        aria-live="polite"
        className="flex min-h-[1.5rem] flex-wrap justify-center gap-2 text-sm"
      >
        {recent.map((reaction) => (
          <li key={reaction.id} className="rounded bg-[#ffffff15] px-2 py-0.5">
            {reaction.username} {reaction.emoji}
          </li>
        ))}
      </ul>
    </section>
  );
}
