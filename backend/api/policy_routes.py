from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from models.schemas import PolicyDocument, UploadResponse
from services.vector_store_factory import VectorStoreFactory
from services.document_processor import DocumentProcessor
from utils.logger import setup_logger
import os
from datetime import datetime

router = APIRouter()
logger = setup_logger(__name__)

@router.post("/upload", response_model=UploadResponse)
async def upload_policy_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    category: str = Form("general"),
    policy_type: str = Form("regulation"),
    instansi_penerbit: str = Form(None),
    tahun_terbit: int = Form(None),
    status: str = Form("aktif")
):
    """Upload and process a policy document"""
    try:
        # Validate file type
        if not file.filename.endswith(('.pdf', '.docx', '.txt')):
            raise HTTPException(
                status_code=400, 
                detail="Only PDF, DOCX, and TXT files are supported"
            )
        
        # Validate status
        if status not in ["aktif", "tidak_aktif"]:
            raise HTTPException(
                status_code=400,
                detail="Status must be either 'aktif' or 'tidak_aktif'"
            )
        
        # Read file content
        content = await file.read()
        
        # Process document
        processor = DocumentProcessor()
        extracted_text = processor.extract_text(content, file.filename)
        
        # Use filename as title if not provided
        if not title:
            title = os.path.splitext(file.filename)[0]
        
        # Create metadata
        metadata = {
            "category": category,
            "document_type": policy_type,
            "source": file.filename,
            "date_created": datetime.now().isoformat(),
            "language": "id",  # Could be detected automatically
            "file_size": len(content),
            "instansi_penerbit": instansi_penerbit,
            "tahun_terbit": tahun_terbit,
            "status": status
        }
        
        # Add to vector store
        vector_store = VectorStoreFactory.create_vector_store()
        await vector_store.initialize()
        document_id = await vector_store.add_document(title, extracted_text, metadata)
        
        return UploadResponse(
            success=True,
            message=f"Document '{title}' uploaded and processed successfully",
            document_id=document_id,
            processed_chunks=len(extracted_text) // 1000 + 1  # Rough estimate
        )
        
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def list_policies():
    """List all policies in the system"""
    try:
        vector_store = VectorStoreFactory.create_vector_store()
        await vector_store.initialize()
        stats = await vector_store.get_collection_stats()
        
        return {
            "message": "Policy collection stats",
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"Error listing policies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def get_all_policy_documents():
    """Get list of all uploaded policy documents"""
    try:
        vector_store = VectorStoreFactory.create_vector_store()
        await vector_store.initialize()
        documents = await vector_store.get_all_documents()
        
        return {
            "documents": documents,
            "total": len(documents)
        }
        
    except Exception as e:
        logger.error(f"Error getting policy documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}")
async def delete_policy(document_id: str):
    """Delete a policy document"""
    try:
        vector_store = VectorStoreFactory.create_vector_store()
        await vector_store.initialize()
        
        # Use document_id as title (since we're using title as identifier)
        result = vector_store.delete_document_by_title(document_id)
        
        if result["success"]:
            return {
                "success": True,
                "message": result["message"],
                "deleted_chunks": result["deleted_chunks"]
            }
        else:
            raise HTTPException(status_code=404, detail=result["message"])
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
