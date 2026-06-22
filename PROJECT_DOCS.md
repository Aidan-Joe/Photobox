# 📁 Struktur Project Photobox

```
src/
├── App.jsx                    ← Main app dengan workflow lengkap
├── config.js                  ← Config & endpoints
├── index.css                  ← Global styles
├── main.jsx                   ← React entry point
├── App.css                    ← App styles
│
├── services/
│   └── api.js                 ← API client untuk CI4
│
└── hooks/                     ← Custom React hooks (reusable logic)
    ├── useAuth.js             ← Login/logout logic
    ├── useCamera.js           ← Camera access
    ├── useFetch.js            ← Generic API fetching
    ├── useLocalStorage.js     ← Browser storage
    └── usePhotoboxWorkflow.js ← Full workflow orchestration
```

---

## 🚀 Cara Pakai:

### 1. **Setup Environment**
```bash
cp .env.example .env
# Edit .env dengan URL CI4 Anda
```

### 2. **Install Dependencies**
```bash
npm install
```

### 3. **Jalankan Development**
```bash
npm start
```

---

## 📱 Workflow Aplikasi:

```
LOGIN
  ↓ (useAuth)
  ├─ Email/Password
  └─ Simpan ke localStorage
  
BOOKING
  ↓ (usePhotoboxWorkflow + useFetch)
  ├─ Masukkan booking code / scan QR
  ├─ Verifikasi dengan CI4
  └─ Ambil print options & frames
  
PAYMENT
  ↓ (usePhotoboxWorkflow)
  ├─ Generate QR code
  ├─ Customer scan & bayar
  └─ Check payment status
  
FOTO
  ↓ (useCamera)
  ├─ Start camera
  ├─ Ambil 3 foto
  └─ Review hasil
  
UPLOAD
  ↓ (usePhotoboxWorkflow)
  ├─ Upload ke CI4
  ├─ Kirim ke email
  └─ Complete session
  
SELESAI ✅
```

---

## 📚 Dokumentasi Hooks:

### **useAuth** 🔐
```javascript
const auth = useAuth();

// Properties
auth.user              // { id, email, name }
auth.token            // JWT token
auth.isLoggedIn       // boolean
auth.loading          // loading state
auth.error            // error message

// Methods
await auth.login(email, password)
await auth.register(email, password, name)
auth.logout()
```

### **useCamera** 📷
```javascript
const camera = useCamera();

// Properties
camera.videoRef       // DOM ref untuk <video>
camera.canvasRef      // DOM ref untuk canvas
camera.isActive       // boolean
camera.error          // error message

// Methods
await camera.startCamera('user')      // front camera
await camera.startCamera('environment') // back camera
const photo = await camera.takePhoto()
await camera.takeMultiplePhotos(3)
camera.stopCamera()
```

### **useFetch** 🔗
```javascript
const { data, loading, error, refetch } = useFetch('/api/frames');

// Auto-fetch on mount, re-fetch when endpoint changes
// Refetch manually: refetch()
```

### **useLocalStorage** 💾
```javascript
const [value, setValue, removeValue] = useLocalStorage('key', defaultValue);

setValue(newValue)    // Simpan
removeValue()         // Hapus
// Auto-persist ke browser storage
```

### **usePhotoboxWorkflow** 🎬
```javascript
const workflow = usePhotoboxWorkflow();

// State
workflow.step         // 'idle', 'verifying', 'paying', etc
workflow.bookingId
workflow.sessionId
workflow.error
workflow.loading

// Methods
await workflow.verifyBooking(code)
await workflow.generatePaymentQR(printOptionId)
await workflow.startSession(frameId, filterId)
await workflow.uploadPhotos(files)
await workflow.sendSessionEmail(email)
await workflow.completeSession()
workflow.reset()
```

---

## 🔌 API Integration:

Semua endpoint dari CI4 sudah di-config di `src/config.js`:

```javascript
POST /api/customer/booking/verify
GET  /api/customer/print-options
GET  /api/customer/frames
POST /api/payment/qr
GET  /api/payment/{paymentId}/status
POST /api/session/start
POST /api/photo/session/{sessionId}/upload
POST /api/session/{sessionId}/email
POST /api/session/{sessionId}/complete
```

---

## 🛠️ Development Tips:

1. **Environment Variables** → Edit `.env`
2. **Mock Data** → `useAuth` punya mock login untuk dev
3. **localStorage** → Data persist bahkan setelah refresh
4. **Error Handling** → Setiap hook punya error state

---

## 📦 Build untuk Production:

```bash
npm run build
npm run preview
```

Output akan di folder `dist/`

---

**Happy Coding! 🚀**
