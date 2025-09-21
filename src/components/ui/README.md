# Custom Alert System

This directory contains a professional custom alert/modal system that replaces browser alerts with styled, accessible components that match the VS Code-inspired design.

## Components

### CustomAlert
A professional modal component with glassmorphism design and VS Code theming.

**Features:**
- Professional glassmorphism styling
- VS Code color scheme integration
- Keyboard accessibility (Escape/Enter support)
- Backdrop click to close
- Multiple alert types (info, warning, success, error)
- Customizable buttons and actions
- Animation effects

## Hooks

### useCustomAlert
A reusable hook that provides alert functionality throughout the application.

**Usage:**
```jsx
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from './CustomAlert';

const MyComponent = () => {
  const { 
    alertConfig, 
    closeAlert, 
    showInfoAlert, 
    showWarningAlert, 
    showSuccessAlert, 
    showErrorAlert,
    showConfirmDialog 
  } = useCustomAlert();

  const handleAction = () => {
    showInfoAlert('Success', 'Operation completed successfully!');
  };

  const handleDelete = () => {
    showConfirmDialog(
      'Delete Item',
      'Are you sure you want to delete this item? This action cannot be undone.',
      () => {
        // Perform delete action
        console.log('Item deleted');
      },
      { isDangerous: true, confirmText: 'Delete' }
    );
  };

  return (
    <div>
      <button onClick={handleAction}>Show Info</button>
      <button onClick={handleDelete}>Delete Item</button>
      
      <CustomAlert
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
        showCancel={alertConfig.showCancel}
        isDangerous={alertConfig.isDangerous}
      />
    </div>
  );
};
```

## Alert Types

### Info Alert
```jsx
showInfoAlert('Information', 'This is an informational message.');
```

### Success Alert
```jsx
showSuccessAlert('Success', 'Operation completed successfully!');
```

### Warning Alert
```jsx
showWarningAlert('Warning', 'This action may have consequences.', () => {
  console.log('User confirmed');
});
```

### Error Alert
```jsx
showErrorAlert('Error', 'Something went wrong. Please try again.');
```

### Custom Confirm Dialog
```jsx
showConfirmDialog(
  'Confirm Action',
  'Are you sure you want to proceed?',
  () => { console.log('Confirmed'); },
  {
    type: 'warning',
    confirmText: 'Yes, Proceed',
    cancelText: 'No, Cancel',
    isDangerous: true
  }
);
```

## Styling

The alert system uses:
- VS Code color tokens for consistent theming
- Glassmorphism effects with backdrop-blur
- Professional spacing using the 8px grid system
- FontAwesome icons for visual indicators
- Smooth animations with scale-in effects

## Accessibility

- **Keyboard Navigation**: Supports Escape to close and Enter to confirm
- **Focus Management**: Prevents body scroll when modal is open
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Uses VS Code's accessible color scheme

## Migration from Browser Alerts

Replace browser alerts throughout the application:

**Before:**
```jsx
if (window.confirm('Delete this item?')) {
  deleteItem();
}
```

**After:**
```jsx
showConfirmDialog(
  'Delete Item',
  'Are you sure you want to delete this item?',
  deleteItem,
  { isDangerous: true }
);
```

This provides a much more professional user experience while maintaining the same functionality.