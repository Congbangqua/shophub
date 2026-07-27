from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from fastapi import Depends
from sqlalchemy.orm import Session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


DATABASE_URL = "postgresql://postgres:Pikachured.147@localhost:5432/shophub_db"

engine = create_engine(DATABASE_URL, echo=True)  # echo for debugging

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()