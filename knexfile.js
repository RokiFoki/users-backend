// Update with your config settings.

module.exports = {
    development: {
      client: 'postgresql',
      connection: {
        database: 'users_backend',
        user:     'postgres',
        password: 'postgres'
      },
      migrations: {
        tableName: 'knex_migrations'
      }
    },
  };
  