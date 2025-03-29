import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import './assets/styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { store } from './store'; // Import the configured store

// Create a root element for React rendering
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render with StrictMode enabled for better development experience
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);

// Measure performance
reportWebVitals();
