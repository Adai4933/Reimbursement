from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, Enum

from src.db.db_enum import TicketStatus
from src.db.modals.base_db import BaseDB


class Ticket(BaseDB):
    __tablename__ = 'ticket'
    purchase_time = Column(DateTime)
    purchaser_id = Column(Integer, ForeignKey("user.id"))
    amount = Column(Float)
    attachment_link = Column(String)
    status = Column(Enum(TicketStatus), default=TicketStatus.PENDING.name)
