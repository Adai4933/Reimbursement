from datetime import datetime

from sqlalchemy import select, and_

from src.db.db_configs import get_db
from src.db.db_enum import TicketStatus, UserGroup
from src.db.modals.ticket import Ticket
from src.db.modals.user import User


async def create_ticket(user_id: int, amount: float, attachment_link: str = ''):
    async for db in get_db():
        try:
            result = await db.execute(
                select(User).where(and_(User.id == user_id, User.deleted == 0))
            )
            user = result.scalar_one_or_none()
            new_ticket = Ticket(
                purchase_time=datetime.now(),
                purchaser_id=user.id,
                amount=amount,
                attachment_link=attachment_link,
                status=TicketStatus.PENDING.name,
                created_time=datetime.now(),
                updated_time=datetime.now(),
            )
            db.add(new_ticket)
            await db.commit()
            await db.refresh(new_ticket)
            return new_ticket

        except Exception as e:
            await db.rollback()
            raise e


async def list_tickets_for_user(email: str):
    async for db in get_db():
        try:
            result = await db.execute(
                select(User).where(and_(User.email == email, User.deleted == 0))
            )
            user = result.scalar_one_or_none()
            group = user.group

            tickets_with_user_info = []

            # return different ticket lists based on user group
            if group == UserGroup.EMPLOYEE.name:
                result = await db.execute(
                    select(Ticket, User.email, User.username).
                    join(User, Ticket.purchaser_id == User.id).
                    where(User.id == user.id)
                )
            else:
                result = await db.execute(
                    select(Ticket, User.email, User.username).
                    outerjoin(User, Ticket.purchaser_id == User.id)
                )
            rows = result.all()
            for row in rows:
                ticket, email, username = row

                tickets_with_user_info.append({
                    'ticket': ticket,
                    'user_info': {
                        'email': email,
                        'username': username
                    },
                })
            return tickets_with_user_info
        except Exception as e:
            raise e


async def approve_or_reject_ticket(ticket_id: int, new_status: str, user_id: int):
    async for db in get_db():
        try:
            result = await db.execute(
                select(User).where(and_(User.id == user_id, User.deleted == 0))
            )
            user = result.scalar_one_or_none()
            if user.group != UserGroup.EMPLOYER:
                raise PermissionError("Not enough permissions")

            ticket_result = await db.execute(
                select(Ticket).where(Ticket.id == ticket_id)
            )
            ticket = ticket_result.scalar_one_or_none()
            if not ticket:
                raise ValueError("Ticket not found")

            ticket.status = TicketStatus.get_name(new_status)
            ticket.updated_time = datetime.now()
            await db.commit()
            await db.refresh(ticket)
            return ticket

        except Exception as e:
            raise e
