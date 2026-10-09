import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  source: { type: String, default: 'Website Visitor Popup' },
  syncedToSheet: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Lead = mongoose.models.Lead || mongoose.model('Lead', LeadSchema, 'Leads');
export default Lead;
