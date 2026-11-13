import usePageTitle from 'src/hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageShell from 'src/components/ui/PageShell';
import StateMessage from 'src/components/ui/StateMessage';
import XpBar from 'src/components/profile/XpBar';
import StatCards from 'src/components/profile/StatCards';
import AchievementGrid from 'src/components/profile/AchievementGrid';
import { apiFetch } from 'src/services/api';
import { queryKeys } from 'src/services/queryKeys';
export default function Profile() {
    usePageTitle('Profile');
const profile = useQuery({ queryKey: queryKeys.profile, queryFn: () =>
apiFetch('/api/profile') });
const stats = useQuery({ queryKey: queryKeys.stats, queryFn: () =>
apiFetch('/api/stats') });
if (profile.isPending || stats.isPending) {
return (
<PageShell title="Profile">
<StateMessage kind="loading" text="Loading your profile..." />
</PageShell>
);
}
if (profile.isError || stats.isError) {
const message = (profile.error || stats.error).message;
return (
<PageShell title="Profile">
<StateMessage
kind="error"
text={message}
action={
<button
onClick={() => {
profile.refetch();
stats.refetch();
}}
className="rounded bg-[#D30CBD] px-4 py-2 font-bold"
>
Try again
</button>
}
/>
</PageShell>
);
}
const { user, achievements } = profile.data;
return (
<PageShell title={user.username}>
<div className="flex flex-col gap-8">
{user.isGuest ? (<div className="rounded-lg border border-[#D30CBD] bg-[#D30CBD20]
p-4 text-center">
<p className="mb-3">
You are playing as a guest. Create an account to earn XP,
unlock achievements and
appear on the leaderboard.
</p>
<Link to="/register" className="rounded bg-[#D30CBD] px-4 py-2
font-bold">
Create an account
</Link>
</div>
) : (
<XpBar
level={user.level}
xpIntoLevel={user.xpIntoLevel}
xpForNextLevel={user.xpForNextLevel}
/>
)}
<section aria-labelledby="stats-heading">
<h2 id="stats-heading" className="pri-font mb-3 text-xl">
Stats
</h2>
<StatCards stats={stats.data} />
</section>
<section aria-labelledby="achievements-heading">
<h2 id="achievements-heading" className="pri-font mb-3 text-xl">
Achievements
</h2>
<AchievementGrid achievements={achievements} />
</section>
<Link to="/history" className="text-center font-bold underline">
See my match history
</Link>
</div>
</PageShell>
);
}
