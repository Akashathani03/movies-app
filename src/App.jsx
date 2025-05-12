import React, { useEffect, useState } from 'react';
import Search from './components/Search';
import MovieCard from './components/MovieCard';
import Spinner from './components/Spinner';
import { useDebounce } from 'react-use';
import { updateSearchCount } from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);

  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500, [searchTerm]);

  // Fetch popular movies on initial load
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/movie/popular?language=kn-IN&page=1&region=IN`,
          API_OPTIONS
        );
        if (!response.ok) throw new Error('Failed to fetch popular movies');
        const data = await response.json();
        setPopularMovies(data.results || []);

        updateSearchCount()
        
      } catch (error) {
        console.error('Error fetching popular movies:', error);
        setErrorMessage('Failed to load popular movies');
      } finally {
        setIsLoadingPopular(false);
      }
    };

    fetchPopularMovies();
  }, []);

  // Fetch search results when debounced term changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([]);
        setErrorMessage('');
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await fetch(
          `${API_BASE_URL}/search/movie?query=${encodeURIComponent(debouncedSearchTerm)}&language=kn-IN&page=1&region=IN`,
          API_OPTIONS
        );
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setSearchResults(data.results || []);
        if (data.results.length === 0) {
          setErrorMessage('No movies found for your search');
        }
      } catch (error) {
        console.error('Search error:', error);
        setErrorMessage('Error during search');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [debouncedSearchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <header
        className="p-6 bg-black bg-opacity-50 shadow-md text-white"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=1950&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <h1 className="text-3xl md:text-5xl font-bold text-center mb-4">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Akash's
          </span>{' '}
          Kannada Movie Hub
        </h1>
        <img
          src="/heros.webp"
          alt="Kannada cinema banner"
          className="mx-auto my-4 rounded-lg shadow-xl"
          style={{
            maxWidth: '1000px',
            width: '100%',
            height: 'auto',
            maxHeight: '400px',
            objectFit: 'cover',
          }}
        />
      </header>

      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="p-6 max-w-7xl mx-auto">
        {/* Search Results */}
        {isLoading ? (
          <div className="flex justify-center my-12">
            <Spinner />
          </div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center my-8 text-xl">{errorMessage}</p>
        ) : searchResults.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Search Results ({searchResults.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {searchResults.map((movie) => (
                <MovieCard key={`search-${movie.id}`} movie={movie} />
              ))}
            </div>
          </>
        ) : null}

        {/* Popular Movies */}
        {!isLoading && searchResults.length === 0 && !isLoadingPopular && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center">
              Popular Kannada Movies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularMovies.map((movie) => (
                <MovieCard key={`popular-${movie.id}`} movie={movie} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;

