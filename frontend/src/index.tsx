import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create a root element for React rendering
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render with StrictMode enabled for better development experience
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Measure performance
reportWebVitals();
