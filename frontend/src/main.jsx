import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.warn(
    '%c[LifeFlow] Google Sign-In disabled: VITE_GOOGLE_CLIENT_ID is not set.\n' +
    '%cTo fix: edit frontend/.env and add:\n' +
    '%cVITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com\n' +
    '%cGet your Client ID from https://console.cloud.google.com/apis/credentials',
    'color:#e53e3e;font-weight:bold;',
    'color:#3182ce;',
    'color:#38a169;font-weight:bold;',
    'color:#718096;'
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || 'MISSING_GOOGLE_CLIENT_ID'}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
