export const queryKeys = {
profile: ['profile'],
stats: ['stats'],
leaderboard: ['leaderboard'],
matches: ['matches'],
};
// Call this when a match ends, so profile, stats, leaderboard and history
//refresh by themselves.
export function refreshAfterMatch(queryClient) {
Object.values(queryKeys).forEach((queryKey) => {
queryClient.invalidateQueries({ queryKey });
});
}