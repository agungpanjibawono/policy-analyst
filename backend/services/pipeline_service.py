import asyncio
import json
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import time
from services.optimized_llm_service import OptimizedLLMService, TaskType
from services.vector_store_factory import VectorStoreFactory
from utils.logger import setup_logger

logger = setup_logger(__name__)

@dataclass
class QueryPipeline:
    query: str
    context: List[Dict[str, Any]]
    language: str = "id"
    task_type: TaskType = TaskType.QA
    priority: int = 1

@dataclass
class ProcessedResult:
    answer: str
    confidence_score: float
    sources: List[Dict[str, Any]]
    metadata: Dict[str, Any]
    processing_stats: Dict[str, Any]

class OptimizedPipelineService:
    def __init__(self):
        self.llm_service = OptimizedLLMService()
        self.vector_store = VectorStoreFactory.create_vector_store()
        self.cache = {}  # Simple in-memory cache
        self.processing_queue = []
        
    async def process_query_pipeline(
        self, 
        query: str, 
        language: str = "id",
        category: Optional[str] = None,
        limit: int = 5,
        task_type: TaskType = TaskType.QA
    ) -> ProcessedResult:
        """Optimized end-to-end query processing pipeline"""
        start_time = time.time()
        pipeline_stats = {
            "start_time": datetime.now().isoformat(),
            "steps": {}
        }
        
        try:
            # Step 1: Check cache
            cache_key = f"{query}:{language}:{category}:{task_type.value}"
            if cache_key in self.cache:
                logger.info("Cache hit for query")
                cached_result = self.cache[cache_key]
                cached_result.metadata["from_cache"] = True
                return cached_result
            
            step_start = time.time()
            
            # Step 2: Vector search optimization
            search_results = await self._optimized_vector_search(
                query, category, limit, task_type
            )
            pipeline_stats["steps"]["vector_search"] = time.time() - step_start
            
            # Enhanced filtering: check if we have truly relevant results
            if not search_results:
                return self._empty_result(query, pipeline_stats)
            
            # Additional relevance check: ensure at least one result has good similarity
            best_distance = min(result.get('distance', float('inf')) for result in search_results)
            if best_distance > 8.0:  # Very strict threshold for relevance
                logger.info(f"No sufficiently relevant documents found (best distance: {best_distance:.2f})")
                return self._empty_result(query, pipeline_stats)
            
            # Step 3: Context optimization and ranking
            step_start = time.time()
            optimized_context = self._rank_and_filter_context(search_results, query, task_type)
            pipeline_stats["steps"]["context_optimization"] = time.time() - step_start
            
            # Step 4: LLM processing with task-specific optimization
            step_start = time.time()
            llm_response = await self.llm_service.generate_answer_optimized(
                query=query,
                context=optimized_context,
                language=language,
                task_type=task_type
            )
            pipeline_stats["steps"]["llm_processing"] = time.time() - step_start
            
            # Step 5: Structured output parsing and validation
            step_start = time.time()
            parsed_result = self._parse_and_validate_output(
                llm_response, optimized_context, query
            )
            pipeline_stats["steps"]["output_parsing"] = time.time() - step_start
            
            # Step 6: Create final result with confidence scoring
            final_result = self._create_final_result(
                parsed_result, optimized_context, pipeline_stats, query
            )
            
            # Check if confidence is too low - if so, return empty result
            if final_result.confidence_score < 0.4:  # Raised threshold for better filtering
                logger.info(f"Confidence too low ({final_result.confidence_score:.3f}), returning empty result")
                return self._empty_result(query, pipeline_stats)
            
            # Cache the result
            self.cache[cache_key] = final_result
            
            total_time = time.time() - start_time
            final_result.processing_stats["total_time"] = round(total_time, 2)
            
            logger.info(f"Pipeline completed in {total_time:.2f}s for task {task_type.value}")
            return final_result
            
        except Exception as e:
            logger.error(f"Pipeline error: {e}")
            return self._error_result(str(e), pipeline_stats)

    async def _optimized_vector_search(
        self, 
        query: str, 
        category: Optional[str], 
        limit: int,
        task_type: TaskType
    ) -> List[Dict[str, Any]]:
        """Optimized vector search with task-specific parameters"""
        
        # Adjust search parameters based on task type
        if task_type == TaskType.QA:
            # For Q&A, we want high precision but lower threshold for better recall
            search_limit = min(limit, 5)
            similarity_threshold = 0.2
        elif task_type == TaskType.SUMMARIZATION:
            # For summarization, we want more comprehensive context
            search_limit = min(limit * 2, 10)
            similarity_threshold = 0.1
        elif task_type == TaskType.POLICY_DRAFTING:
            # For drafting, we want diverse reference materials
            search_limit = min(limit * 3, 15)
            similarity_threshold = 0.1
        else:
            search_limit = limit
            similarity_threshold = 0.2
        
        # Ensure vector store is initialized
        await self.vector_store.initialize()
        
        # Perform search
        results = await self.vector_store.search_documents(
            query=query,
            limit=search_limit,
            category=category
        )
        
        # Filter by similarity threshold (for distance-based similarity)
        # Lower distance = higher similarity, so we want results with distance below threshold
        # Use stricter threshold to avoid irrelevant results
        distance_threshold = 10.0 if task_type == TaskType.QA else 15.0
        filtered_results = [
            result for result in results 
            if result.get('distance', float('inf')) <= distance_threshold
        ]
        
        logger.info(f"Vector search: {len(results)} -> {len(filtered_results)} results (threshold: {similarity_threshold})")
        return filtered_results

    def _rank_and_filter_context(
        self, 
        search_results: List[Dict[str, Any]], 
        query: str,
        task_type: TaskType
    ) -> List[Dict[str, Any]]:
        """Advanced context ranking and filtering"""
        
        if not search_results:
            return []
        
        # Calculate relevance scores
        for result in search_results:
            score = self._calculate_relevance_score(result, query, task_type)
            result['relevance_score'] = score
        
        # Sort by relevance score
        ranked_results = sorted(
            search_results, 
            key=lambda x: x['relevance_score'], 
            reverse=True
        )
        
        # Remove duplicates based on content similarity
        unique_results = self._remove_duplicate_content(ranked_results)
        
        # Final filtering based on task type
        final_limit = self._get_context_limit_for_task(task_type)
        
        return unique_results[:final_limit]

    def _calculate_relevance_score(
        self, 
        result: Dict[str, Any], 
        query: str, 
        task_type: TaskType
    ) -> float:
        """Calculate comprehensive relevance score"""
        
        # Base similarity score (from vector search)
        # For distance-based similarity, lower distance = higher similarity
        # Convert distance to similarity score between 0-1
        distance = result.get('distance', 100)
        base_score = max(0, 1 - (distance / 30))  # Normalize distance to 0-1 range with stricter scaling
        
        # Content length factor
        content_length = len(result.get('content', ''))
        length_factor = min(content_length / 1000, 1.0)  # Normalize to 0-1
        
        # Document type relevance
        doc_type = result.get('metadata', {}).get('document_type', '')
        type_factor = self._get_type_relevance(doc_type, task_type)
        
        # Keyword matching in title/content
        keyword_factor = self._calculate_keyword_match(result, query)
        
        # Weighted combination
        final_score = (
            base_score * 0.4 +
            length_factor * 0.2 +
            type_factor * 0.2 +
            keyword_factor * 0.2
        )
        
        return round(final_score, 3)

    def _get_type_relevance(self, doc_type: str, task_type: TaskType) -> float:
        """Get document type relevance for specific task"""
        type_relevance = {
            TaskType.QA: {
                'undang-undang': 1.0,
                'peraturan-pemerintah': 0.9,
                'peraturan-menteri': 0.8,
                'peraturan-lembaga': 0.8,
                'peraturan-daerah': 0.7,
                'policy': 0.6,
                'regulation': 0.7
            },
            TaskType.POLICY_DRAFTING: {
                'undang-undang': 1.0,
                'peraturan-pemerintah': 1.0,
                'peraturan-menteri': 0.9,
                'peraturan-lembaga': 0.9,
                'peraturan-daerah': 0.8,
                'policy': 0.7,
                'regulation': 0.6
            },
            TaskType.SUMMARIZATION: {
                'policy': 1.0,
                'regulation': 0.9,
                'undang-undang': 0.8,
                'peraturan-pemerintah': 0.8,
                'peraturan-menteri': 0.7,
                'peraturan-lembaga': 0.7,
                'peraturan-daerah': 0.6
            }
        }
        
        return type_relevance.get(task_type, {}).get(doc_type, 0.5)

    def _calculate_keyword_match(self, result: Dict[str, Any], query: str) -> float:
        """Calculate keyword matching score"""
        content = result.get('content', '').lower()
        title = result.get('metadata', {}).get('title', '').lower()
        query_lower = query.lower()
        
        # Simple keyword matching
        query_words = query_lower.split()
        content_words = content.split()
        title_words = title.split()
        
        title_matches = sum(1 for word in query_words if word in title_words)
        content_matches = sum(1 for word in query_words if word in content_words)
        
        title_score = title_matches / len(query_words) if query_words else 0
        content_score = content_matches / len(query_words) if query_words else 0
        
        # Weight title matches higher
        return (title_score * 0.7 + content_score * 0.3)

    def _remove_duplicate_content(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Remove results with very similar content"""
        unique_results = []
        seen_content = set()
        
        for result in results:
            content = result.get('content', '')
            # Use first 200 characters as fingerprint
            fingerprint = content[:200].strip()
            
            if fingerprint not in seen_content:
                seen_content.add(fingerprint)
                unique_results.append(result)
        
        return unique_results

    def _get_context_limit_for_task(self, task_type: TaskType) -> int:
        """Get optimal context limit for task type"""
        limits = {
            TaskType.QA: 3,
            TaskType.SUMMARIZATION: 5,
            TaskType.POLICY_DRAFTING: 7,
            TaskType.CLASSIFICATION: 3
        }
        return limits.get(task_type, 3)

    def _parse_and_validate_output(
        self, 
        llm_response: Dict[str, Any], 
        context: List[Dict[str, Any]],
        query: str
    ) -> Dict[str, Any]:
        """Parse and validate LLM output structure"""
        
        answer = llm_response.get('answer', '')
        
        # Structured parsing based on expected format
        parsed_sections = self._parse_structured_answer(answer)
        
        # Validation checks
        validation_score = self._validate_answer_quality(
            answer, context, query
        )
        
        return {
            'raw_answer': answer,
            'parsed_sections': parsed_sections,
            'validation_score': validation_score,
            'model_info': {
                'model_used': llm_response.get('model_used', ''),
                'processing_time': llm_response.get('processing_time', 0),
                'optimization_applied': llm_response.get('optimization_applied', False)
            }
        }

    def _parse_structured_answer(self, answer: str) -> Dict[str, str]:
        """Parse structured answer format"""
        sections = {}
        lines = answer.split('\n')
        current_section = 'main'
        current_content = []
        
        for line in lines:
            line = line.strip()
            if self._is_section_header(line):
                sections = self._save_current_section(sections, current_section, current_content)
                current_section, current_content = self._process_section_header(line)
            else:
                if line:
                    current_content.append(line)
        
        # Save last section
        if current_content:
            sections[current_section] = '\n'.join(current_content)
        
        return sections
    
    def _is_section_header(self, line: str) -> bool:
        """Check if line is a section header"""
        return line.startswith('•') or line.startswith('-')
    
    def _save_current_section(self, sections: Dict[str, str], 
                             current_section: str, 
                             current_content: List[str]) -> Dict[str, str]:
        """Save current section to sections dict"""
        if current_content:
            sections[current_section] = '\n'.join(current_content)
        return sections
    
    def _process_section_header(self, line: str) -> tuple:
        """Process section header and return section name and content"""
        if ':' in line:
            section_name = line.split(':')[0].replace('•', '').replace('-', '').strip()
            section_content = ':'.join(line.split(':')[1:]).strip()
            current_section = section_name.lower()
            current_content = [section_content] if section_content else []
        else:
            current_section = 'main'
            current_content = [line]
        return current_section, current_content

    def _validate_answer_quality(
        self, 
        answer: str, 
        context: List[Dict[str, Any]], 
        query: str
    ) -> float:
        """Validate answer quality and relevance"""
        
        if not answer or len(answer.strip()) < 10:
            return 0.0
        
        # Check if answer references context
        context_references = 0
        for doc in context:
            title = doc.get('metadata', {}).get('title', '')
            if title.lower() in answer.lower():
                context_references += 1
        
        reference_score = min(context_references / len(context), 1.0) if context else 0
        
        # Check answer completeness
        completeness_score = min(len(answer) / 500, 1.0)  # Normalize by expected length
        
        # Check query relevance
        query_words = query.lower().split()
        answer_lower = answer.lower()
        query_coverage = sum(1 for word in query_words if word in answer_lower)
        relevance_score = query_coverage / len(query_words) if query_words else 0
        
        # Combined score
        quality_score = (
            reference_score * 0.4 +
            completeness_score * 0.3 +
            relevance_score * 0.3
        )
        
        return round(quality_score, 3)

    def _create_final_result(
        self, 
        parsed_result: Dict[str, Any], 
        context: List[Dict[str, Any]],
        pipeline_stats: Dict[str, Any],
        query: str
    ) -> ProcessedResult:
        """Create final structured result"""
        
        # Format sources with relevance scores
        sources = []
        for doc in context:
            source = {
                "title": doc['metadata'].get('title', 'Unknown'),
                "content_preview": doc['content'][:200] + "...",
                "category": doc['metadata'].get('category', 'Unknown'),
                "document_type": doc['metadata'].get('document_type', 'Unknown'),
                "relevance_score": doc.get('relevance_score', 0),
                "distance": doc.get('distance', 1)
            }
            sources.append(source)
        
        # Calculate overall confidence score
        confidence = self._calculate_confidence_score(parsed_result, context)
        
        return ProcessedResult(
            answer=parsed_result['raw_answer'],
            confidence_score=confidence,
            sources=sources,
            metadata={
                "query": query,
                "parsed_sections": parsed_result['parsed_sections'],
                "validation_score": parsed_result['validation_score'],
                "model_info": parsed_result['model_info'],
                "optimization_level": "high"
            },
            processing_stats=pipeline_stats
        )

    def _calculate_confidence_score(
        self, 
        parsed_result: Dict[str, Any], 
        context: List[Dict[str, Any]]
    ) -> float:
        """Calculate overall confidence score"""
        
        validation_score = parsed_result.get('validation_score', 0)
        
        # Average relevance score from context
        if context:
            avg_relevance = sum(doc.get('relevance_score', 0) for doc in context) / len(context)
        else:
            avg_relevance = 0
        
        # Model optimization factor
        optimization_bonus = 0.1 if parsed_result['model_info'].get('optimization_applied') else 0
        
        # Combined confidence
        confidence = min(
            (validation_score * 0.6 + avg_relevance * 0.4 + optimization_bonus),
            1.0
        )
        
        return round(confidence, 3)

    def _empty_result(self, query: str, stats: Dict[str, Any]) -> ProcessedResult:
        """Create result for when no documents found"""
        # Check for specific topics not in knowledge base
        query_lower = query.lower()
        
        if any(term in query_lower for term in ["layanan konsultasi digital", "konsultasi digital", "digital consultation"]):
            answer = "Maaf, informasi mengenai Layanan Konsultasi Digital tidak tersedia dalam knowledge base kami saat ini. Silakan hubungi pihak terkait untuk informasi lebih lanjut."
        else:
            answer = "Maaf, informasi yang Anda cari tidak tersedia dalam knowledge base kami saat ini. Silakan coba dengan kata kunci yang berbeda atau hubungi pihak terkait untuk informasi lebih lanjut."
        
        return ProcessedResult(
            answer=answer,
            confidence_score=0.0,
            sources=[],
            metadata={"query": query, "optimization_level": "high", "no_results_reason": "empty_knowledge_base"},
            processing_stats=stats
        )

    def _error_result(self, error: str, stats: Dict[str, Any]) -> ProcessedResult:
        """Create result for errors"""
        return ProcessedResult(
            answer=f"Terjadi kesalahan dalam pemrosesan: {error}",
            confidence_score=0.0,
            sources=[],
            metadata={"error": error, "optimization_level": "high"},
            processing_stats=stats
        )

    async def batch_process_pipeline(
        self, 
        queries: List[Dict[str, Any]]
    ) -> List[ProcessedResult]:
        """Batch processing with pipeline optimization"""
        
        # Create pipelines
        pipelines = []
        for query_data in queries:
            pipeline = QueryPipeline(
                query=query_data["query"],
                context=query_data.get("context", []),
                language=query_data.get("language", "id"),
                task_type=TaskType(query_data.get("task_type", "qa")),
                priority=query_data.get("priority", 1)
            )
            pipelines.append(pipeline)
        
        # Sort by priority
        pipelines.sort(key=lambda x: x.priority)
        
        # Process in batches
        tasks = []
        for pipeline in pipelines:
            task = self.process_query_pipeline(
                query=pipeline.query,
                language=pipeline.language,
                task_type=pipeline.task_type
            )
            tasks.append(task)
        
        # Concurrent execution
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Batch pipeline {i} failed: {result}")
                processed_results.append(self._error_result(str(result), {}))
            else:
                processed_results.append(result)
        
        return processed_results
