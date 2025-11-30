import React from 'react';

const GenericPage: React.FC<{title: string}> = ({ title }) => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--font-color)' }}>
      <h2 style={{ marginBottom: '1rem', color: 'var(--heading-color)' }}>{title}</h2>
      <p>This module is under construction.</p>
    </div>
  );
};
export default GenericPage;