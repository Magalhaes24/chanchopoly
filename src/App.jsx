import { useEffect, useMemo, useRef, useState } from "react"
import boardImage from "./assets/Print Area.png"
import {
  applyAction,
  BOARD_TILES,
  createGame,
  getPlayerColors,
} from "../shared/game.js"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore"
import { db } from "./firebase.js"
import QRCode from "qrcode"

const PIP_MAP = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

const buildPositions = () => {
  const positions = []
  for (let i = 0; i <= 10; i += 1) {
    positions.push({ x: 100 - i * 10, y: 100 })
  }
  for (let i = 1; i <= 10; i += 1) {
    positions.push({ x: 0, y: 100 - i * 10 })
  }
  for (let i = 1; i <= 10; i += 1) {
    positions.push({ x: i * 10, y: 0 })
  }
  for (let i = 1; i <= 9; i += 1) {
    positions.push({ x: 100, y: i * 10 })
  }
  return positions
}

const buildJoinUrl = (roomId) => {
  const basePath = import.meta.env.BASE_URL ?? "/"
  const origin = window.location.origin
  return `${origin}${basePath}?room=${roomId}`
}

const filterStateForPlayer = (state, playerId) => {
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

const useOnlineState = () => {
  const [status, setStatus] = useState("idle")
  const [room, setRoom] = useState(null)
  const [roomPlayers, setRoomPlayers] = useState([])
  const [playerId, setPlayerId] = useState(null)
  const [role, setRole] = useState(null)
  const [game, setGame] = useState(null)
  const [error, setError] = useState(null)
  const gameRef = useRef(null)
  const processedActions = useRef(new Set())

  useEffect(() => {
    gameRef.current = game
  }, [game])

  useEffect(() => {
    if (!room?.id) return
    const roomRef = doc(db, "rooms", room.id)
    const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        setError("Room not found.")
        return
      }
      const data = snapshot.data()
      setRoom((prev) => ({ ...(prev ?? {}), ...data, id: snapshot.id }))
      if (data.state) {
        setGame(role === "player" ? filterStateForPlayer(data.state, playerId) : data.state)
      }
    })
    const playersRef = collection(roomRef, "players")
    const unsubscribePlayers = onSnapshot(playersRef, (snapshot) => {
      const list = snapshot.docs.map((docSnap) => docSnap.data())
      setRoomPlayers(list)
    })
    return () => {
      unsubscribeRoom()
      unsubscribePlayers()
    }
  }, [room?.id, role, playerId])

  useEffect(() => {
    if (!room?.id || role !== "display") return
    const actionsRef = collection(doc(db, "rooms", room.id), "actions")
    const actionsQuery = query(actionsRef, orderBy("createdAt"))
    const unsubscribeActions = onSnapshot(actionsQuery, (snapshot) => {
      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data()
        if (data.consumed || processedActions.current.has(docSnap.id)) return
        const currentState = gameRef.current
        if (!currentState) return
        const nextState = applyAction(currentState, data.action, Math.random)
        gameRef.current = nextState
        setGame(nextState)
        updateDoc(doc(db, "rooms", room.id), {
          state: nextState,
          updatedAt: serverTimestamp(),
        })
        updateDoc(doc(actionsRef, docSnap.id), { consumed: true })
        processedActions.current.add(docSnap.id)
      })
    })
    return () => unsubscribeActions()
  }, [room?.id, role])

  const createDisplayRoom = async () => {
    setStatus("connecting")
    const roomRef = doc(collection(db, "rooms"))
    await setDoc(roomRef, {
      createdAt: serverTimestamp(),
      status: "lobby",
      displayConnected: true,
      state: null,
    })
    setRoom({ id: roomRef.id })
    setRole("display")
    setStatus("connected")
    setError(null)
  }

  const joinDisplayRoom = async (roomId) => {
    setStatus("connecting")
    const roomRef = doc(db, "rooms", roomId)
    const snapshot = await getDoc(roomRef)
    if (!snapshot.exists()) {
      setError("Room not found.")
      setStatus("idle")
      return
    }
    await updateDoc(roomRef, { displayConnected: true })
    setRoom({ id: roomId })
    setRole("display")
    setStatus("connected")
    setError(null)
  }

  const joinPlayerRoom = async (roomId, name) => {
    setStatus("connecting")
    const roomRef = doc(db, "rooms", roomId)
    const snapshot = await getDoc(roomRef)
    if (!snapshot.exists()) {
      setError("Room not found.")
      setStatus("idle")
      return
    }
    const playersSnapshot = await getDocs(collection(roomRef, "players"))
    const playerCount = playersSnapshot.size
    const player = {
      id: Math.random().toString(36).slice(2, 9),
      name,
      color: getPlayerColors(playerCount + 1)[playerCount] ?? "#38bdf8",
      connected: true,
      createdAt: serverTimestamp(),
    }
    await setDoc(doc(collection(roomRef, "players"), player.id), player)
    setRoom({ id: roomId })
    setPlayerId(player.id)
    setRole("player")
    setStatus("connected")
    setError(null)
  }

  const startGame = async () => {
    if (!room?.id || role !== "display") return
    const gameState = createGame(roomPlayers)
    await updateDoc(doc(db, "rooms", room.id), {
      state: gameState,
      status: "playing",
      updatedAt: serverTimestamp(),
    })
    setGame(gameState)
  }

  const sendAction = async (action) => {
    if (!room?.id || !playerId) return
    const actionsRef = collection(doc(db, "rooms", room.id), "actions")
    await addDoc(actionsRef, {
      playerId,
      action: { ...action, playerId },
      createdAt: serverTimestamp(),
      consumed: false,
    })
  }

  return {
    status,
    room,
    roomPlayers,
    playerId,
    role,
    game,
    error,
    createDisplayRoom,
    joinDisplayRoom,
    joinPlayerRoom,
    startGame,
    sendAction,
  }
}

const DiceFace = ({ value }) => (
  <div className="dice-face">
    {Array.from({ length: 9 }).map((_, index) => (
      <span
        key={index}
        className={`dice-dot ${PIP_MAP[value]?.includes(index) ? "active" : ""}`}
      />
    ))}
  </div>
)

const Token = ({ color }) => (
  <span className="token" style={{ background: color }} />
)

const Board = ({ state }) => {
  const positions = useMemo(buildPositions, [])
  const tokensByTile = useMemo(() => {
    const map = new Map()
    state.players.forEach((player) => {
      const list = map.get(player.position) ?? []
      list.push(player)
      map.set(player.position, list)
    })
    return map
  }, [state.players])

  const offsets = [
    { x: -10, y: -10 },
    { x: 10, y: -10 },
    { x: -10, y: 10 },
    { x: 10, y: 10 },
    { x: 0, y: -16 },
    { x: -16, y: 0 },
  ]

  return (
    <div className="relative aspect-square w-full max-w-[720px] rounded-[32px] border border-emerald-300/30 bg-slate-900 shadow-[0_25px_60px_rgba(15,23,42,0.6)]">
      <img
        src={boardImage}
        alt="Chanchopoly board"
        className="h-full w-full rounded-[32px] object-cover"
      />
      {BOARD_TILES.map((tile, index) => {
        const position = positions[index]
        const tokens = tokensByTile.get(index) ?? []
        return (
          <div
            key={tile.id}
            className="absolute"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="relative h-8 w-8">
              {tokens.map((player, tokenIndex) => (
                <span
                  key={player.id}
                  className="absolute"
                  style={{
                    transform: `translate(${offsets[tokenIndex % offsets.length].x}px, ${offsets[tokenIndex % offsets.length].y}px)`,
                  }}
                >
                  <Token color={player.color} />
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const PlayerCard = ({ player, active }) => (
  <div
    className={`rounded-2xl border border-slate-800 bg-slate-900/70 p-4 ${
      active ? "ring-2 ring-emerald-300/60" : ""
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Token color={player.color} />
        <div>
          <p className="text-sm font-semibold">{player.name}</p>
          <p className="text-xs text-slate-400">
            ${player.money} {player.inJail ? "- In Jail" : ""}
          </p>
        </div>
      </div>
      <span className="text-xs text-slate-400">Pos {player.position}</span>
    </div>
  </div>
)

const PropertyList = ({ state, player, onAction, disabled }) => {
  const ownedTiles = state.board.filter((tile) => tile.ownerId === player.id)
  if (ownedTiles.length === 0) {
    return <p className="text-xs text-slate-400">No properties yet.</p>
  }
  return (
    <div className="space-y-2">
      {ownedTiles.map((tile) => (
        <div key={tile.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold">{tile.name}</p>
              <p className="text-[0.65rem] text-slate-400">
                {tile.mortgaged ? "Mortgaged" : "Active"} - Houses {tile.houses} {tile.hotel ? "- Hotel" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onAction({ type: "BUILD", tileIndex: tile.id })}
                disabled={disabled}
                className="rounded-full border border-emerald-300/40 px-2 py-0.5 text-[0.6rem] text-emerald-200"
              >
                Build
              </button>
              <button
                onClick={() => onAction({ type: "SELL_BUILDING", tileIndex: tile.id })}
                disabled={disabled}
                className="rounded-full border border-orange-300/40 px-2 py-0.5 text-[0.6rem] text-orange-200"
              >
                Sell
              </button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2 text-[0.6rem] text-slate-300">
            <button
              onClick={() => onAction({ type: "MORTGAGE", tileIndex: tile.id })}
              disabled={disabled}
              className="rounded-full border border-slate-700 px-2 py-0.5"
            >
              Mortgage
            </button>
            <button
              onClick={() => onAction({ type: "UNMORTGAGE", tileIndex: tile.id })}
              disabled={disabled}
              className="rounded-full border border-slate-700 px-2 py-0.5"
            >
              Unmortgage
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

const Lobby = ({ localPlayers, setLocalPlayers, onStartLocal, online }) => {
  const [localName, setLocalName] = useState("")
  const [joinCode, setJoinCode] = useState(
    new URLSearchParams(window.location.search).get("room")?.toUpperCase() ?? "",
  )
  const [displayCode, setDisplayCode] = useState("")
  const [onlineName, setOnlineName] = useState("")
  const [qrUrl, setQrUrl] = useState("")
  const colors = getPlayerColors(localPlayers.length + 1)

  const addLocalPlayer = () => {
    if (!localName.trim() || localPlayers.length >= 6) return
    const nextPlayer = {
      id: Math.random().toString(36).slice(2, 9),
      name: localName.trim(),
      color: colors[localPlayers.length],
    }
    setLocalPlayers([...localPlayers, nextPlayer])
    setLocalName("")
  }

  useEffect(() => {
    if (!online.room?.id || online.role !== "display") {
      setQrUrl("")
      return
    }
    const joinUrl = buildJoinUrl(online.room.id)
    QRCode.toDataURL(joinUrl, { margin: 1, width: 220 })
      .then((url) => setQrUrl(url))
      .catch(() => setQrUrl(""))
  }, [online.room?.id, online.role])

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <img src="/assets/logo.svg" alt="Chanchopoly" className="h-14 w-14" />
          <div>
            <p className="title-font text-3xl text-emerald-300">Chanchopoly</p>
            <p className="text-sm text-slate-300">
              Play locally on one screen or online with a shared room.
            </p>
          </div>
        </div>
        <div className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs text-emerald-200">
          Official rules applied
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3">
            <span className="title-font text-lg text-emerald-300">Local Play</span>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
              One device
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Add 2-6 players. Roll to determine order when the game starts.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              value={localName}
              onChange={(event) => setLocalName(event.target.value)}
              placeholder="Player name"
              className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-emerald-400 focus:outline-none"
            />
            <button
              onClick={addLocalPlayer}
              className="rounded-2xl border border-emerald-400/60 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200 transition hover:border-emerald-300"
            >
              Add
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {localPlayers.map((player) => (
              <div key={player.id} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3">
                <Token color={player.color} />
                <span className="text-sm">{player.name}</span>
              </div>
            ))}
          </div>
          <button
            onClick={onStartLocal}
            disabled={localPlayers.length < 2}
            className="mt-6 w-full rounded-2xl bg-emerald-400/20 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-400/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Start Local Game
          </button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center gap-3">
            <span className="title-font text-lg text-orange-300">Online Play</span>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
              Multiple devices
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-300">
            Use one device as the shared display. Players join with phones.
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-200">
              <p className="font-semibold text-orange-200">Display device</p>
              <p className="text-slate-300">Create or reconnect the shared screen.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    online.createDisplayRoom()
                  }}
                  className="rounded-2xl border border-orange-300/60 bg-orange-300/10 px-3 py-2 text-xs text-orange-200 transition hover:border-orange-200"
                >
                  Create Display Room
                </button>
                <input
                  value={displayCode}
                  onChange={(event) => setDisplayCode(event.target.value.toUpperCase())}
                  placeholder="Room code"
                  className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-100"
                />
                <button
                  onClick={() => {
                    online.joinDisplayRoom(displayCode.trim())
                  }}
                  className="rounded-2xl border border-orange-300/60 bg-orange-300/10 px-3 py-2 text-xs text-orange-200"
                >
                  Join Display
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-200">
              <p className="font-semibold text-orange-200">Player phone</p>
              <div className="mt-2 flex gap-2">
                <input
                  value={onlineName}
                  onChange={(event) => setOnlineName(event.target.value)}
                  placeholder="Your name"
                  className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-orange-300 focus:outline-none"
                />
                <input
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                  placeholder="Room code"
                  className="w-28 rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-100 focus:border-orange-300 focus:outline-none"
                />
                <button
                  onClick={() => {
                    online.joinPlayerRoom(joinCode.trim(), onlineName || "Player")
                  }}
                  className="rounded-2xl border border-orange-300/60 bg-orange-300/10 px-4 py-2 text-xs text-orange-200 transition hover:border-orange-200"
                >
                  Join Phone
                </button>
              </div>
            </div>
            {online.error && <p className="text-xs text-red-300">{online.error}</p>}
            {online.room?.id && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-200">
                Room: <span className="font-semibold text-orange-200">{online.room.id}</span>
              </div>
            )}
            {online.room?.id && online.role === "display" && qrUrl && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-200">
                <p className="font-semibold text-orange-200">Scan to join</p>
                <img src={qrUrl} alt="Join room QR code" className="mx-auto mt-3 h-40 w-40 rounded-xl" />
                <p className="mt-2 break-all text-[0.65rem] text-slate-400">
                  {buildJoinUrl(online.room.id)}
                </p>
              </div>
            )}
            {online.roomPlayers?.length ? (
              <div className="space-y-2">
                {online.roomPlayers.map((player) => (
                  <div key={player.id} className="flex items-center gap-2 text-xs text-slate-300">
                    <Token color={player.color} />
                    {player.name} {player.connected ? "" : "(offline)"}
                  </div>
                ))}
              </div>
            ) : null}
            {online.room?.id && online.role === "display" && !online.game && (
              <button
                onClick={() => online.startGame()}
                className="mt-2 w-full rounded-2xl bg-orange-300/20 px-4 py-2 text-sm font-semibold text-orange-200 transition hover:bg-orange-300/30"
              >
                Start Online Game
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const GameUI = ({ state, mode, onAction, onBack, activePlayerId }) => {
  const currentPlayer = state.players[state.currentPlayerIndex]
  const activeTrade = state.trade
  const canAct = !activePlayerId || currentPlayer.id === activePlayerId
  const auctionTurnId = state.auction?.activeIds?.[state.auction.turnIndex]
  const canAuctionAct = !activePlayerId || activePlayerId === auctionTurnId
  const canRespondTrade = !activePlayerId || activePlayerId === activeTrade?.toId
  const [tradePartner, setTradePartner] = useState("")
  const [offerMoney, setOfferMoney] = useState(0)
  const [requestMoney, setRequestMoney] = useState(0)
  const [offerProps, setOfferProps] = useState([])
  const [requestProps, setRequestProps] = useState([])
  const [offerJail, setOfferJail] = useState(0)
  const [requestJail, setRequestJail] = useState(0)
  const [bidAmount, setBidAmount] = useState("")

  const pendingTile = state.pendingPropertyId !== null ? state.board[state.pendingPropertyId] : null
  const setupPlayerId =
    state.phase === "setup"
      ? state.setup.tiePlayers?.[state.setup.index] ?? state.players[state.setup.index]?.id
      : null
  const setupPlayer = setupPlayerId ? state.players.find((player) => player.id === setupPlayerId) : null
  const sendTrade = () => {
    if (!tradePartner) return
    onAction({
      type: "TRADE_PROPOSE",
      toId: tradePartner,
      offer: { money: Number(offerMoney), properties: offerProps, jailCards: Number(offerJail) },
      request: { money: Number(requestMoney), properties: requestProps, jailCards: Number(requestJail) },
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="title-font text-3xl text-emerald-300">Chanchopoly</p>
          <p className="text-sm text-slate-300">
            {mode === "online" ? "Online room" : "Local table"} - {currentPlayer.name}'s turn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-slate-400"
          >
            Back
          </button>
          {state.lastRoll ? (
            <div className="flex gap-2">
              <DiceFace value={state.lastRoll[0]} />
              <DiceFace value={state.lastRoll[1]} />
            </div>
          ) : (
            <div className="text-xs text-slate-400">Roll to start</div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <Board state={state} />
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-emerald-200">Action Panel</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {state.phase === "setup" && (
                <button
                  onClick={() => onAction({ type: "ROLL_ORDER" })}
                  disabled={!canAct}
                  className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200 transition hover:border-emerald-200"
                >
                  Roll for Order {setupPlayer ? `(${setupPlayer.name})` : ""}
                </button>
              )}
              {state.phase === "await-roll" && (
                <>
                  {currentPlayer.inJail && (
                    <>
                      <button
                        onClick={() => onAction({ type: "PAY_JAIL" })}
                        disabled={!canAct}
                        className="rounded-2xl border border-orange-300/60 bg-orange-300/10 px-3 py-2 text-sm text-orange-200"
                      >
                        Pay $50
                      </button>
                      <button
                        onClick={() => onAction({ type: "USE_JAIL_CARD" })}
                        disabled={!canAct}
                        className="rounded-2xl border border-orange-300/60 bg-orange-300/10 px-3 py-2 text-sm text-orange-200"
                      >
                        Use Jail Card
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onAction({ type: "ROLL" })}
                    disabled={!canAct}
                    className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200 transition hover:border-emerald-200"
                  >
                    Roll Dice
                  </button>
                </>
              )}
              {state.phase === "chance" && (
                <button
                  onClick={() => onAction({ type: "DRAW_CHANCE" })}
                  disabled={!canAct}
                  className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200"
                >
                  Draw Chance
                </button>
              )}
              {state.phase === "community" && (
                <button
                  onClick={() => onAction({ type: "DRAW_COMMUNITY" })}
                  disabled={!canAct}
                  className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200"
                >
                  Draw Community Chest
                </button>
              )}
              {state.phase === "await-buy" && pendingTile && (
                <>
                  <button
                    onClick={() => onAction({ type: "BUY" })}
                    disabled={!canAct}
                    className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200"
                  >
                    Buy {pendingTile.name}
                  </button>
                  <button
                    onClick={() => onAction({ type: "DECLINE_BUY" })}
                    disabled={!canAct}
                    className="rounded-2xl border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm text-slate-200"
                  >
                    Start Auction
                  </button>
                </>
              )}
              {state.phase === "await-end" && (
                <button
                  onClick={() => onAction({ type: "END_TURN" })}
                  disabled={!canAct}
                  className="rounded-2xl border border-slate-600 bg-slate-800/60 px-4 py-2 text-sm text-slate-200"
                >
                  End Turn
                </button>
              )}
              {state.phase === "debt" && (
                <>
                  <button
                    onClick={() => onAction({ type: "RESOLVE_DEBT" })}
                    disabled={!canAct}
                    className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200"
                  >
                    Check Debt
                  </button>
                  <button
                    onClick={() => onAction({ type: "DECLARE_BANKRUPT" })}
                    disabled={!canAct}
                    className="rounded-2xl border border-red-400/60 bg-red-400/10 px-4 py-2 text-sm text-red-200"
                  >
                    Declare Bankruptcy
                  </button>
                </>
              )}
            </div>
            {pendingTile && state.phase === "await-buy" && (
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-xs text-slate-200">
                {pendingTile.name} - Price ${pendingTile.price}
              </div>
            )}
            {state.auction && (
              <div className="mt-4 rounded-2xl border border-orange-300/30 bg-orange-400/10 p-3 text-xs text-orange-200">
                <p className="font-semibold">Auction: {BOARD_TILES[state.auction.propertyId].name}</p>
                <p>Current bid: ${state.auction.currentBid || 0}</p>
                <div className="mt-2 flex gap-2">
                  <input
                    value={bidAmount}
                    onChange={(event) => setBidAmount(event.target.value)}
                    placeholder="Bid"
                    className="w-20 rounded-full border border-orange-300/40 bg-slate-950 px-2 py-1 text-xs text-orange-100"
                  />
                  <button
                    onClick={() => {
                      onAction({ type: "AUCTION_BID", amount: Number(bidAmount) })
                      setBidAmount("")
                    }}
                    disabled={!canAuctionAct}
                    className="rounded-full border border-orange-300/60 px-2 py-1 text-xs"
                  >
                    Bid
                  </button>
                  <button
                    onClick={() => onAction({ type: "AUCTION_PASS" })}
                    disabled={!canAuctionAct}
                    className="rounded-full border border-slate-600 px-2 py-1 text-xs"
                  >
                    Pass
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-emerald-200">Players</h2>
            <div className="mt-3 grid gap-3">
              {state.players.map((player, index) => (
                <PlayerCard key={player.id} player={player} active={index === state.currentPlayerIndex} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-emerald-200">Manage Properties</h2>
            <div className="mt-3">
              <PropertyList state={state} player={currentPlayer} onAction={onAction} disabled={!canAct} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-emerald-200">Trade</h2>
            {activeTrade ? (
              <div className="mt-3 text-xs text-slate-200">
                <p>Offer from {state.players.find((p) => p.id === activeTrade.fromId)?.name}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => onAction({ type: "TRADE_RESPOND", accept: true })}
                    disabled={!canRespondTrade}
                    className="rounded-full border border-emerald-300/60 px-3 py-1 text-xs text-emerald-200"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onAction({ type: "TRADE_RESPOND", accept: false })}
                    disabled={!canRespondTrade}
                    className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3 space-y-2 text-xs text-slate-200">
                <select
                  value={tradePartner}
                  onChange={(event) => setTradePartner(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
                >
                  <option value="">Choose partner</option>
                  {state.players
                    .filter((player) => player.id !== currentPlayer.id && !player.bankrupt)
                    .map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                </select>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="number"
                    value={offerMoney}
                    onChange={(event) => setOfferMoney(event.target.value)}
                    placeholder="Offer money"
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
                  />
                  <input
                    type="number"
                    value={requestMoney}
                    onChange={(event) => setRequestMoney(event.target.value)}
                    placeholder="Request money"
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="number"
                    value={offerJail}
                    onChange={(event) => setOfferJail(event.target.value)}
                    placeholder="Offer jail cards"
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
                  />
                  <input
                    type="number"
                    value={requestJail}
                    onChange={(event) => setRequestJail(event.target.value)}
                    placeholder="Request jail cards"
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-[0.6rem] uppercase text-slate-400">Offer Properties</p>
                    {currentPlayer.properties.map((id) => (
                      <label key={id} className="mt-1 flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={offerProps.includes(id)}
                          onChange={(event) =>
                            setOfferProps((prev) =>
                              event.target.checked ? [...prev, id] : prev.filter((item) => item !== id),
                            )
                          }
                        />
                        <span>{BOARD_TILES[id].name}</span>
                      </label>
                    ))}
                  </div>
                  <div>
                    <p className="text-[0.6rem] uppercase text-slate-400">Request Properties</p>
                    {tradePartner &&
                      state.players
                        .find((player) => player.id === tradePartner)
                        ?.properties.map((id) => (
                          <label key={id} className="mt-1 flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={requestProps.includes(id)}
                              onChange={(event) =>
                                setRequestProps((prev) =>
                                  event.target.checked ? [...prev, id] : prev.filter((item) => item !== id),
                                )
                              }
                            />
                            <span>{BOARD_TILES[id].name}</span>
                          </label>
                        ))}
                  </div>
                </div>
                  <button
                    onClick={sendTrade}
                    disabled={!canAct}
                    className="w-full rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-200"
                  >
                    Send Trade Offer
                  </button>
                </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="text-sm font-semibold text-emerald-200">Game Log</h2>
            <div className="mt-3 grid gap-2 text-xs text-slate-300">
              {state.log.map((entry, index) => (
                <div key={index} className="rounded-xl border border-slate-800 bg-slate-950/70 p-2">
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const HandUI = ({ state, onAction, onBack, playerId }) => {
  const self = state.self ?? state.players.find((player) => player.id === playerId)
  const currentTurnId =
    state.currentPlayerId ?? state.players[state.currentPlayerIndex]?.id ?? null
  const isTurn = currentTurnId === self?.id
  const pendingTile =
    state.pendingPropertyId !== null ? state.board[state.pendingPropertyId] : null
  const auctionTurnId = state.auction?.activeIds?.[state.auction.turnIndex]
  const canAuctionAct = self?.id === auctionTurnId
  const activeTrade = state.trade
  const canRespondTrade = activeTrade?.toId === self?.id
  const [bidAmount, setBidAmount] = useState("")
  const [tradePartner, setTradePartner] = useState("")
  const [offerMoney, setOfferMoney] = useState(0)
  const [requestMoney, setRequestMoney] = useState(0)
  const [offerProps, setOfferProps] = useState([])
  const [requestProps, setRequestProps] = useState([])
  const [offerJail, setOfferJail] = useState(0)
  const [requestJail, setRequestJail] = useState(0)
  const partnerProps = tradePartner
    ? state.board.filter((tile) => tile.ownerId === tradePartner).map((tile) => tile.id)
    : []

  if (!self) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-4 px-6 py-12 text-center text-slate-200">
        <p className="text-lg font-semibold">Connecting to room...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col gap-4 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="title-font text-2xl text-emerald-300">Chanchopoly</p>
          <p className="text-xs text-slate-400">Player hand</p>
        </div>
        <button
          onClick={onBack}
          className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300"
        >
          Back
        </button>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex items-center gap-3">
          <Token color={self.color} />
          <div>
            <p className="text-sm font-semibold">{self.name}</p>
            <p className="text-xs text-slate-400">
              ${self.money} {self.inJail ? "- In Jail" : ""}
            </p>
            <p className="text-[0.65rem] text-slate-500">
              Jail cards: {self.jailCards?.chance ?? 0} chance, {self.jailCards?.community ?? 0} community
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-300">
          {isTurn ? "Your turn" : `Waiting for ${state.players.find((p) => p.id === currentTurnId)?.name ?? "next player"}`}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-sm font-semibold text-emerald-200">Actions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {state.phase === "setup" && (
            <button
              onClick={() => onAction({ type: "ROLL_ORDER" })}
              disabled={!isTurn}
              className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-200"
            >
              Roll for Order
            </button>
          )}
          {state.phase === "await-roll" && (
            <>
              {self.inJail && (
                <>
                  <button
                    onClick={() => onAction({ type: "PAY_JAIL" })}
                    disabled={!isTurn}
                    className="rounded-2xl border border-orange-300/60 bg-orange-300/10 px-3 py-2 text-xs text-orange-200"
                  >
                    Pay $50
                  </button>
                  <button
                    onClick={() => onAction({ type: "USE_JAIL_CARD" })}
                    disabled={!isTurn}
                    className="rounded-2xl border border-orange-300/60 bg-orange-300/10 px-3 py-2 text-xs text-orange-200"
                  >
                    Use Jail Card
                  </button>
                </>
              )}
              <button
                onClick={() => onAction({ type: "ROLL" })}
                disabled={!isTurn}
                className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-200"
              >
                Roll Dice
              </button>
            </>
          )}
          {state.phase === "chance" && (
            <button
              onClick={() => onAction({ type: "DRAW_CHANCE" })}
              disabled={!isTurn}
              className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-200"
            >
              Draw Chance
            </button>
          )}
          {state.phase === "community" && (
            <button
              onClick={() => onAction({ type: "DRAW_COMMUNITY" })}
              disabled={!isTurn}
              className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-200"
            >
              Draw Community Chest
            </button>
          )}
          {state.phase === "await-buy" && pendingTile && (
            <>
              <button
                onClick={() => onAction({ type: "BUY" })}
                disabled={!isTurn}
                className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-200"
              >
                Buy {pendingTile.name}
              </button>
              <button
                onClick={() => onAction({ type: "DECLINE_BUY" })}
                disabled={!isTurn}
                className="rounded-2xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-xs text-slate-200"
              >
                Start Auction
              </button>
            </>
          )}
          {state.phase === "await-end" && (
            <button
              onClick={() => onAction({ type: "END_TURN" })}
              disabled={!isTurn}
              className="rounded-2xl border border-slate-600 bg-slate-800/60 px-3 py-2 text-xs text-slate-200"
            >
              End Turn
            </button>
          )}
          {state.phase === "debt" && (
            <>
              <button
                onClick={() => onAction({ type: "RESOLVE_DEBT" })}
                disabled={!isTurn}
                className="rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-200"
              >
                Check Debt
              </button>
              <button
                onClick={() => onAction({ type: "DECLARE_BANKRUPT" })}
                disabled={!isTurn}
                className="rounded-2xl border border-red-400/60 bg-red-400/10 px-3 py-2 text-xs text-red-200"
              >
                Declare Bankruptcy
              </button>
            </>
          )}
        </div>
        {state.auction && (
          <div className="mt-4 rounded-2xl border border-orange-300/30 bg-orange-400/10 p-3 text-xs text-orange-200">
            <p className="font-semibold">Auction: {BOARD_TILES[state.auction.propertyId].name}</p>
            <p>Current bid: ${state.auction.currentBid || 0}</p>
            <div className="mt-2 flex gap-2">
              <input
                value={bidAmount}
                onChange={(event) => setBidAmount(event.target.value)}
                placeholder="Bid"
                className="w-20 rounded-full border border-orange-300/40 bg-slate-950 px-2 py-1 text-xs text-orange-100"
              />
              <button
                onClick={() => {
                  onAction({ type: "AUCTION_BID", amount: Number(bidAmount) })
                  setBidAmount("")
                }}
                disabled={!canAuctionAct}
                className="rounded-full border border-orange-300/60 px-2 py-1 text-xs"
              >
                Bid
              </button>
              <button
                onClick={() => onAction({ type: "AUCTION_PASS" })}
                disabled={!canAuctionAct}
                className="rounded-full border border-slate-600 px-2 py-1 text-xs"
              >
                Pass
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-sm font-semibold text-emerald-200">My Properties</h2>
        <div className="mt-3">
          <PropertyList state={state} player={self} onAction={onAction} disabled={!isTurn} />
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-sm font-semibold text-emerald-200">Trade</h2>
        {activeTrade ? (
          <div className="mt-2 text-xs text-slate-200">
            <p>Offer from {state.players.find((p) => p.id === activeTrade.fromId)?.name}</p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => onAction({ type: "TRADE_RESPOND", accept: true })}
                disabled={!canRespondTrade}
                className="rounded-full border border-emerald-300/60 px-3 py-1 text-xs text-emerald-200"
              >
                Accept
              </button>
              <button
                onClick={() => onAction({ type: "TRADE_RESPOND", accept: false })}
                disabled={!canRespondTrade}
                className="rounded-full border border-slate-600 px-3 py-1 text-xs text-slate-200"
              >
                Decline
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-2 space-y-2 text-xs text-slate-200">
            <select
              value={tradePartner}
              onChange={(event) => setTradePartner(event.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
            >
              <option value="">Choose partner</option>
              {state.players
                .filter((player) => player.id !== self.id && !player.bankrupt)
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
            </select>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="number"
                value={offerMoney}
                onChange={(event) => setOfferMoney(event.target.value)}
                placeholder="Offer money"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
              />
              <input
                type="number"
                value={requestMoney}
                onChange={(event) => setRequestMoney(event.target.value)}
                placeholder="Request money"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="number"
                value={offerJail}
                onChange={(event) => setOfferJail(event.target.value)}
                placeholder="Offer jail cards"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
              />
              <input
                type="number"
                value={requestJail}
                onChange={(event) => setRequestJail(event.target.value)}
                placeholder="Request jail cards"
                className="rounded-2xl border border-slate-700 bg-slate-950 px-2 py-2 text-xs"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-[0.6rem] uppercase text-slate-400">Offer Properties</p>
                {self.properties.map((id) => (
                  <label key={id} className="mt-1 flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={offerProps.includes(id)}
                      onChange={(event) =>
                        setOfferProps((prev) =>
                          event.target.checked ? [...prev, id] : prev.filter((item) => item !== id),
                        )
                      }
                    />
                    <span>{BOARD_TILES[id].name}</span>
                  </label>
                ))}
              </div>
              <div>
                <p className="text-[0.6rem] uppercase text-slate-400">Request Properties</p>
                {partnerProps.map((id) => (
                  <label key={id} className="mt-1 flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={requestProps.includes(id)}
                      onChange={(event) =>
                        setRequestProps((prev) =>
                          event.target.checked ? [...prev, id] : prev.filter((item) => item !== id),
                        )
                      }
                    />
                    <span>{BOARD_TILES[id].name}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={() =>
                onAction({
                  type: "TRADE_PROPOSE",
                  toId: tradePartner,
                  offer: { money: Number(offerMoney), properties: offerProps, jailCards: Number(offerJail) },
                  request: { money: Number(requestMoney), properties: requestProps, jailCards: Number(requestJail) },
                })
              }
              disabled={!isTurn || !tradePartner}
              className="w-full rounded-2xl border border-emerald-300/60 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-200"
            >
              Send Trade Offer
            </button>
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
        <h2 className="text-sm font-semibold text-emerald-200">Game Log</h2>
        <div className="mt-3 grid gap-2 text-xs text-slate-300">
          {state.log.map((entry, index) => (
            <div key={index} className="rounded-xl border border-slate-800 bg-slate-950/70 p-2">
              {entry}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const WaitingRoom = ({ online, onBack }) => (
  <div className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center gap-4 px-6 py-12 text-center text-slate-200">
    <p className="title-font text-3xl text-emerald-300">Chanchopoly</p>
    <p className="text-sm text-slate-300">
      Waiting for the display to start the game.
    </p>
    {online.room?.id && (
      <p className="text-xs text-slate-400">Room code: {online.room.id}</p>
    )}
    <div className="mt-4 space-y-2 text-xs text-slate-300">
      {online.roomPlayers?.map((player) => (
        <div key={player.id} className="flex items-center justify-center gap-2">
          <Token color={player.color} />
          <span>{player.name}</span>
        </div>
      ))}
    </div>
    <button
      onClick={onBack}
      className="mx-auto mt-4 rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-300"
    >
      Back
    </button>
  </div>
)

function App() {
  const [localPlayers, setLocalPlayers] = useState([])
  const [localGame, setLocalGame] = useState(null)
  const online = useOnlineState()

  const startLocal = () => {
    setLocalGame(createGame(localPlayers))
  }

  const handleLocalAction = (action) => {
    setLocalGame((prev) => applyAction(prev, action))
  }

  if (localGame) {
    return (
      <GameUI
        state={localGame}
        mode="local"
        onAction={handleLocalAction}
        activePlayerId={null}
        onBack={() => {
          setLocalGame(null)
          setLocalPlayers([])
        }}
      />
    )
  }

  if (online.game && online.role === "display") {
    return (
      <GameUI
        state={online.game}
        mode="online"
        onAction={() => {}}
        activePlayerId="display"
        onBack={() => window.location.reload()}
      />
    )
  }

  if (online.game && online.role === "player") {
    return (
      <HandUI
        state={online.game}
        onAction={(action) => online.sendAction(action)}
        playerId={online.playerId}
        onBack={() => window.location.reload()}
      />
    )
  }

  if (online.role === "player" && online.room?.id && !online.game) {
    return <WaitingRoom online={online} onBack={() => window.location.reload()} />
  }

  return (
    <Lobby
      localPlayers={localPlayers}
      setLocalPlayers={setLocalPlayers}
      onStartLocal={startLocal}
      online={online}
    />
  )
}

export default App
