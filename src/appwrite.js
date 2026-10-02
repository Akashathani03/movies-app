import { Client, Databases, Query, ID } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_ID);

const database = new Databases(client);

const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Normalize spacing and letter case so "Avatar " and "avatar" share one row
const normalizeSearchTerm = (searchTerm) =>
  searchTerm.trim().replace(/\s+/g, ' ').toLowerCase();

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const term = normalizeSearchTerm(searchTerm);
    if (!term) return;

    // Search for existing document
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('searchTerm', term),
        Query.limit(1)
      ]
    );

    if (result.total > 0) {
      // Document exists, update count (its movie_id/poster_url are kept)
      const doc = result.documents[0];
      const updatedCount = (doc.count || 0) + 1;

      await database.updateDocument(
        DATABASE_ID,
        COLLECTION_ID,
        doc.$id,
        {
          count: updatedCount
        }
      );
    } else if (movie?.poster_path) {
      // Create new document
      await database.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          searchTerm: term,
          count: 1,
          movie_id: movie.id,
          poster_url: `${TMDB_POSTER_BASE_URL}${movie.poster_path}`
        }
      );
    } else {
      // poster_url is a required URL field, so there is nothing valid to store
      console.warn(`Search "${term}" not tracked: no result has a poster`);
    }
  } catch (error) {
    console.error('Failed to update search count:', error);
  }
};
