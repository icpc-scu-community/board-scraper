import { prop, modelOptions, getModelForClass, Severity } from '@typegoose/typegoose';

// each codeforces group (e.g. https://codeforces.com/group/n3sTiYtHxI/) has a set of contests (aka sheets)
// every contest (e.g. https://codeforces.com/group/n3sTiYtHxI/contest/348729) consists of problems and submissions
// submissions exist under status page (e.g. https://codeforces.com/group/n3sTiYtHxI/contest/348729/status)
@modelOptions({
  options: { allowMixed: Severity.ALLOW },
})
export class Contest {
  @prop({ required: true, unique: true, index: true })
  public id!: string;

  @prop({ required: true, index: true })
  public groupId!: string;

  @prop({ required: true })
  public name!: string;

  @prop({ default: [] })
  public problems!: {
    id: string;
    name: string;
  }[];

  @prop({ default: { totalPages: 1, lastParsedPage: 1 } })
  public status!: {
    totalPages: number;
    lastParsedPage: number;
  };
}

export const ContestModel = getModelForClass(Contest);
