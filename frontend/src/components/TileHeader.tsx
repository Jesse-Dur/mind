import { useStore } from "../store"
import { CloseButton } from "./CloseButton"
import type { Tile } from "../types"

export function TileHeader({ tile, onDragDown, editing, setEditing }: { tile: Tile; onDragDown: (e: React.MouseEvent) => void; editing: boolean; setEditing: (v: boolean) => void }) {
  const { updateTile, removeTile } = useStore()

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
        {editing ? (
          <input
            autoFocus
            defaultValue={tile.title}
            onBlur={(e) => {
              const t = e.currentTarget.value
              if (t !== tile.title) updateTile(tile.id, { title: t })
              setEditing(false)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); e.currentTarget.blur() }
              if (e.key === "Escape") { setEditing(false) }
            }}
            style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", outline: "none", cursor: "text", border: "none", background: "transparent", padding: 0, width: "100%", fontFamily: "inherit" }}
          />
        ) : (
          <span
            onMouseDown={(e) => {
              const startX = e.clientX
              const startY = e.clientY
              onDragDown(e)
              const onUp = (up: MouseEvent) => {
                window.removeEventListener("mouseup", onUp)
                const moved = Math.abs(up.clientX - startX) > 3 || Math.abs(up.clientY - startY) > 3
                if (!moved) setEditing(true)
              }
              window.addEventListener("mouseup", onUp)
            }}
            style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", cursor: "text", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >{tile.title}</span>
        )}
      </div>
      <div style={{ marginRight: 6 }}><CloseButton onClick={() => removeTile(tile.id)} size={22} /></div>
    </div>
  )
}
