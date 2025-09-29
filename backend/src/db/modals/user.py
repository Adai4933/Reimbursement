from sqlalchemy import Column, String, Enum

from src.db.modals.base_db import BaseDB
from src.db.db_enum import UserGroup


class User(BaseDB):
    __tablename__ = 'user'
    username = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    group = Column(Enum(UserGroup))
