from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from auth.deps import require_admin
from database import get_db
from models.product import ProductDB
from schemas.product import ProductCreate, ProductUpdate, ProductRead

router = APIRouter(prefix="/products", tags=["products"])


def map_product(p: ProductDB) -> ProductRead:
    discount = p.discount_percent or 0
    discounted_price = round(p.price * (1 - discount / 100), 2)
    return ProductRead(
        id=int(p.id),
        name=str(p.name),
        price=float(p.price),
        category=str(p.category),
        description=str(p.description),
        imageUrl=str(p.image_path) if p.image_path else None,
        stock=int(p.stock),
        discount_percent=discount,
        discounted_price=discounted_price,
    )


@router.get("", response_model=List[ProductRead])
def list_products(db: Session = Depends(get_db)):
    products = db.query(ProductDB).all()
    return [map_product(p) for p in products]


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return map_product(product)


@router.post(
    "",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    new_product = ProductDB(
        name=payload.name,
        price=payload.price,
        category=payload.category,
        description=payload.description,
        image_path=payload.imageUrl,
        stock=payload.stock,
        discount_percent=payload.discount_percent,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return map_product(new_product)


@router.put("/{product_id}", response_model=ProductRead, dependencies=[Depends(require_admin)])
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if payload.name is not None:
        product.name = payload.name
    if payload.price is not None:
        product.price = payload.price
    if payload.category is not None:
        product.category = payload.category
    if payload.description is not None:
        product.description = payload.description
    if payload.imageUrl is not None:
        product.image_path = payload.imageUrl
    if payload.stock is not None:
        product.stock = payload.stock
    if payload.discount_percent is not None:
        product.discount_percent = payload.discount_percent

    db.commit()
    db.refresh(product)
    return map_product(product)


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    try:
        db.delete(product)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete this product because it already has orders associated with it.",
        )
