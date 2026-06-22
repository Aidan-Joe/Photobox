import { useState } from 'react';
import { mockApiResponses, testBookingCodes } from '../mockData.js';

// DEVELOPMENT MODE - Set ke true untuk testing tanpa backend
const USE_MOCK_MODE = true;

/**
 * Custom hook untuk mengelola Photobox workflow
 * Handles: booking verification → payment → session → photo upload → completion
 * 
 * Mock Mode: Set USE_MOCK_MODE = true untuk testing tanpa backend CI4
 */
export function usePhotoboxWorkflow() {
  const [state, setState] = useState({
    step: 'idle',
    bookingId: null,
    paymentId: null,
    sessionId: null,
    printOptions: [],
    frames: [],
    error: null,
    loading: false,
    mockMode: USE_MOCK_MODE,
  });

  // Helper: Delay untuk simulate network
  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  // Step 1: Verify booking
  const verifyBooking = async (bookingCodeOrQR) => {
    setState(prev => ({ ...prev, step: 'verifying', loading: true, error: null }));
    try {
      console.log('🧪 [MOCK] Verifying booking:', bookingCodeOrQR);
      await delay(800);

      if (!testBookingCodes.includes(bookingCodeOrQR)) {
        throw new Error('❌ Kode booking tidak valid! Gunakan: 842000, 123456, atau 654321');
      }

      const result = mockApiResponses.verifyBooking(bookingCodeOrQR);
      const bookingId = result.data?.booking_id;

      const printOpts = mockApiResponses.getPrintOptions();
      const framesData = mockApiResponses.getFrames();

      setState(prev => ({
        ...prev,
        step: 'verified',
        bookingId,
        printOptions: printOpts.data || [],
        frames: framesData.data || [],
        loading: false,
      }));

      console.log('✅ [MOCK] Booking verified:', bookingId);
      return { bookingId, printOptions: printOpts.data, frames: framesData.data };
    } catch (error) {
      setState(prev => ({
        ...prev,
        step: 'error',
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  };

  // Step 2: Generate payment QR
  const generatePaymentQR = async (printOptionId) => {
    setState(prev => ({ ...prev, step: 'paying', loading: true, error: null }));
    try {
      console.log('🧪 [MOCK] Generating payment QR for option:', printOptionId);
      await delay(600);

      const result = mockApiResponses.generatePaymentQR(state.bookingId, printOptionId);
      const paymentId = result.data?.payment_id;

      setState(prev => ({
        ...prev,
        paymentId,
        loading: false,
      }));

      console.log('✅ [MOCK] Payment QR generated:', paymentId);
      return { paymentId, qrCode: result.data?.qr_code };
    } catch (error) {
      setState(prev => ({
        ...prev,
        step: 'error',
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  };

  // Step 3: Check payment status
  const checkPaymentStatus = async (paymentId) => {
    try {
      console.log('🧪 [MOCK] Checking payment status:', paymentId);
      
      // Simulate payment processing - auto success
      const statuses = ['pending', 'waiting', 'settlement'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      console.log('✅ [MOCK] Payment status:', randomStatus);
      return randomStatus;
    } catch (error) {
      console.error('❌ Payment status check failed:', error);
      throw error;
    }
  };

  // Step 4: Start session
  const startSession = async (frameId, filterId) => {
    setState(prev => ({ ...prev, step: 'processing', loading: true, error: null }));
    try {
      console.log('🧪 [MOCK] Starting session with frame:', frameId);
      await delay(800);

      const result = mockApiResponses.startSession(state.bookingId, frameId, filterId);
      const sessionId = result.data?.session_id;

      setState(prev => ({
        ...prev,
        sessionId,
        loading: false,
      }));

      console.log('✅ [MOCK] Session started:', sessionId);
      return { sessionId };
    } catch (error) {
      setState(prev => ({
        ...prev,
        step: 'error',
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  };

  // Step 5: Upload photos
  const uploadPhotos = async (files) => {
    setState(prev => ({ ...prev, step: 'uploading', loading: true, error: null }));
    try {
      console.log('🧪 [MOCK] Uploading photos:', files.length);
      await delay(1000);

      const result = mockApiResponses.uploadPhotos(state.sessionId, files.length);

      setState(prev => ({ ...prev, loading: false }));

      console.log('✅ [MOCK] Photos uploaded:', files.length);
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        step: 'error',
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  };

  // Step 6: Send email
  const sendSessionEmail = async (email) => {
    try {
      console.log('🧪 [MOCK] Sending email to:', email);
      await delay(600);

      const result = mockApiResponses.sendEmail(state.sessionId, email);

      console.log('✅ [MOCK] Email sent to:', email);
      return result;
    } catch (error) {
      console.error('❌ Email send failed:', error);
      throw error;
    }
  };

  // Step 7: Complete session
  const completeSession = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      console.log('🧪 [MOCK] Completing session');
      await delay(500);

      const result = mockApiResponses.completeSession(state.sessionId);

      setState(prev => ({
        ...prev,
        step: 'complete',
        loading: false,
      }));

      console.log('✅ [MOCK] Session completed');
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        step: 'error',
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  };

  // Reset workflow
  const reset = () => {
    setState({
      step: 'idle',
      bookingId: null,
      paymentId: null,
      sessionId: null,
      printOptions: [],
      frames: [],
      error: null,
      loading: false,
      mockMode: USE_MOCK_MODE,
    });
  };

  return {
    // State
    ...state,

    // Actions
    verifyBooking,
    generatePaymentQR,
    checkPaymentStatus,
    startSession,
    uploadPhotos,
    sendSessionEmail,
    completeSession,
    reset,

    // Utils
    testBookingCodes,
  };
}

