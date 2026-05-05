import { Hono } from "hono"
import { cors } from "hono/cors"
import { tilesRoute } from "./routes/tiles"
import { thoughtsRoute } from "./routes/thoughts"
import { tagsRoute } from "./routes/tags"
import { ollamaRoute } from "./routes/ollama"
import { historyRoute } from "./routes/history"
import "./db/client" // runs CREATE TABLE IF NOT EXISTS on startup

const app = new Hono()

app.use("*", cors({ origin: "http://localhost:5173" }))

app.route("/api/tiles", tilesRoute)
app.route("/api/thoughts", thoughtsRoute)
app.route("/api/tags", tagsRoute)
app.route("/api/ollama", ollamaRoute)
app.route("/api/history", historyRoute)

export default { port: 3000, fetch: app.fetch }
