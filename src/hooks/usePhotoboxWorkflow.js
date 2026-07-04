import { useState } from 'react';
import {
  bookingAPI,
  paymentAPI,
  sessionAPI,
} from '../services/api.js';

export function usePhotoboxWorkflow() {
  const [state, setState] = useState({
    step: 'idle',
    bookingId: null,
    paymentId: null,
    sessionId: null,
    printOptions: [],
    frames: [],
    categories: [],
    filters: [],
    error: null,
    loading: false,
    mockMode: false,
  });

  // STEP 1 - VERIFY BOOKING
  const verifyBooking = async (bookingCodeOrQR) => {
    setState(prev => ({
      ...prev,
      step: 'verifying',
      loading: true,
      error: null,
    }));

    try {
      console.log('🔍 Verifying booking:', bookingCodeOrQR);

      const bookingResult = await bookingAPI.verifyBooking({
        booking_code: bookingCodeOrQR,
      });

      const bookingId = bookingResult.booking?.id;

      if (!bookingId) {
        throw new Error('Booking tidak ditemukan');
      }

      const printOptionsResult =
        await bookingAPI.getPrintOptions(bookingCodeOrQR);

      const framesResult =
        await bookingAPI.getFrames();

      const printOptions =
        printOptionsResult.print_options || [];

      const frames =
        framesResult.frames || [];

      const categories =
        framesResult.categories || [];

      const filters =
        framesResult.filters || [];

      setState(prev => ({
        ...prev,
        step: 'verified',
        bookingId,
        printOptions,
        frames,
        categories,
        filters,
        loading: false,
      }));

      return {
        bookingId,
        printOptions,
        frames,
        filters,
      };
    } catch (error) {
      console.error(error);

      setState(prev => ({
        ...prev,
        step: 'error',
        error: error.message,
        loading: false,
      }));

      throw error;
    }
  };

  const createWalkinBooking = async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      console.log('⚡ Creating walk-in booking...');
      const result = await bookingAPI.createWalkinBooking();
      const bookingCode = result.booking?.booking_code;

      if (!bookingCode) {
        throw new Error('Gagal membuat walk-in booking.');
      }

      return await verifyBooking(bookingCode);
    } catch (error) {
      console.error(error);
      setState(prev => ({
        ...prev,
        step: 'error',
        error: error.message,
        loading: false,
      }));
      throw error;
    }
  };

  // STEP 2 - GENERATE PAYMENT QR
  const generatePaymentQR = async (printOptionId) => {
    setState(prev => ({
      ...prev,
      step: 'paying',
      loading: true,
      error: null,
    }));

    try {
      const result = await paymentAPI.generateQR({
        booking_id: state.bookingId,
        print_option_id: printOptionId,
      });

      const paymentId =
        result.payment?.id ||
        result.payment_id;

      setState(prev => ({
        ...prev,
        paymentId,
        loading: false,
      }));

      return {
        paymentId,
        payment: result.payment,
        midtrans: result.midtrans,
      };
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

  // STEP 3 - CHECK PAYMENT STATUS
  const checkPaymentStatus = async (paymentId) => {
    try {
      const result =
        await paymentAPI.getPaymentStatus(paymentId);

      return (
        result.payment?.status ||
        'pending'
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // SIMULATE PAYMENT SUCCESS FOR DEV MODE
  const simulatePaymentSuccess = async (paymentId) => {
    try {
      await paymentAPI.midtransCallback({
        order_id: paymentId || state.paymentId,
        transaction_status: 'settlement',
      });
    } catch (error) {
      console.error('Simulating payment success failed:', error);
      throw error;
    }
  };

  // STEP 4 - START SESSION
  const startSession = async (frameId, filterId) => {
    setState(prev => ({
      ...prev,
      step: 'processing',
      loading: true,
      error: null,
    }));

    try {
      const result =
        await sessionAPI.startSession({
          booking_id: state.bookingId,
          frame_id: frameId,
          filter_id: filterId,
        });

      const sessionId =
        result.session?.id;

      if (!sessionId) {
        throw new Error('Session gagal dibuat');
      }

      setState(prev => ({
        ...prev,
        sessionId,
        loading: false,
      }));

      return {
        sessionId,
        session: result.session,
      };
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

  // STEP 5 - UPLOAD PHOTOS
  const uploadPhotos = async (files) => {
    setState(prev => ({
      ...prev,
      step: 'uploading',
      loading: true,
      error: null,
    }));

    try {
      const result =
        await sessionAPI.uploadPhotos(
          state.sessionId,
          files
        );

      setState(prev => ({
        ...prev,
        loading: false,
      }));

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

  // STEP 6 - SAVE EMAIL
  const sendSessionEmail = async (email) => {
    return await sessionAPI.sendEmail(
      state.sessionId,
      email
    );
  };

  // STEP 7 - COMPLETE SESSION
  const completeSession = async () => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const result =
        await sessionAPI.completeSession(
          state.sessionId
        );

      setState(prev => ({
        ...prev,
        step: 'complete',
        loading: false,
      }));

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

  const reset = () => {
    setState({
      step: 'idle',
      bookingId: null,
      paymentId: null,
      sessionId: null,
      printOptions: [],
      frames: [],
      categories: [],
      filters: [],
      error: null,
      loading: false,
      mockMode: false,
    });
  };

  return {
    ...state,

    verifyBooking,
    createWalkinBooking,
    generatePaymentQR,
    checkPaymentStatus,
    simulatePaymentSuccess,
    startSession,
    uploadPhotos,
    sendSessionEmail,
    completeSession,
    reset,
  };
}