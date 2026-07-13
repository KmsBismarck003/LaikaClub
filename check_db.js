const mysql = require('mysql2/promise');

async function check() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'laika_club3_v2'
    });
    
    const [rows] = await connection.execute('SELECT count(*) as count FROM venues');
    console.log("Total venues in MySQL:", rows[0].count);
    
    await connection.end();
  } catch (err) {
    console.error("MySQL Error:", err.message);
  }
}

check();
