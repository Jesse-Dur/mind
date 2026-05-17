import { db } from "./client"
import { historyDb } from "./history"
import type { Tile } from "../../frontend/src/types"

export const tilesDb = {
  list: () => db.query("SELECT * FROM tiles WHERE deleted_at IS NULL ORDER BY created_at DESC").all() as Tile[],

  listPast: () => db.query("SELECT * FROM tiles WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC").all() as Tile[],

  get: (id: number) => db.query("SELECT * FROM tiles WHERE id = ?").get(id) as Tile | null,

  create: (data: Omit<Tile, "id" | "created_at">) => {
    const tile = db.query(`
      INSERT INTO tiles (title, x, y, width, height, importance, visible)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `).get(data.title, data.x, data.y, data.width, data.height, data.importance, data.visible ? 1 : 0) as Tile
    historyDb.log("tile.create", `Created tile "${tile.title}"`, { tile_id: tile.id, title: tile.title })
    return tile
  },

  update: (id: number, data: Partial<Omit<Tile, "id" | "created_at">>) => {
    const keys = Object.keys(data)
    const fields = keys.map((k) => `${k} = ?`).join(", ")
    const values = keys.map((k) => (data as Record<string, unknown>)[k])
    const tile = db.query(`UPDATE tiles SET ${fields} WHERE id = ? RETURNING *`).get(...[...values, id] as unknown as [number]) as Tile
    if (data.title) {
      console.log(`[tile.update] "${data.title}" (id: ${id})`)
      historyDb.log("tile.update", `Renamed tile to "${data.title}"`, { tile_id: id, title: data.title })
    }
    return tile
  },

  remove: (id: number) => {
    const tile = db.query("SELECT title FROM tiles WHERE id = ?").get(id) as { title: string } | null
    db.query("UPDATE thoughts SET deleted_at = datetime('now') WHERE tile_id = ? AND deleted_at IS NULL").run(id)
    db.query("UPDATE tiles SET deleted_at = datetime('now') WHERE id = ?").run(id)
    historyDb.log("tile.delete", `Deleted tile "${tile?.title ?? id}"`, { tile_id: id })
  },
}
