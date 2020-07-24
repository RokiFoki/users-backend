import knex from 'knex';
import config from './config';

const db = knex({
    client: 'pg',
    connection: config.database,
    debug: true,
    asyncStackTraces: true,
    migrations: {
        tableName: "knex_migrations"
      }
});

export default db;