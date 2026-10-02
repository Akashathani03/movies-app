import React, { useState } from 'react';

const MovieCard = ({ movie }) => {
  // TMDB image base URL
  const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; // w500 is a good balance of size/quality
  const FALLBACK_POSTER = '/no-poster.svg'; // Local asset in public/

  // Set once the TMDB poster fails to load; drives both the image and its alt text
  const [posterFailed, setPosterFailed] = useState(false);
  const showingFallback = !movie.poster_path || posterFailed;

  // Get the full poster URL with fallbacks
  const getPosterUrl = () => {
    if (showingFallback) {
      return FALLBACK_POSTER;
    }
    return `${IMAGE_BASE_URL}${movie.poster_path}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
      {/* Poster Image Container */}
      <div className="relative pb-[150%]"> {/* Maintains 2:3 aspect ratio */}
        <img
          src={getPosterUrl()}
          alt={showingFallback ? `No poster available for ${movie.title}` : `${movie.title} movie poster`}
          className="absolute top-0 left-0 w-full h-full object-cover"
          loading="lazy"
          onError={() => {
            // Swap in the fallback once; if the fallback itself fails, stop (prevents a loop)
            if (!showingFallback) {
              setPosterFailed(true);
            }
          }}
        />
      </div>
      
      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{movie.title}</h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-sm text-gray-600">
            {movie.release_date?.substring(0,4) || 'Year N/A'}
          </span>
          {movie.vote_average > 0 && (
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              ★ {movie.vote_average.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;