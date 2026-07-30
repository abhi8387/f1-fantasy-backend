// Standalone schema sync: creates/updates tables to match the Sequelize
// models without booting the full HTTP server. Run after changing a model.
require('dotenv').config();
const { sequelize } = require('../src/database/models');

sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synced (tables created/altered to match models)');
    return sequelize.close();
  })
  .catch((err) => {
    console.error('Sync failed:', err.message);
    process.exit(1);
  });
