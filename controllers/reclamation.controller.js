// controllers/reclamation.controller.js
import { Reclamation } from "../models/reclamation.model.js";
import { User } from "../models/user.model.js";

const reclamationController = {
  // Create a new reclamation (user)
  createReclamation: async (req, res) => {
    try {
      const { subject, description } = req.body;
        const userId = req.user._id;
      const newReclamation = new Reclamation({
        user: userId, // Assuming req.user is populated with the authenticated user's info
        subject,
        description,
        status: 'pending',
        priority: 'medium'
      });

      await newReclamation.save();

      res.status(201).json({
        success: true,
        message: "Reclamation submitted successfully",
        reclamation: newReclamation
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get all reclamations (admin)
  getAllReclamations: async (req, res) => {
    try {
      const { status, search } = req.query;
      
      let query = {};
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (search) {
        query.$or = [
          { subject: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const reclamations = await Reclamation.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, reclamations });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get single reclamation (admin)
  getReclamationById: async (req, res) => {
    try {
      const reclamation = await Reclamation.findById(req.params.id)
        .populate('user', 'name email')

      if (!reclamation) {
        return res.status(404).json({ success: false, message: "Reclamation not found" });
      }

      res.status(200).json({ success: true, reclamation });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update reclamation status (admin)
  updateReclamationStatus: async (req, res) => {
    try {
      const { status } = req.body;
      
      const reclamation = await Reclamation.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      ).populate('user', 'name email');

      if (!reclamation) {
        return res.status(404).json({ success: false, message: "Reclamation not found" });
      }

      res.status(200).json({
        success: true,
        message: "Reclamation status updated",
        reclamation
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Add response to reclamation (admin)
  addResponse: async (req, res) => {
    try {
      const { responseMessage, status } = req.body;
      
      const reclamation = await Reclamation.findByIdAndUpdate(
        req.params.id,
        { 
          responseMessage,
          status: status || 'resolved'
        },
        { new: true }
      ).populate('user', 'name email');

      if (!reclamation) {
        return res.status(404).json({ success: false, message: "Reclamation not found" });
      }

      res.status(200).json({
        success: true,
        message: "Response added to reclamation",
        reclamation
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get user's reclamations (user)
  getUserReclamations: async (req, res) => {
    try {
      const reclamations = await Reclamation.find({ user: req.user._id })
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, reclamations });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

export default reclamationController;