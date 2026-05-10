/*
REPLACE EXISTING App.js WITH THIS
File Location: frontend/src/App.js
*/

import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <Dashboard />
      </div>
    </div>
  );
}

export default App;