from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, Integer, String, DECIMAL, Date, Text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from typing import Optional
from datetime import date

Base = declarative_base()


class UserData(Base):
    __tablename__ = "user_data"
    user_id = Column(Integer, primary_key=True, index=True)
    user_name = Column(String(50))
    user_email = Column(String(30))
    user_password = Column(String(50))
    created_at = Column(TIMESTAMP)

    categories = relationship("Category", back_populates="user")
    expenses = relationship("Expense", back_populates="user")
    budgets = relationship("Budget", back_populates="user")


class Category(Base):
    __tablename__ = "category"
    cy_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_data.user_id"))
    cy_name = Column(String(20), nullable=False)

    user = relationship("UserData", back_populates="categories")
    expenses = relationship("Expense", back_populates="category")


class Expense(Base):
    __tablename__ = "expense"
    ex_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_data.user_id"))
    cy_id = Column(Integer, ForeignKey("category.cy_id"))
    ex_amount = Column(DECIMAL)
    ex_desc = Column(Text)
    ex_data = Column(Date)
    created_at = Column(TIMESTAMP)

    user = relationship("UserData", back_populates="expenses")
    category = relationship("Category", back_populates="expenses")


class Budget(Base):
    __tablename__ = "budget"
    b_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_data.user_id"))
    b_mnth = Column(Date)
    limit_amount = Column(DECIMAL)
    created_at = Column(TIMESTAMP)

    user = relationship("UserData", back_populates="budgets")


