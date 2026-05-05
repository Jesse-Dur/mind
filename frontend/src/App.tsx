import { useEffect } from "react"
import { Canvas } from "./components/Canvas"
import { Sidebar } from "./components/Sidebar"
import { useStore } from "./store"

export default function App() {
  const { loadTiles, loadThoughts, loadTags, setSpotlightOpen, sidebarOpen, setSidebarOpen } = useStore()

  useEffect(() => {
    loadTiles()
    loadThoughts()
    loadTags()
    const poll = setInterval(loadThoughts, 5000)
    return () => clearInterval(poll)
  }, [loadTiles, loadThoughts, loadTags])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSpotlightOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [setSpotlightOpen])

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{ position: "fixed", top: 12, left: 12, zIndex: 50, background: "none", border: "none", cursor: "pointer", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s ease", color: "#aaa" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#ebebeb")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        title="Tags"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 4h12M2 8h8M2 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      <Sidebar />
      <Canvas />
    </>
  )
}
