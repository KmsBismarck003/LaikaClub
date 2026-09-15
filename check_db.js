const mysql = require('mysql2/promise');

async function check() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'laika_events'
    });
    
    console.log("Connected to laika_events");
    
    let [tables] = await connection.execute('SHOW TABLES');
    console.log("Tables:", tables.map(t => Object.values(t)[0]));
    
    const [venues] = await connection.execute('SELECT * FROM venues');
    console.log("Venues:", venues);
    
    const [rooms] = await connection.execute('SELECT * FROM venue_rooms');
    console.log("Rooms:", rooms.map(r => ({id: r.id, venue_id: r.venue_id, name: r.name, capacity: r.capacity, has_map: !!r.map_configuration})));
    
    await connection.end();
  } catch (err) {
    console.error("MySQL Error:", err.message);
  }
}

check();
