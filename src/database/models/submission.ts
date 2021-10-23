import mongoose from 'mongoose';

export const Submission = mongoose.model(
  'Submission',
  new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // unique to handle parsing the same page twice
    handle: { type: String, required: true, index: true, lowercase: true },
    problem: { type: String, required: true },
    verdict: { type: String, required: true },
    contestId: { type: String, required: true, index: true },
  }),
);
