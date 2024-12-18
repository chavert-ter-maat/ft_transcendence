import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UserPage from './components/UserPage';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import Chat from './chat/Chat'

function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/42/callback" element={<AuthCallback />} />
		{/* <Route path="/chat" element={<Chat />} /> */}
        <Route
          path="/userpage"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />
		<Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
