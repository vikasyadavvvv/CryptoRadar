// src/components/Spinner.jsx
import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
