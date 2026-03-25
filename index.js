const express = require('express');
const sequelize = require('./config/db')
require('dotenv').config()


const User = require('./models/User');
const League = require('./models/League');
const LeagueMember = require('./models/LeagueMember');

// Associations
League.hasMany(LeagueMember, { foreignKey: 'leagueId' });
LeagueMember.belongsTo(League, { foreignKey: 'leagueId' });
User.hasMany(LeagueMember, { foreignKey: 'userId' });
LeagueMember.belongsTo(User, { foreignKey: 'userId' });

const authRoutes = require('./routes/authRoutes');
const leagueRoutes = require('./routes/leagueRoutes');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/leagues', leagueRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'F1 Fantasy API running' });
});


// sequelize.authenticate() tests if the DB connection works
sequelize.authenticate()
  .then(() => console.log('MySQL connected successfully'))
  .catch((err) => console.log('DB connection failed:', err));

// sequelize.sync({ alter: true }) — looks at all your models and creates/updates the tables in MySQL automatically
sequelize.sync({ force: false })
  .then(() => console.log('Tables synced'))
  .catch((err) => console.log('Sync failed:', err));


app.listen(3000, () => {
  console.log('Server running on port 3000');
});