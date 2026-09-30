import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtocallApp from './ProtocallApp';
import { AuthComponent } from './Auth';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          user ? <ProtocallApp user={user} onLogout={() => setUser(null)} /> : <AuthComponent onAuth={setUser} />
        } />
        {/* Add more routes here if needed */}
      </Routes>
    </Router>
  );
}

export default App;
