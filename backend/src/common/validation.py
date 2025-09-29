import re


def is_valid_email(email):
    regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(regex, email) is not None


def is_valid_password(password):
    return len(password) >= 8


def is_valid_username(username):
    return 5 <= len(username) <= 32
