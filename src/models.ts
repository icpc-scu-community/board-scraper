import mongoose from "mongoose";

export const Submission = mongoose.model("Submission", new mongoose.Schema({
    id: { type: String },
    date: { type: String },
    name: { type: String },
    problem: { type: String },
    lang: { type: String },
    verdict: { type: String },
    time: { type: String },
    memory: { type: String }
}));

export const Contest = mongoose.model("Contest", new mongoose.Schema({
    id: { type: String },
    endPage: { type: Number },
    lastParsedPage: { type: Number }
}));