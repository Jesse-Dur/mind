import { Hono } from "hono"
import { historyDb } from "../db/history"

export const historyRoute = new Hono()

historyRoute.get("/", (c) => c.json(historyDb.list()))
