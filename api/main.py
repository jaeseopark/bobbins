from typing import Annotated, Any, Dict, List
from pdf import generate_user_guide
from fastapi import FastAPI, Path
from fastapi.responses import FileResponse
from starlette.responses import JSONResponse
from pydantic import BaseModel

from db import SqliteDatabase


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


@fastapi_app.put("/products/{product_id}")
def update_product(product_id: Annotated[str, Path(title="The ID of the product to update")], payload: Dict[Any, Any] = None):
    payload.update(dict(id=product_id))
    updated = db.update_product(payload)
    return dict(product=updated)


@fastapi_app.get("/products/{product_id}/user_guide", response_class=FileResponse)
def get_user_guide(product_id: str):
    product = db.get_product(product_id)

    if not product_id:
        return JSONResponse(status_code=400)

    pdf_path = generate_user_guide(product)

    return pdf_path
