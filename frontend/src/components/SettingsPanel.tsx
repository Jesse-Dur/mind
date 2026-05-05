import { useStore } from "../store"

const OPTIONS = [
  { value: 1080, label: "Less room, bigger tiles", sub: "1080p" },
  { value: 1440, label: "Balanced room and tile size", sub: "1440p" },
  { value: 2160, label: "Most room, smallest tiles", sub: "4K" },
]

export function SettingsPanel() {
  const { canvasHeight, setCanvasHeight } = useStore()
  const idx = OPTIONS.findIndex(o => o.value === canvasHeight) ?? 1

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>Canvas Size</p>

        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={idx}
          onChange={(e) => setCanvasHeight(OPTIONS[Number(e.target.value)].value)}
          style={{ width: "100%", accentColor: "#1a1a1a", cursor: "pointer" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {OPTIONS.map((o, i) => (
            <span key={o.value} style={{ fontSize: 10, color: i === idx ? "#1a1a1a" : "#bbb", fontWeight: i === idx ? 600 : 400, transition: "color 0.15s ease" }}>
              {o.sub}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 12, padding: "10px 12px", background: "#f8f8f8", borderRadius: 8 }}>
          <p style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{OPTIONS[idx].label}</p>
        </div>
      </div>
    </div>
  )
}
