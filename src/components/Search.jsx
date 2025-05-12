// components/Search.jsx
import React from 'react';

const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="sticky top-0 bg-white py-4 px-4 shadow-sm z-10">
      <div className="max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="Search for Kannada movies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
          autoFocus
        />
      </div>
    </div>
  );
};

export default Search;