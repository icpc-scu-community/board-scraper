import mongoose from 'mongoose';

export const Submission = mongoose.model(
  'Submission',
  new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // unique to handle parsing the same page twice
    name: { type: String, required: true, index: true, lowercase: true },
    problem: { type: String, required: true },
    verdict: { type: String, required: true },
    contestId: { type: String, required: true, index: true }, // codeforces contest id
  }),
);

export const Contest = mongoose.model(
  'Contest',
  new mongoose.Schema({
    id: { type: String, required: true, unique: true, index: true },
    endPage: { type: Number, required: true },
    lastParsedPage: { type: Number, required: true },
  }),
);

export const Scraper = mongoose.model(
  'Scraper',
  new mongoose.Schema(
    {
      lastUpdate: { type: Number, default: Date.now },
    },
    { capped: { max: 1, size: 1024 } },
  ),
);

export const Sheet = mongoose.model(
  'Sheet',
  new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    problems: [
      {
        id: String,
        name: String,
      },
    ],
  }),
);
