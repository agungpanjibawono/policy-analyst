from fastapi import APIRouter, HTTPException, Depends
from typing import List
import time
from models.schemas import PolicyQuery, PolicyAnswer
from services.vector_store_factory import VectorStoreFactory
from services.llm_service import LLMService
from services.pipeline_service import OptimizedPipelineService
from services.optimized_llm_service import TaskType
from utils.logger import setup_logger
from utils.stats_tracker import stats_tracker

router = APIRouter()
logger = setup_logger(__name__)

# Initialize pipeline service
pipeline_service = OptimizedPipelineService()

# Dependency
def get_vector_store():
    return VectorStoreFactory.create_vector_store()

def get_llm_service():
    return LLMService()

def get_pipeline_service():
    return OptimizedPipelineService()

@router.post("/ask", response_model=PolicyAnswer)
async def ask_policy_question(query: PolicyQuery):
    """
    Ask a question about policies with optimized pipeline
    """
    start_time = time.time()
    
    try:
        logger.info(f"Processing query: {query.query}")
        
        # Track query count
        stats_tracker.increment_query_count()
        
        # Determine task type based on query
        task_type = _determine_task_type(query.query)
        
        # Process using optimized pipeline
        result = await pipeline_service.process_query_pipeline(
            query=query.query,
            language=query.language,
            category=query.category,
            limit=query.limit,
            task_type=task_type
        )
        
        # Check for low confidence scores and provide better messaging
        if result.confidence_score < 0.2:  # Very low confidence threshold
            query_lower = query.query.lower()
            
            if any(term in query_lower for term in ["layanan konsultasi digital", "konsultasi digital", "digital consultation"]):
                result.answer = "Maaf, informasi mengenai Layanan Konsultasi Digital tidak tersedia dalam knowledge base kami saat ini. Silakan hubungi pihak terkait untuk informasi lebih lanjut."
            elif result.confidence_score < 0.01:  # Nearly zero confidence
                result.answer = "Maaf, tidak ditemukan dokumen yang relevan untuk pertanyaan Anda dalam knowledge base kami."
            else:
                # Add disclaimer for low confidence
                result.answer = f"⚠️ Informasi yang ditemukan mungkin kurang relevan (confidence: {result.confidence_score:.1%}).\n\n{result.answer}\n\nSilakan verifikasi informasi ini dengan sumber resmi."
        
        # Calculate processing time
        processing_time = time.time() - start_time
        logger.info(f"Query processed in {processing_time:.2f}s with confidence {result.confidence_score:.2f}")
        
        return PolicyAnswer(
            answer=result.answer,
            sources=result.sources,
            confidence_score=result.confidence_score,
            related_policies=[]  # Could be populated with similar policies
        )
        
    except Exception as e:
        logger.error(f"Error processing policy question: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask-advanced", response_model=PolicyAnswer)
async def ask_policy_question_advanced(
    query: PolicyQuery,
    task_type: str = "qa",
    pipeline_service: OptimizedPipelineService = Depends(get_pipeline_service)
):
    """Ask a question with explicit task type specification"""
    try:
        logger.info(f"Processing advanced query: {query.query} (task: {task_type})")
        
        # Track query count
        stats_tracker.increment_query_count()
        
        # Process using optimized pipeline with explicit task type
        result = await pipeline_service.process_query_pipeline(
            query=query.query,
            language=query.language,
            category=query.category,
            limit=query.limit,
            task_type=TaskType(task_type)
        )
        
        return PolicyAnswer(
            answer=result.answer,
            sources=result.sources,
            confidence_score=result.confidence_score,
            related_policies=[]
        )
        
    except Exception as e:
        logger.error(f"Error processing advanced policy question: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ask-legacy", response_model=PolicyAnswer)
async def ask_policy_question_legacy(
    query: PolicyQuery,
    vector_store = Depends(get_vector_store),
    llm_service: LLMService = Depends(get_llm_service)
):
    """Ask a question about policies - legacy endpoint"""
    try:
        logger.info(f"Processing legacy query: {query.query}")
        
        # Track query count
        stats_tracker.increment_query_count()
        
        # Search for relevant documents
        search_results = await vector_store.search_documents(
            query=query.query,
            limit=query.limit,
            category=query.category
        )
        
        if not search_results:
            raise HTTPException(status_code=404, detail="No relevant policies found")
        
        # Generate answer using LLM
        llm_response = llm_service.generate_answer(
            query=query.query,
            context=search_results,
            language=query.language
        )
        
        # Format sources
        sources = [
            {
                "title": result["metadata"].get("title", "Unknown"),
                "content_preview": result["content"][:200] + "...",
                "category": result["metadata"].get("category", "Unknown"),
                "relevance_score": 1 - result["distance"]
            }
            for result in search_results
        ]
        
        return PolicyAnswer(
            answer=llm_response["answer"],
            sources=sources,
            confidence_score=0.85,  # This could be calculated based on various factors
            related_policies=[]  # Could be populated with similar policies
        )
        
    except Exception as e:
        logger.error(f"Error processing legacy policy question: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def _determine_task_type(query: str) -> TaskType:
    """Determine task type from query content"""
    query_lower = query.lower()
    
    if any(word in query_lower for word in ["ringkas", "ringkasan", "summarize", "summary", "ikhtisar"]):
        return TaskType.SUMMARIZATION
    elif any(word in query_lower for word in ["draft", "rancang", "buat", "tulis", "susun"]):
        return TaskType.POLICY_DRAFTING
    elif any(word in query_lower for word in ["klasifikasi", "kategori", "jenis", "type", "classify"]):
        return TaskType.CLASSIFICATION
    else:
        return TaskType.QA

@router.get("/search")
async def search_policies(
    q: str,
    category: str = None,
    limit: int = 10,
    vector_store = Depends(get_vector_store)
):
    """Search policies by keyword"""
    try:
        results = await vector_store.search_documents(
            query=q,
            limit=limit,
            category=category
        )
        
        return {
            "query": q,
            "results": results,
            "total": len(results)
        }
        
    except Exception as e:
        logger.error(f"Error searching policies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-ask")
async def batch_ask_questions(
    queries: List[dict],
    pipeline_service: OptimizedPipelineService = Depends(get_pipeline_service)
):
    """Process multiple questions in batch with optimization"""
    try:
        logger.info(f"Processing batch queries: {len(queries)} questions")
        
        # Process batch using optimized pipeline
        results = await pipeline_service.batch_process_pipeline(queries)
        
        # Format results
        formatted_results = []
        for result in results:
            formatted_result = {
                "answer": result.answer,
                "confidence_score": result.confidence_score,
                "sources": result.sources,
                "processing_stats": result.processing_stats,
                "metadata": result.metadata
            }
            formatted_results.append(formatted_result)
        
        return {
            "results": formatted_results,
            "total_processed": len(formatted_results),
            "batch_size": len(queries)
        }
        
    except Exception as e:
        logger.error(f"Error processing batch questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/optimization-status")
async def get_optimization_status():
    """Get optimization features status"""
    return {
        "optimization_enabled": True,
        "features": {
            "model_quantization": True,
            "task_specific_models": True,
            "async_processing": True,
            "batch_processing": True,
            "memory_optimization": True,
            "structured_parsing": True,
            "pipeline_optimization": True
        },
        "task_types": ["qa", "summarization", "policy_drafting", "classification"],
        "quantization_options": ["fp16", "q4_0", "q8_0"],
        "version": "1.0.0"
    }
