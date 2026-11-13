import { useSearchParams } from "react-router-dom";
import PageShell from "src/components/ui/PageShell";
import Lobby from "src/components/online/Lobby";
import GameBoard from "src/components/online/GameBoard";
import GameOverPanel from "src/components/online/GameOverPanel";
import ReactionBar from "src/components/online/ReactionBar";
import {
  MOCK_ME,
  mockGameOver,
  mockLobby,
  mockPlaying,
} from "src/components/online/mockRoom";

// TEMPORARY preview with fake data. Open /play-online/room/ABCDE?view=lobby (or playing, rolling, over).
export default function Room() {
  const [params] = useSearchParams();
  const view = params.get("view") || "lobby";
  const noop = () => {};

  return (
    <PageShell title="Preview (fake data)">
      {view === "lobby" && (
        <Lobby
          room={mockLobby()}
          meId={MOCK_ME}
          onStart={noop}
          onLeave={noop}
        />
      )}
      {view !== "lobby" && (
        <GameBoard
          room={mockPlaying()}
          meId={MOCK_ME}
          rolling={view === "rolling"}
          lastEvent={{ type: "ROLL", playerId: "me", value: 4 }}
          onRoll={noop}
          onBank={noop}
        />
      )}
      <div className="mt-8">
        <ReactionBar
          onReact={noop}
          recent={[{ id: 1, username: "bola", emoji: "🔥" }]}
        />
      </div>
      {view === "over" && (
        <GameOverPanel gameOver={mockGameOver} meId={MOCK_ME} />
      )}
    </PageShell>
  );
}
