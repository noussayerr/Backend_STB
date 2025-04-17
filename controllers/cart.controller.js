
import { CardApplication } from '../models/CardApplication.js';
import { CardType } from '../models/CardType.js';
import {UserCard} from '../models/UserCard.js';
const cardController = {

  getCardTypes: async (req, res) => {
    try {
      const cardTypes = await CardType.find();
      res.status(201).json(cardTypes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getCardTypeById: async (req, res) => {
    try {
      const cardType = await CardType.findById(req.params.id);
      res.json(cardType);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  // User card application
  submitApplication: async (req, res) => {
    try {
      const application = await CardApplication.create({
        user: req.user._id,
        ...req.body
      });
      res.status(201).json(application);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Get user's cards
  getUserCards: async (req, res) => {
    try {
      const cards = await UserCard.find({ user: req.user._id })
        .populate('cardType');
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Block/unblock card
  toggleCardBlock: async (req, res) => {
    try {
      const card = await UserCard.findById(req.params.id);
      card.status = card.status === 'active' ? 'blocked' : 'active';
      await card.save();
      res.json(card);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};
export default cardController