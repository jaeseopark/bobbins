from abc import ABC, abstractmethod
import json
import os
from typing import List, Optional
import sqlite3


SQL_INIT_SCRIPT = """
CREATE TABLE products (id TEXT PRIMARY KEY, data TEXT);
"""


def sanitized(func: callable):
    def sanitize(product: dict):
        product["tips"] = product.get("tips", "")
        return product

    def wrapper(*args, **kwargs):
        ret = func(*args, **kwargs)
        if ret is None:
            return None
        if isinstance(ret, dict):
            return sanitize(ret)
        if isinstance(ret, list):
            return [sanitize(a) for a in ret]
        raise NotImplementedError

    return wrapper


class Database(ABC):
    @abstractmethod
    def get_products(self) -> List[dict]:
        pass

    @abstractmethod
    def get_product(self, id: str) -> Optional[dict]:
        pass

    @abstractmethod
    def add_product(self, p: dict) -> dict:
        pass

    @abstractmethod
    def update_product(self, p: dict) -> dict:
        pass

    @abstractmethod
    def delete_product(self, product_id: str):
        pass


def _dict_factory(cursor, row):
    dct = {col[0]: row[idx] for idx, col in enumerate(cursor.description)}
    return json.loads(dct["data"])


class SqliteDatabase(Database):
    def __init__(self, path: str) -> None:
        super().__init__()
        self.path = path
        if not os.path.exists(path):
            with self.conn as conn:
                conn.executescript(SQL_INIT_SCRIPT)

    @property
    def conn(self):
        conn = sqlite3.connect(self.path, check_same_thread=False)
        conn.row_factory = _dict_factory
        return conn

    @sanitized
    def get_products(self) -> List[dict]:
        with self.conn as conn:
            return conn.execute("SELECT data FROM products").fetchall()

    @sanitized
    def get_product(self, id: str) -> Optional[dict]:
        with self.conn as conn:
            stmt = "SELECT data FROM products WHERE id = :id"
            # TODO: null check before returning
            return conn.execute(stmt, dict(id=id)).fetchone()

    def add_product(self, p: dict) -> dict:
        with self.conn as conn:
            args = (p["id"], json.dumps(p))
            conn.execute("INSERT INTO products (id, data) VALUES (?, ?)", args)
        return p

    def update_product(self, p: dict) -> dict:
        with self.conn as conn:
            stmt = "UPDATE products SET data = :data WHERE id = :id"
            params = dict(
                id=p["id"],
                data=json.dumps(p)
            )
            conn.execute(stmt, params)
        return p

    def delete_product(self, product_id: str):
        with self.conn as conn:
            stmt = "DELETE from products WHERE id = :id"
            params = dict(id=product_id)
            conn.execute(stmt, params)
