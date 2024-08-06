import knex from "knex";
import knexConfig from "../../knexfile";

const pg = knex(knexConfig.development);

export default pg;
