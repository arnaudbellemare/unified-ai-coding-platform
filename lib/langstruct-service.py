#!/usr/bin/env python3
"""
LangStruct Service for GEO + ACP + AP2 Integration
Extract structured data from AI interactions and documents
"""

import json
import sys
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

# LangStruct imports (when installed)
try:
    from langstruct import LangStruct
    LANGSTRUCT_AVAILABLE = True
except ImportError:
    LANGSTRUCT_AVAILABLE = False
    print("LangStruct not installed. Run: pip install langstruct", file=sys.stderr)

@dataclass
class ExtractionResult:
    entities: Dict[str, Any]
    confidence: float
    sources: Dict[str, List[Dict[str, Any]]]
    success: bool
    error: Optional[str] = None

class LangStructService:
    """Service for structured data extraction using LangStruct"""
    
    def __init__(self):
        self.extractors = {}
        self._setup_extractors()
    
    def _setup_extractors(self):
        """Initialize extractors for different use cases"""
        if not LANGSTRUCT_AVAILABLE:
            return
            
        # GEO Query Extractor
        self.extractors['geo_query'] = LangStruct(example={
            "query_type": "product_search",
            "price_range": {"min": 50, "max": 100},
            "product_category": "electronics", 
            "brand_preference": "Apple",
            "urgency": "high",
            "location": "San Francisco"
        })
        
        # ACP Payment Extractor
        self.extractors['acp_payment'] = LangStruct(example={
            "product_id": "base-tshirt-001",
            "product_name": "Base T-Shirt",
            "quantity": 2,
            "unit_price": 22.50,
            "total_amount": 45.00,
            "payment_method": "crypto",
            "currency": "USDC",
            "customer_id": "customer_123"
        })
        
        # AP2 Agent Communication Extractor
        self.extractors['ap2_agent'] = LangStruct(example={
            "from_agent": "ShoppingBot_001",
            "to_agent": "PaymentBot_002",
            "amount": 25.50,
            "service": "recommendation_fee",
            "mandate_id": "ap2_mandate_123",
            "currency": "USD",
            "description": "Product recommendation service"
        })
        
        # Document Metadata Extractor
        self.extractors['document_metadata'] = LangStruct(example={
            "document_type": "invoice",
            "company": "Apple Inc.",
            "revenue": 125.3,
            "quarter": "Q3 2024",
            "key_metrics": ["revenue", "profit_margin"],
            "sentiment": "positive"
        })
    
    def extract_geo_query(self, query: str) -> ExtractionResult:
        """Extract structured data from GEO search queries"""
        if not LANGSTRUCT_AVAILABLE:
            return ExtractionResult(
                entities={},
                confidence=0.0,
                sources={},
                success=False,
                error="LangStruct not available"
            )
        
        try:
            result = self.extractors['geo_query'].extract(query)
            return ExtractionResult(
                entities=result.entities,
                confidence=result.confidence,
                sources=result.sources,
                success=True
            )
        except Exception as e:
            return ExtractionResult(
                entities={},
                confidence=0.0,
                sources={},
                success=False,
                error=str(e)
            )
    
    def extract_acp_payment(self, text: str) -> ExtractionResult:
        """Extract ACP payment data from text"""
        if not LANGSTRUCT_AVAILABLE:
            return ExtractionResult(
                entities={},
                confidence=0.0,
                sources={},
                success=False,
                error="LangStruct not available"
            )
        
        try:
            result = self.extractors['acp_payment'].extract(text)
            return ExtractionResult(
                entities=result.entities,
                confidence=result.confidence,
                sources=result.sources,
                success=True
            )
        except Exception as e:
            return ExtractionResult(
                entities={},
                confidence=0.0,
                sources={},
                success=False,
                error=str(e)
            )
    
    def extract_ap2_agent(self, text: str) -> ExtractionResult:
        """Extract AP2 agent communication data"""
        if not LANGSTRUCT_AVAILABLE:
            return ExtractionResult(
                entities={},
                confidence=0.0,
                sources={},
                success=False,
                error="LangStruct not available"
            )
        
        try:
            result = self.extractors['ap2_agent'].extract(text)
            return ExtractionResult(
                entities=result.entities,
                confidence=result.confidence,
                sources=result.sources,
                success=True
            )
        except Exception as e:
            return ExtractionResult(
                entities={},
                confidence=0.0,
                sources={},
                success=False,
                error=str(e)
            )
    
    def extract_document_metadata(self, text: str) -> ExtractionResult:
        """Extract structured metadata from documents"""
        if not LANGSTRUCT_AVAILABLE:
            return ExtractionResult(
                entities={},
                confidence=0.0,
                sources={},
                success=False,
                error="LangStruct not available"
            )
        
        try:
            result = self.extractors['document_metadata'].extract(text)
            return ExtractionResult(
                entities=result.entities,
                confidence=result.confidence,
                sources=result.sources,
                success=True
            )
        except Exception as e:
            return ExtractionResult(
                entities={},
                confidence=0.0,
                sources={},
                success=False,
                error=str(e)
            )

def main():
    """CLI interface for LangStruct service"""
    if len(sys.argv) < 3:
        print("Usage: python langstruct-service.py <extractor_type> <text>")
        print("Extractor types: geo_query, acp_payment, ap2_agent, document_metadata")
        sys.exit(1)
    
    extractor_type = sys.argv[1]
    text = sys.argv[2]
    
    service = LangStructService()
    
    if extractor_type == 'geo_query':
        result = service.extract_geo_query(text)
    elif extractor_type == 'acp_payment':
        result = service.extract_acp_payment(text)
    elif extractor_type == 'ap2_agent':
        result = service.extract_ap2_agent(text)
    elif extractor_type == 'document_metadata':
        result = service.extract_document_metadata(text)
    else:
        print(f"Unknown extractor type: {extractor_type}")
        sys.exit(1)
    
    print(json.dumps({
        "entities": result.entities,
        "confidence": result.confidence,
        "sources": result.sources,
        "success": result.success,
        "error": result.error
    }, indent=2))

if __name__ == "__main__":
    main()
