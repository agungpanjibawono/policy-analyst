import os
import chromadb
from chromadb.config import Settings
from typing import List, Dict, Any, Optional
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
import uuid
from utils.logger import setup_logger

logger = setup_logger(__name__)

class VectorStoreService:
    def __init__(self):
        self.client = None
        self.collection = None
        self.embeddings = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        self.initialized = False
    
    async def initialize(self):
        """Initialize ChromaDB and embeddings"""
        try:
            # Initialize ChromaDB
            self.client = chromadb.PersistentClient(
                path="./data/chroma_db",
                settings=Settings(allow_reset=True)
            )
            
            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name="policy_documents",
                metadata={"description": "Policy documents collection"}
            )
            
            # Initialize embeddings
            self.embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
            )
            
            logger.info("Vector store initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize vector store: {e}")
            raise
    
    async def add_document(self, title: str, content: str, metadata: Dict[str, Any]) -> str:
        """Add a document to the vector store"""
        try:
            # Split document into chunks
            chunks = self.text_splitter.split_text(content)
            
            # Generate embeddings for chunks
            embeddings = self.embeddings.embed_documents(chunks)
            
            # Create unique IDs for chunks
            chunk_ids = [f"{uuid.uuid4()}" for _ in chunks]
            
            # Prepare metadata for each chunk
            chunk_metadata = []
            for i, chunk in enumerate(chunks):
                chunk_meta = metadata.copy()
                chunk_meta.update({
                    "title": title,
                    "chunk_index": i,
                    "total_chunks": len(chunks)
                })
                chunk_metadata.append(chunk_meta)
            
            # Add to ChromaDB
            self.collection.add(
                embeddings=embeddings,
                documents=chunks,
                metadatas=chunk_metadata,
                ids=chunk_ids
            )
            
            logger.info(f"Added document '{title}' with {len(chunks)} chunks")
            return str(uuid.uuid4())
            
        except Exception as e:
            logger.error(f"Failed to add document: {e}")
            raise
    
    async def search_documents(self, query: str, limit: int = 5, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search for relevant documents"""
        try:
            # Ensure embeddings are initialized
            if not self.embeddings:
                await self.initialize()
                
            # Generate query embedding
            query_embedding = self.embeddings.embed_query(query)
            
            # Prepare where clause for filtering
            where_clause = {}
            if category:
                where_clause["category"] = category
            
            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=limit,
                where=where_clause if where_clause else None
            )
            
            # Format results
            formatted_results = []
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    "content": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i],
                    "distance": results['distances'][0][i] if 'distances' in results else 0
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Failed to search documents: {e}")
            raise
    
    async def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the collection"""
        try:
            count = self.collection.count()
            return {
                "total_documents": count,
                "collection_name": "policy_documents"
            }
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {"total_documents": 0, "collection_name": "policy_documents"}
    
    async def get_all_documents(self) -> List[Dict[str, Any]]:
        """Get all documents with their metadata"""
        try:
            # Get all documents from the collection
            results = self.collection.get(
                include=["metadatas", "documents"]
            )
            
            # Group by document title to avoid duplicates (since we have chunks)
            documents_map = {}
            
            for i, metadata in enumerate(results["metadatas"]):
                title = metadata.get("title", "Unknown")
                
                # If document not yet in map, add it
                if title not in documents_map:
                    documents_map[title] = {
                        "title": title,
                        "category": metadata.get("category", "general"),
                        "document_type": metadata.get("document_type", "regulation"),
                        "source": metadata.get("source", "unknown"),
                        "date_created": metadata.get("date_created", "unknown"),
                        "language": metadata.get("language", "id"),
                        "chunk_count": 1,
                        "preview": results["documents"][i][:200] + "..." if len(results["documents"][i]) > 200 else results["documents"][i]
                    }
                else:
                    # Increment chunk count for existing document
                    documents_map[title]["chunk_count"] += 1
            
            # Convert to list and sort by date_created
            documents_list = list(documents_map.values())
            documents_list.sort(key=lambda x: x.get("date_created", ""), reverse=True)
            
            return documents_list
            
        except Exception as e:
            logger.error(f"Failed to get all documents: {e}")
            return []
    
    def delete_document_by_title(self, title: str) -> Dict[str, Any]:
        """Delete all chunks of a document by title"""
        try:
            # Get all documents with the specified title
            results = self.collection.get(
                where={"title": title},
                include=["metadatas"]
            )
            
            if not results["ids"]:
                return {
                    "success": False,
                    "message": f"Document '{title}' not found"
                }
            
            # Delete all chunks with this title
            chunk_ids = results["ids"]
            self.collection.delete(ids=chunk_ids)
            
            logger.info(f"Deleted document '{title}' with {len(chunk_ids)} chunks")
            
            return {
                "success": True,
                "message": f"Document '{title}' deleted successfully",
                "deleted_chunks": len(chunk_ids)
            }
            
        except Exception as e:
            logger.error(f"Failed to delete document '{title}': {e}")
            return {
                "success": False,
                "message": f"Error deleting document: {str(e)}"
            }
