import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageShell from "src/components/ui/PageShell";
import StateMessage from "src/components/ui/StateMessage";
import ConnectionBanner from "src/components/online/ConnectionBanner";
import Lobby from "src/components/online/Lobby";
import GameBoard from "src/components/online/GameBoard";
import GameOverPanel from "src/components/online/GameOverPanel";
import ReactionBar from "src/components/online/ReactionBar";
import useAuth from "src/hooks/useAuth";
import useRoom from "src/hooks/useRoom";

// Errors that mean "you cannot be in this room at all".
const FATAL_CODES = ["ROOM_NOT_FOUND", "ROOM_FULL", "GAME_ALREADY_STARTED"];

export default function Room() {
  const { code } = useParams();
  const roomCode = code.toUpperCase();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { state, joinRoom, leaveRoom, startGame, roll, bank, react } =
    useRoom();
  const { room, connection, error, gameOver, rolling, lastEvent, reactions } =
    state;

  // Join on arrival. The provider joins again by itself after every reconnect.
  useEffect(() => {
    joinRoom(roomCode);
  }, [roomCode, joinRoom]);

  const fatal = !room && error && FATAL_CODES.includes(error.code);

  function handleLeave() {
    leaveRoom();
    navigate("/play-online");
  }

  if (fatal) {
    return (
      <PageShell title="Cannot join this room">
        <StateMessage
          kind="error"
          text={error.message}
          action={
            <Link
              to="/play-online"
              className="rounded bg-[#D30CBD] px-4 py-2 font-bold"
            >
              Back to Play online
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell title={room ? `Room ${room.code}` : "Joining room..."}>
      <ConnectionBanner connection={connection} />

      {!room && <StateMessage kind="loading" text="Joining the room..." />}

      {room && room.status === "LOBBY" && (
        <Lobby
          room={room}
          meId={user.id}
          onStart={startGame}
          onLeave={handleLeave}
        />
      )}

      {room && room.status !== "LOBBY" && (
        <GameBoard
          room={room}
          meId={user.id}
          rolling={rolling}
          lastEvent={lastEvent}
          onRoll={roll}
          onBank={bank}
        />
      )}

      {room && (
        <div className="mt-8">
          <ReactionBar onReact={react} recent={reactions} />
        </div>
      )}

      {room && room.status === "FINISHED" && (
        <GameOverPanel gameOver={gameOver} meId={user.id} />
      )}
    </PageShell>
  );
}
