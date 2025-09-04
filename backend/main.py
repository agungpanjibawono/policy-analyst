from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from typing import List, Optional
import uvicorn

from api.policy_routes import router as policy_router
from api.qa_routes import router as qa_router
from api.drafting_routes import router as drafting_router
from services.vector_store_factory import VectorStoreFactory
from utils.logger import setup_logger
from utils.stats_tracker import stats_tracker

load_dotenv()

app = FastAPI(
    title="Policy Knowledge Management System",
    description="Sistem manajemen pengetahuan kebijakan untuk organisasi",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup logger
logger = setup_logger(__name__)

# Initialize services
vector_store = VectorStoreFactory.create_vector_store()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Policy Management System...")
    await vector_store.initialize()
    logger.info("Vector store initialized successfully")

@app.get("/")
async def root():
    return {
        "message": "Policy Knowledge Management System",
        "version": "1.0.0",
        "status": "running",
        "features": [
            "Policy Q&A Engine",
            "Policy Drafting Assistant", 
            "Policy Analytics",
            "Smart Recommendations"
        ]
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check vector store
        vector_store_status = "connected" if vector_store else "disconnected"
        
        # LLM service is available through API calls
        llm_status = "active"
        
        return {
            "status": "healthy",
            "vector_store": vector_store_status,
            "llm_service": llm_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

@app.get("/api/stats")
async def get_stats():
    """Get real-time system statistics"""
    try:
        # Get total documents in vector store
        vector_stats = await vector_store.get_collection_stats()
        total_policies = vector_stats.get("total_documents", 0)
        
        # Get tracked stats
        tracked_stats = stats_tracker.get_stats()
        
        return {
            "totalPolicies": total_policies,
            "totalQueries": tracked_stats.get("total_queries", 0),
            "activeDrafts": tracked_stats.get("active_drafts", 0),
            "userSessions": 1   # Current session
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")

# Include routers
app.include_router(policy_router, prefix="/api/policies", tags=["policies"])
app.include_router(qa_router, prefix="/api/qa", tags=["qa"])
app.include_router(drafting_router, prefix="/api/drafting", tags=["drafting"])

if __name__ == "__main__":
    uvicorn.run(
        "main:app", 
        host="0.0.0.0", 
        port=8000, 
        reload=True,
        log_level="info"
    )
