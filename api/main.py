from typing import Any, Dict, List
from fastapi import FastAPI
from starlette.responses import JSONResponse
from pydantic import BaseModel
from bobbins import SqliteDatabase


fastapi_app = FastAPI()
db = SqliteDatabase("/data/db.sqlite")


class ProductsResponse(BaseModel):
    products: List[Dict[Any, Any]]


@fastapi_app.exception_handler(AssertionError)
def unicorn_exception_handler(_, e: AssertionError):
    return JSONResponse(
        status_code=400,
        content=dict(message=str(e))
    )


@fastapi_app.exception_handler(NotImplementedError)
def unicorn_exception_handler(*args, **kwargs):
    return JSONResponse(
        status_code=500,
        content=dict(message="Not implemented")
    )


@fastapi_app.get("/products", response_model=ProductsResponse)
def get_products():
    products = db.get_products()
    return dict(products=products)


@fastapi_app.post("/products")
def add_product(payload: Dict[Any, Any]):
    added = db.add_product(payload)
    return dict(product=added)


@fastapi_app.patch("products/{product_id}")
def update_product(product_id: str, payload: Dict[Any, Any]):
    payload.update(dict(id=product_id))
    updated = db.update_product(payload)
    return dict(product=updated)
