import { useContext } from "react";
import { OnlineGameContext } from "src/context/OnlineGameContext";

// Everything the online pages need: the live state and the actions (join, start, roll, bank...).
export default function useRoom() {
  const online = useContext(OnlineGameContext);
  if (!online)
    throw new Error("useRoom must be used inside OnlineGameProvider");
  return online;
}
