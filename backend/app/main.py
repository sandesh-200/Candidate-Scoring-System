from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine

from . import models

from .routers import auth, candidates


Base.metadata.create_all(bind=engine)

app = FastAPI()



origins = [
    "http://localhost:5173",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




app.include_router(auth.router)

app.include_router(candidates.router)


@app.get("/")
def root():

    return {
        "message": "TechKraft API Running"
    }