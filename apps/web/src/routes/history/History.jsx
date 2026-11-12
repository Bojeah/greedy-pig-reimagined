import { useInfiniteQuery } from '@tanstack/react-query';
import PageShell from 'src/components/ui/PageShell';
import StateMessage from 'src/components/ui/StateMessage';
import MatchCard from 'src/components/leaderboard/MatchCard';
import { apiFetch } from 'src/services/api';
import { queryKeys } from 'src/services/queryKeys';
export default function History() {
const query = useInfiniteQuery({
queryKey: queryKeys.matches,
queryFn: ({ pageParam }) =>
apiFetch(`/api/matches?limit=10${pageParam ?
`&cursor=${encodeURIComponent(pageParam)}` : ''}`),
initialPageParam: null,
getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
});
const matches = query.data?.pages.flatMap((page) => page.matches) ?? [];
return (
<PageShell title="Match history">
{query.isPending && <StateMessage kind="loading" text="Loading your
matches..." />}
{query.isError && ( 
    <StateMessage kind="error"
text={query.error.message}
action={
<button onClick={() => query.refetch()} className="rounded bg-
[#D30CBD] px-4 py-2 font-bold">
Try again
</button>
}
/>
)}
{query.data && matches.length === 0 && (
<StateMessage kind="empty" text="No finished matches yet. Play an
online game and it will show up here." />
)}
{matches.length > 0 && (
<ul className="flex flex-col gap-3">
{matches.map((match) => (
<MatchCard key={match.id} match={match} />
))}
</ul>
)}
{query.hasNextPage && (
<div className="mt-4 text-center">
<button
onClick={() => query.fetchNextPage()}
disabled={query.isFetchingNextPage}
className="rounded bg-[#D30CBD] px-6 py-2 font-bold
disabled:opacity-60"
>
{query.isFetchingNextPage ? 'Loading...' : 'Load more'}
</button>
</div>
)}
</PageShell>
);
}