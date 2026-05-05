# Mind
Welcome to Mind. A 100% Local, Offline, AI-Powered Thought Organiser built around a freeform tile-based canvas where you drag to create tiles and add dot-pooint thoughts inside them and can tag and search everything. 
The 'AI' part is designed for voice input tools such as 'VoiceToText' and routes your input through a local AI to automatically classify, split, and file your thoughts.

Everything runs locally. Your business stays in your control, on your machine.

---

## A bit about why i made this
Does a random idea, something you need to do later, or just an interesting thought ever pop into your mind and you have to scramble to write it down else you risk forgetting?
Well, this happens (or should i say *happened*) to me. Every day.
I used to write it down on notepad (back in my microslop windows days), or write it in Goodnotes on my iPad, on a piece of paper, or set a reminder on my phone. But no matter what i did, i found there was no one place I could centralise all of these thoughts, so I made one.

Lying in bed, I began to imagine a blank slate, where i could create tiles and put my 'thoughts', so made it (with the help of AI, of course). I never intended to make this public, but many people have been very interested, so I thought i'd open-source it, the logical solution! But this does mean it's largely vibecoded slop, so feel free to contribute, or to put your time towards a better cause (or touch grass). 

Privacy is important to me, so I designed Mind to run fully locally and have a single 'Spotlight-like' input, where you can use an existing voice to text tool and just dump your brain into it and let the LLM do the categorisation & tagging, for you to search when you need to later on. This way i didn't have to worry about some giant company harvesting my thoughts or paywalling an app I already use.

You're welcome to open issues, fork the project, make it commercial, heck i dont care. All i ask is you be a good person & that's the terms you agree to by interacting with this project. 

If you'd prefer a hosted version for whatever reason, i offer one at [website URL] that's also fully open-source [here].

---

## Features

- **Freeform canvas** — drag to draw tiles anywhere on a canvas that scales to your screen
- **Thoughts** — dot-point notes inside tiles, draggable to reorder or move between tiles
- **Tags** — colour-coded tags with an expanding pill UI, searchable via Spotlight
- **Spotlight** (`Cmd+K`) — fuzzy search across tiles, thoughts, and tags. Type `#tag` to filter by tag, `>` to send to AI, or `t` to create a new tile
- **AI processing** — type a thought in natural language, the AI classifies it, splits compound inputs, applies tags, and files it in the right tile. Can also update, delete, and move existing thoughts
- **History** — full audit log of every action with expand view showing what you said and the actions the LLM took based on that.
- **Sidebar** — Tags, History, and Settings panels

---

## Getting Started
1) Download prerequisites
2) Initialise project
3) Set ENV Vars
4) Run with 1 command
5) Click the menu button in the top left, go to settings and set your 'scale' (aka canvas size). dw, you can change it later. 
6) Create your first tile with CMD+k and typing in the name you want, then clicking new tile OR by clicking and dragging on any point of the empty canvas. 
7) Create your first thought by typing into a tile or typing into spotlight and selecting 'send to AI' (default option when clicking enter). You can monitor the output of the AI in the terminal where you ran `bun run dev`
8) Enjoy ig, i mean idk you do what you want

---

## Prerequisites

- **[Bun](https://bun.sh)** — runtime, package manager, and SQLite
- **[Ollama](https://ollama.com)** — local AI inference (must be running)
- A pulled Ollama model. `qwen3.5:4b` is the recommended minimum, but feel free to experiment.

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Pull the recommended model
ollama pull qwen3.5:4b
```

---

## Setup

```bash
# Install dependencies
bun install
cd frontend && bun install && cd ..
```

---

## Configuration

| Environment variable | Default | Description |
|---|---|---|
| `OLLAMA_URL` | `http://localhost:11434` | URL of your Ollama instance |

To use a remote Ollama instance (e.g. home server):

```bash
OLLAMA_URL=http://your-server-ip:11434 bun run dev
```

---

## Running

```bash
bun run dev
```

This starts both servers concurrently:
- **Backend** — `http://localhost:3000` (Hono + SQLite)
- **Frontend** — `http://localhost:5173` (Vite + React)

Open `http://localhost:5173` in your browser.

---

## Data

All data is stored in `dashboard.db` (SQLite) at the project root. To reset:

```bash
rm dashboard.db
```

The database is recreated automatically on next startup.

---

## Credits
 - The icon of the project & svg is from [freesvg.org](https://freesvg.org/colorful-brain)
 - So far, I've exclusively used Amazon Q-Developer set to Claude Sonnet 4.6 in VS Code to make this project. Bet you can tell lol.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Bun |
| Backend | Hono |
| Database | SQLite (via `bun:sqlite`) |
| Frontend | React + TypeScript + Vite |
| State | Zustand |
| AI | Ollama (local) |

Any questions, ask away.

Peace. 