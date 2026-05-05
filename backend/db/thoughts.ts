import { db } from "./client"
import { historyDb } from "./history"
import type { Thought } from "../../frontend/src/types"

type RawThought = Omit<Thought, "tags"> & { tags: string }

function parse(row: RawThought): Thought {
  return { ...row, tags: JSON.parse(row.tags) }
}

export const thoughtsDb = {
  list: (tileId?: number) => {
    const rows = tileId
      ? db.query("SELECT * FROM thoughts WHERE tile_id = ? AND deleted_at IS NULL ORDER BY sort_order ASC, created_at ASC").all(tileId) as RawThought[]
      : db.query("SELECT * FROM thoughts WHERE deleted_at IS NULL ORDER BY sort_order ASC, created_at ASC").all() as RawThought[]
    return rows.map(parse)
  },

  listPast: () =>
    db.query("SELECT * FROM thoughts WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC").all().map((r) => parse(r as RawThought)),

  create: (data: Omit<Thought, "id" | "created_at">, silent = false) => {
    const maxRow = db.query("SELECT MAX(sort_order) as m FROM thoughts WHERE tile_id = ?").get(data.tile_id) as { m: number | null }
    const sort_order = (maxRow.m ?? -1) + 1
    const row = db.query(`
      INSERT INTO thoughts (tile_id, content, tags, sort_order)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `).get(data.tile_id, data.content, JSON.stringify(data.tags), sort_order) as RawThought
    const thought = parse(row)
    if (!silent) {
      const tile = db.query("SELECT title FROM tiles WHERE id = ?").get(data.tile_id) as { title: string } | null
      const tagStr = data.tags.length ? ` tagged [${data.tags.join(", ")}]` : ""
      historyDb.log("thought.create", `Added thought${tagStr} in "${tile?.title ?? data.tile_id}"`, { thought_id: thought.id, tile_id: data.tile_id, content: data.content, tags: data.tags })
    }
    return thought
  },

  reorder: (id: number, sort_order: number) =>
    db.query("UPDATE thoughts SET sort_order = ? WHERE id = ?").run(sort_order, id),

  updateTags: (id: number, tags: string[]) => {
    const row = db.query("UPDATE thoughts SET tags = ? WHERE id = ? RETURNING *").get(JSON.stringify(tags), id) as RawThought
    const tagStr = tags.length ? tags.join(", ") : "none"
    historyDb.log("thought.tag", `Tagged thought [${tagStr}]`, { thought_id: id, tags })
    return row
  },

  update: (id: number, content: string, tags?: string[]) => {
    const old = db.query("SELECT content FROM thoughts WHERE id = ?").get(id) as { content: string } | null
    const tagsVal = tags !== undefined ? JSON.stringify(tags) : undefined
    if (tagsVal !== undefined) {
      db.query("UPDATE thoughts SET content = ?, tags = ? WHERE id = ?").run(content, tagsVal, id)
    } else {
      db.query("UPDATE thoughts SET content = ? WHERE id = ?").run(content, id)
    }
    historyDb.log("thought.update", `Updated thought "${old?.content?.slice(0, 40) ?? id}" → "${content.slice(0, 40)}"`, { thought_id: id, old_content: old?.content, new_content: content })
  },

  move: (id: number, tile_id: number) => {
    db.query("UPDATE thoughts SET tile_id = ? WHERE id = ?").run(tile_id, id)
    const tile = db.query("SELECT title FROM tiles WHERE id = ?").get(tile_id) as { title: string } | null
    historyDb.log("thought.move", `Moved thought to "${tile?.title ?? tile_id}"`, { thought_id: id, tile_id })
  },

  remove: (id: number) => {
    const row = db.query("SELECT content FROM thoughts WHERE id = ?").get(id) as { content: string } | null
    db.query("UPDATE thoughts SET deleted_at = datetime('now') WHERE id = ?").run(id)
    historyDb.log("thought.delete", `Deleted thought "${row?.content?.slice(0, 40) ?? id}"`, { thought_id: id })
  },
}
