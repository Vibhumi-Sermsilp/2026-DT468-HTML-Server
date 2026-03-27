const WebSocket = require("ws")

const port = process.env.PORT || 4000
const MAX_PLAYERS = 3
const STEP_DISTANCE = 10

const wss = new WebSocket.Server({ port })

let players = new Map()
let gameStarted = false

function broadcast(msg) {
    const data = JSON.stringify(msg)
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN)
            client.send(data);
    })
}

function broadcastGameState(msg_type) {
    const playerList = Array.from(players.values())

    broadcast({
        type: msg_type,
        players: playerList
    })
}

wss.on("connection", (ws) => {
    // Check if player is already full
    if (players.size >= MAX_PLAYERS) {
        ws.send(JSON.stringify({ type: "error", message: "Game Full" }))
        ws.close()
        return
    }

    // Assign Car ID and player position
    const carId = players.size
    const playerStats = {
        id: carId,
        x: 0,
        y: 100 + (carId * 100)
    }
    players.set(ws, playerStats)
    console.log(`Player ${carId} connected.`)

    // Start Game if All players connected
    if (players.size === MAX_PLAYERS && !gameStarted) {
        gameStarted = true
        broadcastGameState("start")
        console.log("Game Started!")
    }

    ws.on("message", (data) => {
        if (!gameStarted) return

        const msg = JSON.parse(data)
        if (msg.type === "move") {
            let p = players.get(ws)
            p.x += STEP_DISTANCE

            // Broadcast the updated game state of all players
            broadcastGameState("state")
        }
    })

    ws.on("close", () => {
        players.delete(ws)
        gameStarted = false
        console.log("Player disconnected")
    })
})

console.log("WebSocket server running on port", port)
