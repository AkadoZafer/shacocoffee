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

class CheckoutItem(BaseModel):
    name: str
    customizations: Optional[dict] = None
    price: float
    quantity: int

class CheckoutRequest(BaseModel):
    items: list[CheckoutItem]
    total: float
    customerName: str

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

@app.post("/api/checkout")
async def checkout_cart(request: CheckoutRequest, user=Depends(get_current_user)):
    """Siparişi tamamlayan ve bakiyeden düşen güvenli Transaction rotası"""
    total = float(request.total)
    if total <= 0 or not request.items:
        raise HTTPException(status_code=400, detail="Invalid checkout request")

    uid = user.get("uid")
    
    try:
        user_ref = db.collection('users').document(uid)
        orders_ref = db.collection('orders')
        
        @firestore.transactional
        def process_checkout_transaction(transaction, user_ref_t):
            snapshot = user_ref_t.get(transaction=transaction)
            if not snapshot.exists:
                raise HTTPException(status_code=404, detail="User not found")
            
            data = snapshot.to_dict()
            current_balance = data.get('balance', 0)
            
            if current_balance < total:
                raise HTTPException(status_code=400, detail="Insufficient balance")
                
            new_balance = current_balance - total
            
            import time
            from datetime import datetime
            import random
            import string
            
            # Generate Order Code
            chars = string.ascii_uppercase + string.digits
            order_code = 'SHC-' + ''.join(random.choice(chars) for _ in range(6))
            
            # User Updates
            new_tx = {
                "id": int(time.time() * 1000),
                "amount": total,
                "type": "purchase",
                "date": datetime.now().strftime("%d.%m.%Y")
            }
            
            transactions = data.get('transactions', [])
            transactions.insert(0, new_tx)
            
            stars = data.get('stars', 0) + (len(request.items) * 5)
            stamp_count = data.get('stampCount', 0) + 1
            earned_free = False
            
            if stamp_count >= 8:
                earned_free = True
                stamp_count = 0
                
            transaction.update(user_ref_t, {
                'balance': new_balance,
                'transactions': transactions,
                'stars': stars,
                'stampCount': stamp_count
            })
            
            # Create Order Document
            new_order_data = {
                "code": order_code,
                "userId": uid,
                "customerName": request.customerName or 'Müşteri',
                "items": [item.model_dump() for item in request.items],
                "total": total,
                "date": datetime.utcnow().isoformat() + "Z",
                "status": "Bekliyor",
                "timestamp": firestore.SERVER_TIMESTAMP
            }
            
            new_order_ref = orders_ref.document()
            transaction.set(new_order_ref, new_order_data)
            
            # To simulate returning valid doc data
            new_order_data["id"] = new_order_ref.id
            del new_order_data["timestamp"] # Cannot serialize ServerTimestamp behavior easily
            
            return new_balance, new_order_data, earned_free

        transaction = db.transaction()
        new_balance, order_data, earned_free = process_checkout_transaction(transaction, user_ref)
        
        return {
            "success": True,
            "new_balance": new_balance,
            "order": order_data,
            "earned_free": earned_free,
            "message": "Checkout completed successfully"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Checkout error: {str(e)}")
