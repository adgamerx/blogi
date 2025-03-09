from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.routers import auth, posts
from app.database import engine
from app.models import posts as post_models
from app.models import users as user_models

# Create database tables
user_models.Base.metadata.create_all(bind=engine)
post_models.Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
os.makedirs("app/uploads", exist_ok=True)

app = FastAPI(
    title="Blogi API",
    description="Backend API for Blogi blogging platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving uploaded images (if needed for development)
app.mount("/uploads", StaticFiles(directory="app/uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to Blogi API"}

# Include routers
app.include_router(auth.router)
app.include_router(posts.router)