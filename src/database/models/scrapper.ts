import { prop, modelOptions, getModelForClass } from '@typegoose/typegoose';

// scrapper metadata
@modelOptions({
  schemaOptions: {
    capped: { max: 1, size: 1024 },
  },
})
export class Scrapper {
  @prop({ default: Date.now })
  public lastUpdate!: number;
}

export const ScrapperModel = getModelForClass(Scrapper);
