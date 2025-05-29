import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendVerificationCode, verifyCode } from '../services/twilioService';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState('phone'); // 'phone' or 'code'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimeout, setResendTimeout] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);
  
  const navigate = useNavigate();
  const { login, theme, toggleTheme } = useAuth();
  const phoneInputRef = useRef(null);
  const codeInputRefs = useRef([...Array(6)].map(() => React.createRef()));

  // Timer for resend code functionality
  useEffect(() => {
    let timer;
    if (resendTimeout > 0) {
      timer = setTimeout(() => {
        setResendTimeout(resendTimeout - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    
    return () => clearTimeout(timer);
  }, [resendTimeout]);

  // Focus on first code input when switching to code step
  useEffect(() => {
    if (step === 'code' && codeInputRefs.current[0]?.current) {
      setTimeout(() => {
        codeInputRefs.current[0].current.focus();
      }, 300);
    }
  }, [step]);

  // Focus on phone input when component mounts
  useEffect(() => {
    if (phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, []);

  const validatePhoneNumber = (phone) => {
    // Improved validation - accepts international format
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSendCode = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number (e.g., +84912345678)');
      return;
    }

    setLoading(true);
    try {
      await sendVerificationCode(phoneNumber);
      setSuccess('Verification code sent successfully!');
      setStep('code');
      // Reset verification code
      setVerificationCode(['', '', '', '', '', '']);
      // Set 60 second timeout for resend
      setResendTimeout(60);
      setResendDisabled(true);
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const code = verificationCode.join('');
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyCode(phoneNumber, code);
      
      if (response.success) {
        setSuccess('Verification successful! Redirecting...');
        login(phoneNumber);
        
        // Add a slight delay for better UX
        setTimeout(() => {
          navigate('/search');
        }, 1000);
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError(typeof error === 'string' ? error : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    // Allow only digits and + character
    const value = e.target.value.replace(/[^\d+]/g, '');
    setPhoneNumber(value);
    
    // Clear error when user types
    if (error) setError('');
  };

  const handleCodeInputChange = (index, value) => {
    // Allow only digits
    if (/^\d?$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      
      // Auto-focus next input if a digit was entered
      if (value && index < 5 && codeInputRefs.current[index + 1]?.current) {
        codeInputRefs.current[index + 1].current.focus();
      }
      
      // Clear error when user types
      if (error) setError('');
    }
  };

  const handleCodeInputKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!verificationCode[index] && index > 0 && codeInputRefs.current[index - 1]?.current) {
        codeInputRefs.current[index - 1].current.focus();
      }
    }
    // Handle left arrow
    else if (e.key === 'ArrowLeft' && index > 0 && codeInputRefs.current[index - 1]?.current) {
      codeInputRefs.current[index - 1].current.focus();
    }
    // Handle right arrow
    else if (e.key === 'ArrowRight' && index < 5 && codeInputRefs.current[index + 1]?.current) {
      codeInputRefs.current[index + 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedText) {
      const newCode = [...verificationCode];
      for (let i = 0; i < pastedText.length; i++) {
        if (i < 6) {
          newCode[i] = pastedText[i];
        }
      }
      setVerificationCode(newCode);
      
      // Focus the next empty input or the last one if all filled
      const nextEmptyIndex = newCode.findIndex(digit => !digit);
      const indexToFocus = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
      if (codeInputRefs.current[indexToFocus]?.current) {
        codeInputRefs.current[indexToFocus].current.focus();
      }
    }
  };

  const formatPhoneNumberDisplay = () => {
    if (!phoneNumber) return '';
    
    // Format phone number for display in step 2
    return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 px-4 py-12 transition-colors duration-300">
      {/* Theme toggle button */}
      <motion.div 
        className="absolute top-4 right-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={toggleTheme}
          className="theme-toggle p-2 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? (
            <svg className="w-5 h-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-yellow-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </motion.div>
      
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === 'phone' ? (
            <motion.div
              key="phone-step"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card variant="elevated" className="overflow-hidden">
                <Card.Body>
                  <motion.div variants={itemVariants} className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">GitHub Auth App</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Enter your phone number to continue</p>
                  </motion.div>
                  
                  {error && (
                    <motion.div 
                      variants={itemVariants}
                      className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-md"
                    >
                      <div className="flex">
                        <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div 
                      variants={itemVariants}
                      className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded-md"
                    >
                      <div className="flex">
                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{success}</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <form onSubmit={handleSendCode}>
                    <motion.div variants={itemVariants} className="mb-6">
                      <Input
                        ref={phoneInputRef}
                        label="Phone Number"
                        type="tel"
                        placeholder="e.g., 84912345678"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        leftIcon={
                          <div className="flex items-center">
                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            <span className="ml-1 mr-0.5 text-gray-500 font-medium">+</span>
                          </div>
                        }
                        isRequired
                        isFullWidth
                        helperText="Include country code (example: +84 for Vietnam)"
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Button 
                        type="submit"
                        variant="primary"
                        isLoading={loading}
                        isFullWidth
                      >
                        Send Verification Code
                      </Button>
                    </motion.div>
                  </form>
                </Card.Body>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="code-step"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Card variant="elevated" className="overflow-hidden">
                <Card.Body>
                  <motion.div variants={itemVariants} className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                      <svg className="w-16 h-16 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Phone</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      Enter the code sent to <span className="font-medium">{formatPhoneNumberDisplay()}</span>
                    </p>
                  </motion.div>
                  
                  {error && (
                    <motion.div 
                      variants={itemVariants}
                      className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-md"
                    >
                      <div className="flex">
                        <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div 
                      variants={itemVariants}
                      className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 rounded-md"
                    >
                      <div className="flex">
                        <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{success}</span>
                      </div>
                    </motion.div>
                  )}
                  
                  <form onSubmit={handleVerifyCode}>
                    <motion.div variants={itemVariants} className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                        Verification Code
                      </label>
                      <div 
                        className="flex justify-center space-x-2" 
                        onPaste={handlePaste}
                      >
                        {verificationCode.map((digit, index) => (
                          <motion.input
                            key={index}
                            ref={codeInputRefs.current[index]}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleCodeInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleCodeInputKeyDown(index, e)}
                            className="w-12 h-14 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                            whileFocus={{ scale: 1.05 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0,
                              transition: { 
                                delay: 0.1 + (index * 0.05),
                                duration: 0.3 
                              }
                            }}
                          />
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                        Enter the 6-digit code we sent to your phone
                      </p>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
                      <motion.button
                        type="button"
                        className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-600 transition-colors"
                        onClick={() => setStep('phone')}
                        disabled={loading}
                        whileHover={{ x: -3 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back
                      </motion.button>
                      
                      <motion.button
                        type="button"
                        className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-600 transition-colors"
                        onClick={handleSendCode}
                        disabled={loading || resendDisabled}
                        whileHover={{ x: 3 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {resendTimeout > 0 ? `Resend in ${resendTimeout}s` : 'Resend code'}
                      </motion.button>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Button 
                        type="submit"
                        variant="primary"
                        isLoading={loading}
                        isDisabled={loading || verificationCode.join('').length !== 6}
                        isFullWidth
                      >
                        Verify Code
                      </Button>
                    </motion.div>
                  </form>
                </Card.Body>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login; 