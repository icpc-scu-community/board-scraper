import mongoose from 'mongoose';

// scrapper metadata
export const Scraper = mongoose.model(
  'Scraper',
  new mongoose.Schema(
    {
      lastUpdate: { type: Number, default: Date.now },
    },
    { capped: { max: 1, size: 1024 } },
  ),
);
