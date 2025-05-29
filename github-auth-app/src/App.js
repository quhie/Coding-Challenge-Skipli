import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Search from './components/Search';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/search" 
              element={
                <PrivateRoute>
                  <Search />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/search" replace />} />
            <Route path="*" element={<Navigate to="/search" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
