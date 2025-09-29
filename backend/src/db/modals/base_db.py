from sqlalchemy.orm import declarative_base
from sqlalchemy import Column, Integer, DateTime


Base = declarative_base()


class BaseDB(Base):
    __abstract__ = True  # sign as abstract class, won't create table
    id = Column(Integer, primary_key=True, index=True)
    created_time = Column(DateTime)
    updated_time = Column(DateTime)
    deleted = Column(Integer, default=0)  # 0: not deleted, 1: deleted
