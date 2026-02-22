import os
import firebase_admin
from firebase_admin import credentials, auth, firestore
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Initialize Firebase Admin
try:
    # Attempt to initialize using Application Default Credentials or env vars
    # In Vercel, we can pass a service account dict or rely on config
    # For now, initialize without explicit creds to use auto-discovery
    # (requires FIREBASE_CONFIG or GOOGLE_APPLICATION_CREDENTIALS env var)
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    db = firestore.client()
except Exception as e:
    print(f"Firebase Admin Initialization Error: {e}")

app = FastAPI(
    title="Shaco Coffee Next-Gen API",
    description="2026 Standartlarında Shaco Coffee Rest API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verifies Firebase Token and returns decoded user data"""
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Pydantic schema for TopUp Request
class TopUpRequest(BaseModel):
    amount: float

@app.get("/api/health")
async def health_check():
    return {
        "status": "success",
        "message": "Shaco Coffee Next-Gen API is running! 🚀",
        "environment": os.getenv("VERCEL_ENV", "local")
    }

@app.post("/api/topup")
async def top_up_balance(request: TopUpRequest, user=Depends(get_current_user)):
    """Güvenli bakiye yükleme uç noktası"""
    amount = float(request.amount)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount")

    uid = user.get("uid")
    
    try:
        user_ref = db.collection('users').document(uid)
        
        @firestore.transactional
        def update_in_transaction(transaction, user_ref_t):
            snapshot = user_ref_t.get(transaction=transaction)
            if not snapshot.exists:
                raise HTTPException(status_code=404, detail="User not found")
            
            data = snapshot.to_dict()
            current_balance = data.get('balance', 0)
            new_balance = current_balance + amount
            
            # Create transaction log
            import time
            from datetime import datetime
            new_tx = {
                "id": int(time.time() * 1000),
                "amount": amount,
                "type": "topup",
                "date": datetime.now().strftime("%d.%m.%Y")
            }
            
            transactions = data.get('transactions', [])
            transactions.insert(0, new_tx)
            
            transaction.update(user_ref_t, {
                'balance': new_balance,
                'transactions': transactions
            })
            return new_balance, new_tx

        transaction = db.transaction()
        new_balance, new_tx = update_in_transaction(transaction, user_ref)
        
        return {
            "success": True, 
            "new_balance": new_balance, 
            "transaction": new_tx,
            "message": "Balance updated successfully"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
