export default function LeaderboardTable({ entries, myId }) {
return (
<div className="overflow-x-auto">
<table className="w-full text-left">
<caption className="sr-only">Top players ranked by wins</caption>
<thead className="border-b border-[#ffffff80] text-sm text-[#ffffffb0]">
<tr>
<th scope="col" className="p-2">Rank</th>
<th scope="col" className="p-2">Player</th>
<th scope="col" className="p-2">Level</th>
<th scope="col" className="p-2">Wins</th>
<th scope="col" className="p-2">Games</th>
<th scope="col" className="p-2">Win rate</th>
</tr>
</thead>
<tbody>
{entries.map((entry) => {
const mine = entry.userId === myId;
return (
<tr
key={entry.userId}
aria-current={mine ? 'true' : undefined}
className={`border-b border-[#ffffff20] ${
mine ? 'bg-[#D30CBD30] font-bold' : entry.rank === 1 ?
'text-[#FFEA70]' : ''
}`}
>
<td className="p-2">{entry.rank}</td>
<td className="p-2">
{entry.username}
{mine ? ' (you)' : ''}
</td>
<td className="p-2">{entry.level}</td>
<td className="p-2">{entry.wins}</td>
<td className="p-2">{entry.gamesPlayed}</td>
<td className="p-2">{entry.winRate}%</td>
</tr>
);
})}
</tbody>
</table>
</div>
);
}