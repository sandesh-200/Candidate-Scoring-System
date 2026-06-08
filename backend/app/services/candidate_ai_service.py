from .gemini_service import GeminiService


gemini_service = GeminiService()


def generate_ai_summary(candidate) -> str:
    return gemini_service.generate_candidate_summary(candidate)