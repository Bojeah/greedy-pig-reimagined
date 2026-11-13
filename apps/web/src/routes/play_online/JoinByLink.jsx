import { Navigate, useParams } from "react-router-dom";

// An invite link looks like /play-online/join/ABCDE. It simply forwards to the room.
export default function JoinByLink() {
  const { code } = useParams();
  return <Navigate to={`/play-online/room/${code.toUpperCase()}`} replace />;
}
