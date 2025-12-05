import React from 'react';
import { FaBookReader } from 'react-icons/fa';

const MyLoans: React.FC = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted-color)' }}>
      <FaBookReader style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
      <h2>My Borrowed Books</h2>
      <p>You have no active book loans from the library.</p>
    </div>
  );
};

export default MyLoans;