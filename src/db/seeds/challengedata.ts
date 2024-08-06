import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("cities").del();
  await knex("brands").del();
  await knex("dish_types").del();
  await knex("diets").del();

  await knex("cities").insert([
    { id: 1, name: "London" },
    { id: 2, name: "Manchester" },
  ]);

  await knex("brands").insert([
    { id: 1, name: "McDonald's" },
    { id: 2, name: "Sushimania" },
  ]);

  await knex("dish_types").insert([{ id: 1, name: "Sushi" }]);

  await knex("diets").insert([
    { id: 1, name: "Vegan" },
    { id: 2, name: "Vegetarian" },
  ]);
}
