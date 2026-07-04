import { CONFIG, ENDPOINTS } from '../config.js';

const API_BASE = CONFIG.API_URL;

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Upload file (multipart/form-data)
  async uploadFile(endpoint, formData) {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header for FormData (browser will set it automatically)
    });

    if (!response.ok) {
      throw new Error(`Upload Error: ${response.status}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();

// ============ BOOKING API ============
export const bookingAPI = {
  // Verify booking dengan booking_code atau qr_code
  verifyBooking: (data) =>
    apiClient.post(ENDPOINTS.BOOKING_VERIFY, data),
  // data: { booking_code: string } atau { qr_code: string }

  // Create dynamic walk-in booking
  createWalkinBooking: () =>
    apiClient.post('/customer/booking/create-walkin', {}),

  // Get print options berdasarkan booking_code
  getPrintOptions: (bookingCode) =>
    apiClient.get(`${ENDPOINTS.PRINT_OPTIONS}?booking_code=${bookingCode}`),

  // Get available frames
  getFrames: () =>
    apiClient.get(ENDPOINTS.FRAMES),
};

// ============ PAYMENT API ============
export const paymentAPI = {
  // Generate QR payment
  generateQR: (data) =>
    apiClient.post(ENDPOINTS.PAYMENT_QR, data),
  // data: { booking_id: number, print_option_id: number }

  // Get payment status
  getPaymentStatus: (paymentId) =>
    apiClient.get(ENDPOINTS.PAYMENT_STATUS.replace('{paymentId}', paymentId)),

  // Midtrans callback handler
  midtransCallback: (data) =>
    apiClient.post(ENDPOINTS.PAYMENT_CALLBACK, data),
  // data: { order_id: string, transaction_status: string }
};

// ============ SESSION API ============
export const sessionAPI = {
  // Start a session
  startSession: (data) =>
    apiClient.post(ENDPOINTS.SESSION_START, data),
  // data: { booking_id: number, frame_id: number, filter_id: number }

  // Upload photos to session
  uploadPhotos: (sessionId, files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos[]', file);
    });
    return apiClient.uploadFile(
      ENDPOINTS.SESSION_UPLOAD.replace('{sessionId}', sessionId),
      formData
    );
  },

  // Send session result via email
  sendEmail: (sessionId, email) =>
    apiClient.post(
      ENDPOINTS.SESSION_EMAIL.replace('{sessionId}', sessionId),
      { email }
    ),

  // Complete session
  completeSession: (sessionId) =>
    apiClient.post(
      ENDPOINTS.SESSION_COMPLETE.replace('{sessionId}', sessionId),
      {}
    ),
};

// ============ COMBINED WORKFLOW API ============
export const photoboxAPI = {
  // Full workflow: verify -> get options -> get frames -> etc
  async completeWorkflow(bookingData, printOptionId, frameId, filterId, photoFiles, email) {
    try {
      // 1. Verify booking
      const bookingResult = await bookingAPI.verifyBooking(bookingData);
      const bookingId = bookingResult.data?.booking_id;

      if (!bookingId) throw new Error('Invalid booking');

      // 2. Generate payment QR
      const paymentResult = await paymentAPI.generateQR({
        booking_id: bookingId,
        print_option_id: printOptionId,
      });
      const paymentId = paymentResult.data?.payment_id;

      // 3. Start session
      const sessionResult = await sessionAPI.startSession({
        booking_id: bookingId,
        frame_id: frameId,
        filter_id: filterId,
      });
      const sessionId = sessionResult.data?.session_id;

      if (!sessionId) throw new Error('Failed to create session');

      // 4. Upload photos
      if (photoFiles && photoFiles.length > 0) {
        await sessionAPI.uploadPhotos(sessionId, photoFiles);
      }

      // 5. Send email
      if (email) {
        await sessionAPI.sendEmail(sessionId, email);
      }

      // 6. Complete session
      await sessionAPI.completeSession(sessionId);

      return {
        success: true,
        bookingId,
        paymentId,
        sessionId,
      };
    } catch (error) {
      console.error('Workflow error:', error);
      throw error;
    }
  },
};
