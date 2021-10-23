import { prop, modelOptions, getModelForClass, DocumentType } from '@typegoose/typegoose';

// scrapper metadata
@modelOptions({
  schemaOptions: {
    capped: { max: 1, size: 1024 },
  },
})
class Scrapper {
  @prop({ default: Date.now })
  public lastUpdate!: number;
}

export const ScrapperModel = getModelForClass(Scrapper);
export type ScrapperType = DocumentType<Scrapper>;
