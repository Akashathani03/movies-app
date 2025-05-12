import { Client, Databases, Query, ID } from 'appwrite';

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(PROJECT_ID);

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // Search for existing document
    const result = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('searchTerm', searchTerm),
        Query.equal('movie', movie)
      ]
    );

    if (result.total > 0) {
      // Document exists, update count
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
    } else {
      // Create new document
      await database.createDocument(
        DATABASE_ID,
        COLLECTION_ID,
        ID.unique(),
        {
          searchTerm,
          movie,
          count: 1
        }
      );
    }
  } catch (error) {
    console.error('Failed to update search count:', error);
  }
};
