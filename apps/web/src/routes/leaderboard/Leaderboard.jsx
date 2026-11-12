import { useQuery } from '@tanstack/react-query';
import PageShell from 'src/components/ui/PageShell';
import StateMessage from 'src/components/ui/StateMessage';
import LeaderboardTable from 'src/components/leaderboard/LeaderBoardTable';
import useAuth from 'src/hooks/useAuth';
import { apiFetch } from 'src/services/api';
import { queryKeys } from 'src/services/queryKeys';
export default function Leaderboard() {
const { user } = useAuth();
const { data, isPending, isError, error, refetch } = useQuery({
queryKey: queryKeys.leaderboard,
queryFn: () => apiFetch('/api/leaderboard?limit=20', { auth: false }),
staleTime: 30 * 1000,
});
return (
<PageShell title="Leaderboard">
{isPending && <StateMessage kind="loading" text="Loading the
leaderboard..." />}
{isError && (
<StateMessage
kind="error"
text={error.message}
action={
<button onClick={() => refetch()} className="rounded bg-[#D30CBD]
px-4 py-2 font-bold">
Try again
</button>
}
/>
)}
{data && data.entries.length === 0 && (
<StateMessage kind="empty" text="Nobody has played 3 matches yet. Be
the first on the board!" />
)}{data && data.entries.length > 0 && <LeaderboardTable entries=
{data.entries} myId={user?.id} />}
<p className="mt-4 text-center text-xs text-[#ffffffa0]">
Only registered players with at least 3 counted matches appear here.
</p>
</PageShell>
);
}