from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import SessionLocal
from database_models import UserData, Category, Expense, Budget
from datetime import datetime 
from sqlalchemy.orm import Session

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/expenses")
def read_expenses(db: Session = Depends(get_db)):
    expenses = db.query(Expense).all()
    return expenses

@app.get("/budgets")
def read_expenses(db: Session = Depends(get_db)):
    expenses = db.query(Budget).all()
    return expenses
@app.get("/user")
def read_expenses(db: Session = Depends(get_db)):
    expenses = db.query(UserData).all()
    return expenses
@app.get("/categories")
def read_expenses(db: Session = Depends(get_db)):
    expenses = db.query(Category).all()
    return expenses

