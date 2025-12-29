import { WebSocketServer } from "ws"
import { applyAction, createGame, getPlayerColors } from "../shared/game.js"

const wss = new WebSocketServer({ port: 5174 })
const rooms = new Map()

const createRoomId = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase()

const send = (socket, payload) => {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload))
  }
}

const broadcast = (room, payload) => {
  room.sockets.forEach((socket) => send(socket, payload))
  if (room.displaySocket) {
    send(room.displaySocket, payload)
  }
}

const buildRoomPayload = (room) => ({
  type: "room",
  roomId: room.id,
  players: room.players,
  displayConnected: Boolean(room.displaySocket),
  hasGame: Boolean(room.game),
})

const buildPlayerState = (state, playerId) => {
  if (!state) return null
  const publicPlayers = state.players.map((player) => ({
    id: player.id,
    name: player.name,
    color: player.color,
    position: player.position,
    bankrupt: player.bankrupt,
    inJail: player.inJail,
    jailTurns: player.jailTurns,
  }))
  const self = state.players.find((player) => player.id === playerId)
  return {
    ...state,
    players: publicPlayers,
    self,
    currentPlayerId: state.players[state.currentPlayerIndex]?.id ?? null,
  }
}

const sendState = (room) => {
  if (room.displaySocket) {
    send(room.displaySocket, { type: "state", state: room.game, view: "display" })
  }
  room.sockets.forEach((socket, playerId) => {
    send(socket, {
      type: "state",
      state: buildPlayerState(room.game, playerId),
      view: "player",
    })
  })
}

const addPlayer = (room, name) => {
  const colors = getPlayerColors(room.players.length + 1)
  const color = colors[room.players.length]
  const player = {
    id: Math.random().toString(36).slice(2, 9),
    name,
    color,
    connected: true,
  }
  room.players.push(player)
  return player
}

wss.on("connection", (socket) => {
  socket.on("message", (data) => {
    let message
    try {
      message = JSON.parse(data.toString())
    } catch (error) {
      send(socket, { type: "error", message: "Invalid message." })
      return
    }

    if (message.type === "create-room") {
      if (message.role !== "display") {
        send(socket, { type: "error", message: "Display must create the room." })
        return
      }
      const roomId = createRoomId()
      const room = {
        id: roomId,
        players: [],
        sockets: new Map(),
        displaySocket: socket,
        game: null,
      }
      rooms.set(roomId, room)
      socket.role = "display"
      socket.roomId = roomId
      send(socket, { type: "joined", roomId, role: "display" })
      broadcast(room, buildRoomPayload(room))
      return
    }

    if (message.type === "join-room") {
      const room = rooms.get(message.roomId)
      if (!room) {
        send(socket, { type: "error", message: "Room not found." })
        return
      }
      if (message.role === "display") {
        room.displaySocket = socket
        socket.role = "display"
        socket.roomId = room.id
        send(socket, { type: "joined", roomId: room.id, role: "display" })
        broadcast(room, buildRoomPayload(room))
        if (room.game) {
          sendState(room)
        }
        return
      }
      if (room.players.length >= 6) {
        send(socket, { type: "error", message: "Room is full." })
        return
      }
      if (room.game) {
        send(socket, { type: "error", message: "Game already started." })
        return
      }
      const player = addPlayer(room, message.name || "Player")
      room.sockets.set(player.id, socket)
      socket.playerId = player.id
      socket.roomId = room.id
      socket.role = "player"
      send(socket, { type: "joined", roomId: room.id, playerId: player.id, role: "player" })
      broadcast(room, buildRoomPayload(room))
      return
    }

    const room = rooms.get(socket.roomId)
    if (!room) {
      send(socket, { type: "error", message: "Not in a room." })
      return
    }

    if (message.type === "start-game") {
      if (socket.role !== "display") {
        send(socket, { type: "error", message: "Only the display can start." })
        return
      }
      room.game = createGame(room.players)
      sendState(room)
      return
    }

    if (message.type === "action") {
      if (!room.game) return
      if (socket.role !== "player") return
      if (message.action?.playerId !== socket.playerId) return
      room.game = applyAction(room.game, message.action, Math.random)
      sendState(room)
      return
    }
  })

  socket.on("close", () => {
    const room = rooms.get(socket.roomId)
    if (!room) return
    if (socket.role === "display") {
      room.displaySocket = null
      broadcast(room, buildRoomPayload(room))
      if (room.players.every((player) => !player.connected)) {
        rooms.delete(room.id)
      }
      return
    }
    if (socket.playerId) {
      room.sockets.delete(socket.playerId)
      room.players = room.players.map((player) =>
        player.id === socket.playerId ? { ...player, connected: false } : player,
      )
      if (room.players.every((player) => !player.connected)) {
        rooms.delete(room.id)
        return
      }
      broadcast(room, buildRoomPayload(room))
    }
  })
})

console.log("Chanchopoly server running on ws://localhost:5174")
