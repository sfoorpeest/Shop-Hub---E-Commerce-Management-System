import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Fab,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import SmartToy from "@mui/icons-material/SmartToy";
import Close from "@mui/icons-material/Close";
import Send from "@mui/icons-material/Send";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";

const ChatWidget = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Xin chào! Tôi là trợ lý Shop Hub. Bạn cần tư vấn size áo, phối đồ hay gợi ý sản phẩm?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const productIdMatch = location.pathname.match(/^\/products\/(\d+)/);
  const productId = productIdMatch ? parseInt(productIdMatch[1], 10) : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  if (!isAuthenticated) return null;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);

    try {
      const payload = { message: text };
      if (productId) payload.product_id = productId;

      const { data } = await axios.post("/api/v1/ai/chat", payload);
      setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        "Không thể kết nối AI. Kiểm tra GEMINI_API_KEY trong backend .env.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: typeof detail === "string" ? detail : "Lỗi dịch vụ AI.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 88,
            right: 24,
            width: { xs: "calc(100% - 32px)", sm: 360 },
            height: 440,
            zIndex: 1300,
            display: "flex",
            flexDirection: "column",
            borderRadius: "16px",
            overflow: "hidden",
            bgcolor: "#1e293b",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontWeight: 700, color: "#fff", fontSize: "0.95rem" }}>
              Shop Hub AI
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "#fff" }}>
              <Close fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
            {messages.map((msg, idx) => (
              <Box
                key={idx}
                sx={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                  px: 1.5,
                  py: 1,
                  borderRadius: "12px",
                  bgcolor:
                    msg.role === "user"
                      ? "rgba(99, 102, 241, 0.25)"
                      : "rgba(255,255,255,0.06)",
                }}
              >
                <Typography variant="body2" sx={{ color: "#e2e8f0", whiteSpace: "pre-wrap" }}>
                  {msg.text}
                </Typography>
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} sx={{ color: "#818cf8" }} />
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Đang suy nghĩ...
                </Typography>
              </Box>
            )}
            <div ref={bottomRef} />
          </Box>

          <Box sx={{ p: 1.5, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Hỏi về size, phối đồ..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#fff",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                },
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={loading || !input.trim()}
              sx={{ bgcolor: "#6366f1", color: "#fff", "&:hover": { bgcolor: "#4f46e5" } }}
            >
              <Send fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      <Fab
        color="primary"
        onClick={() => setOpen((v) => !v)}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1300,
          bgcolor: "#6366f1",
          "&:hover": { bgcolor: "#4f46e5" },
        }}
      >
        {open ? <Close /> : <SmartToy />}
      </Fab>
    </>
  );
};

export default ChatWidget;
