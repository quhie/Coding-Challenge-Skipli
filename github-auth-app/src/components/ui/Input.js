import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Input component with animations and variants
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='default'] - Input variant (default, outline, filled)
 * @param {string} [props.size='md'] - Input size (sm, md, lg)
 * @param {string} [props.type='text'] - Input type
 * @param {string} [props.label] - Input label
 * @param {string} [props.placeholder] - Input placeholder
 * @param {string} [props.error] - Error message
 * @param {string} [props.helperText] - Helper text
 * @param {string} [props.id] - Input id
 * @param {string} [props.name] - Input name
 * @param {string} [props.value] - Input value
 * @param {Function} [props.onChange] - Change handler
 * @param {Function} [props.onFocus] - Focus handler
 * @param {Function} [props.onBlur] - Blur handler
 * @param {boolean} [props.isDisabled=false] - Disabled state
 * @param {boolean} [props.isRequired=false] - Required state
 * @param {boolean} [props.isFullWidth=false] - Whether input should take full width
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} [props.leftIcon] - Icon to display on the left
 * @param {React.ReactNode} [props.rightIcon] - Icon to display on the right
 * @returns {JSX.Element} Input component
 */
const Input = forwardRef(({
  variant = 'default',
  size = 'md',
  type = 'text',
  label,
  placeholder,
  error,
  helperText,
  id,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  isDisabled = false,
  isRequired = false,
  isFullWidth = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Generate a unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Base styles for all inputs
  const baseStyles = 'transition-all duration-200 rounded-lg focus:outline-none';
  
  // Variant styles
  const variantStyles = {
    default: `border ${
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800'
    } dark:bg-gray-700 dark:text-white`,
    outline: `border-2 ${
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
        : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-200 dark:focus:ring-blue-800'
    } dark:bg-gray-700 dark:text-white`,
    filled: `border-0 ${
      error
        ? 'bg-red-50 dark:bg-red-900/20 focus:ring-red-200'
        : 'bg-gray-100 dark:bg-gray-600 focus:ring-blue-200 dark:focus:ring-blue-800'
    } dark:text-white`,
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-3 text-lg',
  };
  
  // Icon padding adjustment
  const leftPadding = leftIcon ? (
    size === 'sm' ? 'pl-8' : 
    size === 'md' ? 'pl-10' :
    'pl-12'
  ) : '';
  
  const rightPadding = rightIcon ? (
    size === 'sm' ? 'pr-8' : 
    size === 'md' ? 'pr-10' :
    'pr-12'
  ) : '';
  
  // Disabled and width styles
  const disabledStyles = isDisabled ? 'opacity-60 cursor-not-allowed' : '';
  const widthStyles = isFullWidth ? 'w-full' : '';
  
  // Combine all styles
  const inputStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${leftPadding} ${rightPadding} ${disabledStyles} ${widthStyles} ${className}`;
  
  // Focus and blur handlers
  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };
  
  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };
  
  // Icon size based on input size
  const getIconSize = () => {
    switch(size) {
      case 'sm': return 'w-4 h-4';
      case 'lg': return 'w-6 h-6';
      default: return 'w-5 h-5';
    }
  };
  
  // Icon container positioning
  const leftIconContainer = leftIcon && (
    <div className={`absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400 dark:text-gray-500 ${isFocused ? 'text-blue-500 dark:text-blue-400' : ''}`}>
      {React.cloneElement(leftIcon, { className: `${getIconSize()} ${leftIcon.props.className || ''}` })}
    </div>
  );
  
  const rightIconContainer = rightIcon && (
    <div className={`absolute top-1/2 transform -translate-y-1/2 right-3 text-gray-400 dark:text-gray-500 ${isFocused ? 'text-blue-500 dark:text-blue-400' : ''}`}>
      {React.cloneElement(rightIcon, { className: `${getIconSize()} ${rightIcon.props.className || ''}` })}
    </div>
  );

  return (
    <div className={`relative ${isFullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className={`block mb-2 text-sm font-medium ${
            error 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIconContainer}
        
        <motion.input
          id={inputId}
          ref={ref}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={isDisabled}
          required={isRequired}
          className={inputStyles}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
          {...props}
        />
        
        {rightIconContainer}
      </div>
      
      {(error || helperText) && (
        <motion.p 
          className={`mt-1.5 text-sm ${
            error 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error || helperText}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 