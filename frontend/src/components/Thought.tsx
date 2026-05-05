import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { thoughtsApi } from "../api/client"
import { useStore } from "../store"
import { TagDot } from "./TagPill"
import { TagMenu } from "./TagMenu"
import { CloseButton } from "./CloseButton"
import type { Thought as ThoughtType } from "../types"

interface Props {
  thought: ThoughtType
  onDragStart: (id: number) => void
  onDragOver: (id: number) => void
  onDrop: () => void
  dragging: boolean
}

export function Thought({ thought, onDragStart, onDragOver, onDrop, dragging }: Props) {
  const { loadThoughts, newThoughtIds, updateThoughtContent } = useStore()
  const isNew = newThoughtIds.has(thought.id)
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [localTags, setLocalTags] = useState(thought.tags)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState(thought.content)
  const didFocus = useRef(false)

  useEffect(() => {
    if (!editing) setContent(thought.content)
  }, [thought.content, editing])

  async function remove(e: React.MouseEvent) {
    e.stopPropagation()
    await thoughtsApi.remove(thought.id)
    loadThoughts()
  }

  async function saveContent() {
    setEditing(false)
    const trimmed = content.trim()
    if (trimmed && trimmed !== thought.content) {
      setContent(trimmed)
      await thoughtsApi.updateContent(thought.id, trimmed)
      loadThoughts()
    }
  }

  function onContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setMenu({ x: e.clientX, y: e.clientY })
  }

  async function onTagUpdate(tags: string[]) {
    setLocalTags(tags)
    await thoughtsApi.updateTags(thought.id, tags)
  }

  return (
    <>
      <div
        draggable={!editing}
        onDragStart={() => !editing && onDragStart(thought.id)}
        onDragEnd={onDrop}
        onDragOver={(e) => { e.preventDefault(); onDragOver(thought.id) }}
        onDrop={onDrop}
        onContextMenu={onContextMenu}
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 8px",
          marginBottom: 2,
          fontSize: 13,
          background: dragging ? "#f5f5f5" : "#fafafa",
          border: "1px solid #ebebeb",
          borderRadius: 6,
          cursor: "grab",
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
            onBlur={(e) => {
              const text = e.currentTarget.textContent?.trim() ?? ""
              setContent(text)
              setEditing(false)
              if (text && text !== thought.content) {
                setSaving(true)
                const start = Date.now()
                updateThoughtContent(thought.id, text).finally(() => {
                  const elapsed = Date.now() - start
                  setTimeout(() => setSaving(false), Math.max(0, 500 - elapsed))
                })
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); e.currentTarget.blur() }
              if (e.key === "Escape") { didFocus.current = false; setEditing(false); setContent(thought.content) }
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
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); didFocus.current = false; setEditing(true) }}
            style={{ color: "#1a1a1a", userSelect: "text", cursor: "text" }}
          >{content}</span>
        )}
        </div>

        {localTags.length > 0 && (
          <>
            <style>{`
              @keyframes thoughtIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
              @keyframes tagIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
            `}</style>
            <div style={{ display: "flex", gap: 0, alignItems: "center", flexShrink: 0 }}>
              {localTags.map((tag) => (
                <div key={tag} style={{ animation: "tagIn 0.15s cubic-bezier(0.4,0,0.2,1)" }}>
                  <TagDot tag={tag} />
                </div>
              ))}
            </div>
          </>
        )}

        {saving && (
          <>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg) } }
              @keyframes savingFadeIn { from { opacity: 0 } to { opacity: 1 } }
            `}</style>
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ flexShrink: 0, animation: "spin 0.7s linear infinite, savingFadeIn 0.2s ease" }}>
              <circle cx="6" cy="6" r="4.5" fill="none" stroke="#ddd" strokeWidth="1.5"/>
              <path d="M6 1.5A4.5 4.5 0 0 1 10.5 6" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </>
        )}
        <CloseButton onClick={remove} size={18} />
      </div>

      {menu && createPortal(
        <TagMenu
          thought={{ ...thought, tags: localTags }}
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          onUpdate={onTagUpdate}
        />,
        document.body
      )}
    </>
  )
}
