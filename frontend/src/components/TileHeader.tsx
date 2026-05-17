import { useState } from "react"
import { useStore } from "../store"
import { CloseButton } from "./CloseButton"
import type { Tile } from "../types"

export function TileHeader({ tile, onDragDown, editing, setEditing }: { tile: Tile; onDragDown: (e: React.MouseEvent) => void; editing: boolean; setEditing: (v: boolean) => void }) {
  const { updateTile, removeTile } = useStore()
  const [saving, setSaving] = useState(false)

  return (
    <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #ebebeb", flexShrink: 0 }}>
      <div
        onMouseDown={(e) => {
          if (editing) (e.currentTarget.querySelector("input") as HTMLInputElement)?.blur()
          if (e.target === e.currentTarget) onDragDown(e)
        }}
        style={{ padding: "8px 10px", cursor: "grab", flex: 1, display: "flex", alignItems: "center", overflow: "hidden", gap: 6 }}
      >
        <span onMouseDown={(e) => { if (editing) (document.activeElement as HTMLElement)?.blur(); onDragDown(e) }} style={{ color: "#ccc", fontSize: 11, flexShrink: 0, cursor: "grab", userSelect: "none" }}>⠿</span>
        <input
          defaultValue={tile.title}
          onFocus={() => setEditing(true)}
          onBlur={(e) => {
            const t = e.currentTarget.value
            if (t !== tile.title) {
              setSaving(true)
              const start = Date.now()
              updateTile(tile.id, { title: t }).finally(() => {
                const elapsed = Date.now() - start
                setTimeout(() => setSaving(false), Math.max(0, 500 - elapsed))
              })
            }
            setEditing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); e.currentTarget.blur() }
            if (e.key === "Escape") { e.currentTarget.blur() }
          }}
          ref={(el) => { if (el) el.addEventListener("scroll", () => { el.scrollLeft = 0 }) }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            fontSize: 13, fontWeight: 600, color: "#1a1a1a",
            outline: "none", border: "none", background: "transparent",
            padding: 0, fontFamily: "inherit",
            cursor: "text",
            userSelect: editing ? "text" : "none",
            fieldSizing: "content",
            minWidth: 4, maxWidth: "100%",
          } as React.CSSProperties}
        />
      </div>
      <div style={{ marginRight: 6, display: "flex", alignItems: "center", gap: 4 }}>
        {saving && (
          <>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } } @keyframes savingFadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0, animation: "spin 0.7s linear infinite, savingFadeIn 0.2s ease" }}>
              <circle cx="6" cy="6" r="4.5" fill="none" stroke="#ddd" strokeWidth="1.5"/>
              <path d="M6 1.5A4.5 4.5 0 0 1 10.5 6" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </>
        )}
        <CloseButton onClick={() => removeTile(tile.id)} size={22} />
      </div>
    </div>
  )
}
