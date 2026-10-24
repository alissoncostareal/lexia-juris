import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

function renderApp() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    document.addEventListener('DOMContentLoaded', renderApp);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
