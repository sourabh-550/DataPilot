import re

# A bare number of 4+ integer digits, optionally with decimals: 224543.85, 69000.
# Not touched: numbers glued to letters or other digits (ORD10234, 2025-01-15,
# 12:30, 1.2.3), numbers that already have separators, and leading-zero codes (00123).
_BARE_NUMBER = re.compile(r"(?<![\w.,/:])(?<!\d-)(\d{4,})(\.\d+)?(?![\w,/:])(?!\.\d)(?!-\d)")


def _add_separators(match: re.Match) -> str:
    whole, decimals = match.group(1), match.group(2) or ""
    if whole.startswith("0"):
        return match.group(0)
    if not decimals and len(whole) == 4 and 1900 <= int(whole) <= 2100:
        return match.group(0)  # most likely a year: "sales in 2024"
    return f"{int(whole):,}{decimals}"


def with_thousands_separators(text: str) -> str:
    """'Smartwatch earned 224543.85' → 'Smartwatch earned 224,543.85' (same style as the charts)."""
    return _BARE_NUMBER.sub(_add_separators, text)
