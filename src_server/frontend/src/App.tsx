// App.tsx
// import React from 'react';
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './chat/Chat'

// Single page?
function App(): JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
		<Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
