import { useRef, useState, useEffect } from "react"
import { useStore } from "../store"
import { Tile } from "./Tile"
import { Spotlight } from "./Spotlight"

const GRID = 24
const MIN = GRID * 4

function snap(n: number) {
  return Math.round(n / GRID) * GRID
}

interface Draft { startX: number; startY: number; x: number; y: number; width: number; height: number }

export function Canvas() {
  const { tiles, addTile, spotlightOpen, newestTileId, canvasHeight } = useStore()
  const CANVAS_H = canvasHeight
  const CANVAS_W = Math.round(canvasHeight * (16 / 9))
  const [draft, setDraft] = useState<Draft | null>(null)
  const [scale, setScale] = useState(1)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function updateScale() {
      setScale(window.innerWidth / CANVAS_W)
    }
    updateScale()
    window.addEventListener("resize", updateScale)
    return () => window.removeEventListener("resize", updateScale)
  }, [CANVAS_W])

  function clamp(x: number, y: number, width: number, height: number) {
    return {
      x: Math.max(0, Math.min(x, snap(CANVAS_W - width))),
      y: Math.max(0, Math.min(y, snap(CANVAS_H - height))),
      width: Math.min(width, CANVAS_W),
      height: Math.min(height, CANVAS_H),
    }
  }

  function toCanvas(clientX: number, clientY: number) {
    return { x: clientX / scale, y: clientY / scale }
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement) !== canvasRef.current) return
    const { x, y } = toCanvas(e.clientX, e.clientY)
    const sx = snap(x), sy = snap(y)
    setDraft({ startX: sx, startY: sy, x: sx, y: sy, width: GRID, height: GRID })
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!draft) return
    const { x, y } = toCanvas(e.clientX, e.clientY)
    const curX = snap(x), curY = snap(y)
    setDraft({
      ...draft,
      x: Math.min(draft.startX, curX),
      y: Math.min(draft.startY, curY),
      width: Math.max(MIN, Math.abs(curX - draft.startX)),
      height: Math.max(MIN, Math.abs(curY - draft.startY)),
    })
  }

  function onMouseUp() {
    if (!draft) return
    if (draft.width >= MIN && draft.height >= MIN) {
      addTile({ title: "New Tile", ...clamp(draft.x, draft.y, draft.width, draft.height), importance: 1, visible: true })
    }
    setDraft(null)
  }

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#f5f5f5" }}>
      <div
        ref={canvasRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        style={{
          position: "absolute",
          width: CANVAS_W,
          height: CANVAS_H,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          backgroundImage: "radial-gradient(circle, #c8c8c8 1px, transparent 1px)",
          backgroundSize: `${GRID}px ${GRID}px`,
          cursor: "crosshair",
          userSelect: "none",
        }}
      >
        {tiles.filter((t) => t.visible).map((tile) => (
          <Tile key={tile.id} tile={tile} isNew={tile.id === newestTileId} scale={scale} />
        ))}
        {draft && (
          <div style={{
            position: "absolute",
            left: draft.x, top: draft.y, width: draft.width, height: draft.height,
            border: "2px dashed #aaa",
            borderRadius: 8,
            background: "rgba(0,0,0,0.04)",
            pointerEvents: "none",
          }} />
        )}
        {spotlightOpen && <Spotlight />}
      </div>
    </div>
  )
}
