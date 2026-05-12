import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtocallApp from './ProtocallApp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProtocallApp />} />
        {/* Add more routes here if needed */}
      </Routes>
    </Router>
  );
}

export default App;
