/**
 * Data Dummy untuk Testing Photobox
 * Gunakan data ini untuk testing tanpa CI4 backend
 */

// ============ BOOKING DATA ============
export const mockBookingData = {
  BOOKING001: {
    id: 'BOOKING001',
    code: 'BOOKING001',
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '08123456789',
    booking_date: '2025-05-17',
    session_start: '10:00',
    status: 'active',
    remaining_time: 120, // menit
  },
  BOOKING002: {
    id: 'BOOKING002',
    code: 'BOOKING002',
    customer_name: 'Jane Smith',
    customer_email: 'jane@example.com',
    customer_phone: '08987654321',
    booking_date: '2025-05-17',
    session_start: '14:00',
    status: 'active',
    remaining_time: 90,
  },
  '842000': {
    id: '842000',
    code: '842000',
    customer_name: 'Aesthetic User',
    customer_email: 'user@cuitbox.com',
    customer_phone: '08122334455',
    booking_date: '2026-06-15',
    session_start: '15:00',
    status: 'active',
    remaining_time: 60,
  },
  '123456': {
    id: '123456',
    code: '123456',
    customer_name: 'Test Customer',
    customer_email: 'test@cuitbox.com',
    customer_phone: '08112233445',
    booking_date: '2026-06-15',
    session_start: '16:00',
    status: 'active',
    remaining_time: 60,
  },
  '654321': {
    id: '654321',
    code: '654321',
    customer_name: 'Regular Customer',
    customer_email: 'regular@cuitbox.com',
    customer_phone: '08998877665',
    booking_date: '2026-06-15',
    session_start: '17:00',
    status: 'active',
    remaining_time: 60,
  },
};

// ============ PRINT OPTIONS ============
export const mockPrintOptions = [
  {
    id: 1,
    name: '2 Cetak',
    price: 'Rp25.000',
    size: '4x6',
    quantity: 2,
    description: 'Classic duo for you and a friend. Physical 4×6 photostrips.',
  },
  {
    id: 2,
    name: '3 Cetak',
    price: 'Rp55.000',
    size: '4x6',
    quantity: 3,
    description: 'Triple the fun. Ideal for small groups or collage lovers.',
    isPopular: true,
  },
  {
    id: 3,
    name: '4 Cetak',
    price: 'Rp75.000',
    size: '4x6',
    quantity: 4,
    description: 'Full party pack. Enough for everyone to take a strip home.',
  },
  {
    id: 4,
    name: '5 Cetak',
    price: 'Rp85.000',
    size: '4x6',
    quantity: 5,
    description: 'Full party pack. Enough for everyone to take a strip home.',
  },
];

// ============ FRAMES / TEMPLATES ============
export const mockFrames = [
  {
    id: 1,
    name: 'Soft Cloud',
    category: 'Minimalist',
    description: 'Dreamy Pastel',
    preview_color: '#dbeafe',
  },
  {
    id: 2,
    name: 'Midnight Neon',
    category: 'Pop Art',
    description: 'Vibrant Pop',
    preview_color: '#111827',
  },
  {
    id: 3,
    name: 'Cherry Blossom',
    category: 'Seasonal',
    description: 'Seasonal Bloom',
    preview_color: '#fdf2f8',
  },
  {
    id: 4,
    name: 'Classic White',
    category: 'Minimalist',
    description: 'Timeless Minimal',
    preview_color: '#ffe4e6',
  },
  {
    id: 5,
    name: 'Kawaii Kitty',
    category: 'Cute',
    description: 'Playful Pink',
    preview_color: '#fee2e2',
  },
  {
    id: 6,
    name: 'Retro Wave',
    category: 'Pop Art',
    description: '80s Synthwave',
    preview_color: '#030712',
  },
];

// ============ FILTERS ============
export const mockFilters = [
  { id: 1, name: 'Normal', effect: 'normal' },
  { id: 2, name: 'B&W', effect: 'grayscale' },
  { id: 3, name: 'Sepia', effect: 'sepia' },
  { id: 4, name: 'Vintage', effect: 'vintage' },
];

// ============ MIDTRANS PAYMENT DATA ============
export const mockPaymentData = {
  'PAY001': {
    id: 'PAY001',
    order_id: 'ORDER-001',
    amount: 35000,
    payment_method: 'qr_code',
    status: 'pending', // pending, waiting, settlement, failed
    qr_code: 'https://via.placeholder.com/300?text=QR+Code+1',
    created_at: '2025-05-17T10:30:00Z',
    expires_at: '2025-05-17T10:45:00Z', // 15 menit
  },
  'PAY002': {
    id: 'PAY002',
    order_id: 'ORDER-002',
    amount: 150000,
    payment_method: 'qr_code',
    status: 'pending',
    qr_code: 'https://via.placeholder.com/300?text=QR+Code+2',
    created_at: '2025-05-17T11:00:00Z',
    expires_at: '2025-05-17T11:15:00Z',
  },
};

// ============ SESSION DATA ============
export const mockSessionData = {
  'SESSION001': {
    id: 'SESSION001',
    booking_id: 'BOOKING001',
    frame_id: 1,
    filter_id: 1,
    status: 'capturing', // capturing, completed, processing, done
    photos_captured: 0,
    photos_total: 10,
    created_at: '2025-05-17T10:35:00Z',
  },
};

// ============ TEST BOOKING CODES ============
export const testBookingCodes = [
  'BOOKING001',
  'BOOKING002',
  'TEST123',
  'QR-ABCD-1234',
  '842000',
  '123456',
  '654321',
];

// ============ HELPER: Generate Mock QR Code URL ============
export function generateMockQRCode(bookingCode) {
  // Gunakan API placeholder untuk generate QR code
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingCode)}`;
}

// ============ MOCK API RESPONSES ============
export const mockApiResponses = {
  // Verify Booking
  verifyBooking: (code) => ({
    success: true,
    data: {
      booking_id: code,
      customer_name: mockBookingData[code]?.customer_name || 'Test Customer',
      valid: true,
    },
  }),

  // Get Print Options
  getPrintOptions: () => ({
    success: true,
    data: mockPrintOptions,
  }),

  // Get Frames
  getFrames: () => ({
    success: true,
    data: mockFrames,
  }),

  // Generate Payment QR
  generatePaymentQR: (bookingId, printOptionId) => ({
    success: true,
    data: {
      payment_id: `PAY-${Date.now()}`,
      order_id: `ORDER-${bookingId}`,
      qr_code: generateMockQRCode(`PAY-${Date.now()}`),
      amount: mockPrintOptions[printOptionId - 1]?.price || 'Rp 35.000',
      expires_in: 900, // 15 menit
    },
  }),

  // Payment Status
  paymentStatus: (paymentId, status = 'pending') => ({
    success: true,
    data: {
      payment_id: paymentId,
      status: status, // pending, settlement, failed
      amount_received: 35000,
      timestamp: new Date().toISOString(),
    },
  }),

  // Start Session
  startSession: (bookingId, frameId, filterId) => ({
    success: true,
    data: {
      session_id: `SESSION-${Date.now()}`,
      booking_id: bookingId,
      frame_id: frameId,
      filter_id: filterId,
      max_photos: 10,
      time_limit: 600, // 10 menit
    },
  }),

  // Upload Photos
  uploadPhotos: (sessionId, photoCount) => ({
    success: true,
    data: {
      session_id: sessionId,
      photos_uploaded: photoCount,
      status: 'processing',
    },
  }),

  // Send Email
  sendEmail: (sessionId, email) => ({
    success: true,
    data: {
      session_id: sessionId,
      email: email,
      message: `Email sent to ${email}`,
      status: 'sent',
    },
  }),

  // Complete Session
  completeSession: (sessionId) => ({
    success: true,
    data: {
      session_id: sessionId,
      status: 'completed',
      timestamp: new Date().toISOString(),
    },
  }),
};
