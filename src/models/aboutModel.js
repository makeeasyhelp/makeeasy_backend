const mongoose = require('mongoose');

/**
 * About Schema
 */
const AboutSchema = new mongoose.Schema({
  mission: {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    logoUrl: { type: String, trim: true }
  },
  story: {
    heading: { type: String, default: "Our Story" },
    description: { type: String, required: true, trim: true },
    highlights: {
      customers: { type: String },   // e.g. "10,000+"
      providers: { type: String },   // e.g. "500+"
      cities: { type: String }       // e.g. "15+"
    }
  },
  coreValues: [
    {
      title: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true }
    }
  ],
  leadershipTeam: [
    {
      name: { type: String, required: true, trim: true },
      role: { type: String, required: true, trim: true },
      bio: { type: String, required: true, trim: true },
      imageUrl: { type: String, trim: true },
      socials: {
        linkedin: { type: String, trim: true },
        twitter: { type: String, trim: true },
        facebook: { type: String, trim: true }
      }
    }
  ],
  blog: [
    {
      category: { type: String, required: true, trim: true },
      date: { type: Date, required: true },
      title: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
      link: { type: String, trim: true }
    }
  ],
  journey: [
    {
      year: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true }
    }
  ],
  community: {
    heading: { type: String, default: "Join the MakeEasy Community" },
    description: { type: String, trim: true },
    buttons: [
      {
        text: { type: String, required: true },
        link: { type: String, required: true }
      }
    ]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('About', AboutSchema);
