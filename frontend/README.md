# Graduation Project Management System - Frontend

Modern React tabanlı mezuniyet projesi yönetim sistemi frontend uygulaması.

## 🚀 Özellikler

### 🔐 **Authentication & Authorization**
- JWT tabanlı kimlik doğrulama
- Rol bazlı erişim kontrolü (Öğrenci/Öğretmen/Admin)
- Şifremi unuttum ve şifre sıfırlama
- Protected routes

### 👨‍🎓 **Öğrenci Özellikleri**
- Course code bazlı proje filtreleme (BLM=Türkçe, COM=İngilizce)
- Proje arama ve filtreleme
- Proje başvuru sistemi
- Başvuru durumu takibi
- Profil ayarları ve şifre değiştirme

### 👨‍🏫 **Öğretmen Özellikleri**
- Proje oluşturma ve yönetimi
- Course code ile proje kategorilendirme
- Öğrenci başvurularını inceleme ve değerlendirme
- Dil bazlı proje filtreleme
- Proje istatistikleri

### 👨‍💼 **Admin Özellikleri**
- Kullanıcı yönetimi (öğrenci/öğretmen ekleme)
- Excel ile toplu kullanıcı ekleme
- Sistem genel bakış ve istatistikler
- Kullanıcı durumu yönetimi

### 🎨 **Modern UI/UX**
- Tailwind CSS ile responsive tasarım
- Course code renk kodları (BLM=mavi, COM=yeşil)
- Loading states ve error handling
- Professional dashboard design

## 📦 Teknolojiler

- **React 18+** - Modern React hooks ve functional components
- **React Router** - Sayfa yönlendirme
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Lucide React** - Modern icon library
- **Context API** - State management

## 🛠️ Kurulum

### Gereksinimler
- Node.js 16+ 
- npm veya yarn

### Kurulum Adımları

1. **Dependencies'leri yükleyin:**
```bash
npm install
```

2. **Environment variables:**
```bash
# .env dosyası oluşturun
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Uygulamayı başlatın:**
```bash
npm start
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📁 Proje Yapısı

```
src/
├── components/          # Reusable UI components
│   ├── Layout.js       # Ana layout komponenti
│   ├── ProjectCard.js  # Proje kartı komponenti
│   ├── *Modal.js       # Modal komponentleri
│   └── ...
├── pages/              # Sayfa komponentleri
│   ├── Login.js        # Giriş sayfası
│   ├── *Dashboard.js   # Dashboard sayfaları
│   ├── Settings.js     # Ayarlar sayfası
│   └── ...
├── services/           # API service katmanı
│   ├── authService.js  # Kimlik doğrulama servisi
│   ├── projectService.js # Proje servisi
│   └── adminService.js # Admin servisi
├── context/            # React Context
│   └── AuthContext.js  # Kimlik doğrulama context
├── utils/              # Utility fonksiyonları
└── styles/             # CSS dosyaları
    └── index.css       # Global styles ve Tailwind
```


## 🌍 API Entegrasyonu

Backend API ile entegrasyon için service katmanı kullanılmaktadır:

- `authService.js` - Authentication işlemleri
- `projectService.js` - Proje CRUD işlemleri
- `adminService.js` - Admin panel işlemleri

## 🎯 Course Code Sistemi

- **BLM kursları** - Türkçe projeler (mavi renk)
- **COM kursları** - İngilizce projeler (yeşil renk)
- Öğrenciler sadece kendi course code grubundaki projeleri görür

## 🔐 Authentication Flow

1. Kullanıcı rol seçimi (Öğrenci/Öğretmen/Admin)
2. Credentials ile giriş
3. JWT token local storage'a kaydedilir
4. Protected routes token ile korunur
5. Token süresi dolduğunda otomatik logout




