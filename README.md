# YKS Koç 🎓

TYT ve AYT'ye (Sayısal · Eşit Ağırlık · Sözel) hazırlananlar için Android uygulaması.
Konu anlatımı, soru bankası, deneme testleri, yanlış defteri, pomodoro ve istatistik tek uygulamada.

> React Native + Expo ile yazıldı. Kod GitHub'a yüklendiğinde GitHub Actions APK'yı otomatik üretir.

---

## Uygulamada neler var?

| Modül | Açıklama |
|---|---|
| **TYT** | 10 ders, 96 konu, 300+ alt başlık (Türkçe, Temel Matematik, Geometri, Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Felsefe, Din Kültürü) |
| **AYT Sayısal** | Matematik, Fizik, Kimya, Biyoloji — 101 konu |
| **AYT Eşit Ağırlık** | Matematik, Edebiyat, Tarih-1, Coğrafya-1 |
| **AYT Sözel** | Edebiyat, Tarih-1/2, Coğrafya-1/2, Felsefe Grubu, Din Kültürü |
| **Konu anlatımı** | Özet bilgi, bilmen gereken bağıntılar, çözümlü örnek, "sınavda dikkat et" uyarıları |
| **Soru bankası** | 71 hazır çözümlü soru; JSON'a eklemeyle sınırsız büyür |
| **Test çözücü** | Ders + soru sayısı + süre seçimi, geri sayım, net hesabı (4 yanlış = 1 doğru götürür) |
| **Yanlış defteri** | Yanlışlar otomatik birikir, ders bazlı dağılım, birebir tekrar çözümü |
| **İstatistik** | 7/30/90 günlük grafikler, ders bazlı başarı, en zayıf ders tespiti |
| **Pomodoro** | 25/5/15 dakika modları, çalışma süresi takibi |
| **Arama** | Türkçe karakterden bağımsız konu/ders/soru arama |
| **Profil** | Alan seçimi, hedef, sınav tarihi, günlük hedef, hatırlatıcı |

Veriler telefonun kendi hafızasında saklanır (AsyncStorage); internet gerekmez.

---

## GitHub'dan APK üretme (adım adım)

1. **Depo oluştur:** GitHub'da yeni bir depo aç (ör. `yks-koc`), README veya .gitignore oluşturma seçeneklerini işaretlemeden boş oluştur.
2. **Dosyaları yükle:** Bu klasördeki **tüm dosyaları** depoya yükle. `.github` klasörü (nokta ile başlıyor) gizli dosyadır, yüklerken mutlaka dahil olsun.
3. **Yükleme sonrası:** GitHub > **Actions** sekmesi > **"APK Üret (YKS Koç)"** otomatik başlar (başlamazsa sekmeden workflow'u elle çalıştır).
4. **Derleme:** Yeşil onay için ~10-15 dk bekle (ilk derleme yükleyip SDK indirir).
5. **APK'yı indir:** Çalışmanın sayfasında **Artifacts** > `yks-koc-apk` > indir > zip'i aç > `yks-koc.apk`.
6. **Kur:** Telefona at, "bilinmeyen kaynaklardan kurulum"a izin ver, kur. Bitti ✅

### İmzalı (release) APK
Play Store dışında geniş paylaşım için: bir keystore üret (Android Studio veya `keytool`), Base64'e çevir, depo **Ayarlar > Secrets** bölümüne
`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` olarak ekle, sonra **"İmzalı Sürüm APK"** workflow'unu elle çalıştır.

### Bilgisayarda derleme (istersen)
Node.js 20 + Java 17 kuruluysa:
```
npm install
npx expo prebuild --platform android --clean
cd android && ./gradlew assembleDebug
```
APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Telefonda geliştirme/önizleme (en hızlı yol)
Expo Go uygulamasını kur, klasörde `npx expo start`, telefonda QR okut.

---

## Soru bankasını büyütme

`src/data/sorular.json` dosyasını aç, yeni soruyu aynı kalıpta ekle:

```json
{
  "id": "q072",
  "subject": "tyt-matematik",
  "topic": "Üslü Sayılar",
  "text": "Soru metni…",
  "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
  "answer": 2,
  "explain": "Çözüm açıklaması…",
  "subjectName": "Temel Matematik"
}
```

`subject` bu kimliklerden biri olmalı (ders listesi otomatik eşleşir):
`tyt-turkce, tyt-matematik, tyt-geometri, tyt-fizik, tyt-kimya, tyt-biyoloji, tyt-tarih, tyt-cografya, tyt-felsefe, tyt-dinkulturu, ayt-matematik, ayt-fizik, ayt-kimya, ayt-biyoloji, ayt-edebiyat, ayt-ea-tarih1, ayt-ea-cografya1, ayt-soz-tarih2, ayt-soz-cografya2, ayt-soz-felsefe`

Konu anlatımı da aynı şekilde `src/data/konu_anlatimi.json` dosyasında düzenlenebilir
(konu `id`'leri `dersler` dosyalarındakilerle eşleşir). Yeni commit attığında Actions tekrar APK üretir.

---

## Dosya yapısı

```
├── App.js                    # Gezinti ve alt menü
├── app.json                  # Uygulama kimliği (com.ykskoc.app)
├── eas.json                  # EAS derleme profilleri
├── .github/workflows/        # GitHub Actions APK tarifleri
└── src/
    ├── theme.js              # Renk ve tipografi sistemi
    ├── ui.js                 # Ortak arayüz bileşenleri
    ├── store.js              # Kalıcı veri (ilerleme, sonuçlar)
    ├── nav.js                # Ekran gezintisi
    ├── notify.js             # Çalışma hatırlatıcısı
    ├── data/                 # Ders, konu, soru JSON'ları
    └── screens/              # 14 ekran
```
