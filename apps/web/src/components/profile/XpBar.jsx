export default function XpBar({ level, xpIntoLevel, xpForNextLevel }) {
const percent = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) *
100));
return (
<div className="w-full">
<div className="mb-1 flex items-end justify-between">
<span className="pri-font text-2xl">Level {level}</span>
<span className="text-sm">
{xpIntoLevel} / {xpForNextLevel} XP to level {level + 1}
</span>
</div>
<div
role="progressbar"
aria-label="Experience points"
aria-valuemin={0}
aria-valuemax={xpForNextLevel}
aria-valuenow={xpIntoLevel}
className="h-4 w-full overflow-hidden rounded-full bg-[#ffffff20]"
>
<div className="h-full bg-[#D30CBD] duration-500" style={{ width:
`${percent}%` }} />
</div>
</div>
);
}
