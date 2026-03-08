import pdfplumber
import docx2txt
import os
import io
import tempfile


def extract_text(file_path):
    """
    Extract text from PDF or DOCX resume
    """
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".pdf":
        return extract_pdf(file_path)

    elif ext == ".docx":
        return extract_docx(file_path)

    elif ext == ".txt":
        return extract_txt(file_path)


    else:
        return ""


def extract_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text

def extract_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def extract_docx(file_path):
    return docx2txt.process(file_path)


def extract_text_from_bytes(filename: str, data: bytes) -> str:
    """
    Extract text from an uploaded resume without saving to uploads/.
    Supports PDF, DOCX, and TXT based on filename extension.
    """
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".pdf":
        return _extract_pdf_bytes(data)
    if ext == ".docx":
        return _extract_docx_bytes(data)
    if ext == ".txt":
        return _extract_txt_bytes(data)
    return ""


def _extract_pdf_bytes(data: bytes) -> str:
    text = ""
    with pdfplumber.open(io.BytesIO(data)) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def _extract_txt_bytes(data: bytes) -> str:
    try:
        return data.decode("utf-8")
    except UnicodeDecodeError:
        return data.decode("latin-1", errors="ignore")


def _extract_docx_bytes(data: bytes) -> str:
    # docx2txt requires a file path; use a temporary file (not uploads/)
    with tempfile.NamedTemporaryFile(suffix=".docx", delete=True) as tmp:
        tmp.write(data)
        tmp.flush()
        return docx2txt.process(tmp.name) or ""
