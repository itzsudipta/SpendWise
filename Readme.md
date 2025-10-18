# SpendWise

**SpendWise** is a modern full-stack application for tracking expenses and managing budgets. It provides a robust backend API for financial management, helping users monitor their spending habits, categorize expenses, and receive insights for better financial control.

---

## 🛠️ Tech Stack

### **Node.js Backend**

| Technology | Version | Description |
|------------|---------|-------------|
| **Node.js** | v18+ | JavaScript runtime environment |
| **Express.js** | v4.x | Fast, minimalist web framework |
| **PostgreSQL** | v14+ | Relational database for data persistence |
| **pg (node-postgres)** | v8.x | PostgreSQL client for Node.js |
| **dotenv** | v16.x | Environment variable management |
| **cors** | v2.x | Cross-Origin Resource Sharing middleware |

### **Python Backend**

| Technology | Version | Description |
|------------|---------|-------------|
| **Python** | v3.9+ | Core programming language |
| **FastAPI** | v0.104+ | Modern, fast web framework for APIs |
| **Uvicorn** | v0.24+ | Lightning-fast ASGI server |
| **SQLAlchemy** | v2.0+ | SQL toolkit and ORM |
| **Pydantic** | v2.0+ | Data validation with type hints |
| **psycopg2** | v2.9+ | PostgreSQL adapter for Python |
| **asyncpg** | v0.29+ | Async PostgreSQL driver |

---

## 📦 Database Setup

### **PostgreSQL Installation**

1. **Download and Install**: Visit [PostgreSQL website](https://www.postgresql.org/download/) and install for your OS
2. **Set up credentials**: Use default port **5432** and set a strong password
3. **Create database**:
   ```sql
   CREATE DATABASE spendwise;
   ```

4. **Create tables**:
   ```sql
   -- User table
   CREATE TABLE user_data (
       user_id SERIAL PRIMARY KEY,
       user_name VARCHAR(100) NOT NULL,
       user_email VARCHAR(255) UNIQUE NOT NULL,
       user_password VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   -- Category table
   CREATE TABLE category (
       cy_id SERIAL PRIMARY KEY,
       user_id INTEGER NOT NULL,
       cy_name VARCHAR(100) NOT NULL,
       FOREIGN KEY (user_id) REFERENCES user_data(user_id) ON DELETE CASCADE
   );
   
   -- Expense table
   CREATE TABLE expense (
       ex_id SERIAL PRIMARY KEY,
       user_id INTEGER NOT NULL,
       cy_id INTEGER NOT NULL,
       ex_amount DECIMAL(10,2) NOT NULL,
       ex_desc TEXT,
       ex_data DATE DEFAULT CURRENT_DATE,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES user_data(user_id) ON DELETE CASCADE,
       FOREIGN KEY (cy_id) REFERENCES category(cy_id) ON DELETE SET NULL
   );
   
   -- Budget table
   CREATE TABLE budget (
       b_id SERIAL PRIMARY KEY,
       user_id INTEGER NOT NULL,
       b_mnth VARCHAR(7) NOT NULL,
       limit_amount DECIMAL(10,2) NOT NULL,
       FOREIGN KEY (user_id) REFERENCES user_data(user_id) ON DELETE CASCADE
   );
   ```

---

## 🚀 Node.js Setup

### **Installation**

```bash
# Clone repository
git clone https://github.com/yourusername/spendwise.git
cd spendwise

# Install dependencies
npm install

# Create .env file
touch .env
```

### **Environment Configuration** (`.env`)

```env
PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=spendwise
DB_PASSWORD=your_password
DB_PORT=5432
```

### **Database Connection** (`src/config/db.js`)

```javascript
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => console.log('✅ Database connected'));
pool.on('error', (err) => console.error('❌ Database error:', err));

export default pool;
```

### **Run Application**

```bash
# Development
npm run dev

# Production
npm start
```

### **API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user` | Get all users |
| POST | `/api/user` | Create user |
| GET | `/api/expenses` | Get all expenses |
| POST | `/api/expenses` | Create expense |
| GET | `/api/budgets` | Get all budgets |
| POST | `/api/budgets` | Create budget |
| GET | `/api/categories` | Get all categories |
| POST | `/api/categories` | Create category |

---

## 🐍 Python Setup with FastAPI

### **Installation**

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv pydantic
```

### **Environment Configuration** (`.env`)

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/spendwise
```

### **Database Connection** (`app/database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### **FastAPI Application** (`app/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SpendWise API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to SpendWise API", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

### **Run with Uvicorn**

```bash
# Development
uvicorn app.main:app --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### **Access Documentation**
- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 🤖 Machine Learning Integration

### **Planned Features**

- 📊 **Expense Prediction**: Forecast future expenses based on historical data
- 🎯 **Smart Budgeting**: AI-driven budget recommendations
- 🔍 **Pattern Analysis**: Identify spending trends and habits
- ⚠️ **Anomaly Detection**: Detect unusual transactions and fraud
- 💡 **Financial Insights**: Personalized money-saving tips

**Status**: Research and planning phase  
**Timeline**: Integration planned for 2025-2026

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details.

---

**⚡ Built with ❤️ for smart financial management**