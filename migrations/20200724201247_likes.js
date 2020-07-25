
exports.up = function(knex) {
    return knex.schema.createTable('likes', (table) => {
        table.integer('originator_id').notNullable();
        table.integer('liked_id').notNullable();

        table.unique(['originator_id', 'liked_id']);

        table.foreign('originator_id').references('id').inTable('users');
        table.foreign('liked_id').references('id').inTable('users');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('likes');
};
