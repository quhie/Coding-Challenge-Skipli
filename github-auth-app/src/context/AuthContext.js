import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check localStorage for authenticated user
    const savedPhone = localStorage.getItem('phoneNumber');
    if (savedPhone) {
      setCurrentUser({ phoneNumber: savedPhone });
    }
    
    // Check localStorage for theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Check for system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        applyTheme('dark');
      }
    }
    
    setLoading(false);
  }, []);
  
  // Function to apply theme to document
  const applyTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  function login(phoneNumber) {
    // Store phone number in localStorage for persistence
    localStorage.setItem('phoneNumber', phoneNumber);
    setCurrentUser({ phoneNumber });
  }

  function logout() {
    localStorage.removeItem('phoneNumber');
    localStorage.removeItem('likedProfiles');
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    login,
    logout,
    theme,
    toggleTheme,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 