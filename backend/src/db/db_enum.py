import enum


class UserGroup(enum.Enum):
    EMPLOYEE = "employee"
    EMPLOYER = "employer"

    @staticmethod
    def get_name(string: str):
        for group in UserGroup:
            if group.name == string or group.value == string:
                return group
        return None


class TicketStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    PAID = "paid"

    @staticmethod
    def get_name(string: str):
        for status in TicketStatus:
            if status.name == string or status.value == string:
                return status
        return None
