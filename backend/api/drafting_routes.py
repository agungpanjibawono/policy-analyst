from fastapi import APIRouter, HTTPException
from models.schemas import PolicyDraftRequest, PolicyDraft, PolicyAnalysis
from services.llm_service import LLMService
from utils.logger import setup_logger
from utils.stats_tracker import stats_tracker

router = APIRouter()
logger = setup_logger(__name__)

@router.post("/draft", response_model=PolicyDraft)
async def draft_policy(request: PolicyDraftRequest):
    """Generate a policy draft based on requirements"""
    try:
        logger.info(f"Drafting policy for topic: {request.topic}")
        
        # Track draft count
        stats_tracker.increment_draft_count()
        
        llm_service = LLMService()
        
        # Generate policy draft
        draft_response = llm_service.draft_policy(
            topic=request.topic,
            category=request.category,
            policy_type=request.policy_type,
            requirements=request.requirements,
            reference_policies=request.reference_policies,
            language=request.language
        )
        
        return PolicyDraft(
            title=f"Draft: {request.topic}",
            category=request.category,
            policy_type=request.policy_type,
            content=draft_response["draft"],
            sections=[],  # Could be parsed from the generated content
            references=request.reference_policies
        )
        
    except Exception as e:
        logger.error(f"Error drafting policy: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze", response_model=PolicyAnalysis)
async def analyze_policy(
    policy_content: str,
    reference_policies: list[str] = []
):
    """Analyze a policy for compliance and gaps"""
    try:
        llm_service = LLMService()
        
        # Analyze policy compliance
        analysis_response = llm_service.analyze_policy_compliance(
            policy_content=policy_content,
            reference_policies=reference_policies
        )
        
        # This is a simplified response - in reality, you'd parse the LLM response
        return PolicyAnalysis(
            policy_id="temp_id",
            compliance_score=85.0,  # Would be extracted from LLM response
            gaps=["Gap 1", "Gap 2"],  # Would be extracted from LLM response
            recommendations=["Recommendation 1", "Recommendation 2"],
            similar_policies=["Similar Policy 1", "Similar Policy 2"]
        )
        
    except Exception as e:
        logger.error(f"Error analyzing policy: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates")
async def get_policy_templates():
    """Get available policy templates"""
    templates = [
        {
            "id": "hr_policy",
            "name": "HR Policy Template",
            "category": "Human Resources",
            "description": "Template for HR-related policies"
        },
        {
            "id": "it_security",
            "name": "IT Security Policy Template",
            "category": "Information Technology",
            "description": "Template for IT security policies"
        },
        {
            "id": "financial",
            "name": "Financial Policy Template",
            "category": "Finance",
            "description": "Template for financial policies"
        }
    ]
    
    return {"templates": templates}
