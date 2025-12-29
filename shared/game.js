const START_MONEY = 1500
const PASS_GO_BONUS = 200
const JAIL_FINE = 50
const INCOME_TAX = 200
const LUXURY_TAX = 100
const MAX_HOUSES = 32
const MAX_HOTELS = 12

const COLOR_POOL = [
  "#f97316",
  "#38bdf8",
  "#f43f5e",
  "#a3e635",
  "#fbbf24",
  "#a855f7",
  "#22d3ee",
  "#facc15",
]

const BOARD = [
  { id: 0, name: "GO", type: "go" },
  {
    id: 1,
    name: "Mediterranean Avenue",
    type: "property",
    color: "brown",
    price: 60,
    mortgage: 30,
    rent: [2, 10, 30, 90, 160, 250],
    houseCost: 50,
  },
  { id: 2, name: "Community Chest", type: "community" },
  {
    id: 3,
    name: "Baltic Avenue",
    type: "property",
    color: "brown",
    price: 60,
    mortgage: 30,
    rent: [4, 20, 60, 180, 320, 450],
    houseCost: 50,
  },
  { id: 4, name: "Income Tax", type: "tax", amount: INCOME_TAX },
  {
    id: 5,
    name: "Reading Railroad",
    type: "railroad",
    price: 200,
    mortgage: 100,
    rent: [25, 50, 100, 200],
  },
  {
    id: 6,
    name: "Oriental Avenue",
    type: "property",
    color: "lightblue",
    price: 100,
    mortgage: 50,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
  },
  { id: 7, name: "Chance", type: "chance" },
  {
    id: 8,
    name: "Vermont Avenue",
    type: "property",
    color: "lightblue",
    price: 100,
    mortgage: 50,
    rent: [6, 30, 90, 270, 400, 550],
    houseCost: 50,
  },
  {
    id: 9,
    name: "Connecticut Avenue",
    type: "property",
    color: "lightblue",
    price: 120,
    mortgage: 60,
    rent: [8, 40, 100, 300, 450, 600],
    houseCost: 50,
  },
  { id: 10, name: "Jail", type: "jail" },
  {
    id: 11,
    name: "St. Charles Place",
    type: "property",
    color: "pink",
    price: 140,
    mortgage: 70,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
  },
  {
    id: 12,
    name: "Electric Company",
    type: "utility",
    price: 150,
    mortgage: 75,
  },
  {
    id: 13,
    name: "States Avenue",
    type: "property",
    color: "pink",
    price: 140,
    mortgage: 70,
    rent: [10, 50, 150, 450, 625, 750],
    houseCost: 100,
  },
  {
    id: 14,
    name: "Virginia Avenue",
    type: "property",
    color: "pink",
    price: 160,
    mortgage: 80,
    rent: [12, 60, 180, 500, 700, 900],
    houseCost: 100,
  },
  {
    id: 15,
    name: "Pennsylvania Railroad",
    type: "railroad",
    price: 200,
    mortgage: 100,
    rent: [25, 50, 100, 200],
  },
  {
    id: 16,
    name: "St. James Place",
    type: "property",
    color: "orange",
    price: 180,
    mortgage: 90,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
  },
  { id: 17, name: "Community Chest", type: "community" },
  {
    id: 18,
    name: "Tennessee Avenue",
    type: "property",
    color: "orange",
    price: 180,
    mortgage: 90,
    rent: [14, 70, 200, 550, 750, 950],
    houseCost: 100,
  },
  {
    id: 19,
    name: "New York Avenue",
    type: "property",
    color: "orange",
    price: 200,
    mortgage: 100,
    rent: [16, 80, 220, 600, 800, 1000],
    houseCost: 100,
  },
  { id: 20, name: "Free Parking", type: "free-parking" },
  {
    id: 21,
    name: "Kentucky Avenue",
    type: "property",
    color: "red",
    price: 220,
    mortgage: 110,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
  },
  { id: 22, name: "Chance", type: "chance" },
  {
    id: 23,
    name: "Indiana Avenue",
    type: "property",
    color: "red",
    price: 220,
    mortgage: 110,
    rent: [18, 90, 250, 700, 875, 1050],
    houseCost: 150,
  },
  {
    id: 24,
    name: "Illinois Avenue",
    type: "property",
    color: "red",
    price: 240,
    mortgage: 120,
    rent: [20, 100, 300, 750, 925, 1100],
    houseCost: 150,
  },
  {
    id: 25,
    name: "B. & O. Railroad",
    type: "railroad",
    price: 200,
    mortgage: 100,
    rent: [25, 50, 100, 200],
  },
  {
    id: 26,
    name: "Atlantic Avenue",
    type: "property",
    color: "yellow",
    price: 260,
    mortgage: 130,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
  },
  {
    id: 27,
    name: "Ventnor Avenue",
    type: "property",
    color: "yellow",
    price: 260,
    mortgage: 130,
    rent: [22, 110, 330, 800, 975, 1150],
    houseCost: 150,
  },
  { id: 28, name: "Water Works", type: "utility", price: 150, mortgage: 75 },
  {
    id: 29,
    name: "Marvin Gardens",
    type: "property",
    color: "yellow",
    price: 280,
    mortgage: 140,
    rent: [24, 120, 360, 850, 1025, 1200],
    houseCost: 150,
  },
  { id: 30, name: "Go To Jail", type: "go-to-jail" },
  {
    id: 31,
    name: "Pacific Avenue",
    type: "property",
    color: "green",
    price: 300,
    mortgage: 150,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
  },
  {
    id: 32,
    name: "North Carolina Avenue",
    type: "property",
    color: "green",
    price: 300,
    mortgage: 150,
    rent: [26, 130, 390, 900, 1100, 1275],
    houseCost: 200,
  },
  { id: 33, name: "Community Chest", type: "community" },
  {
    id: 34,
    name: "Pennsylvania Avenue",
    type: "property",
    color: "green",
    price: 320,
    mortgage: 160,
    rent: [28, 150, 450, 1000, 1200, 1400],
    houseCost: 200,
  },
  {
    id: 35,
    name: "Short Line",
    type: "railroad",
    price: 200,
    mortgage: 100,
    rent: [25, 50, 100, 200],
  },
  { id: 36, name: "Chance", type: "chance" },
  {
    id: 37,
    name: "Park Place",
    type: "property",
    color: "darkblue",
    price: 350,
    mortgage: 175,
    rent: [35, 175, 500, 1100, 1300, 1500],
    houseCost: 200,
  },
  { id: 38, name: "Luxury Tax", type: "tax", amount: LUXURY_TAX },
  {
    id: 39,
    name: "Boardwalk",
    type: "property",
    color: "darkblue",
    price: 400,
    mortgage: 200,
    rent: [50, 200, 600, 1400, 1700, 2000],
    houseCost: 200,
  },
]

const COLOR_GROUPS = {
  brown: [1, 3],
  lightblue: [6, 8, 9],
  pink: [11, 13, 14],
  orange: [16, 18, 19],
  red: [21, 23, 24],
  yellow: [26, 27, 29],
  green: [31, 32, 34],
  darkblue: [37, 39],
}

const CHANCE_CARDS = [
  { id: "chance-advance-go", text: "Advance to GO (Collect $200).", action: { type: "move", target: 0 } },
  { id: "chance-go-jail", text: "Go to Jail. Do not pass GO.", action: { type: "go-to-jail" } },
  { id: "chance-illinois", text: "Advance to Illinois Avenue.", action: { type: "move", target: 24 } },
  { id: "chance-st-charles", text: "Advance to St. Charles Place.", action: { type: "move", target: 11 } },
  { id: "chance-dividend", text: "Bank pays you dividend of $50.", action: { type: "money", amount: 50 } },
  { id: "chance-repairs", text: "General repairs: Pay $25 per house and $100 per hotel.", action: { type: "repairs", house: 25, hotel: 100 } },
  { id: "chance-poor-tax", text: "Pay poor tax of $15.", action: { type: "money", amount: -15 } },
  { id: "chance-utilities", text: "Advance to the nearest Utility.", action: { type: "move-nearest-utility" } },
  { id: "chance-railroad", text: "Advance to the nearest Railroad.", action: { type: "move-nearest-railroad" } },
  { id: "chance-back-3", text: "Go back 3 spaces.", action: { type: "move-steps", steps: -3 } },
  { id: "chance-get-out", text: "Get Out of Jail Free.", action: { type: "get-out-of-jail" } },
  { id: "chance-chairman", text: "Pay each player $50.", action: { type: "pay-each", amount: 50 } },
  { id: "chance-reading", text: "Take a ride to Reading Railroad.", action: { type: "move", target: 5 } },
  { id: "chance-boardwalk", text: "Advance to Boardwalk.", action: { type: "move", target: 39 } },
  { id: "chance-building", text: "Building loan matures. Collect $150.", action: { type: "money", amount: 150 } },
  { id: "chance-trip", text: "Take a trip to Water Works.", action: { type: "move", target: 28 } },
]

const COMMUNITY_CARDS = [
  { id: "community-advance-go", text: "Advance to GO (Collect $200).", action: { type: "move", target: 0 } },
  { id: "community-bank-error", text: "Bank error in your favor. Collect $200.", action: { type: "money", amount: 200 } },
  { id: "community-doctors", text: "Doctor's fee. Pay $50.", action: { type: "money", amount: -50 } },
  { id: "community-sale", text: "From sale of stock you get $50.", action: { type: "money", amount: 50 } },
  { id: "community-jail", text: "Go to Jail. Do not pass GO.", action: { type: "go-to-jail" } },
  { id: "community-holiday", text: "Holiday fund matures. Collect $100.", action: { type: "money", amount: 100 } },
  { id: "community-income", text: "Income tax refund. Collect $20.", action: { type: "money", amount: 20 } },
  { id: "community-birthday", text: "It is your birthday. Collect $10 from every player.", action: { type: "collect-each", amount: 10 } },
  { id: "community-insurance", text: "Life insurance matures. Collect $100.", action: { type: "money", amount: 100 } },
  { id: "community-hospital", text: "Hospital fees. Pay $100.", action: { type: "money", amount: -100 } },
  { id: "community-school", text: "School fees. Pay $50.", action: { type: "money", amount: -50 } },
  { id: "community-consult", text: "Receive $25 consultancy fee.", action: { type: "money", amount: 25 } },
  { id: "community-street", text: "You inherit $100.", action: { type: "money", amount: 100 } },
  { id: "community-repairs", text: "Pay $40 per house and $115 per hotel.", action: { type: "repairs", house: 40, hotel: 115 } },
  { id: "community-beauty", text: "You are assessed for street repairs. Pay $40 per house and $115 per hotel.", action: { type: "repairs", house: 40, hotel: 115 } },
  { id: "community-get-out", text: "Get Out of Jail Free.", action: { type: "get-out-of-jail" } },
]

const cloneBoard = () =>
  BOARD.map((tile) => ({
    ...tile,
    ownerId: null,
    houses: 0,
    hotel: false,
    mortgaged: false,
  }))

const logMessage = (state, message) => ({
  ...state,
  log: [message, ...state.log].slice(0, 8),
})

const getPlayerById = (state, playerId) =>
  state.players.find((player) => player.id === playerId)

const getMonopolyColors = (state, ownerId) =>
  Object.keys(COLOR_GROUPS).filter((color) =>
    COLOR_GROUPS[color].every((index) => {
      const tile = state.board[index]
      return tile.ownerId === ownerId && !tile.mortgaged
    }),
  )

const getGroupHouseCounts = (state, color) =>
  COLOR_GROUPS[color].map((index) => {
    const tile = state.board[index]
    return tile.hotel ? 5 : tile.houses
  })

const getRent = (state, tile, lastRollTotal) => {
  if (tile.mortgaged) return 0
  if (tile.type === "property") {
    const houseCount = tile.hotel ? 5 : tile.houses
    if (houseCount > 0) {
      return tile.rent[houseCount]
    }
    const hasMonopoly = getMonopolyColors(state, tile.ownerId).includes(tile.color)
    return hasMonopoly ? tile.rent[0] * 2 : tile.rent[0]
  }
  if (tile.type === "railroad") {
    const ownerRails = state.board.filter(
      (entry) => entry.type === "railroad" && entry.ownerId === tile.ownerId,
    ).length
    return tile.rent[ownerRails - 1] ?? tile.rent[0]
  }
  if (tile.type === "utility") {
    const ownerUtilities = state.board.filter(
      (entry) => entry.type === "utility" && entry.ownerId === tile.ownerId,
    ).length
    return (ownerUtilities === 2 ? 10 : 4) * lastRollTotal
  }
  return 0
}

const adjustMoney = (state, playerId, delta) => {
  const players = state.players.map((player) =>
    player.id === playerId ? { ...player, money: player.money + delta } : player,
  )
  return { ...state, players }
}

const movePlayer = (state, playerId, target, collectGo) => {
  const players = state.players.map((player) => {
    if (player.id !== playerId) return player
    let money = player.money
    if (collectGo) {
      money += PASS_GO_BONUS
    }
    return { ...player, position: target, money }
  })
  return { ...state, players }
}

const sendToJail = (state, playerId) => {
  const jailIndex = state.board.findIndex((tile) => tile.type === "jail")
  const players = state.players.map((player) =>
    player.id === playerId
      ? { ...player, position: jailIndex, inJail: true, jailTurns: 0, doublesInRow: 0 }
      : player,
  )
  return logMessage({ ...state, players, lastRoll: null }, "Sent to Jail.")
}

const findNextActivePlayer = (players, startIndex) => {
  const total = players.length
  for (let offset = 1; offset <= total; offset += 1) {
    const index = (startIndex + offset) % total
    if (!players[index].bankrupt) {
      return index
    }
  }
  return startIndex
}

const normalizeDeck = (deck) => deck.map((card) => ({ ...card }))

const drawCard = (deck) => {
  const card = deck.shift()
  deck.push(card)
  return card
}

const removeCardFromDeck = (deck, cardId) => deck.filter((card) => card.id !== cardId)

const replaceCardAtBottom = (deck, card) => [...deck, card]

const moveJailCards = (fromPlayer, toPlayer, amount) => {
  let remaining = Math.max(0, Number(amount) || 0)
  const moveChance = Math.min(fromPlayer.jailCards.chance, remaining)
  remaining -= moveChance
  const moveCommunity = Math.min(fromPlayer.jailCards.community, remaining)
  return {
    from: {
      chance: fromPlayer.jailCards.chance - moveChance,
      community: fromPlayer.jailCards.community - moveCommunity,
    },
    to: {
      chance: toPlayer.jailCards.chance + moveChance,
      community: toPlayer.jailCards.community + moveCommunity,
    },
  }
}

const checkBankruptcy = (state, playerId, creditorId) => {
  const player = getPlayerById(state, playerId)
  if (player.money >= 0) return state
  return {
    ...state,
    phase: "debt",
    debt: { playerId, creditorId },
  }
}

const ensureAwaitEnd = (state) => (state.phase === "debt" ? state : { ...state, phase: "await-end" })

const resolveLanding = (state, playerId, tileIndex, lastRollTotal) => {
  const tile = state.board[tileIndex]
  if (!tile) return state

  if (tile.type === "property" || tile.type === "railroad" || tile.type === "utility") {
    if (!tile.ownerId) {
      return { ...state, phase: "await-buy", pendingPropertyId: tileIndex }
    }
    if (tile.ownerId !== playerId) {
      const rent = getRent(state, tile, lastRollTotal)
      let updated = adjustMoney(state, playerId, -rent)
      updated = adjustMoney(updated, tile.ownerId, rent)
      updated = logMessage(updated, `Paid $${rent} rent to ${getPlayerById(updated, tile.ownerId).name}.`)
      return checkBankruptcy(updated, playerId, tile.ownerId)
    }
    return { ...state, phase: "await-end" }
  }

  if (tile.type === "tax") {
    const updated = adjustMoney(state, playerId, -tile.amount)
    const logged = logMessage(updated, `Paid tax of $${tile.amount}.`)
    return checkBankruptcy(logged, playerId, "bank")
  }

  if (tile.type === "chance" || tile.type === "community") {
    return { ...state, phase: tile.type }
  }

  if (tile.type === "go-to-jail") {
    return sendToJail(state, playerId)
  }

  return { ...state, phase: "await-end" }
}

const applyCardAction = (state, playerId, card, fromDeck) => {
  let updated = logMessage(state, card.text)
  if (card.action.type === "money") {
    updated = adjustMoney(updated, playerId, card.action.amount)
    return ensureAwaitEnd(checkBankruptcy(updated, playerId, card.action.amount < 0 ? "bank" : null))
  }
  if (card.action.type === "move") {
    const player = getPlayerById(updated, playerId)
    const passedGo = card.action.target < player.position
    updated = movePlayer(updated, playerId, card.action.target, passedGo)
    return resolveLanding(updated, playerId, card.action.target, updated.lastRollTotal ?? 0)
  }
  if (card.action.type === "move-steps") {
    const player = getPlayerById(updated, playerId)
    const target = (player.position + card.action.steps + state.board.length) % state.board.length
    updated = movePlayer(updated, playerId, target, false)
    return resolveLanding(updated, playerId, target, updated.lastRollTotal ?? 0)
  }
  if (card.action.type === "move-nearest-railroad") {
    const player = getPlayerById(updated, playerId)
    const railIndexes = state.board
      .map((tile, index) => (tile.type === "railroad" ? index : null))
      .filter((index) => index !== null)
    const target = railIndexes.find((index) => index > player.position) ?? railIndexes[0]
    updated = movePlayer(updated, playerId, target, target < player.position)
    return resolveLanding(updated, playerId, target, updated.lastRollTotal ?? 0)
  }
  if (card.action.type === "move-nearest-utility") {
    const player = getPlayerById(updated, playerId)
    const utilityIndexes = state.board
      .map((tile, index) => (tile.type === "utility" ? index : null))
      .filter((index) => index !== null)
    const target = utilityIndexes.find((index) => index > player.position) ?? utilityIndexes[0]
    updated = movePlayer(updated, playerId, target, target < player.position)
    return resolveLanding(updated, playerId, target, updated.lastRollTotal ?? 0)
  }
  if (card.action.type === "go-to-jail") {
    return sendToJail(updated, playerId)
  }
  if (card.action.type === "repairs") {
    const playerTiles = updated.board.filter((tile) => tile.ownerId === playerId)
    const houses = playerTiles.reduce((sum, tile) => sum + tile.houses, 0)
    const hotels = playerTiles.filter((tile) => tile.hotel).length
    const cost = houses * card.action.house + hotels * card.action.hotel
    updated = adjustMoney(updated, playerId, -cost)
    updated = logMessage(updated, `Paid $${cost} for repairs.`)
    return ensureAwaitEnd(checkBankruptcy(updated, playerId, "bank"))
  }
  if (card.action.type === "collect-each") {
    const amount = card.action.amount
    let nextState = updated
    updated.players.forEach((player) => {
      if (player.id !== playerId && !player.bankrupt) {
        nextState = adjustMoney(nextState, player.id, -amount)
        nextState = adjustMoney(nextState, playerId, amount)
      }
    })
    return ensureAwaitEnd(checkBankruptcy(nextState, playerId, null))
  }
  if (card.action.type === "pay-each") {
    const amount = card.action.amount
    let nextState = updated
    updated.players.forEach((player) => {
      if (player.id !== playerId && !player.bankrupt) {
        nextState = adjustMoney(nextState, player.id, amount)
        nextState = adjustMoney(nextState, playerId, -amount)
      }
    })
    return ensureAwaitEnd(checkBankruptcy(nextState, playerId, null))
  }
  if (card.action.type === "get-out-of-jail") {
    const players = updated.players.map((player) =>
      player.id === playerId
        ? { ...player, jailCards: { ...player.jailCards, [fromDeck]: player.jailCards[fromDeck] + 1 } }
        : player,
    )
    const decks = {
      ...updated.decks,
      [fromDeck]: removeCardFromDeck(updated.decks[fromDeck], card.id),
    }
    return { ...updated, players, decks, phase: "await-end" }
  }
  return updated
}

export const getPlayerColors = (count) => COLOR_POOL.slice(0, count)

export const createGame = (playerInfos) => ({
  board: cloneBoard(),
  players: playerInfos.map((player, index) => ({
    id: player.id,
    name: player.name,
    color: player.color ?? COLOR_POOL[index % COLOR_POOL.length],
    position: 0,
    money: START_MONEY,
    properties: [],
    bankrupt: false,
    inJail: false,
    jailTurns: 0,
    jailCards: { chance: 0, community: 0 },
    doublesInRow: 0,
  })),
  bank: { houses: MAX_HOUSES, hotels: MAX_HOTELS },
  currentPlayerIndex: 0,
  phase: "setup",
  setup: {
    index: 0,
    rolls: {},
    order: [],
    tiePlayers: null,
  },
  pendingPropertyId: null,
  lastRoll: null,
  lastRollTotal: 0,
  log: ["Roll to determine order."],
  winnerId: null,
  decks: {
    chance: normalizeDeck(CHANCE_CARDS),
    community: normalizeDeck(COMMUNITY_CARDS),
  },
  auction: null,
  trade: null,
  debt: null,
})

const resolveOrderRoll = (state, playerId, roll) => {
  const setup = { ...state.setup }
  setup.rolls[playerId] = roll
  setup.index += 1

  const players = state.players
  const rollIds = setup.tiePlayers?.length ? setup.tiePlayers : players.map((player) => player.id)
  const rollPlayers = players.filter((player) => rollIds.includes(player.id))
  if (setup.index >= rollPlayers.length) {
    const highest = Math.max(...rollIds.map((id) => setup.rolls[id]))
    const tied = rollPlayers.filter((player) => setup.rolls[player.id] === highest)
    if (tied.length > 1) {
      setup.index = 0
      setup.rolls = {}
      setup.tiePlayers = tied.map((player) => player.id)
      return logMessage({ ...state, setup }, "Tie for first. Reroll tied players.")
    }
    const winnerId = tied[0].id
    const sorted = [players.find((player) => player.id === winnerId)].concat(
      players.filter((player) => player.id !== winnerId),
    )
    return logMessage(
      {
        ...state,
        players: sorted,
        currentPlayerIndex: 0,
        phase: "await-roll",
        setup: { ...setup, order: sorted.map((player) => player.id), tiePlayers: null },
      },
      `${sorted[0].name} goes first.`,
    )
  }
  return { ...state, setup }
}

const startAuction = (state, propertyId) => {
  const activeIds = state.players.filter((player) => !player.bankrupt).map((player) => player.id)
  return {
    ...state,
    phase: "auction",
    auction: {
      propertyId,
      currentBid: 0,
      currentBidderId: null,
      activeIds,
      turnIndex: 0,
    },
    pendingPropertyId: null,
  }
}

const finishAuction = (state) => {
  const auction = state.auction
  if (!auction) return state
  const winnerId = auction.currentBidderId
  if (!winnerId) {
    return { ...state, phase: "await-end", auction: null }
  }
  const board = state.board.map((entry, index) =>
    index === auction.propertyId ? { ...entry, ownerId: winnerId } : entry,
  )
  const players = state.players.map((player) =>
    player.id === winnerId
      ? { ...player, money: player.money - auction.currentBid, properties: [...player.properties, auction.propertyId] }
      : player,
  )
  return logMessage(
    { ...state, board, players, auction: null, phase: "await-end" },
    `${getPlayerById(state, winnerId).name} won the auction for $${auction.currentBid}.`,
  )
}

const canBuildOnTile = (state, playerId, tileIndex) => {
  const tile = state.board[tileIndex]
  if (!tile || tile.type !== "property") return false
  if (tile.ownerId !== playerId || tile.mortgaged) return false
  const monopolyColors = getMonopolyColors(state, playerId)
  if (!monopolyColors.includes(tile.color)) return false
  const counts = getGroupHouseCounts(state, tile.color)
  const min = Math.min(...counts)
  const targetCount = tile.hotel ? 5 : tile.houses
  return targetCount === min && targetCount < 5
}

const canSellFromTile = (state, playerId, tileIndex) => {
  const tile = state.board[tileIndex]
  if (!tile || tile.type !== "property") return false
  if (tile.ownerId !== playerId) return false
  const counts = getGroupHouseCounts(state, tile.color)
  const max = Math.max(...counts)
  const targetCount = tile.hotel ? 5 : tile.houses
  return targetCount === max && targetCount > 0
}

export const applyAction = (state, action, rng = Math.random) => {
  if (!state || state.winnerId) return state

  const currentPlayer = state.players[state.currentPlayerIndex]
  let actionPlayerId = action.playerId
  if (!actionPlayerId) {
    if (state.phase === "setup" && action.type === "ROLL_ORDER") {
      if (state.setup.tiePlayers?.length) {
        actionPlayerId = state.setup.tiePlayers[state.setup.index] ?? state.setup.tiePlayers[0]
      } else {
        actionPlayerId = state.players[state.setup.index]?.id ?? currentPlayer.id
      }
    } else {
      actionPlayerId = currentPlayer.id
    }
  }
  const actingPlayer = getPlayerById(state, actionPlayerId)

  if (!actingPlayer || actingPlayer.bankrupt) return state

  if (state.phase === "setup" && action.type === "ROLL_ORDER") {
    const roll = Math.floor(rng() * 6) + 1 + (Math.floor(rng() * 6) + 1)
    if (state.setup.tiePlayers && !state.setup.tiePlayers.includes(actionPlayerId)) {
      return state
    }
    if (!state.setup.tiePlayers && state.players[state.setup.index]?.id !== actionPlayerId) {
      return state
    }
    return resolveOrderRoll(logMessage(state, `${actingPlayer.name} rolled ${roll}.`), actionPlayerId, roll)
  }

  if (action.type === "ROLL" && state.phase === "await-roll") {
    if (actionPlayerId !== currentPlayer.id) return state

    const die1 = Math.floor(rng() * 6) + 1
    const die2 = Math.floor(rng() * 6) + 1
    const total = die1 + die2
    const doubles = die1 === die2
    let updated = { ...state, lastRoll: [die1, die2], lastRollTotal: total }

    if (currentPlayer.inJail) {
      if (doubles) {
        const players = updated.players.map((player) =>
          player.id === currentPlayer.id
            ? { ...player, inJail: false, jailTurns: 0, doublesInRow: 0 }
            : player,
        )
        updated = logMessage({ ...updated, players }, `${currentPlayer.name} rolled doubles to leave Jail.`)
      } else {
        const players = updated.players.map((player) =>
          player.id === currentPlayer.id
            ? { ...player, jailTurns: player.jailTurns + 1 }
            : player,
        )
        updated = logMessage({ ...updated, players }, `${currentPlayer.name} failed to roll doubles.`)
        const jailTurns = players.find((player) => player.id === currentPlayer.id).jailTurns
        if (jailTurns >= 3) {
          const paid = adjustMoney(updated, currentPlayer.id, -JAIL_FINE)
          const freed = paid.players.map((player) =>
            player.id === currentPlayer.id ? { ...player, inJail: false, jailTurns: 0 } : player,
          )
          updated = logMessage({ ...paid, players: freed }, `${currentPlayer.name} paid $50 to leave Jail.`)
        } else {
          return { ...updated, phase: "await-end" }
        }
      }
    }

    const player = getPlayerById(updated, currentPlayer.id)
    if (player.inJail) return updated

    const nextPosition = (player.position + total) % updated.board.length
    const passedGo = player.position + total >= updated.board.length
    const players = updated.players.map((entry) =>
      entry.id === currentPlayer.id
        ? {
            ...entry,
            position: nextPosition,
            money: entry.money + (passedGo ? PASS_GO_BONUS : 0),
            doublesInRow: doubles ? entry.doublesInRow + 1 : 0,
          }
        : entry,
    )
    updated = logMessage({ ...updated, players }, `${currentPlayer.name} rolled ${die1} + ${die2}.`)
    const updatedPlayer = players.find((playerItem) => playerItem.id === currentPlayer.id)
    if (updatedPlayer.doublesInRow >= 3) {
      return sendToJail(updated, currentPlayer.id)
    }
    updated = resolveLanding(updated, currentPlayer.id, nextPosition, total)
    if (doubles && updated.phase === "await-end" && !updated.players.find((p) => p.id === currentPlayer.id).inJail) {
      return logMessage({ ...updated, phase: "await-roll" }, "Doubles! Roll again.")
    }
    return updated
  }

  if (action.type === "PAY_JAIL" && state.phase === "await-roll") {
    if (actionPlayerId !== currentPlayer.id) return state
    if (!currentPlayer.inJail || currentPlayer.money < JAIL_FINE) return state
    const updated = adjustMoney(state, currentPlayer.id, -JAIL_FINE)
    const players = updated.players.map((player) =>
      player.id === currentPlayer.id ? { ...player, inJail: false, jailTurns: 0 } : player,
    )
    return logMessage({ ...updated, players }, `${currentPlayer.name} paid $50 to leave Jail.`)
  }

  if (action.type === "USE_JAIL_CARD" && state.phase === "await-roll") {
    if (actionPlayerId !== currentPlayer.id) return state
    const hasChance = currentPlayer.jailCards.chance > 0
    const hasCommunity = currentPlayer.jailCards.community > 0
    if (!hasChance && !hasCommunity) return state
    const useDeck = hasChance ? "chance" : "community"
    const players = state.players.map((player) =>
      player.id === currentPlayer.id
        ? {
            ...player,
            inJail: false,
            jailTurns: 0,
            jailCards: { ...player.jailCards, [useDeck]: player.jailCards[useDeck] - 1 },
          }
        : player,
    )
    const cardToReturn =
      useDeck === "chance"
        ? CHANCE_CARDS.find((card) => card.id === "chance-get-out")
        : COMMUNITY_CARDS.find((card) => card.id === "community-get-out")
    const decks = {
      ...state.decks,
      [useDeck]: replaceCardAtBottom(state.decks[useDeck], cardToReturn),
    }
    return logMessage({ ...state, players, decks }, `${currentPlayer.name} used a Get Out of Jail Free card.`)
  }

  if (action.type === "DRAW_CHANCE" && state.phase === "chance") {
    const card = drawCard(state.decks.chance)
    return applyCardAction({ ...state, decks: { ...state.decks } }, currentPlayer.id, card, "chance")
  }

  if (action.type === "DRAW_COMMUNITY" && state.phase === "community") {
    const card = drawCard(state.decks.community)
    return applyCardAction({ ...state, decks: { ...state.decks } }, currentPlayer.id, card, "community")
  }

  if (action.type === "BUY" && state.phase === "await-buy") {
    if (actionPlayerId !== currentPlayer.id) return state
    const tile = state.board[state.pendingPropertyId]
    if (!tile || tile.ownerId || currentPlayer.money < tile.price) return state
    const board = state.board.map((entry, index) =>
      index === state.pendingPropertyId ? { ...entry, ownerId: currentPlayer.id } : entry,
    )
    const players = state.players.map((player) =>
      player.id === currentPlayer.id
        ? { ...player, money: player.money - tile.price, properties: [...player.properties, tile.id] }
        : player,
    )
    return logMessage({ ...state, board, players, phase: "await-end", pendingPropertyId: null }, `${currentPlayer.name} bought ${tile.name}.`)
  }

  if (action.type === "DECLINE_BUY" && state.phase === "await-buy") {
    if (actionPlayerId !== currentPlayer.id) return state
    return startAuction(state, state.pendingPropertyId)
  }

  if (action.type === "AUCTION_BID" && state.phase === "auction") {
    const auction = state.auction
    if (!auction || !auction.activeIds.includes(actionPlayerId)) return state
    if (auction.activeIds[auction.turnIndex] !== actionPlayerId) return state
    const bid = Number(action.amount)
    if (!Number.isFinite(bid) || bid <= auction.currentBid) return state
    if (actingPlayer.money < bid) return state
    return {
      ...state,
      auction: { ...auction, currentBid: bid, currentBidderId: actionPlayerId, turnIndex: (auction.turnIndex + 1) % auction.activeIds.length },
    }
  }

  if (action.type === "AUCTION_PASS" && state.phase === "auction") {
    const auction = state.auction
    if (!auction || !auction.activeIds.includes(actionPlayerId)) return state
    if (auction.activeIds[auction.turnIndex] !== actionPlayerId) return state
    const remaining = auction.activeIds.filter((id) => id !== actionPlayerId)
    if (remaining.length <= 1) {
      return finishAuction({ ...state, auction: { ...auction, activeIds: remaining } })
    }
    const nextTurnIndex = auction.turnIndex >= remaining.length ? 0 : auction.turnIndex
    return { ...state, auction: { ...auction, activeIds: remaining, turnIndex: nextTurnIndex } }
  }

  if (action.type === "BUILD" && state.phase !== "auction") {
    if (actionPlayerId !== currentPlayer.id) return state
    const tileIndex = action.tileIndex
    if (!canBuildOnTile(state, currentPlayer.id, tileIndex)) return state
    const tile = state.board[tileIndex]
    if (currentPlayer.money < tile.houseCost) return state
    let bank = { ...state.bank }
    let board = [...state.board]
    if (tile.houses < 4 && !tile.hotel) {
      if (bank.houses < 1) return state
      bank.houses -= 1
      board[tileIndex] = { ...tile, houses: tile.houses + 1 }
    } else if (tile.houses === 4 && !tile.hotel) {
      if (bank.hotels < 1) return state
      bank.hotels -= 1
      bank.houses += 4
      board[tileIndex] = { ...tile, houses: 0, hotel: true }
    } else {
      return state
    }
    const players = state.players.map((player) =>
      player.id === currentPlayer.id ? { ...player, money: player.money - tile.houseCost } : player,
    )
    return logMessage({ ...state, board, bank, players }, `Built on ${tile.name}.`)
  }

  if (action.type === "SELL_BUILDING" && state.phase !== "auction") {
    if (actionPlayerId !== currentPlayer.id) return state
    const tileIndex = action.tileIndex
    if (!canSellFromTile(state, currentPlayer.id, tileIndex)) return state
    const tile = state.board[tileIndex]
    let bank = { ...state.bank }
    let board = [...state.board]
    let refund = tile.houseCost / 2
    if (tile.hotel) {
      if (bank.houses < 4) return state
      bank.hotels += 1
      bank.houses -= 4
      board[tileIndex] = { ...tile, hotel: false, houses: 4 }
    } else if (tile.houses > 0) {
      bank.houses += 1
      board[tileIndex] = { ...tile, houses: tile.houses - 1 }
    }
    const players = state.players.map((player) =>
      player.id === currentPlayer.id ? { ...player, money: player.money + refund } : player,
    )
    return logMessage({ ...state, board, bank, players }, `Sold building on ${tile.name}.`)
  }

  if (action.type === "MORTGAGE" && state.phase !== "auction") {
    if (actionPlayerId !== currentPlayer.id) return state
    const tile = state.board[action.tileIndex]
    if (!tile || tile.ownerId !== currentPlayer.id || tile.mortgaged) return state
    if (tile.type === "property" && (tile.houses > 0 || tile.hotel)) return state
    const board = state.board.map((entry, index) =>
      index === action.tileIndex ? { ...entry, mortgaged: true } : entry,
    )
    const players = state.players.map((player) =>
      player.id === currentPlayer.id ? { ...player, money: player.money + tile.mortgage } : player,
    )
    return logMessage({ ...state, board, players }, `Mortgaged ${tile.name}.`)
  }

  if (action.type === "UNMORTGAGE" && state.phase !== "auction") {
    if (actionPlayerId !== currentPlayer.id) return state
    const tile = state.board[action.tileIndex]
    if (!tile || tile.ownerId !== currentPlayer.id || !tile.mortgaged) return state
    const cost = Math.ceil(tile.mortgage * 1.1)
    if (currentPlayer.money < cost) return state
    const board = state.board.map((entry, index) =>
      index === action.tileIndex ? { ...entry, mortgaged: false } : entry,
    )
    const players = state.players.map((player) =>
      player.id === currentPlayer.id ? { ...player, money: player.money - cost } : player,
    )
    return logMessage({ ...state, board, players }, `Unmortgaged ${tile.name}.`)
  }

  if (action.type === "TRADE_PROPOSE" && state.phase !== "auction" && !state.trade) {
    if (actionPlayerId !== currentPlayer.id) return state
    const target = getPlayerById(state, action.toId)
    if (!target || target.bankrupt) return state
    return {
      ...state,
      trade: {
        fromId: currentPlayer.id,
        toId: action.toId,
        offer: action.offer,
        request: action.request,
      },
    }
  }

  if (action.type === "TRADE_RESPOND" && state.trade) {
    if (actionPlayerId !== state.trade.toId) return state
    if (action.accept) {
      const trade = state.trade
      let updated = { ...state, trade: null }
      const from = getPlayerById(updated, trade.fromId)
      const to = getPlayerById(updated, trade.toId)
      if (!from || !to) return updated
      const offerCards = trade.offer.jailCards ?? 0
      const requestCards = trade.request.jailCards ?? 0
      const firstMove = moveJailCards(from, to, offerCards)
      const secondMove = moveJailCards(
        { ...to, jailCards: firstMove.to },
        { ...from, jailCards: firstMove.from },
        requestCards,
      )
      const transferProperties = (ownerId, ids) =>
        updated.board.map((tile, index) =>
          ids.includes(index) ? { ...tile, ownerId } : tile,
        )
      updated = {
        ...updated,
        board: transferProperties(trade.toId, trade.offer.properties ?? []),
      }
      updated = {
        ...updated,
        board: transferProperties(trade.fromId, trade.request.properties ?? []),
      }
      const players = updated.players.map((player) => {
        if (player.id === from.id) {
          return {
            ...player,
            money: player.money - (trade.offer.money ?? 0) + (trade.request.money ?? 0),
            properties: player.properties
              .filter((id) => !(trade.offer.properties ?? []).includes(id))
              .concat(trade.request.properties ?? []),
            jailCards: secondMove.to,
          }
        }
        if (player.id === to.id) {
          return {
            ...player,
            money: player.money - (trade.request.money ?? 0) + (trade.offer.money ?? 0),
            properties: player.properties
              .filter((id) => !(trade.request.properties ?? []).includes(id))
              .concat(trade.offer.properties ?? []),
            jailCards: secondMove.from,
          }
        }
        return player
      })
      return logMessage({ ...updated, players }, "Trade accepted.")
    }
    return logMessage({ ...state, trade: null }, "Trade declined.")
  }

  if (action.type === "DECLARE_BANKRUPT" && state.phase === "debt") {
    if (actionPlayerId !== state.debt.playerId) return state
    const debtorId = state.debt.playerId
    const creditorId = state.debt.creditorId
    let board = [...state.board]
    let players = state.players.map((player) =>
      player.id === debtorId ? { ...player, bankrupt: true, properties: [], money: 0 } : player,
    )
    if (creditorId && creditorId !== "bank") {
      board = board.map((tile) =>
        tile.ownerId === debtorId ? { ...tile, ownerId: creditorId, mortgaged: tile.mortgaged } : tile,
      )
      players = players.map((player) =>
        player.id === creditorId
          ? {
              ...player,
              properties: player.properties.concat(
                state.board.filter((tile) => tile.ownerId === debtorId).map((tile) => tile.id),
              ),
            }
          : player,
      )
    } else {
      board = board.map((tile) =>
        tile.ownerId === debtorId ? { ...tile, ownerId: null, mortgaged: false, houses: 0, hotel: false } : tile,
      )
    }
    const remaining = players.filter((player) => !player.bankrupt)
    if (remaining.length === 1) {
      return { ...state, board, players, winnerId: remaining[0].id, phase: "await-end", debt: null }
    }
    return logMessage({ ...state, board, players, phase: "await-end", debt: null }, `${actingPlayer.name} is bankrupt.`)
  }

  if (action.type === "END_TURN" && state.phase === "await-end") {
    if (actionPlayerId !== currentPlayer.id) return state
    const nextIndex = findNextActivePlayer(state.players, state.currentPlayerIndex)
    return {
      ...state,
      currentPlayerIndex: nextIndex,
      phase: "await-roll",
      lastRoll: null,
      lastRollTotal: 0,
    }
  }

  if (action.type === "RESOLVE_DEBT" && state.phase === "debt") {
    const debtor = getPlayerById(state, state.debt.playerId)
    if (debtor.money >= 0) {
      return { ...state, phase: "await-end", debt: null }
    }
  }

  return state
}

export const BOARD_TILES = BOARD
export const COLOR_GROUPS_LIST = COLOR_GROUPS
export const STARTING_MONEY = START_MONEY
export const PASS_GO = PASS_GO_BONUS
