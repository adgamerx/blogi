from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc
from ..models.posts import Post
from ..models.users import User
from ..schemas.post import PostCreate, PostOut, PostUpdate
from ..database import get_db
from ..schemas.user import UserOut
from ..routers.auth import get_current_user, get_user_details
from datetime import datetime
from typing import List, Optional
import io
import base64

router = APIRouter(tags=["posts"])

@router.post("/posts", response_model=PostOut)
async def create_post(
    title: str = Form(...),
    content: str = Form(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db), 
    current_username: str = Depends(get_current_user),
):
    current_user = get_user_details(current_username, db)
    if current_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Process the image if provided
    image_data = None
    if image:
        image_data = await image.read()
    
    # Create new post
    new_post = Post(
        title=title,
        content=content,
        image=image_data,
        author_id=current_user.id
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    # Convert image to base64 for output
    image_data_base64 = None
    if new_post.image:
        try:
            image_data_base64 = base64.b64encode(new_post.image).decode("utf-8")
        except Exception as e:
            print(f"Error encoding image: {e}")
    
    # Get the post with author loaded from database
    post_with_author = db.query(Post).filter(Post.id == new_post.id).first()
    
    # Manually set the author attribute for serialization
    post_dict = {
        "id": post_with_author.id,
        "title": post_with_author.title,
        "content": post_with_author.content,
        "image": None,  # Don't include raw image in output
        "image_data": image_data_base64,  # Use base64 encoded image
        "created_at": post_with_author.created_at,
        "updated_at": post_with_author.updated_at,
        "author_id": post_with_author.author_id,
        "author": current_user
    }
    
    return post_dict

@router.get("/posts", response_model=List[PostOut])
async def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    posts = db.query(Post).order_by(desc(Post.created_at)).offset(skip).limit(limit).all()
    
    result = []
    for post in posts:
        # Get author information
        author = db.query(User).filter(User.id == post.author_id).first()
        author_out = UserOut.model_validate(author) if author else None
        
        # Convert image to base64 for output
        image_data_base64 = None
        if post.image:
            try:
                image_data_base64 = base64.b64encode(post.image).decode("utf-8")
            except Exception as e:
                print(f"Error encoding image: {e}")
        
        # Prepare post dict for serialization
        post_dict = {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "image": None,  # Don't include raw image in output
            "image_data": image_data_base64,  # Use base64 encoded image
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "author_id": post.author_id,
            "author": author_out
        }
        result.append(post_dict)
    
    return result

@router.get("/posts/search", response_model=List[PostOut])
async def search_posts(
    query: str = Query(..., min_length=1, description="Search term for post title or content"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search for posts by title or content.
    Returns posts where the title or content contains the search query.
    Results are sorted by creation date (newest first).
    """
    # Use ILIKE for case-insensitive search in PostgreSQL
    search_term = f"%{query}%"
    
    # Query posts where title or content contains the search term
    posts = db.query(Post).filter(
        (Post.title.ilike(search_term)) | 
        (Post.content.ilike(search_term))
    ).order_by(desc(Post.created_at)).offset(skip).limit(limit).all()
    
    result = []
    for post in posts:
        # Get author information
        author = db.query(User).filter(User.id == post.author_id).first()
        author_out = UserOut.model_validate(author) if author else None
        
        # Convert image to base64 for output
        image_data_base64 = None
        if post.image:
            try:
                image_data_base64 = base64.b64encode(post.image).decode("utf-8")
            except Exception as e:
                print(f"Error encoding image: {e}")
        
        # Prepare post dict for serialization
        post_dict = {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "image": None,  # Don't include raw image in output
            "image_data": image_data_base64,  # Use base64 encoded image
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "author_id": post.author_id,
            "author": author_out
        }
        result.append(post_dict)
    
    return result

@router.get("/posts/{post_id}", response_model=PostOut)
async def get_post(
    post_id: int = Path(...),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Get author information
    author = db.query(User).filter(User.id == post.author_id).first()
    author_out = UserOut.model_validate(author) if author else None
    
    # Convert image to base64 for output
    image_data_base64 = None
    if post.image:
        try:
            image_data_base64 = base64.b64encode(post.image).decode("utf-8")
        except Exception as e:
            print(f"Error encoding image: {e}")
    
    # Prepare post dict for serialization
    post_dict = {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "image": None,  # Don't include raw image in output
        "image_data": image_data_base64,  # Use base64 encoded image
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "author_id": post.author_id,
        "author": author_out
    }
    
    return post_dict

@router.put("/posts/{post_id}", response_model=PostOut)
async def update_post(
    post_id: int = Path(...),
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_username: str = Depends(get_current_user)
):
    current_user = get_user_details(current_username, db)
    post = db.query(Post).filter(Post.id == post_id).first()
    
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user is the author
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this post")
    
    # Update fields if provided
    if title:
        post.title = title
    if content:
        post.content = content
    if image:
        post.image = await image.read()
    
    db.commit()
    db.refresh(post)
    
    # Convert image to base64 for output
    image_data_base64 = None
    if post.image:
        try:
            image_data_base64 = base64.b64encode(post.image).decode("utf-8")
        except Exception as e:
            print(f"Error encoding image: {e}")
    
    # Prepare post dict for serialization
    post_dict = {
        "id": post.id,
        "title": post.title,
        "content": post.content,
        "image": None,  # Don't include raw image in output
        "image_data": image_data_base64,  # Use base64 encoded image
        "created_at": post.created_at,
        "updated_at": post.updated_at,
        "author_id": post.author_id,
        "author": current_user
    }
    
    return post_dict

@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int = Path(...),
    db: Session = Depends(get_db),
    current_username: str = Depends(get_current_user)
):
    current_user = get_user_details(current_username, db)
    post = db.query(Post).filter(Post.id == post_id).first()
    
    if post is None:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user is the author
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    db.delete(post)
    db.commit()
    return None