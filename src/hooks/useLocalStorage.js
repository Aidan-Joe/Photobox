import { useState, useEffect } from 'react';

/**
 * Custom hook untuk localStorage
 * Simpan & ambil data dari browser localStorage
 * Data tetap ada meski halaman di-refresh
 */
export function useLocalStorage(key, initialValue = null) {
  // State untuk value saat ini
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Ambil dari localStorage
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });

  // Function untuk set value (simpan ke localStorage)
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  // Function untuk hapus dari localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  };

  return [storedValue, setValue, removeValue];
}
