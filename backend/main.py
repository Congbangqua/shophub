from fastapi import FastAPI
from data.routers import products  #, users
from fastapi.middleware.cors import CORSMiddleware
from routers import auth
from database import engine
from models.product import Base as ProductBase
from models.user import Base as UserBase
from data.routers import products, orders
from models.order import Base as OrderBase
from data.routers import products, orders, payments
from data.routers import products, orders, payments, admin_stats

app = FastAPI(title="ShopHub Product API", version="1.1.0")

ProductBase.metadata.create_all(bind=engine)
UserBase.metadata.create_all(bind=engine)
OrderBase.metadata.create_all(bind=engine)

origins = [
    "http://localhost:5173",  # Vite React dev
    # add more allowed origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(auth.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(admin_stats.router)