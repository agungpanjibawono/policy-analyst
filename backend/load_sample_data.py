"""
Script to load sample policy documents into the vector database
Run this after setting up the environment
"""

import asyncio
import os
from datetime import datetime
from services.vector_store import VectorStoreService
from utils.logger import setup_logger

logger = setup_logger(__name__)

async def load_sample_policies():
    """Load sample policy documents"""
    
    # Initialize vector store
    vector_store = VectorStoreService()
    await vector_store.initialize()
    
    # Sample policies directory
    data_dir = "./data"
    
    # Sample policies to load
    sample_files = [
        {
            "filename": "sample_policy_wfh.txt",
            "title": "Kebijakan Work From Home",
            "category": "hr",
            "document_type": "policy",
            "language": "id"
        },
        {
            "filename": "sample_policy_cuti.txt", 
            "title": "Kebijakan Cuti Karyawan",
            "category": "hr",
            "document_type": "policy",
            "language": "id"
        }
    ]
    
    for policy_info in sample_files:
        file_path = os.path.join(data_dir, policy_info["filename"])
        
        if os.path.exists(file_path):
            logger.info(f"Loading {policy_info['title']}...")
            
            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Prepare metadata
            metadata = {
                "category": policy_info["category"],
                "document_type": policy_info["document_type"],
                "source": policy_info["filename"],
                "date_created": datetime.now().isoformat(),
                "language": policy_info["language"],
                "tags": "sample,hr,policy"  # Convert list to string
            }
            
            # Add to vector store
            try:
                document_id = await vector_store.add_document(
                    title=policy_info["title"],
                    content=content,
                    metadata=metadata
                )
                logger.info(f"✅ Successfully loaded: {policy_info['title']} (ID: {document_id})")
            except Exception as e:
                logger.error(f"❌ Failed to load {policy_info['title']}: {e}")
        else:
            logger.warning(f"⚠️  File not found: {file_path}")
    
    # Get collection stats
    stats = await vector_store.get_collection_stats()
    logger.info(f"📊 Total documents in collection: {stats['total_documents']}")
    
    logger.info("🎉 Sample data loading completed!")

if __name__ == "__main__":
    print("🏛️ Loading sample policy documents...")
    asyncio.run(load_sample_policies())
