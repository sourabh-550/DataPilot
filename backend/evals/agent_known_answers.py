"""
Known-answer eval for the CSV chat agent. Makes REAL Groq calls (uses GROQ_API_KEY).

Every question has an answer computed with pandas; the agent's reply must contain it.
Run after any prompt or model change:

    cd backend
    python -m evals.agent_known_answers

Exits with code 1 if any case fails.

COST: one run is ~30 LLM calls ≈ 50-60k tokens. Groq's free tier allows 200k
tokens/day per ORGANIZATION (shared with the live site), so run it sparingly —
or point GROQ_API_KEY at a separate Groq account used only for testing.
"""
import re
import sys
import time

import pandas as pd

# Built so each wrong method gives a different wrong answer:
#   most units          -> Power Bank (69)
#   most revenue        -> Smartwatch (8999.55)
#   largest single row  -> Laptop (7500)  <- the trap: one big order is not "top selling"
_orders = []
for product, category, unit_price, quantities in [
    ("Power Bank", "Accessories", 29.99, [10, 12, 15, 14, 18]),
    ("Smartwatch", "Wearables", 199.99, [5, 8, 6, 7, 9, 10]),
    ("Laptop", "Computers", 1500.00, [5]),
    ("Headphones", "Accessories", 59.99, [6, 9, 11, 7]),
    ("Charger", "Accessories", 15.00, [20, 24]),
]:
    for q in quantities:
        _orders.append({"product": product, "category": category, "quantity": q,
                        "unit_price": unit_price, "total_sales": round(q * unit_price, 2)})
SALES = pd.DataFrame(_orders)

PRODUCTS = pd.DataFrame({
    "product": ["Laptop", "Phone", "Tablet", "Monitor", "Mouse", "Keyboard", "Laptop", "Phone"],
    "category": ["Computers", "Mobile", "Mobile", "Computers", "Accessories", "Accessories", "Computers", "Mobile"],
    "region": ["North", "South", "North", "East", "West", "East", "South", "North"],
    "price": [1200, 800, 450, 300, 25, 60, 1150, 780],
    "units": [5, 12, 7, 9, 40, 25, 3, 10],
})

_CURRENCY = re.compile(r"[$₹€£]|\b(USD|INR|EUR|GBP|Rs\.?)\b")


def _norm(text: str) -> str:
    return text.lower().replace(",", "")


def has(*needles):
    """All needles must appear (case-insensitive, thousands separators ignored)."""
    return lambda a: all(_norm(n) in _norm(a) for n in needles)


def any_of(*checks):
    return lambda a: any(c(a) for c in checks)


def no_currency(check):
    """The datasets have no currency column, so a symbol in the answer is invented."""
    return lambda a: check(a) and not _CURRENCY.search(a)


CASES = [
    # Live bug: answered "Smartwatch ... 19,995.0", which was one order row, not a total.
    (SALES, "What is the maximum selling product",
     "Power Bank, 69 units (or Smartwatch, 8999.55 revenue) — never Laptop/7500",
     no_currency(lambda a: any_of(has("power bank", "69"), has("smartwatch", "8999.55"))(a)
                 and "laptop" not in a.lower() and "7500" not in _norm(a))),
    (SALES, "Which product has the highest total sales?", "Smartwatch, 8999.55",
     no_currency(has("smartwatch", "8999.55"))),
    (SALES, "Which product sold the most units?", "Power Bank, 69",
     no_currency(has("power bank", "69"))),
    (SALES, "What is the best selling category?",
     "Accessories, 146 units (or Wearables, 8999.55 revenue)",
     no_currency(any_of(has("accessories", "146"), has("wearables", "8999.55")))),
    # One row: must not be described as summed across orders.
    (SALES, "What is the largest single order by total sales?", "Laptop, 7500 (one row)",
     no_currency(lambda a: has("laptop", "7500")(a) and "across all" not in a.lower())),
    (SALES, "Which product has the lowest unit price?", "Charger, 15",
     no_currency(has("charger", "15"))),
    (PRODUCTS, "Which product has the lowest price?", "Mouse, 25", has("mouse", "25")),
    # Price is a per-item attribute: summing Laptop's two rows (2350) is wrong.
    (PRODUCTS, "Which product has the highest price?", "Laptop, 1200 (not 2350)",
     lambda a: has("laptop", "1200")(a) and "2350" not in _norm(a)),
    (PRODUCTS, "Which region has the highest average price?", "South, 975", has("south", "975")),
    (PRODUCTS, "Which category has the most units?", "Accessories, 65", has("accessories", "65")),
    (PRODUCTS, "Which product sold the most units in total?", "Mouse, 40", has("mouse", "40")),
    (PRODUCTS, "What is the average price in the Mobile category?", "676.67", has("676.67")),
    (PRODUCTS, "What is the total number of units?", "111", has("111")),
]


def main():
    from agent.core import create_agent
    from config import GROQ_MODEL

    print(f"Model: {GROQ_MODEL}\n")
    agents = {}
    failures = 0
    for df, question, expected, check in CASES:
        agent = agents.setdefault(id(df), create_agent(df, "eval"))
        start = time.time()
        answer = agent.invoke({"input": question})["output"]
        ok = check(answer)
        failures += not ok
        print(f"{'PASS' if ok else 'FAIL'}  {time.time() - start:4.1f}s  {question}")
        print(f"      expected: {expected}")
        print(f"      got:      {answer[:160]}")
    print(f"\n{len(CASES) - failures}/{len(CASES)} passed")
    sys.exit(1 if failures else 0)


if __name__ == "__main__":  # guard required: generated code runs in a spawned child on Windows
    main()
