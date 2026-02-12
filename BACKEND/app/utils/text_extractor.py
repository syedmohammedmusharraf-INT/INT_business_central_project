import io
import os
from pypdf import PdfReader
from docx import Document

def extract_text_from_bytes(file_bytes: bytes, filename: str) -> str:
    """
    Extracts text from bytes content based on filename extension.
    """
    ext = os.path.splitext(filename)[1].lower()
    file_stream = io.BytesIO(file_bytes)
    
    if ext == ".pdf":
        return extract_pdf_text_from_stream(file_stream)
    elif ext in [".docx", ".doc"]:
        return extract_docx_text_from_stream(file_stream)
    elif ext == ".txt":
        return file_bytes.decode("utf-8", errors="ignore")
    else:
        print(f"Unsupported file type for in-memory extraction: {ext}")
        return ""

def extract_pdf_text_from_stream(stream: io.BytesIO) -> str:
    try:
        reader = PdfReader(stream)
        text = " ".join(page.extract_text() or "" for page in reader.pages)
        return text.strip()
    except Exception as e:
        print(f"PDF stream extraction failed: {e}")
        return ""

def extract_docx_text_from_stream(stream: io.BytesIO) -> str:
    try:
        doc = Document(stream)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text.strip()
    except Exception as e:
        print(f"DOCX stream extraction failed: {e}")
        return ""

def extract_text_from_path(file_path: str) -> str:
    """
    Legacy support for extracting from a file path.
    """
    if not os.path.exists(file_path):
        return ""
        
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        with open(file_path, "rb") as f:
            return extract_pdf_text_from_stream(io.BytesIO(f.read()))
    elif ext in [".docx", ".doc"]:
        with open(file_path, "rb") as f:
            return extract_docx_text_from_stream(io.BytesIO(f.read()))
    elif ext == ".txt":
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
    return ""
