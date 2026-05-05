import { Hono } from "hono"
import { tagsDb } from "../db/tags"

export const tagsRoute = new Hono()

tagsRoute.get("/", (c) => c.json(tagsDb.list()))

tagsRoute.post("/", async (c) => {
  const { name, color } = await c.req.json() as { name: string; color: string }
  return c.json(tagsDb.upsert(name.slice(0, 16), color), 201)
})

tagsRoute.patch("/:id", async (c) => {
  const { name, color } = await c.req.json() as { name: string; color: string }
  return c.json(tagsDb.update(Number(c.req.param("id")), name.slice(0, 16), color))
})

tagsRoute.delete("/:id", (c) => {
  tagsDb.remove(Number(c.req.param("id")))
  return c.body(null, 204)
})
