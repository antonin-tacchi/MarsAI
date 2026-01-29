import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "marsai",
};

async function addYouTubeUrl() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Check existing films
    const [films] = await connection.query(
      "SELECT id, title, status, youtube_url FROM films LIMIT 10"
    );

    console.log("Films existants:");
    console.table(films);

    if (films.length === 0) {
      // Create a test film if none exists
      console.log("\nAucun film trouvé. Création d'un film test...");

      const [result] = await connection.query(`
        INSERT INTO films (
          title, country, description, status,
          director_firstname, director_lastname, director_email,
          ai_tools_used, youtube_url
        ) VALUES (
          'Film Test - Never Gonna Give You Up',
          'France',
          'Un film test pour démontrer l\\'intégration YouTube avec l\\'interface Netflix du jury.',
          'approved',
          'Rick',
          'Astley',
          'test@example.com',
          'Midjourney, Runway ML, Sora',
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        )
      `);

      console.log(`Film créé avec ID: ${result.insertId}`);
    } else {
      // Update first film with YouTube URL
      const filmId = films[0].id;
      console.log(`\nMise à jour du film ID ${filmId} avec l'URL YouTube...`);

      await connection.query(
        "UPDATE films SET youtube_url = ?, status = 'approved' WHERE id = ?",
        ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", filmId]
      );

      console.log("URL YouTube ajoutée avec succès!");
    }

    // Verify the update
    const [updated] = await connection.query(
      "SELECT id, title, status, youtube_url FROM films WHERE youtube_url IS NOT NULL"
    );

    console.log("\nFilms avec YouTube URL:");
    console.table(updated);

  } catch (error) {
    console.error("Erreur:", error.message);
  } finally {
    await connection.end();
  }
}

addYouTubeUrl();
