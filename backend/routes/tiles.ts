import { Hono } from "hono"
import { tilesDb } from "../db/tiles"

export const tilesRoute = new Hono()

tilesRoute.get("/", (c) => c.json(tilesDb.list()))

tilesRoute.get("/past", (c) => c.json(tilesDb.listPast()))

tilesRoute.post("/", async (c) => {
  const body = await c.req.json()
  return c.json(tilesDb.create(body), 201)
})

tilesRoute.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"))
  const body = await c.req.json()
  return c.json(tilesDb.update(id, body))
})

tilesRoute.delete("/:id", (c) => {
  tilesDb.remove(Number(c.req.param("id")))
  return c.body(null, 204)
})
