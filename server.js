const WebSocket = require("ws")

const port = process.env.PORT || 4000

const wss = new WebSocket.Server({ port })

let counter = 0

function broadcast() {
    const msg = JSON.stringify({
        type: "counter",
        value: counter
    })

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN)
            client.send(msg)
    })
}

wss.on("connection", (ws) => {

    console.log("client connected")

    ws.send(JSON.stringify({
        type: "counter",
        value: counter
    }))

    ws.on("message", (data) => {

        const msg = JSON.parse(data)

        if (msg.type === "click") {
            counter++
            broadcast()
        }
    })
})

console.log("WebSocket server running on port", port)