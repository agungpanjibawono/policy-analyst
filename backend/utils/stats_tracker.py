import json
import os
from datetime import datetime
from typing import Dict, Any
from utils.logger import setup_logger

logger = setup_logger(__name__)

class StatsTracker:
    def __init__(self, stats_file="data/stats.json"):
        self.stats_file = stats_file
        self.ensure_stats_file()
    
    def ensure_stats_file(self):
        """Ensure stats file exists with default values"""
        if not os.path.exists(self.stats_file):
            os.makedirs(os.path.dirname(self.stats_file), exist_ok=True)
            default_stats = {
                "total_queries": 0,
                "active_drafts": 0,
                "last_updated": datetime.now().isoformat()
            }
            with open(self.stats_file, 'w') as f:
                json.dump(default_stats, f, indent=2)
    
    def increment_query_count(self):
        """Increment total query count"""
        try:
            stats = self.load_stats()
            stats["total_queries"] += 1
            stats["last_updated"] = datetime.now().isoformat()
            self.save_stats(stats)
            logger.info(f"Query count incremented to {stats['total_queries']}")
        except Exception as e:
            logger.error(f"Failed to increment query count: {e}")
    
    def increment_draft_count(self):
        """Increment active draft count"""
        try:
            stats = self.load_stats()
            stats["active_drafts"] += 1
            stats["last_updated"] = datetime.now().isoformat()
            self.save_stats(stats)
            logger.info(f"Draft count incremented to {stats['active_drafts']}")
        except Exception as e:
            logger.error(f"Failed to increment draft count: {e}")
    
    def load_stats(self) -> Dict[str, Any]:
        """Load stats from file"""
        try:
            with open(self.stats_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load stats: {e}")
            return {"total_queries": 0, "active_drafts": 0}
    
    def save_stats(self, stats: Dict[str, Any]):
        """Save stats to file"""
        try:
            with open(self.stats_file, 'w') as f:
                json.dump(stats, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save stats: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current stats"""
        return self.load_stats()

# Global instance
stats_tracker = StatsTracker()
