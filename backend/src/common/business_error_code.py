from enum import Enum


# for frontend message customizing
class ErrorCode(Enum):

    # 4xx series, client error

    # 400, bad request
    invalid_parameter = 40000
    email_exist = 40001

    # 401, unauthorized
    invalid_token = 40100  # token is invalid
    no_user_found = 40101  # token is valid but user not found

    # 403, forbidden
    permission_denied = 40302  # not enough permission to finish the operation

    # 5xx series, server error

    # 500, internal server error
    db_insert_error = 50000
    db_query_error = 50001
    db_update_error = 50002
