// models/reclamation.model.js
import mongoose from "mongoose";

const reclamationSchema = new mongoose.Schema({
  user: { 
    type: String, 
    
  },
  subject: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'resolved', 'rejected'], 
    default: 'pending' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  category: { 
    type: String, 
  },
  responseMessage: { 
    type: String 
  },
}, { timestamps: true });

export const Reclamation = mongoose.model('Reclamation', reclamationSchema);