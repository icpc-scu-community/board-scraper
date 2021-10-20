import mongoose from 'mongoose';

export const Submission = mongoose.model(
  'Submission',
  new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // unique to handle parsing the same page twice
    who: { type: String, required: true, index: true },
    problem: { type: String, required: true },
    verdict: { type: String, required: true },
    contestId: { type: String, required: true, index: true },
  }),
);
