from pydantic import BaseModel
from typing import List, Optional
from datetime import date

from pydantic import BaseModel
from datetime import datetime, date

class UserSchema(BaseModel):
    user_name: str
    user_email: str
    user_password: str
    created_at: datetime = None

class CategorySchema(BaseModel):
    user_id: int
    cy_name: str

class ExpenseSchema(BaseModel):
    user_id: int
    cy_id: int
    ex_amount: float
    ex_desc: str
    ex_data: date

class BudgetSchema(BaseModel):
    user_id: int
    b_mnth: date
    limit_amount: float


