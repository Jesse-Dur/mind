import { useState, useRef, useEffect } from "react"
import { useStore } from "../store"
import { Thought } from "./Thought"
import { ThoughtInput } from "./ThoughtInput"
import { thoughtsApi } from "../api/client"
import { CloseButton } from "./CloseButton"
import { dragState } from "../utils/dragState"
import type { Tile as TileType } from "../types"

const GRID = 24

function snap(n: number) {
  return Math.round(n / GRID) * GRID
}

export function Tile({ tile, isNew, scale = 1 }: { tile: TileType; isNew?: boolean; scale?: number }) {
  const { updateTile, removeTile, thoughts, canvasHeight } = useStore()
  const CANVAS_W = Math.round(canvasHeight * (16 / 9))
  const CANVAS_H = canvasHeight
  const [editing, setEditing] = useState(isNew ?? false)
  const [title, setTitle] = useState(tile.title)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const thoughtInputRef = useRef<HTMLInputElement>(null)
  const [orderedIds, setOrderedIds] = useState<number[]>([])
  const [draggingId, setDraggingId] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState(false)
  const dragThought = useRef<number | null>(null)
  const drag = useRef<{ mx: number; my: number; tx: number; ty: number } | null>(null)
  const resize = useRef<{ mx: number; my: number; tw: number; th: number } | null>(null)

  useEffect(() => {
    if (isNew && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [])

  const tileThoughts = thoughts
    .filter((t) => t.tile_id === tile.id)
    .sort((a, b) => {
      const ai = orderedIds.indexOf(a.id)
      const bi = orderedIds.indexOf(b.id)
      if (ai === -1 && bi === -1) return a.sort_order - b.sort_order
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })

  function onThoughtDragStart(id: number) {
    dragThought.current = id
    dragState.thoughtId = id
    dragState.sourceTileId = tile.id
    setDraggingId(id)
    setOrderedIds(tileThoughts.map((t) => t.id))
  }

  function onThoughtDragOver(overId: number) {
    if (!dragThought.current || dragThought.current === overId) return
    setOrderedIds((ids) => {
      const arr = [...ids]
      const from = arr.indexOf(dragThought.current!)
      const to = arr.indexOf(overId)
      if (from === -1 || to === -1) return ids
      arr.splice(from, 1)
      arr.splice(to, 0, dragThought.current!)
      return arr
    })
  }

  async function onThoughtDrop() {
    if (!orderedIds.length) return
    await Promise.all(orderedIds.map((id, i) => thoughtsApi.reorder(id, i)))
    dragThought.current = null
    dragState.thoughtId = null
    dragState.sourceTileId = null
    setDraggingId(null)
  }

  async function onTileContentDrop(e: React.DragEvent) {
    e.preventDefault()
    setDropTarget(false)
    const id = dragState.thoughtId
    const srcTile = dragState.sourceTileId
    if (!id || srcTile === tile.id) return
    await thoughtsApi.move(id, tile.id)
    dragState.thoughtId = null
    dragState.sourceTileId = null
    useStore.getState().loadThoughts()
  }

  function onDragDown(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    let moved = false
    drag.current = { mx: e.clientX, my: e.clientY, tx: tile.x, ty: tile.y }

    function onMove(e: MouseEvent) {
      if (!drag.current) return
      if (!moved && (Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4)) moved = true
      if (!moved) return
      e.preventDefault()
      const x = Math.max(0, Math.min(snap((drag.current.tx + (e.clientX - drag.current.mx) / scale)), snap(CANVAS_W - tile.width)))
      const y = Math.max(0, Math.min(snap((drag.current.ty + (e.clientY - drag.current.my) / scale)), snap(CANVAS_H - tile.height)))
      updateTile(tile.id, { x, y })
    }

    function onUp() {
      drag.current = null
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
      if (!moved) setEditing(true)
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  function onResizeDown(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    resize.current = { mx: e.clientX, my: e.clientY, tw: tile.width, th: tile.height }

    function onMove(e: MouseEvent) {
      if (!resize.current) return
      e.preventDefault()
      const width = Math.min(snap(CANVAS_W - tile.x), Math.max(GRID * 4, snap(resize.current.tw + (e.clientX - resize.current.mx) / scale)))
      const height = Math.min(snap(CANVAS_H - tile.y), Math.max(GRID * 4, snap(resize.current.th + (e.clientY - resize.current.my) / scale)))
      updateTile(tile.id, { width, height })
    }

    function onUp() {
      resize.current = null
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
  }

  function saveTitle(moveFocus = false) {
    setEditing(false)
    if (title !== tile.title) updateTile(tile.id, { title })
    if (moveFocus) setTimeout(() => thoughtInputRef.current?.focus(), 50)
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        left: tile.x,
        top: tile.y,
        width: tile.width,
        height: tile.height,
        background: "rgba(255,255,255,0.95)",
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(8px)",
        userSelect: "none",
      }}
    >
      {/* drag handle — title bar */}
      <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid #ebebeb", flexShrink: 0 }}>
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) onDragDown(e) }}
          style={{ padding: "8px 10px", cursor: "grab", flex: 1, display: "flex", alignItems: "center", overflow: "hidden", gap: 6 }}
        >
          <span
            onMouseDown={onDragDown}
            style={{ color: "#ccc", fontSize: 11, flexShrink: 0, cursor: "grab", userSelect: "none" }}
          >⠿</span>
        {editing ? (
          <span
            contentEditable
            suppressContentEditableWarning
            onFocus={(e) => {
              const range = document.createRange()
              range.selectNodeContents(e.currentTarget)
              range.collapse(false)
              window.getSelection()?.removeAllRanges()
              window.getSelection()?.addRange(range)
            }}
            onBlur={(e) => { saveTitle(false); setTitle(e.currentTarget.textContent ?? "") }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); saveTitle(true) }
              if (e.key === "Escape") { setEditing(false); setTitle(tile.title) }
            }}
            ref={(el) => { if (el && editing) { el.focus() } }}
            style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", outline: "none", cursor: "text", userSelect: "text", minWidth: 4 }}
          >{title}</span>
        ) : (
            <span
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDragDown(e)
              }}
              style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a", cursor: "grab" }}
            >
              {tile.title}
            </span>
          )}
        </div>
        <div style={{ marginRight: 6 }}><CloseButton onClick={() => removeTile(tile.id)} size={22} /></div>
      </div>

      {/* content */}
      <div
        style={{ padding: "6px 10px", flex: 1, overflowY: "auto", userSelect: "text", cursor: "text", background: dropTarget ? "rgba(124,58,237,0.04)" : undefined, transition: "background 0.15s ease" }}
        onClick={() => thoughtInputRef.current?.focus()}
        onDragOver={(e) => { e.preventDefault(); if (dragState.sourceTileId !== tile.id) setDropTarget(true) }}
        onDragLeave={() => setDropTarget(false)}
        onDrop={onTileContentDrop}
      >
        {tileThoughts.map((t) => (
          <Thought
            key={t.id}
            thought={t}
            onDragStart={onThoughtDragStart}
            onDragOver={onThoughtDragOver}
            onDrop={onThoughtDrop}
            dragging={draggingId === t.id}
          />
        ))}
        <ThoughtInput tileId={tile.id} inputRef={thoughtInputRef} />
      </div>

      {/* resize handle */}
      <div
        onMouseDown={onResizeDown}
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: 16,
          height: 16,
          cursor: "nwse-resize",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <path d="M7 1L1 7M7 4L4 7" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  )
}
