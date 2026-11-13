import { io } from "socket.io-client";
import { API_URL, getToken } from "src/services/api";

let socket = null;

// One shared connection to the server. It is created on first use.
// `auth` is a function so every (re)connection sends the latest login token.
export function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: (callback) => callback({ token: getToken() }),
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
