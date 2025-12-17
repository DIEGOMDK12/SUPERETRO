import pg from "pg";

const renderUrl = process.env.RENDER_DATABASE_URL;

if (!renderUrl) {
  console.error("RENDER_DATABASE_URL not set");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: renderUrl,
  ssl: { rejectUnauthorized: false },
});

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log("Connecting to Render PostgreSQL...");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);
    console.log("Created users table");

    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        core TEXT NOT NULL DEFAULT 'snes',
        cover TEXT NOT NULL,
        rom TEXT NOT NULL
      );
    `);
    console.log("Created games table");

    await client.query(`
      CREATE TABLE IF NOT EXISTS saves (
        id SERIAL PRIMARY KEY,
        game_id TEXT NOT NULL,
        save_data TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT now()
      );
    `);
    console.log("Created saves table");

    await client.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT now()
      );
    `);
    console.log("Created files table");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
