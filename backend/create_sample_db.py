import sqlite3
import os

# Create sample database
conn = sqlite3.connect("sample_store.db")
cursor = conn.cursor()

# Table 1 — Customers
cursor.execute("""
CREATE TABLE IF NOT EXISTS customers (
    customer_id INTEGER PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT,
    city TEXT,
    country TEXT
)
""")

# Table 2 — Products
cursor.execute("""
CREATE TABLE IF NOT EXISTS products (
    product_id INTEGER PRIMARY KEY,
    product_name TEXT NOT NULL,
    category TEXT,
    price REAL,
    stock INTEGER
)
""")

# Table 3 — Orders
cursor.execute("""
CREATE TABLE IF NOT EXISTS orders (
    order_id INTEGER PRIMARY KEY,
    customer_id INTEGER,
    product_id INTEGER,
    quantity INTEGER,
    order_date TEXT,
    total_amount REAL,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (product_id) REFERENCES products(product_id)
)
""")

# Insert Customers
customers = [
    (1, "Alice Johnson", "alice@email.com", "New York", "USA"),
    (2, "Bob Smith", "bob@email.com", "London", "UK"),
    (3, "Charlie Brown", "charlie@email.com", "Mumbai", "India"),
    (4, "Diana Prince", "diana@email.com", "Toronto", "Canada"),
    (5, "Eva Martinez", "eva@email.com", "Delhi", "India"),
    (6, "Frank Wilson", "frank@email.com", "Sydney", "Australia"),
    (7, "Grace Lee", "grace@email.com", "Singapore", "Singapore"),
    (8, "Henry Davis", "henry@email.com", "Dubai", "UAE"),
]
cursor.executemany(
    "INSERT OR IGNORE INTO customers VALUES (?,?,?,?,?)", customers
)

# Insert Products
products = [
    (1, "Laptop Pro", "Electronics", 75000, 50),
    (2, "Wireless Mouse", "Electronics", 1200, 200),
    (3, "Mechanical Keyboard", "Electronics", 3500, 150),
    (4, "Office Chair", "Furniture", 12000, 30),
    (5, "Standing Desk", "Furniture", 25000, 20),
    (6, "Notebook Pack", "Stationery", 250, 500),
    (7, "Pen Set", "Stationery", 150, 1000),
    (8, "Monitor 27inch", "Electronics", 18000, 75),
    (9, "Webcam HD", "Electronics", 4500, 100),
    (10, "Headphones", "Electronics", 8000, 80),
]
cursor.executemany(
    "INSERT OR IGNORE INTO products VALUES (?,?,?,?,?)", products
)

# Insert Orders
orders = [
    (1,  1, 1, 1, "2025-01-05", 75000),
    (2,  2, 2, 2, "2025-01-08", 2400),
    (3,  3, 3, 1, "2025-01-10", 3500),
    (4,  4, 4, 2, "2025-01-12", 24000),
    (5,  5, 5, 1, "2025-01-15", 25000),
    (6,  6, 6, 5, "2025-01-18", 1250),
    (7,  7, 7, 3, "2025-01-20", 450),
    (8,  8, 8, 1, "2025-01-22", 18000),
    (9,  1, 9, 2, "2025-02-01", 9000),
    (10, 2, 10, 1, "2025-02-05", 8000),
    (11, 3, 1, 1, "2025-02-08", 75000),
    (12, 4, 2, 3, "2025-02-10", 3600),
    (13, 5, 3, 2, "2025-02-12", 7000),
    (14, 6, 4, 1, "2025-02-15", 12000),
    (15, 7, 8, 2, "2025-02-18", 36000),
    (16, 8, 10, 1, "2025-02-20", 8000),
    (17, 1, 5, 1, "2025-03-01", 25000),
    (18, 2, 6, 10, "2025-03-05", 2500),
    (19, 3, 7, 5, "2025-03-08", 750),
    (20, 4, 9, 1, "2025-03-10", 4500),
]
cursor.executemany(
    "INSERT OR IGNORE INTO orders VALUES (?,?,?,?,?,?)", orders
)

conn.commit()
conn.close()
print("✅ Sample database created: sample_store.db")
print("Tables: customers, products, orders")
print("Records: 8 customers, 10 products, 20 orders")