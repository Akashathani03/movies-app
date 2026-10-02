# Akash's Movie Hub

Akash's Movie Hub is a movie discovery web app built with React and Vite. It shows popular movies from [The Movie Database (TMDB)](https://www.themoviedb.org/) and lets you search TMDB's catalogue of films in every language, displaying the results as poster cards. Completed searches are counted in an [Appwrite](https://appwrite.io/) database.

## Features

- **Popular movies** – the first page of TMDB's popular movies is shown when the app opens.
- **Live, debounced search** – results update as you type, 500 ms after you stop typing, using TMDB's movie search (first page of results).
- **Movie cards** – poster, title, release year and rating, in a responsive layout of 1 to 4 columns depending on screen width.
- **Poster fallback** – movies without a poster, or whose poster fails to load, show a local "No poster available" image.
- **Loading, empty and error states** – a spinner while searching, a "No movies found" message, and separate messages for search errors and for popular movies failing to load.
- **Stale-response protection** – if you keep typing, a slower response for an earlier search term can never replace newer results, errors or the loading state.
- **Search tracking with Appwrite** – once a search has settled (1.5 s without typing) and returned results, its normalised search term is counted in Appwrite.
- **Accessibility** – a labelled search input, a loading status for screen readers, errors announced as alerts, "no results" announced as a status message, and descriptive poster alt text (including the fallback image).
- **Illustrated hero banner and favicon** – local SVG artwork, no external image services.

## Tech Stack

- [React 19](https://react.dev/) (JavaScript, JSX)
- [Vite 6](https://vite.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/vite`
- [react-use](https://github.com/streamich/react-use) – `useDebounce`
- [Appwrite Web SDK 17](https://appwrite.io/docs) with Appwrite Cloud
- [TMDB API](https://developer.themoviedb.org/) (v3 endpoints, authenticated with a v4 API Read Access Token)
- ESLint 9

## How It Works

1. **Popular movies** – on load, `App.jsx` requests `/movie/popular` from TMDB (`language=en-US`, `region=IN`) and renders each movie as a `MovieCard`.
2. **Search** – the search box updates on every keystroke; the term is debounced for 500 ms and then sent to TMDB's `/search/movie` endpoint with the same language and region parameters. There is no language filter, so movies in all languages are returned.
3. **Results** – matching movies replace the popular list. If there are no matches, "No movies found for your search" is shown; if the request fails, "Error during search" is shown. Popular-movie errors are tracked separately, so a search never hides them.
4. **Stale responses** – each request belongs to the search term that started it. When a newer search starts, the older request's response is ignored.
5. **Search tracking** – separately from the 500 ms search, a 1500 ms "settled" timer runs. When the term has stopped changing, is still current and its results have arrived, `updateSearchCount()` in `appwrite.js`:
   - normalises the term (trims it, collapses repeated spaces, lowercases it);
   - increments `count` if a row for that term already exists;
   - otherwise creates a row with `count: 1` and the TMDB `movie_id` and `poster_url` of the top result that has a poster.

   The same term is not recorded twice in a row, and any Appwrite error is caught and logged without affecting the page.
6. **Posters** – posters load from `https://image.tmdb.org/t/p/w500`. If a movie has no poster, or the image fails to load, `/no-poster.svg` is shown instead.

## Project Structure

```text
movies-app/
├── index.html              # Page title and favicon
├── public/
│   ├── favicon.svg         # Clapperboard favicon
│   ├── hero-banner.svg     # Illustrated cinema banner behind the heading
│   └── no-poster.svg       # Fallback image for missing or failed posters
├── src/
│   ├── main.jsx            # React entry point
│   ├── App.jsx             # Popular movies, search, stale-response handling, tracking and layout
│   ├── appwrite.js         # Appwrite client and updateSearchCount()
│   ├── index.css           # Tailwind import and base page colours
│   └── components/
│       ├── MovieCard.jsx   # Poster (with fallback), title, year and rating
│       ├── Search.jsx      # Labelled search input
│       └── Spinner.jsx     # Loading spinner with a screen-reader status
├── .env.example            # Environment variable template (placeholders only)
├── eslint.config.js
├── vite.config.js
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18, 20 or 22+ and npm
- A TMDB account and an **API Read Access Token**
- An Appwrite Cloud project with a database and a collection for search tracking (see [Appwrite setup](#appwrite-setup))

### Install and run

```bash
git clone https://github.com/Akashathani03/movies-app.git
cd movies-app
npm install
cp .env.example .env.local   # then fill in your own values
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Environment Variables

Create `.env.local` from `.env.example`. It is ignored by git.

| Variable | Description |
|---|---|
| `VITE_TMDB_API_KEY` | TMDB **API Read Access Token**. It is sent as a `Bearer` token, so the shorter v3 "API key" will not work. |
| `VITE_APPWRITE_PROJECT_ID` | Appwrite project ID |
| `VITE_APPWRITE_DATABASE_ID` | ID of the Appwrite database |
| `VITE_APPWRITE_COLLECTION_ID` | ID of the collection that stores search counts |

The Appwrite endpoint is set in `src/appwrite.js` (`https://cloud.appwrite.io/v1`).

> **Note:** Vite embeds every `VITE_*` value in the JavaScript sent to the browser, so anyone using the site can read these values. Only use credentials intended for client-side use.

## Appwrite Setup

Create a collection (shown as a "Table" in newer versions of the Appwrite Console) with these columns:

| Column | Type | Required |
|---|---|---|
| `searchTerm` | String | Yes |
| `count` | Integer | Yes |
| `movie_id` | Integer | Yes |
| `poster_url` | URL | Yes |

The app has no sign-in, so the **Any** role needs **Read**, **Create** and **Update** permissions on this collection. Delete permission is not needed.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production bundle into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Known Limitations

- **Client-side credentials** – the TMDB token and Appwrite IDs are part of the browser bundle, and anonymous users can create and update search-count rows.
- **Approximate counts** – counts are increments read and written from the browser (not atomic), so two people searching the same term at the same moment can lose one increment.
- **Search tracking granularity** – a pause of 1.5 s or more while typing counts as a completed search, and searching the same term twice in a row counts once.
- **TMDB connectivity** – if `api.themoviedb.org` cannot be reached (for example, when a network's DNS blocks it), the app shows an error message instead of movies. Switching to a public DNS resolver usually fixes this.

## Acknowledgements

Movie data and images are provided by [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.
