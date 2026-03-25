const League = require('../models/League');
const LeagueMember = require('../models/LeagueMember');
const crypto = require('crypto');

// Create a league
const createLeague = async (req, res) => {
  try {
    const { name } = req.body;

    // Generate random invite code
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const league = await League.create({
      name,
      inviteCode,
      createdBy: req.user.id
    });

    // Creator automatically joins their own league
    await LeagueMember.create({
      userId: req.user.id,
      leagueId: league.id
    });

    res.status(201).json({
      message: 'League created successfully',
      league
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Join a league via invite code
const joinLeague = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    // Find the league
    const league = await League.findOne({ where: { inviteCode } });
    if (!league) {
      return res.status(404).json({ message: 'Invalid invite code' });
    }

    // Check if already a member
    const existing = await LeagueMember.findOne({
      where: { userId: req.user.id, leagueId: league.id }
    });
    if (existing) {
      return res.status(400).json({ message: 'You are already in this league' });
    }

    await LeagueMember.create({
      userId: req.user.id,
      leagueId: league.id
    });

    res.status(200).json({ message: 'Joined league successfully', league });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get my leagues
const getMyLeagues = async (req, res) => {
  try {
    const memberships = await LeagueMember.findAll({
      where: { userId: req.user.id },
      include: [{ model: League }]
    });

    const leagues = memberships.map(m => m.League);

    res.status(200).json({ leagues });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createLeague, joinLeague, getMyLeagues };