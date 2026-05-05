import { db } from "./client"

export interface HistoryEvent {
  id: number
  action: string
  summary: string
  detail: string
  created_at: string
}

export const historyDb = {
  list: () => db.query(`
    SELECT * FROM history
    WHERE created_at >= datetime('now', '-30 days')
    ORDER BY created_at DESC
  `).all() as HistoryEvent[],

  log: (action: string, summary: string, detail: Record<string, unknown>) =>
    db.query("INSERT INTO history (action, summary, detail) VALUES (?, ?, ?)").run(action, summary, JSON.stringify(detail)),
}
