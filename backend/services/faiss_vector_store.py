"""
FAISS Vector Store Service for improved policy search performance
"""
import os
import json
import pickle
import numpy as np
import faiss
from typing import List, Dict, Any, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
import uuid
from utils.logger import setup_logger

logger = setup_logger(__name__)

class FAISSVectorStoreService:
    def __init__(self):
        self.index = None
        self.documents = []  # Store document content and metadata
        self.embeddings = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        # Get the directory of this script
        script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(script_dir, "data")
        os.makedirs(data_dir, exist_ok=True)
        
        self.index_path = os.path.join(data_dir, "faiss_index")
        self.metadata_path = os.path.join(data_dir, "faiss_metadata.json")
        self.documents_path = os.path.join(data_dir, "faiss_documents.pkl")
        self.initialized = False
        
    async def initialize(self):
        """Initialize FAISS index and embeddings"""
        try:
            # Initialize embeddings
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
            )
            
            # Load existing index if available
            if self._index_exists():
                await self._load_index()
            else:
                # Create new index (384 dimensions for the model)
                self.index = faiss.IndexFlatIP(384)  # Inner Product for cosine similarity
                self.documents = []
                
            self.initialized = True
            logger.info(f"FAISS vector store initialized with {self.index.ntotal} vectors")
            
        except Exception as e:
            logger.error(f"Failed to initialize FAISS vector store: {e}")
            raise
    
    def _index_exists(self) -> bool:
        """Check if FAISS index files exist"""
        return (os.path.exists(self.index_path) and 
                os.path.exists(self.documents_path))
    
    async def _load_index(self):
        """Load existing FAISS index and metadata"""
        try:
            # Load FAISS index
            self.index = faiss.read_index(self.index_path)
            
            # Load documents
            with open(self.documents_path, 'rb') as f:
                self.documents = pickle.load(f)
                
            logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors")
            
        except Exception as e:
            logger.error(f"Failed to load FAISS index: {e}")
            # Create new index if loading fails
            self.index = faiss.IndexFlatIP(384)
            self.documents = []
    
    async def _save_index(self):
        """Save FAISS index and metadata to disk"""
        try:
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
            
            # Save FAISS index
            faiss.write_index(self.index, self.index_path)
            
            # Save documents
            with open(self.documents_path, 'wb') as f:
                pickle.dump(self.documents, f)
                
            logger.info(f"Saved FAISS index with {self.index.ntotal} vectors")
            
        except Exception as e:
            logger.error(f"Failed to save FAISS index: {e}")
    
    async def add_document(self, title: str, content: str, metadata: Dict[str, Any]) -> str:
        """Add a document to the FAISS vector store"""
        try:
            # Split document into chunks
            chunks = self.text_splitter.split_text(content)
            
            # Generate embeddings for chunks
            embeddings_list = self.embeddings.embed_documents(chunks)
            embeddings_array = np.array(embeddings_list, dtype=np.float32)
            
            # Normalize embeddings for cosine similarity
            faiss.normalize_L2(embeddings_array)
            
            # Add to FAISS index
            self.index.add(embeddings_array)
            
            # Store document metadata and content
            for i, chunk in enumerate(chunks):
                chunk_metadata = metadata.copy()
                chunk_metadata.update({
                    "title": title,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                    "document_id": str(uuid.uuid4())
                })
                
                self.documents.append({
                    "content": chunk,
                    "metadata": chunk_metadata
                })
            
            # Save index
            await self._save_index()
            
            logger.info(f"Added document '{title}' with {len(chunks)} chunks to FAISS")
            return str(uuid.uuid4())
            
        except Exception as e:
            logger.error(f"Failed to add document to FAISS: {e}")
            raise
    
    async def search_documents(self, query: str, limit: int = 5, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search for relevant documents using FAISS"""
        try:
            if not self.initialized:
                await self.initialize()
                
            if self.index.ntotal == 0:
                return []
            
            # Generate query embedding
            query_embedding = self.embeddings.embed_query(query)
            query_vector = np.array([query_embedding], dtype=np.float32)
            
            # Normalize for cosine similarity
            faiss.normalize_L2(query_vector)
            
            # Search with FAISS (get more results for filtering)
            search_limit = min(limit * 3, self.index.ntotal)
            scores, indices = self.index.search(query_vector, search_limit)
            
            # Format results
            formatted_results = []
            for i, (score, idx) in enumerate(zip(scores[0], indices[0])):
                if idx == -1:  # FAISS returns -1 for invalid indices
                    continue
                    
                doc = self.documents[idx]
                
                # Apply category filter if specified
                if category and doc["metadata"].get("category") != category:
                    continue
                
                formatted_results.append({
                    "content": doc["content"],
                    "metadata": doc["metadata"],
                    "distance": float(1.0 - score),  # Convert similarity to distance
                    "similarity_score": float(score)
                })
                
                if len(formatted_results) >= limit:
                    break
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Failed to search documents with FAISS: {e}")
            raise
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the FAISS collection"""
        try:
            if not self.initialized:
                await self.initialize()
                
            # Count unique documents (by title)
            titles = set()
            for doc in self.documents:
                titles.add(doc["metadata"].get("title", "Unknown"))
            
            return {
                "total_vectors": self.index.ntotal if self.index else 0,
                "total_documents": len(titles),
                "total_chunks": len(self.documents),
                "vector_store_type": "FAISS"
            }
        except Exception as e:
            logger.error(f"Failed to get FAISS collection stats: {e}")
            return {"total_vectors": 0, "total_documents": 0, "vector_store_type": "FAISS"}
    
    async def get_all_documents(self) -> List[Dict[str, Any]]:
        """Get all documents with their metadata"""
        try:
            if not self.initialized:
                await self.initialize()
            
            # Group by document title to avoid duplicates
            documents_map = {}
            
            for doc in self.documents:
                metadata = doc["metadata"]
                title = metadata.get("title", "Unknown")
                
                if title not in documents_map:
                    documents_map[title] = {
                        "title": title,
                        "category": metadata.get("category", "general"),
                        "document_type": metadata.get("document_type", "regulation"),
                        "source": metadata.get("source", "unknown"),
                        "date_created": metadata.get("date_created", "unknown"),
                        "language": metadata.get("language", "id"),
                        "chunk_count": 1,
                        "preview": doc["content"][:200] + "..." if len(doc["content"]) > 200 else doc["content"]
                    }
                else:
                    documents_map[title]["chunk_count"] += 1
            
            # Convert to list and sort by date_created
            documents_list = list(documents_map.values())
            documents_list.sort(key=lambda x: x.get("date_created", ""), reverse=True)
            
            return documents_list
            
        except Exception as e:
            logger.error(f"Failed to get all documents from FAISS: {e}")
            return []
    
    def delete_document_by_title(self, title: str) -> Dict[str, Any]:
        """Delete all chunks of a document by title"""
        try:
            if not self.initialized:
                return {
                    "success": False,
                    "message": "Vector store not initialized"
                }
            
            # Find indices of chunks with matching title
            indices_to_remove = []
            for i, doc in enumerate(self.documents):
                if doc["metadata"].get("title") == title:
                    indices_to_remove.append(i)
            
            if not indices_to_remove:
                return {
                    "success": False,
                    "message": f"Document '{title}' not found"
                }
            
            # Remove from documents list (in reverse order to maintain indices)
            for i in reversed(indices_to_remove):
                self.documents.pop(i)
            
            # Rebuild FAISS index (FAISS doesn't support efficient deletion)
            self._rebuild_index()
            
            logger.info(f"Deleted document '{title}' with {len(indices_to_remove)} chunks from FAISS")
            
            return {
                "success": True,
                "message": f"Document '{title}' deleted successfully",
                "deleted_chunks": len(indices_to_remove)
            }
            
        except Exception as e:
            logger.error(f"Failed to delete document '{title}' from FAISS: {e}")
            return {
                "success": False,
                "message": f"Error deleting document: {str(e)}"
            }
    
    def _rebuild_index(self):
        """Rebuild FAISS index after deletion"""
        try:
            if not self.documents:
                self.index = faiss.IndexFlatIP(384)
                return
            
            # Extract all embeddings and rebuild index
            all_contents = [doc["content"] for doc in self.documents]
            embeddings_list = self.embeddings.embed_documents(all_contents)
            embeddings_array = np.array(embeddings_list, dtype=np.float32)
            
            # Normalize embeddings
            faiss.normalize_L2(embeddings_array)
            
            # Create new index and add all embeddings
            self.index = faiss.IndexFlatIP(384)
            self.index.add(embeddings_array)
            
            # Save the rebuilt index
            import asyncio
            asyncio.create_task(self._save_index())
            
        except Exception as e:
            logger.error(f"Failed to rebuild FAISS index: {e}")
