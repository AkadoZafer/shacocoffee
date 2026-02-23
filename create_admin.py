import os
import firebase_admin
from firebase_admin import credentials, auth, firestore

# Firebase config json dosyasının yolu veya ortam değişkenlerinden alınacak
# Vercel üzerinde bu ortam değişkenleriyle çalışıyor, lokalde json dosyası gerekir
# Şimdilik uygulamanın çalıştığını varsayarak (Default Credential veya env var)
try:
    if not firebase_admin._apps:
        firebase_admin.initialize_app()
    db = firestore.client()
except Exception as e:
    print(f"Firebase başlatılamadı: {e}")
    # Eğer doğrudan çalıştırırsak patlayabilir, çünkü .env.local'deki VITE_ değişkenleriyle çalışmaz.
    # Bu yüzden manuel bir REST API isteği ile kayıt olmayı da deneyebiliriz.

# Kullanıcı oluşturma
try:
    user = auth.create_user(
        email='admin@shaco.com',
        password='adminpassword123',
        display_name='Sistem Yöneticisi'
    )
    print(f"Başarıyla yeni auth kullanıcısı oluşturuldu: {user.uid}")
    
    # Firestore'a veri yazma
    db.collection('users').document(user.uid).set({
        'name': 'Sistem Yöneticisi',
        'email': 'admin@shaco.com',
        'role': 'admin',
        'balance': 0,
        'stars': 0,
        'stampCount': 0,
        'joined': firestore.SERVER_TIMESTAMP
    })
    print("Firestore tablosuna admin yetkisiyle eklendi!")
    print("GİRİŞ BİLGİLERİ:")
    print("E-posta: admin@shaco.com")
    print("Şifre: adminpassword123")
    
except Exception as e:
    print(f"Hata oluştu: {e}")
    print("Muhtemelen e-posta adresi zaten kullanılıyor olabilir veya Firebase Admin kimlik bilgileri eksik.")
