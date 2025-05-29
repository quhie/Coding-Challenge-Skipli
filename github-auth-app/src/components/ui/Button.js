import React from 'react';
import { motion } from 'framer-motion';

/**
 * Button component with animations and variants
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='primary'] - Button variant (primary, secondary, outline, danger, success)
 * @param {string} [props.size='md'] - Button size (sm, md, lg)
 * @param {boolean} [props.isLoading=false] - Loading state
 * @param {boolean} [props.isFullWidth=false] - Whether button should take full width
 * @param {boolean} [props.isDisabled=false] - Disabled state
 * @param {React.ReactNode} props.children - Button content
 * @param {Function} [props.onClick] - Click handler
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.type='button'] - Button type
 * @returns {JSX.Element} Button component
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isFullWidth = false,
  isDisabled = false,
  children,
  onClick,
  className = '',
  type = 'button',
  ...props
}) => {
  // Base styles for all buttons
  const baseStyles = 'relative font-medium rounded-lg focus:outline-none transition-all';
  
  // Variant styles
  const variantStyles = {
    primary: `bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-md`,
    secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200',
    outline: 'border border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    glass: 'backdrop-blur-md bg-white/10 dark:bg-black/20 border border-white/20 dark:border-gray-700/30 text-gray-800 dark:text-white hover:bg-white/20 dark:hover:bg-black/30',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Disabled and width styles
  const disabledStyles = isDisabled || isLoading ? 'opacity-70 cursor-not-allowed' : '';
  const widthStyles = isFullWidth ? 'w-full' : '';
  
  // Combine all styles
  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles} ${className}`;
  
  // Animation variants
  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    },
    disabled: {
      scale: 1,
    }
  };

  return (
    <motion.button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      whileHover={!isDisabled && !isLoading ? 'hover' : 'disabled'}
      whileTap={!isDisabled && !isLoading ? 'tap' : 'disabled'}
      variants={buttonVariants}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="opacity-0">{children}</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button; 