import React, { useEffect, useRef, useState } from 'react';
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

const NO_RESULTS_MESSAGE = 'No movies found for your search';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  // Separate error states so a search never clears or overwrites a popular-movies error (and vice versa)
  const [popularMoviesError, setPopularMoviesError] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const lastTrackedTermRef = useRef('');
  const [settledSearchTerm, setSettledSearchTerm] = useState('');
  const [completedSearch, setCompletedSearch] = useState(null);

  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 500, [searchTerm]);

  // Longer pause before a search counts as finished, so mid-typing pauses aren't tracked
  useDebounce(() => {
    setSettledSearchTerm(searchTerm);
  }, 1500, [searchTerm]);

  // Fetch popular movies on initial load
  useEffect(() => {
    const fetchPopularMovies = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/movie/popular?language=en-US&page=1&region=IN`,
          API_OPTIONS
        );
        if (!response.ok) throw new Error('Failed to fetch popular movies');
        const data = await response.json();
        setPopularMovies(data.results || []);
      } catch (error) {
        console.error('Error fetching popular movies:', error);
        setPopularMoviesError('Failed to load popular movies');
      } finally {
        setIsLoadingPopular(false);
      }
    };

    fetchPopularMovies();
  }, []);

  // Fetch search results when debounced term changes
  useEffect(() => {
    let ignore = false;

    const fetchSearchResults = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([]);
        setSearchError('');
        // An in-flight search for the previous term won't clear loading once it is stale
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setSearchError('');

      try {
        const response = await fetch(
          `${API_BASE_URL}/search/movie?query=${encodeURIComponent(debouncedSearchTerm)}&language=en-US&page=1&region=IN`,
          API_OPTIONS
        );
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        // A newer search has started; this response is stale, so leave the UI alone
        if (ignore) return;

        // Tolerate an unexpected response shape (e.g. a 200 without a "results" array)
        const results = Array.isArray(data?.results) ? data.results : [];
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError(NO_RESULTS_MESSAGE);
        } else if (!ignore) {
          // Remember the latest successful search; it is tracked once the term settles
          setCompletedSearch({ term: debouncedSearchTerm, results });
        }
      } catch (error) {
        if (ignore) return;
        console.error('Search error:', error);
        setSearchError('Error during search');
        setSearchResults([]);
      } finally {
        // Only the current search may end the loading state
        if (!ignore) setIsLoading(false);
      }
    };

    fetchSearchResults();

    return () => {
      ignore = true;
    };
  }, [debouncedSearchTerm]);

  // Track a search once the term has settled, is still current, and its results have arrived
  useEffect(() => {
    if (
      !completedSearch ||
      settledSearchTerm !== searchTerm ||
      completedSearch.term !== settledSearchTerm
    ) {
      return;
    }

    // Only once per term
    const trackedTerm = settledSearchTerm.trim();
    if (!trackedTerm || lastTrackedTermRef.current === trackedTerm) return;

    lastTrackedTermRef.current = trackedTerm;
    // Top result that has a poster (poster_url is required in Appwrite)
    updateSearchCount(trackedTerm, completedSearch.results.find((movie) => movie.poster_path));
  }, [searchTerm, settledSearchTerm, completedSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      {/* isolate keeps the layer z-indexes inside the header, below the sticky search bar */}
      <header className="relative isolate overflow-hidden shadow-md text-white">
        {/* Layer 1: banner image */}
        <img
          src="/hero-banner.svg"
          alt="Illustrated cinema banner with a film reel, clapperboard, popcorn, tickets, film strips and movie genre icons"
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
        {/* Layer 2: 50% black overlay; never intercepts clicks */}
        <div className="absolute inset-0 z-10 bg-black/50 pointer-events-none" aria-hidden="true" />
        {/* Layer 3: content */}
        <div className="relative z-20 flex min-h-[260px] md:min-h-[400px] items-center justify-center p-6">
          <h1 className="text-3xl md:text-5xl font-bold text-center">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Akash's
            </span>{' '}
            Movie Hub
          </h1>
        </div>
      </header>

      <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="p-6 max-w-7xl mx-auto">
        {/* Search Results */}
        {isLoading ? (
          <div className="flex justify-center my-12">
            <Spinner />
          </div>
        ) : searchError ? (
          // Errors are announced as alerts; "no results" is an ordinary outcome, announced politely
          <p
            role={searchError === NO_RESULTS_MESSAGE ? 'status' : 'alert'}
            className="text-red-700 text-center my-8 text-xl"
          >
            {searchError}
          </p>
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
            {popularMoviesError && (
              <p role="alert" className="text-red-700 text-center my-8 text-xl">
                {popularMoviesError}
              </p>
            )}
            <h2 className="text-2xl font-bold mb-6 text-center">
              Popular Movies
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

