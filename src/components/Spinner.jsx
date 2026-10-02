// components/Spinner.jsx
import React from 'react';

const Spinner = () => {
  return (
    // role="status" is a polite live region: screen readers announce the text once, without interrupting
    <div
      role="status"
      className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"
    >
      <span className="sr-only">Loading movies</span>
    </div>
  );
};

export default Spinner;