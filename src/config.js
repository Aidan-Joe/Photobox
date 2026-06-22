// Configuration
export const CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  TIMEOUT: 30000,
};

// API Endpoints mapping
export const ENDPOINTS = {
  // Booking
  BOOKING_VERIFY: '/customer/booking/verify',
  PRINT_OPTIONS: '/customer/print-options',
  FRAMES: '/customer/frames',

  // Payment
  PAYMENT_QR: '/payment/qr',
  PAYMENT_STATUS: '/payment/{paymentId}/status',
  PAYMENT_CALLBACK: '/payment/midtrans/callback',

  // Session
  SESSION_START: '/session/start',
  SESSION_UPLOAD: '/photo/session/{sessionId}/upload',
  SESSION_EMAIL: '/session/{sessionId}/email',
  SESSION_COMPLETE: '/session/{sessionId}/complete',
};
