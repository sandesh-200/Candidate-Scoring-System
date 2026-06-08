from google import genai
from ..core.config import settings


class GeminiService:
    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    def generate_candidate_summary(self, candidate) -> str:

        prompt = f"""
You are an HR assistant.

Generate a professional candidate evaluation summary.

Name: {candidate.name}
Email: {candidate.email}
Role Applied: {candidate.role_applied}
Skills: {candidate.skills}
Status: {candidate.status}

Return:
- Short summary
- Strengths
- Concerns
- Final verdict (hire / maybe / reject)
"""

        response = self.client.models.generate_content(
            model="models/gemini-2.5-flash",   # ✅ FIX HERE
            contents=prompt
        )

        return response.text