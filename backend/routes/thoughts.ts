import { Hono } from "hono"
import { thoughtsDb } from "../db/thoughts"

export const thoughtsRoute = new Hono()

thoughtsRoute.get("/", (c) => {
  const tileId = c.req.query("tile_id")
  return c.json(thoughtsDb.list(tileId ? Number(tileId) : undefined))
})

thoughtsRoute.get("/past", (c) => c.json(thoughtsDb.listPast()))

thoughtsRoute.post("/", async (c) => {
  const body = await c.req.json()
  return c.json(thoughtsDb.create(body), 201)
})

thoughtsRoute.patch("/:id/reorder", async (c) => {
  const { sort_order } = await c.req.json() as { sort_order: number }
  thoughtsDb.reorder(Number(c.req.param("id")), sort_order)
  return c.body(null, 204)
})

thoughtsRoute.patch("/:id/tags", async (c) => {
  const { tags } = await c.req.json() as { tags: string[] }
  const updated = thoughtsDb.updateTags(Number(c.req.param("id")), tags)
  return c.json(updated)
})

thoughtsRoute.patch("/:id/content", async (c) => {
  const { content } = await c.req.json() as { content: string }
  const id = Number(c.req.param("id"))
  console.log(`✏️ Update thought ${id}: "${content}"`)
  thoughtsDb.update(id, content)
  return c.body(null, 204)
})

thoughtsRoute.patch("/:id/move", async (c) => {
  const { tile_id } = await c.req.json() as { tile_id: number }
  thoughtsDb.move(Number(c.req.param("id")), tile_id)
  return c.body(null, 204)
})

thoughtsRoute.delete("/:id", (c) => {
  thoughtsDb.remove(Number(c.req.param("id")))
  return c.body(null, 204)
})
