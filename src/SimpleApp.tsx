import React from 'react';

const SimpleApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Portfolio Tracker</h1>
      <p>Application is loading...</p>
      <div style={{ background: '#f0f0f0', padding: '10px', marginTop: '20px' }}>
        <h3>Environment Status:</h3>
        <ul>
          <li>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</li>
          <li>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</li>
        </ul>
      </div>
    </div>
  );
};

export default SimpleApp;