from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class PolicyDocument(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    category: str
    document_type: str  # "law", "regulation", "guideline", "policy"
    source: str
    date_created: datetime
    date_updated: Optional[datetime] = None
    language: str = "id"  # "id" for Indonesian, "en" for English
    tags: List[str] = []
    # New metadata fields
    instansi_penerbit: Optional[str] = None  # Publishing institution
    tahun_terbit: Optional[int] = None       # Publication year
    status: str = "aktif"                    # Status: "aktif" or "tidak_aktif"
    metadata: Dict[str, Any] = {}

class PolicyQuery(BaseModel):
    query: str
    language: str = "id"
    category: Optional[str] = None
    limit: int = 5

class PolicyAnswer(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]
    confidence_score: float
    related_policies: List[str] = []

class PolicyDraft(BaseModel):
    title: str
    category: str
    policy_type: str
    content: str
    sections: List[Dict[str, str]] = []
    references: List[str] = []

class PolicyDraftRequest(BaseModel):
    topic: str
    category: str
    policy_type: str
    requirements: List[str] = []
    reference_policies: List[str] = []
    language: str = "id"

class PolicyAnalysis(BaseModel):
    policy_id: str
    compliance_score: float
    gaps: List[str]
    recommendations: List[str]
    similar_policies: List[str]

class UploadResponse(BaseModel):
    success: bool
    message: str
    document_id: Optional[str] = None
    processed_chunks: int = 0
