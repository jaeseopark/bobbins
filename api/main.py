import asyncio
import json
import logging
from typing import Annotated, Any, Callable, Dict, List

from fastapi import FastAPI, Path, UploadFile, WebSocket
from fastapi.responses import FileResponse
from starlette.responses import JSONResponse
from starlette.websockets import WebSocketDisconnect
from pydantic import BaseModel

from vids import generate_transcript_pdf, get_stats
from pdf import generate_user_guide


from db import SqliteDatabase
from ai import askgpt

logger = logging.getLogger("bobbins")
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())

fastapi_app = FastAPI()
fastapi_app.should_accept_ws_clients = True
sockets: List[WebSocket] = []
db = SqliteDatabase("/data/db.sqlite")


class ProductsResponse(BaseModel):
    products: List[Dict[Any, Any]]


# @fastapi_app.on_event("startup")
# async def startup():
#     fastapi_app.should_accept_ws_clients = True

# @fastapi_app.on_event("shutdown")
# async def shutdown():
#     logger.info("shutdown event")
#     fastapi_app.should_accept_ws_clients = False
#     for websocket in sockets:
#         logger.info("closing socket")
#         await websocket.close(code=1001)


@fastapi_app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("Socket open")
    sockets.append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        sockets.remove(websocket)
        logger.info("Socket closed")


def get_broadcast_function(topic: str) -> Callable[[dict], None]:
    def broadcast(payload: dict) -> None:
        async def broadcast_async():
            for socket in sockets:
                await socket.send_text(json.dumps(dict(
                    topic=topic,
                    payload=payload
                )))
        asyncio.run(broadcast_async())
    return broadcast


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


@fastapi_app.delete("/products/{product_id}")
def update_product(product_id: Annotated[str, Path(title="The ID of the product to update")]):
    db.delete_product(product_id)
    return JSONResponse(
        status_code=200,
        content=dict(message="Success")
    )


@fastapi_app.get("/products/{product_id}/user_guide", response_class=FileResponse)
def get_user_guide(product_id: str):
    product = db.get_product(product_id or "")

    if not product:
        return JSONResponse(status_code=404)

    pdf_path = generate_user_guide(product)
    return pdf_path


@fastapi_app.get("/products/{product_id}/stats")
def get_local_stats(product_id: str):
    product = db.get_product(product_id or "")

    if not product:
        return JSONResponse(status_code=404)

    stats = get_stats(product)
    return dict(stats=stats)


@fastapi_app.post("/products/{product_id}/thumbnail")
def upload_thumbnail(product_id: str, file: UploadFile):
    product = db.get_product(product_id or "")

    if not product:
        return JSONResponse(status_code=404)

    # TODO: only support jpg???
    local_path = f"/data/products/{product_id}-thumbnail.jpg"
    return_path = f"/product-assets/{product_id}-thumbnail.jpg"

    try:
        contents = file.file.read()
        with open(local_path, 'wb+') as f:
            f.write(contents)
    except Exception as e:
        print(e)
    finally:
        file.file.close()

    return dict(path=return_path)


@fastapi_app.post("/ask")
def ask(payload: Dict[Any, Any]):
    answer, log = askgpt(payload.get("question"), payload.get("log"))
    return dict(answer=answer, log=log)


@fastapi_app.post("/products/{product_id}/transcribe")
def transcribe(product_id: str):
    product = db.get_product(product_id or "")
    if not product:
        return JSONResponse(
            status_code=404,
            content=dict(message=f"Not found")
        )

    try:
        callback = get_broadcast_function("transcript")
        generate_transcript_pdf(product, callback=callback)
        return dict(message="Request submitted")
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content=dict(message=str(e))
        )
