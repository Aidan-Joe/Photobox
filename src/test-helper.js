/**
 * Quick Testing Guide untuk Photobox
 * 
 * Gunakan booking code di bawah untuk testing di aplikasi
 */

// ============ VALID BOOKING CODES UNTUK TESTING ============

console.log('%c📸 Photobox Testing Guide', 'font-size: 18px; font-weight: bold; color: #ff6b6b');
console.log('Gunakan salah satu booking code di bawah untuk test:');
console.log('%cBOOKING001', 'color: #51cf66; font-weight: bold');
console.log('%cBOOKING002', 'color: #51cf66; font-weight: bold');
console.log('%cTEST123', 'color: #51cf66; font-weight: bold');

// ============ PRINT OPTIONS (akan di-display otomatis) ============
/*
1. 4x6 Polaroid - Rp 35.000 (1 lembar)
2. 5x7 Postcard - Rp 50.000 (1 lembar)
3. A6 Mini Album (10 foto) - Rp 150.000
4. A5 Keychain (8 foto) - Rp 120.000
*/

// ============ FRAMES (akan di-display otomatis) ============
/*
1. Classic 🖼️
2. Fun 🎨
3. Elegant ✨
4. Modern 🌈
*/

// ============ FLOW TESTING ============
/*
1. Buka aplikasi
2. Di halaman Input Booking:
   - Ketik: BOOKING001 (atau BOOKING002)
   - Klik "Verifikasi"
   
3. Di halaman Print Option:
   - Pilih salah satu paket
   
4. Di halaman Payment:
   - Klik "Sudah Bayar?"
   - Aplikasi akan simulasikan payment success dalam 3-6 detik
   
5. Di halaman Frame:
   - Pilih salah satu frame
   - Kamera akan otomatis start
   
6. Capture Mode:
   - Tunggu countdown 3-2-1
   - Sistem akan auto capture 10 foto (15 detik per foto)
   
7. Preview Mode:
   - Pilih foto yang mau dicetak (min 1)
   - Timer: 7 menit untuk review
   - Klik "Lanjut ke Email"
   
8. Email Input:
   - Masukkan email (bisa sembarang untuk testing)
   - Klik "Upload & Kirim"
   
9. Done:
   - Klik "Kembali ke Awal" untuk reset
*/

// ============ DEVELOPER TIPS ============
/*
📌 Untuk melihat debug logs:
   - Buka Browser DevTools (F12)
   - Tab Console
   - Lihat [MOCK] messages untuk tracking

📌 Jika ingin rubah ke Real API (CI4):
   - Edit file: src/hooks/usePhotoboxWorkflow.js
   - Ubah: const USE_MOCK_MODE = true
   - Jadi: const USE_MOCK_MODE = false
   - Update .env dengan CI4 URL yang benar

📌 Untuk speed up payment testing:
   - Edit: src/App.jsx
   - Ubah paymentPollRef interval dari 2000ms ke 500ms

📌 Untuk extend preview timer:
   - Edit: src/App.jsx
   - Ubah: setPreviewTimer(420) 
   - Ke: setPreviewTimer(1200) // 20 menit
*/

// ============ EXAMPLE CURL COMMANDS ============
/*
# Test Verify Booking (jika backend siap)
curl -X POST http://localhost:8080/api/customer/booking/verify \
  -H "Content-Type: application/json" \
  -d '{"booking_code":"BOOKING001"}'

# Test Get Print Options
curl -X GET "http://localhost:8080/api/customer/print-options?booking_code=BOOKING001"

# Test Get Frames
curl -X GET http://localhost:8080/api/customer/frames

# Test Generate Payment QR
curl -X POST http://localhost:8080/api/payment/qr \
  -H "Content-Type: application/json" \
  -d '{"booking_id":1,"print_option_id":1}'
*/

// ============ MOCK DATA STRUCTURE ============
export const mockTestData = {
  bookingCodes: ['BOOKING001', 'BOOKING002', 'TEST123'],
  
  printOptions: [
    { id: 1, name: '4x6 Polaroid', price: 'Rp 35.000' },
    { id: 2, name: '5x7 Postcard', price: 'Rp 50.000' },
    { id: 3, name: 'A6 Mini Album (10 foto)', price: 'Rp 150.000' },
    { id: 4, name: 'A5 Keychain (8 foto)', price: 'Rp 120.000' },
  ],
  
  frames: [
    { id: 1, name: 'Classic', icon: '🖼️' },
    { id: 2, name: 'Fun', icon: '🎨' },
    { id: 3, name: 'Elegant', icon: '✨' },
    { id: 4, name: 'Modern', icon: '🌈' },
  ],
};

console.log('%c✅ Testing Mode Enabled', 'color: #51cf66; font-weight: bold');
console.log('Mock Data tersedia di: src/mockData.js');
console.log('Testing Guide tersedia di: TESTING_GUIDE.md');
