// test-pg.js
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false },
});

(async () => {
    try {
        await client.connect();
        const res = await client.query('SELECT 1');
        console.log('OK', res.rows);
        await client.end();
    } catch (err) {
        console.error('ERR', err);
        process.exit(1);
    }
})();