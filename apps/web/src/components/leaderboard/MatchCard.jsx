export default function MatchCard({ match }) {
const opponents = match.players.map((p) => `${p.username}
(${p.finalScore})`).join(', ');
return (
<li
className={`rounded-lg border p-3 ${
match.won ? 'border-[#FFD700c0] bg-[#FFD70010]' : 'border-[#ffffff30] bg-[#ffffff08]'
}`}
>
<div className="flex items-center justify-between">
<p className="font-bold">
{match.won ? 'Won' : 'Lost'}
{match.myPlacement ? `, finished #${match.myPlacement}` : ''}
</p>
<p className="text-sm">
{match.myScore} / {match.targetScore}
</p>
</div>
<p className="text-sm text-[#ffffffb0]">{opponents}</p>
{match.endedAt && (<p className="text-xs text-[#ffffff90]">{new
Date(match.endedAt).toLocaleString()}</p>
)}
</li>
);
}
