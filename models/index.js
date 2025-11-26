const { Sequelize } = require("sequelize");
const env = require('dotenv').config()

if (!process.env.POSTGRES_DB_URL) {
  console.error("POSTGRES_DB_URL is missing from .env");
  process.exit(1);
}

const sequelize = new Sequelize(process.env.POSTGRES_DB_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, 
      rejectUnauthorized: false,
    },
  },
});

async function connectPostgreSQL() {
  try {
    await sequelize.authenticate();
    console.log('Connection to PostgreSQL established succcessfully');

    await sequelize.sync();
    console.log('Sequelize models synced');
  }
  catch(err) {
    console.error(`Error connecting to PostgreSQL: ${err}`);
    process.exit(1);
  }
}

const Task = require("./Task")(sequelize);

module.exports = {
  sequelize,
  Task,
  connectPostgreSQL
};