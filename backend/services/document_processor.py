import PyPDF2
from docx import Document
from io import BytesIO
from typing import Union
from utils.logger import setup_logger

logger = setup_logger(__name__)

class DocumentProcessor:
    """Process different document formats and extract text"""
    
    def extract_text(self, content: bytes, filename: str) -> str:
        """Extract text from various document formats"""
        try:
            if filename.endswith('.pdf'):
                return self._extract_from_pdf(content)
            elif filename.endswith('.docx'):
                return self._extract_from_docx(content)
            elif filename.endswith('.txt'):
                return content.decode('utf-8')
            else:
                raise ValueError(f"Unsupported file format: {filename}")
                
        except Exception as e:
            logger.error(f"Error extracting text from {filename}: {e}")
            raise
    
    def _extract_from_pdf(self, content: bytes) -> str:
        """Extract text from PDF"""
        try:
            pdf_file = BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            raise
    
    def _extract_from_docx(self, content: bytes) -> str:
        """Extract text from DOCX"""
        try:
            docx_file = BytesIO(content)
            doc = Document(docx_file)
            
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error extracting DOCX text: {e}")
            raise
