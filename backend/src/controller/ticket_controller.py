import logging

from fastapi import HTTPException, Request, APIRouter
from fastapi.params import Body
from fastapi.responses import JSONResponse

from src.common.business_error_code import ErrorCode
from src.db.modals.ticket import Ticket
from src.service import ticket_service, user_service
from src.service.user_service import is_email_existing, get_user_id_from_token
from src.utils.datetime import format_datetime_to_minute

ticket_router = APIRouter(prefix="/api/tickets")


@ticket_router.get("/")
async def list_tickets(request: Request):
    token = request.headers.get("Authorization")
    user_id = await get_user_id_from_token(token)

    if not user_id:
        logging.error("Invalid or missing token.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid token", "success": False, "error_code": ErrorCode.invalid_token}
        )

    user = await user_service.get_user_by_id(user_id)

    if not user:
        logging.error(f"User with ID {user_id} does not exist.")
        raise HTTPException(
            status_code=400,
            detail={"error": "User not exist", "success": False, "error_code": ErrorCode.invalid_parameter}
        )

    email = user.email

    if not await is_email_existing(email):
        logging.error(f"User with email {email} does not exist.")
        raise HTTPException(
            status_code=400,
            detail={"error": "User not exist", "success": False, "error_code": ErrorCode.invalid_parameter}
        )

    tickets_with_user_info = await ticket_service.list_tickets_for_user(email)

    if not isinstance(tickets_with_user_info, list):
        logging.error(f"Failed to query tickets for user with email {email}.")
        raise HTTPException(
            status_code=500,
            detail={"error": "Query ticket list failed", "success": False, "error_code": ErrorCode.db_query_error}
        )

    if len(tickets_with_user_info) == 0:
        return JSONResponse(
            status_code=200,
            content={
                "data": [],
                "success": True
            }
        )

    ticket_list = []
    for ticket in tickets_with_user_info:
        ticket_list.append({
            "id": ticket.get("ticket").id,
            "amount": ticket.get("ticket").amount,
            "attachmentUrl": ticket.get("ticket").attachment_link,
            "paymentTime": format_datetime_to_minute(ticket.get("ticket").purchase_time),
            "userEmail": ticket.get("user_info").get("email"),
            "username": ticket.get("user_info").get("username"),
            "status": ticket.get("ticket").status.name,
            "createdAt": format_datetime_to_minute(ticket.get("ticket").created_time),
        })

    return JSONResponse(
        status_code=200,
        content={
            "data": ticket_list,
            "success": True
        }
    )


@ticket_router.post("/")
async def create_ticket(data: dict = Body(...), request: Request = None):
    amount = data.get('amount', 0.0)
    attachment_link = data.get('attachment_link', '')

    token = request.headers.get("Authorization")
    user_id = await get_user_id_from_token(token)

    if not user_id:
        logging.error("Invalid or missing token.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid token", "success": False, "error_code": ErrorCode.invalid_token}
        )

    current_ticket = await ticket_service.create_ticket(user_id, amount, attachment_link)
    if isinstance(current_ticket, Ticket):
        return JSONResponse(
            status_code=200,
            content={
                "data": {
                    "ticket_id": current_ticket.id,
                    "amount": current_ticket.amount,
                    "attachment_link": current_ticket.attachment_link,
                    "purchase_time": format_datetime_to_minute(current_ticket.purchase_time),
                    "status": current_ticket.status.name
                },
                "success": True
            }
        )

    logging.error(f"Failed to create ticket for user with id {user_id}.")
    raise HTTPException(
        status_code=500,
        detail={"error": "Creat ticket failed", "success": False, "error_code": ErrorCode.db_insert_error}
    )


@ticket_router.put("/{ticket_id}/status")
async def approve_ticket(ticket_id: int, data: dict = Body(...), request: Request = None):
    status = data.get('status', '')

    token = request.headers.get("Authorization")
    user_id = await get_user_id_from_token(token)

    if not user_id:
        logging.error("Invalid or missing token.")
        raise HTTPException(
            status_code=401,
            detail={"error": "Invalid token", "success": False, "error_code": ErrorCode.invalid_token}
        )

    ticket = await ticket_service.approve_or_reject_ticket(ticket_id, status, user_id)

    if isinstance(ticket, Ticket):
        return JSONResponse(
            status_code=200,
            content={
                "data": {
                    "ticket_id": ticket.id,
                    "amount": ticket.amount,
                    "attachment_link": ticket.attachment_link,
                    "purchase_time": format_datetime_to_minute(ticket.purchase_time),
                    "purchaser_id": ticket.purchaser_id,
                    "status": ticket.status.name
                },
                "success": True
            }
        )

    raise HTTPException(
        status_code=500,
        detail={"error": "Approve or reject ticket failed", "success": False, "error_code": ErrorCode.db_update_error}
    )
