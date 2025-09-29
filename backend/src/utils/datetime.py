import datetime


def format_datetime_to_minute(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d %H:%M") if dt else ""
