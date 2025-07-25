import React from 'react';

const TestApp: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test App Works!</h1>
      <p>If you can see this, React is working.</p>
      <p>Environment check:</p>
      <ul>
        <li>VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Not set'}</li>
        <li>VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</li>
      </ul>
    </div>
  );
};

export default TestApp;