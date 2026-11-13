import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from "src/hooks/useAuth";
import useToast from "src/hooks/useToast";
import { clearToken } from "src/services/api";
import { refreshAfterMatch } from "src/services/queryKeys";
import { showProgressionToasts } from "src/services/progression";
import { disconnectSocket, getSocket } from "src/services/socket";
import { initialOnlineState, onlineReducer } from "./onlineGameReducer";

export const OnlineGameContext = createContext(null);

export function OnlineGameProvider({ children }) {
  const [state, dispatch] = useReducer(onlineReducer, initialOnlineState);
  const queryClient = useQueryClient();
  const toast = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  const codeRef = useRef(null); // the room we are supposed to be in
  const rollingTimer = useRef(null);

  // Connect when the online pages open, disconnect when they close.
  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      dispatch({ type: "connection", status: "connected" });
      // After EVERY (re)connection the server sees a new connection, so we join the room again.
      if (codeRef.current) socket.emit("room:join", { code: codeRef.current });
    };
    const onDisconnect = () =>
      dispatch({ type: "connection", status: "reconnecting" });
    const onConnectError = (err) => {
      dispatch({ type: "connection", status: "reconnecting" });
      if (err.message === "UNAUTHORIZED") {
        clearToken();
        window.dispatchEvent(new Event("gp:unauthorized"));
      }
    };
    const onRoomState = (room) => dispatch({ type: "room_state", room });
    const onGameEvent = (event) => {
      clearTimeout(rollingTimer.current);
      dispatch({ type: "game_event", event });
    };
    const onGameOver = (payload) => {
      dispatch({ type: "game_over", payload });
      refreshAfterMatch(queryClient);
      showProgressionToasts(toast, payload.progression, userId);
    };
    const onError = (error) => {
      clearTimeout(rollingTimer.current);
      dispatch({ type: "error", error });
      toast.error(error.message);
    };
    const onReaction = (reaction) =>
      dispatch({
        type: "reaction",
        reaction: { ...reaction, id: `${Date.now()}-${Math.random()}` },
      });

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("room:state", onRoomState);
    socket.on("game:event", onGameEvent);
    socket.on("game:over", onGameOver);
    socket.on("error:message", onError);
    socket.on("room:reaction", onReaction);
    socket.connect();

    return () => {
      clearTimeout(rollingTimer.current);
      disconnectSocket();
    };
  }, [queryClient, toast, userId]);

  const joinRoom = useCallback((code) => {
    codeRef.current = code;
    dispatch({ type: "reset" });
    const socket = getSocket();
    if (socket.connected) socket.emit("room:join", { code });
  }, []);

  const leaveRoom = useCallback(() => {
    getSocket().emit("room:leave");
    codeRef.current = null;
    dispatch({ type: "reset" });
  }, []);

  const startGame = useCallback(() => getSocket().emit("room:start"), []);
  const bank = useCallback(() => getSocket().emit("game:bank"), []);
  const react = useCallback(
    (emoji) => getSocket().emit("room:react", { emoji }),
    [],
  );

  const roll = useCallback(() => {
    dispatch({ type: "rolling" });
    // If the server never answers, do not leave the player stuck.
    clearTimeout(rollingTimer.current);
    rollingTimer.current = setTimeout(() => {
      dispatch({ type: "rolling_timeout" });
      toast.error("The server did not answer. Please try again.");
    }, 5000);
    getSocket().emit("game:roll");
  }, [toast]);

  const value = useMemo(
    () => ({ state, joinRoom, leaveRoom, startGame, roll, bank, react }),
    [state, joinRoom, leaveRoom, startGame, roll, bank, react],
  );

  return (
    <OnlineGameContext.Provider value={value}>
      {children}
    </OnlineGameContext.Provider>
  );
}
