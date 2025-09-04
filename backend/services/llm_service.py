import os
from openai import OpenAI
from typing import List, Dict, Any
from utils.logger import setup_logger

logger = setup_logger(__name__)

class LLMService:
    def __init__(self):
        # Check if using localhost service
        service_base_url = os.getenv("SERVICE_BASE_URL", "https://api.service.com/compat/v1/")
        service_api_key = os.getenv("SERVICE_API_KEY", "dummy-key-for-localhost")
        
        # For localhost, we don't need a real API key
        if "localhost" in service_base_url or "127.0.0.1" in service_base_url:
            service_api_key = "dummy-key-for-localhost"
        
        self.client = OpenAI(
            api_key=service_api_key,
            base_url=service_base_url
        )
        self.is_localhost = "localhost" in service_base_url or "127.0.0.1" in service_base_url
    
    def generate_answer(self, query: str, context: List[Dict[str, Any]], language: str = "id") -> Dict[str, Any]:
        """Generate answer based on query and context"""
        try:
            # Check if API key is properly configured or if using localhost
            api_key = os.getenv("SERVICE_API_KEY")
            base_url = os.getenv("SERVICE_BASE_URL", "https://api.service.com/compat/v1/")
            
            # If not using localhost and no proper API key, show fallback
            if not self.is_localhost and (not api_key or api_key == "your_llama_api_key_here"):
                # Fallback response when API key is not configured
                context_text = "\n".join([
                    f"Document: {doc['metadata'].get('title', 'Unknown')}\n{doc['content'][:300]}..."
                    for doc in context
                ])
                
                fallback_answer = f"""
                Berdasarkan dokumen yang ditemukan untuk pertanyaan "{query}":

                {context_text}

                **Catatan**: Untuk mendapatkan jawaban yang lebih komprehensif, 
                silakan konfigurasi SERVICE_BASE_URL ke localhost service Anda di file .env.
                Contoh: LLAMA_BASE_URL=http://localhost:11434/v1/
                
                Saat ini sistem menampilkan konten relevan dari database untuk membantu Anda.
                """
                
                return {
                    "answer": fallback_answer,
                    "model_used": "Fallback (localhost Llama3 not configured)"
                }
            
            # Prepare context text
            context_text = "\n".join([
                f"Document: {doc['metadata'].get('title', 'Unknown')}\n{doc['content']}"
                for doc in context
            ])
            
            # System prompt based on language
            if language == "id":
                system_prompt = """Anda adalah asisten AI yang ahli dalam kebijakan dan peraturan Indonesia. 
                Berikan jawaban yang akurat dan komprehensif berdasarkan dokumen yang diberikan.
                Selalu sertakan rujukan ke dokumen sumber."""
            else:
                system_prompt = """You are an AI assistant expert in policies and regulations. 
                Provide accurate and comprehensive answers based on the provided documents.
                Always include references to source documents."""
            
            user_prompt = f"""
            Berdasarkan dokumen kebijakan berikut:
            
            {context_text}
            
            Pertanyaan: {query}
            
            Berikan jawaban yang komprehensif dengan:
            1. Jawaban langsung terhadap pertanyaan
            2. Rujukan spesifik ke dokumen sumber
            3. Konteks tambahan jika relevan
            """
            
            # Choose model based on localhost or cloud
            model_name = "llama3" if self.is_localhost else "Llama-3.3-70B-Instruct"
            
            response = self.client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            return {
                "answer": response.choices[0].message.content,
                "model_used": f"{model_name} ({'localhost' if self.is_localhost else 'cloud'})"
            }
            
        except Exception as e:
            logger.error(f"Failed to generate answer: {e}")
            # Return a more informative error for localhost debugging
            if self.is_localhost:
                error_message = f"""
                Gagal terhubung ke Llama3 localhost. 
                
                Error: {str(e)}
                
                Pastikan:
                1. Llama3 server berjalan di {os.getenv("LLAMA_BASE_URL", "localhost")}
                2. Server mendukung OpenAI-compatible API
                3. Model tersedia (biasanya 'llama3' atau 'llama3:latest')
                
                Untuk menjalankan Ollama dengan Llama3:
                ```
                ollama serve
                ollama run llama3
                ```
                """
                return {
                    "answer": error_message,
                    "model_used": "Error (localhost connection failed)"
                }
            raise
    
    def draft_policy(self, topic: str, category: str, policy_type: str, 
                    requirements: List[str], reference_policies: List[str], 
                    language: str = "id") -> Dict[str, Any]:
        """Draft a new policy based on requirements"""
        try:
            if language == "id":
                system_prompt = """Anda adalah ahli kebijakan yang berpengalaman dalam menyusun peraturan dan kebijakan Indonesia. 
                Buatlah draft kebijakan yang sesuai dengan standar penulisan peraturan Indonesia."""
            else:
                system_prompt = """You are a policy expert experienced in drafting regulations and policies. 
                Create a policy draft following standard policy writing practices."""
            
            user_prompt = f"""
            Buatlah draft kebijakan dengan detail berikut:
            
            Topik: {topic}
            Kategori: {category}
            Jenis Kebijakan: {policy_type}
            Persyaratan: {', '.join(requirements)}
            Referensi Kebijakan: {', '.join(reference_policies)}
            
            Format draft harus mencakup:
            1. Judul
            2. Konsiderans (pertimbangan)
            3. Dasar hukum
            4. Batang tubuh dengan pasal-pasal
            5. Ketentuan penutup
            
            Pastikan draft sesuai dengan kaidah penulisan peraturan Indonesia.
            """
            
            response = self.client.chat.completions.create(
                model="Llama-3.3-70B-Instruct",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.4,
                max_tokens=2000
            )
            
            return {
                "draft": response.choices[0].message.content,
                "model_used": "Llama-3.3-70B-Instruct"
            }
            
        except Exception as e:
            logger.error(f"Failed to draft policy: {e}")
            raise
    
    def analyze_policy_compliance(self, policy_content: str, reference_policies: List[str]) -> Dict[str, Any]:
        """Analyze policy compliance against reference policies"""
        try:
            prompt = f"""
            Analisis kepatuhan kebijakan berikut terhadap kebijakan referensi:
            
            Kebijakan yang dianalisis:
            {policy_content}
            
            Kebijakan referensi:
            {chr(10).join(reference_policies)}
            
            Berikan analisis dalam format:
            1. Skor kepatuhan (0-100)
            2. Gap yang ditemukan
            3. Rekomendasi perbaikan
            4. Kebijakan serupa yang relevan
            """
            
            response = self.client.chat.completions.create(
                model="Llama-3.3-70B-Instruct",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=1500
            )
            
            return {
                "analysis": response.choices[0].message.content,
                "model_used": "Llama-3.3-70B-Instruct"
            }
            
        except Exception as e:
            logger.error(f"Failed to analyze policy compliance: {e}")
            raise
