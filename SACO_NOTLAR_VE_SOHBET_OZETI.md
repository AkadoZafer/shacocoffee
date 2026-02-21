# Shaco Coffee App - Firebase ve Sunucu Notları (21 Şubat 2026)

Masaüstü bilgisayarına geçtiğinde kaldığın yerden devam etmek ve bu akşamki sohbetimizi unutmamak için hazırladığım özet notlar:

### 1. Sistem Gerçekten Starbucks Gibi Çalışır Mı?
Evet. Barkod yapısı, bakiye düşme mantığı ve yetkilendirmeler (Barista/Müşteri) tamamen Starbucks'ın kullandığı mantıkla aynıdır. Tek eksiği gerçek bir banka posu ve gerçek bir sunucudur.

### 2. Backend (Sunucu) Neden Ücretsiz / Ucuz?
Modern sistemlerde (Firebase veya Supabase) devasa donanım kiraları ödenmez.
- Google Firebase, uygulamayı ilk kurduğunda (Aylık 50.000 aktif kullanıcıya kadar) **TAMAMEN ÜCRETSİZDİR**.
- Sistem "Kullandığın Kadar Öde" (Pay-as-you-go) mantığıyla çalışır. Küçük kafeler için maliyeti pratik olarak sıfırdır.

### 3. Birden Fazla Kafe (Ayrı Markalar) Yönetilebilir Mi?
Kesinlikle. Her yeni kafe (Örn: Barbaros Burger, X Cafe) için Firebase'de tek tuşla yeni ve **bedava** bir proje açılır.
- Kodlar aynı kalır, sadece içindeki 3 satırlık "API Şifresi" değiştirilir.
- İki kafenin müşterileri, ciroları ve veritabanları birbirine ASLA karışmaz. Bildirimleri (Push Notification) ayrı ayrı atılır.

### 4. Bakiye Ödemesi ve Banka Testi
Uygulamayı denemek için Ziraat veya PayTR gibi gerçek bir bankayı beklemek **zorunda değiliz**.
1. **Manuel Yükleme Yöntemi:** Barista paneline "Bakiye Yükle" butonu ekleriz. Kasanıza gelen müşteriden parayı nakit veya yazar kasadan kartla çeker, uygulamaya bakiyeyi manuel girersiniz.
2. **Sandbox (Kum Havuzu) Yöntemi:** Iyzico/PayTR'ın yazılımcılara verdiği sahte test kartlarıyla (Örn: 4111 1111...) uygulamanın kredi kartı ekranı gerçekmiş gibi kodlanır ve denenir.

### 5. Bu Projeyi Masaüstüne Nasıl Aktarırım?
Şu an içinde bulunduğun `Shaco_Laptop_Project` klasörünü bir USB'ye veya Google Drive'a at. Masaüstü bilgisayarına yapıştır. İçindeki tüm kodlar (Barkod okuyucu, sarı alerjen uyarıları, null-safety giriş korumaları) eksiksiz olarak o klasörün içindedir. Masaüstündeki AI'a "Bu klasörden devam edelim, hadi Firebase'i bağlayalım" demen yeterlidir.

Görüşmek üzere usta! 😎🚀
