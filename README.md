# Kannada Movie Hub

A React movie discovery app focused on Kannada cinema. It loads popular Kannada movies from The Movie Database (TMDB), supports debounced movie search, displays posters and ratings, and records search analytics in Appwrite.

## Features

- Popular Kannada movies shown on initial load
- Search with a 500 ms debounce to reduce unnecessary API requests
- Kannada-region and language parameters for TMDB requests
- Movie cards with posters, release years, ratings, lazy loading, and fallback images
- Loading spinner and friendly empty/error states
- Appwrite-backed search-count analytics
- Responsive Tailwind CSS layout

## Tech stack

- React 19
- Vite
- Tailwind CSS 4
- `react-use` for debouncing
- TMDB API for movie data and posters
- Appwrite Databases for search analytics

## Project structure

```text
movies-app/
├── public/
│   ├── heros.webp            # Kannada cinema banner
│   ├── search.svg            # Search icon asset
│   └── star.svg              # Rating icon asset
├── src/
│   ├── App.jsx               # TMDB fetching, search state, and page layout
│   ├── appwrite.js           # Appwrite search-count persistence
│   ├── components/
│   │   ├── MovieCard.jsx     # Poster, title, year, and rating display
│   │   ├── Search.jsx        # Search input
│   │   └── Spinner.jsx        # Loading indicator
│   ├── assets/               # Bundled assets
│   ├── index.css             # Global styles
│   └── main.jsx              # React entry point
├── package.json
└── vite.config.js
```

## Prerequisites

- Node.js and npm
- A TMDB API bearer token
- An Appwrite project, database, and collection configured for search analytics

## Environment variables

Create a `.env` file in the project root:

```env
VITE_TMDB_API_KEY=your_tmdb_bearer_token
VITE_APPWRITE_PROJECT_ID=your_appwrite_project_id
VITE_APPWRITE_DATABASE_ID=your_appwrite_database_id
VITE_APPWRITE_COLLECTION_ID=your_appwrite_collection_id
```

The Appwrite collection should allow the app to read and create documents containing `searchTerm`, `movie`, and `count` fields.

## Setup and run

```bash
git clone https://github.com/Akashathani03/movies-app.git
cd movies-app
npm install
npm run dev
```

Open the local URL printed by Vite. For a production preview:

```bash
npm run build
npm run preview
```

## Data flow

`App.jsx` fetches popular movies from TMDB on mount. Search input is debounced before a TMDB search request is sent; results are rendered by `MovieCard`. `appwrite.js` uses `updateSearchCount` to create or increment an Appwrite document for tracked searches. The application expects the TMDB token and Appwrite identifiers to be exposed as Vite `VITE_*` variables.
