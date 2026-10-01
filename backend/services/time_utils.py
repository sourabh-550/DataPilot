from datetime import timezone


def to_utc_iso(dt):
    """
    Timestamps are stored as naive UTC (TIMESTAMP WITHOUT TIME ZONE). Tag them as
    UTC before sending, otherwise browsers parse them as local time (IST is +5:30).
    """
    return dt.replace(tzinfo=timezone.utc).isoformat() if dt else None
