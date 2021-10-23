import mongoose from 'mongoose';

// each codeforces group (e.g. https://codeforces.com/group/n3sTiYtHxI/) has a set of contests (aka sheets)
// every contest (e.g. https://codeforces.com/group/n3sTiYtHxI/contest/348729) consists of problems and submissions
// submissions exist under status page (e.g. https://codeforces.com/group/n3sTiYtHxI/contest/348729/status)
export const Contest = mongoose.model(
  'Contest',
  new mongoose.Schema(
    {
      id: { type: String, required: true, unique: true, index: true },
      name: { type: String, required: true },
      problems: [
        {
          id: String,
          name: String,
        },
      ],
      status: {
        totalPages: { type: Number, default: 1 },
        lastParsedPage: { type: Number, default: 1 },
      },
      groupId: { type: String, required: true, index: true },
    },
    { _id: false }, // disable _id for problems subschema
  ),
);
