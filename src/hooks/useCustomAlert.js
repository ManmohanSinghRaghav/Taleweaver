// useCustomAlert - Hook for using custom alerts throughout the app
import { useState, useCallback } from 'react';

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Cancel',
    showCancel: true,
    isDangerous: false,
  });

  const showAlert = useCallback((config) => {
    setAlertConfig({
      isOpen: true,
      title: config.title || 'Notification',
      message: config.message || '',
      type: config.type || 'info',
      onConfirm: config.onConfirm || null,
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || 'Cancel',
      showCancel: config.showCancel !== false,
      isDangerous: config.isDangerous || false,
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Specific alert types for common use cases
  const showInfoAlert = useCallback((title, message) => {
    showAlert({
      title,
      message,
      type: 'info',
      showCancel: false,
      confirmText: 'OK'
    });
  }, [showAlert]);

  const showWarningAlert = useCallback((title, message, onConfirm) => {
    showAlert({
      title,
      message,
      type: 'warning',
      onConfirm,
      isDangerous: true,
      confirmText: 'Proceed',
      cancelText: 'Cancel'
    });
  }, [showAlert]);

  const showSuccessAlert = useCallback((title, message) => {
    showAlert({
      title,
      message,
      type: 'success',
      showCancel: false,
      confirmText: 'Great!'
    });
  }, [showAlert]);

  const showErrorAlert = useCallback((title, message) => {
    showAlert({
      title,
      message,
      type: 'error',
      showCancel: false,
      confirmText: 'OK'
    });
  }, [showAlert]);

  const showConfirmDialog = useCallback((title, message, onConfirm, options = {}) => {
    showAlert({
      title,
      message,
      type: options.type || 'warning',
      onConfirm,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      isDangerous: options.isDangerous || false,
    });
  }, [showAlert]);

  return {
    alertConfig,
    showAlert,
    closeAlert,
    showInfoAlert,
    showWarningAlert,
    showSuccessAlert,
    showErrorAlert,
    showConfirmDialog,
  };
};