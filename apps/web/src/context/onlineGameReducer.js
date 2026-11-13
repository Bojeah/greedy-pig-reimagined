// All the live-game state in one place. The browser never works out scores or turns,
// it only stores what the server says. A reducer takes the current state and an action
// (something that happened) and returns the new state.
export const initialOnlineState = {
  connection: "connecting", // 'connecting' | 'connected' | 'reconnecting'
  room: null, // the latest room:state from the server
  lastEvent: null, // the latest game:event, used for animation and the text feed
  gameOver: null, // the game:over payload
  error: null, // the latest error:message
  rolling: false, // true between pressing Roll and the server's answer
  reactions: [], // the last few emoji reactions
};

export function onlineReducer(state, action) {
  switch (action.type) {
    case "reset":
      return { ...initialOnlineState, connection: state.connection };

    case "room_state": {
      // Messages can arrive late. If this one is older than what we already show, ignore it.
      const oldVersion = state.room?.game?.version ?? -1;
      const newVersion = action.room.game?.version ?? -1;
      if (newVersion < oldVersion) return state;
      return { ...state, room: action.room, error: null };
    }

    case "connection":
      return { ...state, connection: action.status };

    case "rolling":
      return { ...state, rolling: true };

    case "rolling_timeout":
      return { ...state, rolling: false };

    case "game_event":
      return { ...state, lastEvent: action.event, rolling: false };

    case "game_over":
      return { ...state, gameOver: action.payload, rolling: false };

    case "error":
      return { ...state, error: action.error, rolling: false };

    case "reaction":
      return {
        ...state,
        reactions: [...state.reactions.slice(-2), action.reaction],
      };

    default:
      return state;
  }
}
