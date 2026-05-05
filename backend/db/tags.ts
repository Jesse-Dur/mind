import { db } from "./client"
import type { Tag } from "../../frontend/src/types"

export const tagsDb = {
  list: () => db.query("SELECT * FROM tags ORDER BY name").all() as Tag[],

  upsert: (name: string, color = "#888") =>
    db.query(`
      INSERT INTO tags (name, color) VALUES (?, ?)
      ON CONFLICT(name) DO UPDATE SET color = excluded.color
      RETURNING *
    `).get(name, color) as Tag,

  update: (id: number, name: string, color: string) => {
    const old = db.query("SELECT name FROM tags WHERE id = ?").get(id) as { name: string } | null
    const tag = db.query("UPDATE tags SET name = ?, color = ? WHERE id = ? RETURNING *").get(name, color, id) as Tag
    if (old && old.name !== name) {
      // update all thoughts that reference the old tag name
      const thoughts = db.query("SELECT id, tags FROM thoughts WHERE tags LIKE ?").all(`%${old.name}%`) as { id: number; tags: string }[]
      for (const t of thoughts) {
        const updated = JSON.parse(t.tags).map((tg: string) => tg === old.name ? name : tg)
        db.query("UPDATE thoughts SET tags = ? WHERE id = ?").run(JSON.stringify(updated), t.id)
      }
    }
    return tag
  },

  remove: (id: number) => db.query("DELETE FROM tags WHERE id = ?").run(id),
}
