const config = {
    PORT: process.env.PORT || 3000,
    database: {
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE || 'users_backend'
    },
    type: process.env.NODE_ENV || 'development',
    secret: process.env.SECRET || 'Pl0xN0Sh4re',    
    rounds: 5000,
    salt: process.env.SALT || 'Pl0xN0Sh4re'
}

export default config;