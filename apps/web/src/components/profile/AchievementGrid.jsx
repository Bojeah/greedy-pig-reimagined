export default function AchievementGrid({ achievements }) {
return (
<ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
{achievements.map((a) => (
<li
key={a.key}
className={`rounded-lg border p-3 ${
a.unlocked
? 'border-[#FFD700c0] bg-[#FFD70015] text-[#FFEA70]'
: 'border-[#ffffff30] bg-[#ffffff08] text-[#ffffff80]'
}`}
>
<p className="font-bold">
{a.unlocked ? '★ ' : '🔒 '}
{a.name}
</p>
<p className="text-sm">{a.description}</p>
{a.unlocked && a.unlockedAt && (
<p className="mt-1 text-xs">Unlocked {new
Date(a.unlockedAt).toLocaleDateString()}</p>
)}
</li>
))}
</ul>
);
}
