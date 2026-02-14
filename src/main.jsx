import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Import custom Bootstrap (tree-shaken)
import './styles/bootstrap-custom.scss';

// Import Bootstrap Icons CSS (critical)
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import custom CSS
import './index.css';

// Lazy load the main App component
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
