import React from 'react';
import { motion } from 'framer-motion';

/**
 * Card component with animations and variants
 * 
 * @param {Object} props - Component props
 * @param {string} [props.variant='default'] - Card variant (default, elevated, outline, glass)
 * @param {boolean} [props.isHoverable=false] - Whether card should have hover effect
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onClick] - Click handler
 * @returns {JSX.Element} Card component
 */
const Card = ({
  variant = 'default',
  isHoverable = false,
  children,
  className = '',
  onClick,
  ...props
}) => {
  // Base styles for all cards
  const baseStyles = 'rounded-xl overflow-hidden transition-all duration-300';
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg',
    outline: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    glass: 'backdrop-blur-md bg-white/70 dark:bg-gray-800/70 border border-white/20 dark:border-gray-700/30',
  };
  
  // Hover styles
  const hoverStyles = isHoverable ? 'cursor-pointer hover:shadow-xl' : '';
  
  // Combine all styles
  const cardStyles = `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`;
  
  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        duration: 0.4 
      }
    },
    hover: isHoverable ? { 
      y: -5,
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    } : {},
  };

  return (
    <motion.div
      className={cardStyles}
      onClick={onClick}
      initial="hidden"
      animate="visible"
      whileHover={isHoverable ? 'hover' : undefined}
      variants={cardVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Card.Header component
 */
Card.Header = ({ className = '', children, ...props }) => (
  <div className={`p-5 border-b border-gray-100 dark:border-gray-700 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card.Body component
 */
Card.Body = ({ className = '', children, ...props }) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card.Footer component
 */
Card.Footer = ({ className = '', children, ...props }) => (
  <div className={`p-5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 ${className}`} {...props}>
    {children}
  </div>
);

export default Card; 