# 🌿 [Project Name] — An Interactive Food Web Game

> *"When we try to pick out anything by itself, we find it hitched to everything else in the universe."*
> — John Muir

A web-based game powered by real ecological data from the **[Who Eats Whom](https://whoeatswhom.org/)** database. Drag animals onto a canvas, watch their feeding connections come alive — and discover what happens when you remove one.

---

## 🎮 The Game

The rules are simple. The consequences are not.

1. **Browse the Shelf** — Pick from a curated collection of species drawn from 13,000+ verified feeding records
2. **Drag to the Canvas** — Place an animal on the screen; its predators and prey appear, connected by visible threads
3. **Build a Web** — Add more species and watch the network grow as connections multiply
4. **Remove One** — Pull a species out and watch the cascade: every animal that depended on it disappears too

It's a game about interconnection. Every species is load-bearing.

---

## 🔬 The Science Behind It

This project is an interactive extension of **[Who Eats Whom](https://whoeats whom.net)**, a planetary food web database founded by Dr. Bradley Allf and led technically by Dr. Aditi Mallavarapu at NC State University.

| | |
|---|---|
| 🌍 Verified feeding records | ~13,000 |
| 📸 Each record | Backed by photographic evidence |
| 🤝 Data source | iNaturalist community (Research Grade only) |
| 🔗 Interaction types | Predation, scavenging, parasitism, pollination |

No simulations, no inference. Every connection you see in the game was witnessed and photographed by a real person in the field.

### Citing the Data
> Mallavarapu, A., Uzzo, S., Vasudeva, N., Dunn, R., Allf, B. "Who Eats Whom: Modeling trophic interaction networks with large-scale, crowdsourced ecological data." *COMPLEX NETWORKS 2025*, Springer.

---

## 🛠️ Tech Stack

### Frontend
| Tool | Role |
|------|------|
| **Next.js** (React) | UI, drag-and-drop, canvas rendering |
| **Framer Motion** | Connection animations, cascade removal effects |

### Backend
| Tool | Role |
|------|------|
| **Python + Flask** | API layer between the game and database |
| **Neo4j Bolt Driver** | Real-time Cypher queries into the food web graph |

### Database
| Tool | Role |
|------|------|
| **Neo4j** | Graph database storing ~13,000 trophic relationships |

```
Nodes  →  :Species   (organisms verified by iNaturalist)
Edges  →  :EATS      (predation, scavenging, parasitism, pollination)
```

---

## 🏗️ Architecture

```
User drags a species onto canvas
              │
              ▼
     Next.js Frontend
              │  API call
              ▼
    Python Flask Backend
              │  Cypher query
              ▼
         Neo4j Graph DB
        (13,000+ records)
              │  returns trophic partners
              ▼
    Connected species rendered
    on canvas with live links
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A running Neo4j instance (local or AuraDB)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-org/your-repo-name.git
cd your-repo-name

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### Environment Variables

`/backend/.env`:
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

`/frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Run Locally

```bash
# Start the Flask backend
cd backend && python app.py

# Start the Next.js frontend
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start building your food web.

---

## 📁 Project Structure

```
project-root/
├── frontend/
│   ├── components/
│   │   ├── Shelf.jsx           # Species selection panel
│   │   ├── Canvas.jsx          # Game canvas
│   │   ├── SpeciesNode.jsx     # Individual animal card
│   │   └── ConnectionLines.jsx # Live feeding relationship links
│   ├── pages/
│   │   └── index.jsx
│   └── styles/
├── backend/
│   ├── app.py                  # Flask entry point
│   ├── graph.py                # Neo4j query logic
│   └── routes/
│       └── species.py          # Trophic partner endpoints
├── data/
│   └── seed/                   # Neo4j seed scripts
└── README.md
```

---

## 🤝 The Team

| | |
|---|---|
| **Dr. Bradley Allf** | Founder — postdoctoral researcher in ecology, citizen science, and biodiversity |
| **Dr. Aditi Mallavarapu** | Technical Lead — computer scientist specializing in networks and interactive systems |
| **Nikhil Vasudeva** | Developer — data pipelines and interactive tools |

Huge thanks to the **iNaturalist community** whose observations make this possible. *(This project is not formally affiliated with iNaturalist.)*

---

## 📜 License

MIT — see [LICENSE](LICENSE) for details.

Data belongs to the Who Eats Whom project and the iNaturalist community. Please cite appropriately if used in research.

---

<p align="center"><em>Every species is load-bearing. Remove one and see what follows.</em></p>
