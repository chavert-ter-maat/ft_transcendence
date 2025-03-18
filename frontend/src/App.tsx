import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import UserPage from "./components/UserPage";
import AuthCallback from "./components/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute";
import Chat from "./chat/Chat";
import App_game from "./App_game";

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
      </Routes>
    </Router>
  );
}

export default App;
