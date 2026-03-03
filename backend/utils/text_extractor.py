import pdfplumber
import docx2txt
import os


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
