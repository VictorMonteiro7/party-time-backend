import { model, Schema, Types } from "mongoose";

type PartyType = {
  title: string;
  description: string;
  date: Date;
  photos?: string[];
  privacy: boolean;
  userId?: string;
};

const PartySchema = new Schema<PartyType>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  photos: {
    type: [String],
  },
  privacy: {
    type: Boolean,
  },
  userId: {
    type: String,
  },
  date: {
    type: Date,
  },
});

export default model("Party", PartySchema);
