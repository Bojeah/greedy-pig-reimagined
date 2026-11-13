// Turns a game:event into a sentence for the activity line under the dice.
export function describeEvent(event, players) {
  if (!event) return "";
  const name =
    players.find((p) => p.userId === event.playerId)?.username ?? "Someone";
  switch (event.type) {
    case "ROLL":
      return `${name} rolled a ${event.value}.`;
    case "BUST":
      return `${name} rolled a 1 and lost the points for this turn.`;
    case "BANK":
      return `${name} passed and banked ${event.value} points.`;
    case "TIMEOUT":
      return event.value
        ? `${name} ran out of time and banked ${event.value} points.`
        : `${name} ran out of time.`;
    default:
      return "";
  }
}
