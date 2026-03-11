# SpendWise
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Overview
SpendWise is a full-stack personal finance tracker to manage:
- Income and expenses
- Monthly budgets
- Current balance
- Monthly PDF reports

## Personal Note
I implemented this project for my own personal finance management and daily transaction tracking.

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white) | REST API and business logic |
| Database | ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?logo=postgresql&logoColor=white) ![NEON](https://img.shields.io/badge/-NEON-00E699?logo=neon&logoColor=black) | Data storage |
| DB Client | ![pg](https://img.shields.io/badge/-pg-4169E1?logo=postgresql&logoColor=white) | PostgreSQL access from Node.js |
| Frontend | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) | Web app UI |
| Styling | ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white) | UI styling |
| Charts | ![Recharts](https://img.shields.io/badge/-Recharts-FF6B6B?logo=chartdotjs&logoColor=white) | Dashboard visualization |
| Reports | ![PDFKit](https://img.shields.io/badge/-PDFKit-DC2626?logo=adobeacrobatreader&logoColor=white) ![jsPDF](https://img.shields.io/badge/-jsPDF-1F2937?logo=javascript&logoColor=F7DF1E) | PDF report generation |
| Cloud | ![AWS](https://img.shields.io/badge/-AWS-232F3E?logo=amazonaws&logoColor=white) | Hosting and infrastructure |

## Installation

### 1) Clone and install backend dependencies
```bash
git clone <your-repo-url>
cd SpendWise
npm install
```

### 2) Configure backend environment
Create `.env` in project root:

```env
PORT=3001
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
AUTO_REPORTS_ENABLED=true
```

### 3) Run backend
```bash
npm run dev
```

Backend URL: `http://localhost:3001`

### 4) Install frontend dependencies
```bash
cd spendwise-frontend
npm install
```

### 5) Configure frontend environment
Create `spendwise-frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

### 6) Run frontend
```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## Deployment
Hosted on AWS.

### Backend
- Host on Render/Railway
- Set env vars:
  - `DATABASE_URL`
  - `PORT`
  - `AUTO_REPORTS_ENABLED=true`
- Start command:
```bash
npm start
```

### Frontend
- Host on Vercel/Netlify
- Set env var:
  - `VITE_API_URL=https://<your-backend-domain>`
- Build command:
```bash
npm run build
```
- Output directory: `dist`

## API Reference
For all endpoints, request/response formats, and report routes:
- `API_DOCS.md`
