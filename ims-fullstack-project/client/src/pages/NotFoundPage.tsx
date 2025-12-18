// client/src/pages/NotFoundPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import './NotFoundPage.scss';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="content-wrapper">
        <div className="icon-container">
          <FaExclamationTriangle />
        </div>
        
        <h1>404</h1>
        <h2>Page Not Found</h2>
        
        <p>
          Oops! The page you are looking for doesn't exist or has been moved.
          <br />
          It looks like you've taken a wrong turn.
        </p>

        <div className="actions">
          <button className="btn-home" onClick={() => navigate('/dashboard')}>
            <FaArrowLeft /> Back to Dashboard
          </button>
          <button className="btn-back" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;