import { prop, getModelForClass, DocumentType } from '@typegoose/typegoose';

class Submission {
  @prop({ required: true, unique: true })
  public id!: string;

  @prop({ required: true, lowercase: true, index: true })
  public handle!: string;

  @prop({ required: true })
  public problem!: string;

  @prop({ required: true })
  public verdict!: string;

  @prop({ required: true, index: true })
  public contestId!: string;

  @prop({ required: true, index: true })
  public groupId!: string;
}

export const SubmissionModel = getModelForClass(Submission);
export type SubmissionType = DocumentType<Submission>;
