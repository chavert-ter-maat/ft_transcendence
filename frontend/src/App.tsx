import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UserPage from './components/UserPage';
import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import Chat from './chat/Chat';
import App_game from './App_game';
import TwoFADashboard from './components/TwoFA/TwoFADashboard';
import VerifyTwoFA from './components/TwoFA/TwoFAVerification';
import NotFound from './components/NotFound/NotFound';

function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/42/callback" element={<AuthCallback />} />
        {/* <Route path="/game" element={<App_game />} /> */}
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
        <Route
          path="/game"
          element={
            <ProtectedRoute>
              <App_game />
            </ProtectedRoute>
          }
        />
        <Route
          path="/2fa-dashboard"
          element={
            <ProtectedRoute>
              <TwoFADashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/auth/verify-2fa"
          element={
            <ProtectedRoute>
              <VerifyTwoFA />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
