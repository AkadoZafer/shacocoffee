from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Uygulama örneğini oluştur
app = FastAPI(
    title="Shaco Coffee Next-Gen API",
    description="2026 Standartlarında Shaco Coffee Rest API",
    version="1.0.0"
)

# CORS ayarları (React uygulamasıyla haberleşebilmesi için)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    """Sistemin ayakta olup olmadığını kontrol eden sağlık rotası"""
    return {
        "status": "success",
        "message": "Shaco Coffee Next-Gen API is running! 🚀",
        "environment": os.getenv("VERCEL_ENV", "local")
    }
