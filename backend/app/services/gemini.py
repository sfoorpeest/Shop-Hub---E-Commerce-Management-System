"""Gemini AI service for Shop Hub."""

from typing import Optional

from app.core.config import settings

SYSTEM_PROMPT = """Bạn là trợ lý mua sắm thời trang của Shop Hub — cửa hàng quần áo online.
Nhiệm vụ: tư vấn size, phối đồ, gợi ý sản phẩm phù hợp.
Quy tắc:
- Trả lời bằng tiếng Việt, ngắn gọn, thân thiện.
- Khi tư vấn size: hỏi chiều cao/cân nặng nếu chưa có, gợi ý S/M/L/XL cụ thể.
- Không bịa giá hoặc tồn kho — chỉ dựa trên thông tin sản phẩm được cung cấp.
- Nếu không chắc, khuyên khách xem chi tiết sản phẩm hoặc liên hệ shop."""


def _get_model():
    if not settings.GEMINI_API_KEY:
        return None
    try:
        import google.generativeai as genai

        genai.configure(api_key=settings.GEMINI_API_KEY)
        return genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT,
        )
    except Exception:
        return None


def chat(message: str, product_context: Optional[str] = None) -> str:
    """Send a chat message to Gemini and return the reply."""
    model = _get_model()
    if not model:
        raise ValueError(
            "Gemini API chưa được cấu hình. Thêm GEMINI_API_KEY vào file .env"
        )

    prompt = message
    if product_context:
        prompt = f"[Thông tin sản phẩm đang xem]\n{product_context}\n\n[Câu hỏi khách hàng]\n{message}"

    response = model.generate_content(prompt)
    return response.text.strip()


def generate_product_description(
    name: str,
    category: str,
    material: Optional[str] = None,
    notes: Optional[str] = None,
) -> str:
    """Generate a product description for admin."""
    model = _get_model()
    if not model:
        raise ValueError(
            "Gemini API chưa được cấu hình. Thêm GEMINI_API_KEY vào file .env"
        )

    prompt = f"""Viết mô tả sản phẩm thời trang cho cửa hàng Shop Hub.
Tên: {name}
Danh mục: {category}
Chất liệu: {material or "không rõ"}
Ghi chú thêm: {notes or "không có"}

Yêu cầu: 2-3 câu, tiếng Việt, hấp dẫn, nêu điểm nổi bật. Không dùng bullet points."""

    response = model.generate_content(prompt)
    return response.text.strip()
