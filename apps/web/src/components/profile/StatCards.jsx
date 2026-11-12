function Card({ label, value }) {
return (
<div className="rounded-lg border border-[#ffffff40] bg-[#ffffff10] p-3
text-center">
<p className="pri-font text-2xl">{value}</p>
<p className="text-xs text-[#ffffffb0]">{label}</p>
</div>
);
}
export default function StatCards({ stats }) {
return (
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
<Card label="Games played" value={stats.gamesPlayed} />
<Card label="Wins" value={stats.wins} />
<Card label="Win rate" value={`${stats.winRate}%`} />
<Card label="Best turn" value={stats.highestTurnScore} />
<Card label="Best game" value={stats.highestGameScore} />
<Card label="Leaderboard rank" value={stats.rank ? `#${stats.rank}` :
'-'} />
</div>
);
}