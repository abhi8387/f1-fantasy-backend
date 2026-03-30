const axios = require('axios');
const Race = require('../models/Race');
const Driver = require('../models/Driver');

// Sync races from OpenF1
const syncRaces = async (req, res) => {
  try {
    const response = await axios.get('https://api.openf1.org/v1/sessions?session_type=Race&year=2026');
    const sessions = response.data.filter(s => s.session_name === 'Race');

    let count = 0;

    for (const session of sessions) {
      const existing = await Race.findOne({ where: { sessionKey: session.session_key } });
      if (!existing) {
        await Race.create({
          sessionKey: session.session_key,
          raceName: session.session_name,
          location: session.location,
          date: session.date_start
        });
        count++;
      }
    }

    res.status(200).json({ message: `Synced ${count} new races` });

  } catch (error) {
    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
};

// Sync drivers from OpenF1 for a specific race
const syncDrivers = async (req, res) => {
  try {
    const { sessionKey } = req.params;

    const response = await axios.get(`https://api.openf1.org/v1/drivers?session_key=${sessionKey}`);
    const drivers = response.data;

    let count = 0;

    for (const driver of drivers) {
      const existing = await Driver.findOne({
        where: {
          driverNumber: driver.driver_number,
          sessionKey: sessionKey
        }
      });

      if (!existing) {
        await Driver.create({
          driverNumber: driver.driver_number,
          fullName: driver.full_name,
          teamName: driver.team_name,
          sessionKey: sessionKey
        });
        count++;
      }
    }

    res.status(200).json({ message: `Synced ${count} new drivers` });

  } catch (error) {
    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
};

// Get all races from DB
const getRaces = async (req, res) => {
  try {
    const races = await Race.findAll({ order: [['date', 'ASC']] });
    res.status(200).json({ races });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get drivers for a specific race
const getDrivers = async (req, res) => {
  try {
    const { sessionKey } = req.params;
    const drivers = await Driver.findAll({ where: { sessionKey } });
    res.status(200).json({ drivers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { syncRaces, syncDrivers, getRaces, getDrivers };