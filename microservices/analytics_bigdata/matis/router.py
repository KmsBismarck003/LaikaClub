from fastapi import APIRouter

# Import sub-routers
from matis.executive.router import router as executive_router
from matis.sales.router import router as sales_router
from matis.events.router import router as events_router
from matis.venues.router import router as venues_router
from matis.customers.router import router as customers_router
from matis.products.router import router as products_router
from matis.geography.router import router as geography_router
from matis.operational.router import router as operational_router
from matis.predictive.router import router as predictive_router
from matis.quality.router import router as quality_router

matis_router = APIRouter()

# Include all sub-domain routers
matis_router.include_router(executive_router)
# Note: since the sub-routers already define their prefix like /api/analytics/matis/executive,
# we don't need extra prefixes here.
matis_router.include_router(sales_router)
# If a sub-router doesn't have the full prefix, we can specify it here.
# But since we declared the prefix prefix="/api/analytics/matis/..." in each router.py, they are fully self-contained.
matis_router.include_router(events_router)
matis_router.include_router(venues_router)
# Include the remaining routers
matis_router.include_router(customers_router)
# Product
matis_router.include_router(products_router)
# Geography
# Operational
# Predictive
# Quality
matis_router.include_router(geography_router)
matis_router.include_router(operational_router)
# Predictive
matis_router.include_router(predictive_router)
# Quality
matis_router.include_router(quality_router)
