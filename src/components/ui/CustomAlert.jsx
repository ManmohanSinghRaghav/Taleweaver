// CustomAlert - Professional alert/modal system with glassmorphism design
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faExclamationTriangle, faInfoCircle, faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const CustomAlert = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'info', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  showCancel = true,
  isDangerous = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return faExclamationTriangle;
      case 'success':
        return faCheckCircle;
      case 'error':
        return faTimesCircle;
      default:
        return faInfoCircle;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = React.useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && !e.shiftKey) {
      if (onConfirm) {
        onConfirm();
      } else {
        onClose();
      }
    }
  }, [onClose, onConfirm]);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-base bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="glass-panel w-full max-w-md mx-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-lg border-b border-mono-200/20 dark:border-mono-700/20">
          <div className="flex items-center gap-sm">
            <FontAwesomeIcon 
              icon={getIcon()} 
              className={`w-5 h-5 ${getIconColor()}`}
            />
            <h3 className="text-lg font-light text-mono-800 dark:text-mono-200">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="glass-button-sm text-mono-600 dark:text-mono-400 hover:text-mono-800 dark:hover:text-mono-200"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-lg">
          <div className="text-sm text-mono-700 dark:text-mono-300 leading-relaxed whitespace-pre-line">
            {message}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-sm p-lg border-t border-mono-200/20 dark:border-mono-700/20">
          {showCancel && (
            <button
              onClick={onClose}
              className="glass-button text-sm font-light px-base py-xs text-mono-600 dark:text-mono-400"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`glass-button text-sm font-light px-base py-xs ${
                isDangerous 
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-500/10' 
                  : 'text-blue-600 dark:text-blue-400 hover:bg-blue-500/10'
              }`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;