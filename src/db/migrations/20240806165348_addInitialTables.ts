import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("cities", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable().unique();
  });

  await knex.schema.createTable("brands", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable().unique();
  });

  await knex.schema.createTable("dish_types", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable().unique();
  });

  await knex.schema.createTable("diets", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable().unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("diets");
  await knex.schema.dropTable("dish_types");
  await knex.schema.dropTable("brands");
  await knex.schema.dropTable("cities");
}
