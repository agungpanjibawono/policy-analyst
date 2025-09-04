import os
import asyncio
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import json
from openai import AsyncOpenAI
from utils.logger import setup_logger
import time

logger = setup_logger(__name__)

class TaskType(Enum):
    QA = "qa"
    SUMMARIZATION = "summarization"
    POLICY_DRAFTING = "drafting"
    CLASSIFICATION = "classification"

@dataclass
class ModelConfig:
    name: str
    context_length: int
    quantization: str
    best_for: List[TaskType]
    temperature: float
    max_tokens: int

class OptimizedLLMService:
    def __init__(self):
        self.base_url = os.getenv("LLAMA_BASE_URL", "http://localhost:11434/v1/")
        self.api_key = os.getenv("LLAMA_API_KEY", "dummy-key-for-localhost")
        self.is_localhost = "localhost" in self.base_url or "127.0.0.1" in self.base_url
        
        # Initialize async client
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )
        
        # Available model name
        available_model = "llama3:latest"
        
        # Model configurations with quantization options
        self.model_configs = {
            "llama3-fp8": ModelConfig(
                name=available_model,  # Use available model
                context_length=8192,
                quantization="default",
                best_for=[TaskType.QA, TaskType.CLASSIFICATION],
                temperature=0.3,
                max_tokens=1000
            ),
            "llama3-q4": ModelConfig(
                name=available_model,  # Use available model
                context_length=8192,
                quantization="default",
                best_for=[TaskType.SUMMARIZATION],
                temperature=0.4,
                max_tokens=1500
            ),
            "llama3-q8": ModelConfig(
                name=available_model,  # Use available model
                context_length=8192,
                quantization="default",
                best_for=[TaskType.POLICY_DRAFTING],
                temperature=0.5,
                max_tokens=2000
            )
        }
        
        # Default fallback
        self.default_model = available_model
        
    def select_optimal_model(self, task_type: TaskType) -> ModelConfig:
        """Select the best model for specific task"""
        for config in self.model_configs.values():
            if task_type in config.best_for:
                logger.info(f"Selected {config.name} ({config.quantization}) for {task_type.value}")
                return config
        
        # Fallback to default
        return ModelConfig(
            name=self.default_model,
            context_length=4096,
            quantization="default",
            best_for=[task_type],
            temperature=0.3,
            max_tokens=1000
        )

    async def generate_answer_optimized(
        self, 
        query: str, 
        context: List[Dict[str, Any]], 
        language: str = "id",
        task_type: TaskType = TaskType.QA
    ) -> Dict[str, Any]:
        """Optimized answer generation with model selection and async processing"""
        start_time = time.time()
        
        try:
            # Select optimal model for task
            model_config = self.select_optimal_model(task_type)
            
            # Check if using localhost and no proper API key, show fallback
            if not self.is_localhost and (not self.api_key or self.api_key == "your_llama_api_key_here"):
                return self._fallback_response(query, context, task_type)
            
            # Prepare optimized context (memory-efficient)
            optimized_context = self._optimize_context(context, model_config.context_length)
            
            # Create structured prompt based on task type
            system_prompt, user_prompt = self._create_structured_prompts(
                query, optimized_context, language, task_type
            )
            
            # Async generation with optimal settings
            response = await self.client.chat.completions.create(
                model=model_config.name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=model_config.temperature,
                max_tokens=model_config.max_tokens,
                stream=False  # Set to True for streaming responses
            )
            
            processing_time = time.time() - start_time
            
            return {
                "answer": response.choices[0].message.content,
                "model_used": f"{model_config.name} ({model_config.quantization})",
                "task_type": task_type.value,
                "processing_time": round(processing_time, 2),
                "context_chunks": len(optimized_context),
                "optimization_applied": True
            }
            
        except Exception as e:
            logger.error(f"Failed to generate optimized answer: {e}")
            if self.is_localhost:
                return self._error_response_localhost(str(e), task_type)
            raise

    def _optimize_context(self, context: List[Dict[str, Any]], max_length: int) -> List[Dict[str, Any]]:
        """Memory-efficient context optimization"""
        if not context:
            return []
        
        # Sort by relevance score (assuming higher score = more relevant)
        sorted_context = sorted(
            context, 
            key=lambda x: 1 - x.get('distance', 0),  # Convert distance to relevance
            reverse=True
        )
        
        # Truncate context to fit model's context window
        optimized = []
        total_length = 0
        
        for doc in sorted_context:
            doc_length = len(doc.get('content', ''))
            if total_length + doc_length < max_length * 0.7:  # Leave 30% for prompt
                optimized.append(doc)
                total_length += doc_length
            else:
                # Truncate the document to fit
                remaining_space = int((max_length * 0.7) - total_length)
                if remaining_space > 200:  # Only add if meaningful content fits
                    truncated_doc = doc.copy()
                    truncated_doc['content'] = doc['content'][:remaining_space] + "..."
                    optimized.append(truncated_doc)
                break
        
        logger.info(f"Context optimized: {len(context)} -> {len(optimized)} chunks, {total_length} chars")
        return optimized

    def _create_structured_prompts(
        self, 
        query: str, 
        context: List[Dict[str, Any]], 
        language: str, 
        task_type: TaskType
    ) -> tuple[str, str]:
        """Create task-specific structured prompts"""
        
        # Prepare context text
        context_text = "\n".join([
            f"Dokumen: {doc['metadata'].get('title', 'Unknown')}\n{doc['content']}"
            for doc in context
        ])
        
        if task_type == TaskType.QA:
            if language == "id":
                system_prompt = """Anda adalah AI ahli kebijakan Indonesia yang memberikan jawaban akurat berdasarkan dokumen resmi.
                
INSTRUKSI:
- Berikan jawaban langsung dan tepat
- Kutip bagian spesifik dari dokumen
- Sertakan referensi yang jelas
- Gunakan format terstruktur"""
                
                user_prompt = f"""KONTEKS DOKUMEN:
{context_text}

PERTANYAAN: {query}

JAWABAN (gunakan format):
• Jawaban Langsung: [jawaban singkat]
• Penjelasan: [penjelasan detail dengan kutipan]
• Referensi: [dokumen dan pasal spesifik]"""
            else:
                system_prompt = """You are an expert AI assistant for Indonesian policy analysis.
                
INSTRUCTIONS:
- Provide direct and accurate answers
- Quote specific document sections  
- Include clear references
- Use structured format"""
                
                user_prompt = f"""DOCUMENT CONTEXT:
{context_text}

QUESTION: {query}

ANSWER (use format):
• Direct Answer: [brief answer]
• Explanation: [detailed explanation with quotes]
• References: [specific documents and articles]"""
        
        elif task_type == TaskType.SUMMARIZATION:
            system_prompt = """Anda adalah AI yang ahli merangkum dokumen kebijakan dengan fokus pada poin-poin kunci."""
            user_prompt = f"""Rangkum dokumen berikut dalam format terstruktur:

{context_text}

Pertanyaan fokus: {query}

Format ringkasan:
• Poin Utama: [3-5 poin kunci]
• Detail Penting: [informasi spesifik]
• Implikasi: [dampak atau konsekuensi]"""
            
        elif task_type == TaskType.POLICY_DRAFTING:
            system_prompt = """Anda adalah ahli penyusunan kebijakan yang dapat membuat draft berdasarkan referensi yang ada."""
            user_prompt = f"""Berdasarkan dokumen referensi berikut:

{context_text}

Buatlah draft kebijakan untuk: {query}

Format draft:
• Judul
• Konsiderans
• Dasar Hukum  
• Batang Tubuh (pasal-pasal)
• Ketentuan Penutup"""
            
        else:  # CLASSIFICATION
            system_prompt = """Anda adalah AI yang ahli mengklasifikasi dan menganalisis dokumen kebijakan."""
            user_prompt = f"""Analisis dan klasifikasi dokumen berikut:

{context_text}

Fokus analisis: {query}

Format analisis:
• Klasifikasi: [jenis/kategori]
• Karakteristik: [ciri-ciri utama]
• Relevansi: [tingkat kesesuaian]"""
        
        return system_prompt, user_prompt

    def _fallback_response(self, query: str, context: List[Dict[str, Any]], task_type: TaskType) -> Dict[str, Any]:
        """Fallback response when API key is not configured"""
        context_text = "\n".join([
            f"Dokumen: {doc['metadata'].get('title', 'Unknown')}\n{doc['content'][:300]}..."
            for doc in context
        ])
        
        fallback_answer = f"""
        Berdasarkan dokumen yang ditemukan untuk "{query}":

        {context_text}

        **Catatan**: Untuk mendapatkan jawaban AI yang optimal dengan {task_type.value}, 
        silakan konfigurasi LLAMA_BASE_URL ke localhost Llama3 di file .env.
        
        Saat ini sistem menampilkan konten relevan dari database.
        """
        
        return {
            "answer": fallback_answer,
            "model_used": f"Fallback (optimized for {task_type.value})",
            "task_type": task_type.value,
            "processing_time": 0.1,
            "optimization_applied": False
        }

    def _error_response_localhost(self, error: str, task_type: TaskType) -> Dict[str, Any]:
        """Error response for localhost debugging"""
        error_message = f"""
        Gagal terhubung ke Llama3 localhost untuk task {task_type.value}.
        
        Error: {error}
        
        Rekomendasi optimasi:
        1. Pastikan model quantized tersedia: llama3:8b-instruct-q4_0
        2. Cek memory usage: ollama ps
        3. Restart Ollama jika perlu: ollama serve
        
        Model yang direkomendasikan untuk {task_type.value}:
        - QA: llama3:8b-instruct-fp16 (akurasi tinggi)
        - Summarization: llama3:8b-instruct-q4_0 (efisien)
        - Drafting: llama3:8b-instruct-q8_0 (kualitas tinggi)
        """
        
        return {
            "answer": error_message,
            "model_used": f"Error (optimized for {task_type.value})",
            "task_type": task_type.value,
            "optimization_applied": False
        }

    async def batch_process_queries(
        self, 
        queries: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Batch processing for multiple queries"""
        tasks = []
        
        for query_data in queries:
            task = self.generate_answer_optimized(
                query=query_data["query"],
                context=query_data["context"],
                language=query_data.get("language", "id"),
                task_type=TaskType(query_data.get("task_type", "qa"))
            )
            tasks.append(task)
        
        # Concurrent execution
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Batch query {i} failed: {result}")
                processed_results.append({
                    "error": str(result),
                    "query_index": i
                })
            else:
                processed_results.append(result)
        
        return processed_results
