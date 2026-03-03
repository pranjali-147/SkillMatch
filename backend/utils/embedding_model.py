import os
import numpy as np
from gensim.models import KeyedVectors
from sklearn.metrics.pairwise import cosine_similarity
from .preprocessing import preprocess_text


# ===============================
# Load Local GloVe (50d - 2024)
# ===============================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EMBEDDING_PATH = os.path.join(
    BASE_DIR,
    "data",
    "embeddings",
    "glove.2024.wikigiga.50d.txt"
)

print("Loading GloVe 50d model locally...")

model = KeyedVectors.load_word2vec_format(
    EMBEDDING_PATH,
    binary=False,
    no_header=True
)

print("Model loaded successfully!")


# ------------------------------
# Sentence Embedding (GloVe)
# ------------------------------
def get_sentence_vector(text):
    tokens = preprocess_text(text)

    vectors = []
    for word in tokens:
        if word in model:
            vectors.append(model[word])

    if len(vectors) == 0:
        return np.zeros(50)

    return np.mean(vectors, axis=0)


# ------------------------------
# Skill Extraction
# ------------------------------
def extract_skills(text):
    tokens = preprocess_text(text)   # 🔥 use your existing preprocessing
    return set(tokens)



# ------------------------------
# Main Similarity Function
# ------------------------------
def calculate_similarity(jd_text, resume_text, required_skills):

    # ===== 1️⃣ Semantic Similarity =====
    vec1 = get_sentence_vector(jd_text).reshape(1, -1)
    vec2 = get_sentence_vector(resume_text).reshape(1, -1)

    semantic_score = cosine_similarity(vec1, vec2)[0][0] * 100

    # ===== 2️⃣ Skill Matching (ONLY REQUIRED SKILLS) =====
    resume_tokens = preprocess_text(resume_text)


    resume_clean_text = " ".join(resume_tokens)

    required_skills_lower = [skill.lower() for skill in required_skills]

    matched_skills = []
    missing_skills = []

    for skill in required_skills_lower:

        # If skill is multi-word (phrase)
        if " " in skill:
            if skill in resume_clean_text:
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)

        # If skill is single word
        else:
            if skill in resume_tokens:
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)


    if len(required_skills_lower) > 0:
        skill_score = (len(matched_skills) / len(required_skills_lower)) * 100
    else:
        skill_score = 0

    # ===== 3️⃣ Final Weighted Score =====
    final_score = (0.6 * skill_score) + (0.4 * semantic_score)

    return {
        "final_score": round(float(final_score), 2),
        "semantic_score": round(float(semantic_score), 2),
        "skill_score": round(float(skill_score), 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills
    }
