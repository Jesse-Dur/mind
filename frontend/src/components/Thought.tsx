import { useState } from "react"
import { createPortal } from "react-dom"
import { thoughtsApi } from "../api/client"
import { useStore } from "../store"
import { TagMenu } from "./TagMenu"
import { CloseButton } from "./CloseButton"
import { SavingSpinner } from "./SavingSpinner"
import { ThoughtTags } from "./ThoughtTags"
import { useThoughtEdit } from "../hooks/useThoughtEdit"
import type { Thought as ThoughtType } from "../types"

interface Props {
  thought: ThoughtType
  onDragStart: (id: number) => void
  onDragOver: (id: number) => void
  onDrop: () => void
  dragging: boolean
}

export function Thought({ thought, onDragStart, onDragOver, onDrop, dragging }: Props) {
  const { loadThoughts, newThoughtIds } = useStore()
  const isNew = newThoughtIds.has(thought.id)
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [localTags, setLocalTags] = useState(thought.tags)
  const { editing, saving, content, didFocus, startEditing, cancelEditing, saveEditing } = useThoughtEdit(thought)

  async function remove(e: React.MouseEvent) {
    e.stopPropagation()
    await thoughtsApi.remove(thought.id)
    loadThoughts()
  }

  async function onTagUpdate(tags: string[]) {
    setLocalTags(tags)
    await thoughtsApi.updateTags(thought.id, tags)
  }

  return (
    <>
      <style>{`@keyframes thoughtIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div
        draggable={!editing}
        onDragStart={() => !editing && onDragStart(thought.id)}
        onDragEnd={onDrop}
        onDragOver={(e) => { e.preventDefault(); onDragOver(thought.id) }}
        onDrop={onDrop}
        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); setMenu({ x: e.clientX, y: e.clientY }) }}
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 8px", marginBottom: 2, fontSize: 13,
          background: dragging ? "#f5f5f5" : "#fafafa",
          border: "1px solid #ebebeb", borderRadius: 6, cursor: "grab",
          opacity: dragging ? 0.4 : 1,
          transition: "opacity 0.15s ease, transform 0.12s ease",
          transform: dragging ? "scale(0.98)" : "scale(1)",
          animation: isNew ? "thoughtIn 0.4s cubic-bezier(0.4,0,0.2,1)" : undefined,
        }}
      >
        <span style={{ color: "#ccc", flexShrink: 0, fontSize: 11 }}>⠿</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <span
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => saveEditing(e.currentTarget.textContent ?? "")}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur() }
                if (e.key === "Escape") cancelEditing()
              }}
              ref={(el) => {
                if (el && !didFocus.current) {
                  didFocus.current = true
                  el.focus()
                  const r = document.createRange()
                  r.selectNodeContents(el)
                  r.collapse(false)
                  window.getSelection()?.removeAllRanges()
                  window.getSelection()?.addRange(r)
                }
              }}
              style={{ color: "#1a1a1a", outline: "none", cursor: "text", userSelect: "text", fontSize: 13 }}
            >{thought.content}</span>
          ) : (
            <span
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); startEditing() }}
              style={{ color: "#1a1a1a", userSelect: "text", cursor: "text" }}
            >{content}</span>
          )}
        </div>
        <ThoughtTags tags={localTags} />
        {saving && <SavingSpinner />}
        <CloseButton onClick={remove} size={18} />
      </div>

      {menu && createPortal(
        <TagMenu
          thought={{ ...thought, tags: localTags }}
          x={menu.x} y={menu.y}
          onClose={() => setMenu(null)}
          onUpdate={onTagUpdate}
        />,
        document.body
      )}
    </>
  )
}
