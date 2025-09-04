"""
Vector Store Factory - untuk memilih antara ChromaDB dan FAISS
"""
import os
from typing import Union
from services.vector_store import VectorStoreService
from services.faiss_vector_store import FAISSVectorStoreService

class VectorStoreFactory:
    @staticmethod
    def create_vector_store(store_type: str = None) -> Union[VectorStoreService, FAISSVectorStoreService]:
        """
        Create vector store instance based on configuration
        
        Args:
            store_type: 'chromadb' or 'faiss'. If None, uses environment variable VECTOR_STORE_TYPE
        
        Returns:
            Vector store instance
        """
        if store_type is None:
            store_type = os.getenv("VECTOR_STORE_TYPE", "chromadb")
        
        store_type = store_type.lower()
        
        if store_type == "faiss":
            return FAISSVectorStoreService()
        elif store_type == "chromadb":
            return VectorStoreService()
        else:
            raise ValueError(f"Unsupported vector store type: {store_type}. Use 'chromadb' or 'faiss'")
