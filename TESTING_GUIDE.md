/**
 * Contoh Testing Photobox dengan Mock Data
 * 
 * Untuk testing tanpa backend CI4, gunakan file ini sebagai reference
 */

// ============ CONTOH BOOKING CODE UNTUK TESTING ============

const VALID_BOOKING_CODES = [
  'BOOKING001',  // ✅ Valid
  'BOOKING002',  // ✅ Valid
  'TEST123',     // ✅ Valid
];

// ============ CONTOH DATA STRUKTUR API ============

/**
 * POST /api/customer/booking/verify
 * Request:
 */
const bookingVerifyRequest = {
  booking_code: 'BOOKING001',
  // atau
  // qr_code: 'data:image/png;base64,...'
};

/**
 * Response dari verify booking:
 */
const bookingVerifyResponse = {
  success: true,
  data: {
    booking_id: 1,
    booking_code: 'BOOKING001',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    booking_date: '2025-05-17',
    session_time: '10:00',
    valid: true,
  },
};

/**
 * GET /api/customer/print-options?booking_code=BOOKING001
 * Response:
 */
const printOptionsResponse = {
  success: true,
  data: [
    {
      id: 1,
      name: '4x6 Polaroid',
      price: 35000,
      size: '4x6',
      quantity: 1,
    },
    {
      id: 2,
      name: '5x7 Postcard',
      price: 50000,
      size: '5x7',
      quantity: 1,
    },
    {
      id: 3,
      name: 'A6 Mini Album (10 foto)',
      price: 150000,
      size: 'A6',
      quantity: 10,
    },
  ],
};

/**
 * GET /api/customer/frames
 * Response:
 */
const framesResponse = {
  success: true,
  data: [
    {
      id: 1,
      name: 'Classic',
      icon: '🖼️',
      template_url: '/templates/classic.png',
    },
    {
      id: 2,
      name: 'Fun',
      icon: '🎨',
      template_url: '/templates/fun.png',
    },
    {
      id: 3,
      name: 'Elegant',
      icon: '✨',
      template_url: '/templates/elegant.png',
    },
  ],
};

/**
 * POST /api/payment/qr
 * Request:
 */
const paymentQRRequest = {
  booking_id: 1,
  print_option_id: 1,
};

/**
 * Response:
 */
const paymentQRResponse = {
  success: true,
  data: {
    payment_id: 123,
    order_id: 'ORDER-001',
    amount: 35000,
    payment_method: 'qr_code',
    qr_code: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // base64 or URL
    expires_in: 900, // 15 menit dalam detik
  },
};

/**
 * GET /api/payment/123/status
 * Response:
 */
const paymentStatusResponse = {
  success: true,
  data: {
    payment_id: 123,
    status: 'settlement', // pending, waiting, settlement, failed
    amount: 35000,
    paid_at: '2025-05-17T10:35:00Z',
  },
};

/**
 * POST /api/session/start
 * Request:
 */
const sessionStartRequest = {
  booking_id: 1,
  frame_id: 1,
  filter_id: 1,
};

/**
 * Response:
 */
const sessionStartResponse = {
  success: true,
  data: {
    session_id: 456,
    booking_id: 1,
    frame_id: 1,
    max_photos: 10,
    photo_interval: 15, // detik
    time_limit: 600, // 10 menit total
  },
};

/**
 * POST /api/photo/session/456/upload
 * Request: FormData dengan files
 */
const photoUploadFormData = new FormData();
// photoUploadFormData.append('photos[]', file1);
// photoUploadFormData.append('photos[]', file2);
// etc

/**
 * Response:
 */
const photoUploadResponse = {
  success: true,
  data: {
    session_id: 456,
    photos_uploaded: 7,
    storage_urls: [
      '/uploads/SESSION-456/photo-1.jpg',
      '/uploads/SESSION-456/photo-2.jpg',
      // ...
    ],
  },
};

/**
 * POST /api/session/456/email
 * Request:
 */
const sessionEmailRequest = {
  email: 'john@example.com',
};

/**
 * Response:
 */
const sessionEmailResponse = {
  success: true,
  data: {
    session_id: 456,
    email: 'john@example.com',
    status: 'sent',
    message: 'Email telah dikirim',
  },
};

/**
 * POST /api/session/456/complete
 * Response:
 */
const sessionCompleteResponse = {
  success: true,
  data: {
    session_id: 456,
    status: 'completed',
    total_photos: 7,
    print_order_id: 789,
  },
};

// ============ TESTING DENGAN CURL ============

/**
 * Test Verify Booking:
 * 
 * curl -X POST http://localhost:8080/api/customer/booking/verify \
 *   -H "Content-Type: application/json" \
 *   -d '{"booking_code":"BOOKING001"}'
 */

/**
 * Test Generate Payment QR:
 * 
 * curl -X POST http://localhost:8080/api/payment/qr \
 *   -H "Content-Type: application/json" \
 *   -d '{"booking_id":1,"print_option_id":1}'
 */

/**
 * Test Upload Photos:
 * 
 * curl -X POST http://localhost:8080/api/photo/session/456/upload \
 *   -F "photos[]=@/path/to/photo1.jpg" \
 *   -F "photos[]=@/path/to/photo2.jpg"
 */

// ============ DEVELOPER MODE - MOCK BACKEND ============

/**
 * Untuk development tanpa backend CI4, bisa mock response di api.js
 * 
 * Tambahkan di src/services/api.js:
 * 
 * const USE_MOCK = true; // Set ke false untuk production
 * 
 * if (USE_MOCK) {
 *   return mockApiResponses.verifyBooking(data.booking_code);
 * }
 */

export {
  VALID_BOOKING_CODES,
  bookingVerifyRequest,
  bookingVerifyResponse,
  printOptionsResponse,
  framesResponse,
  paymentQRRequest,
  paymentQRResponse,
  paymentStatusResponse,
  sessionStartRequest,
  sessionStartResponse,
  photoUploadResponse,
  sessionEmailRequest,
  sessionEmailResponse,
  sessionCompleteResponse,
};
