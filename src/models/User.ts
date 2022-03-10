import { model, Schema, Types } from "mongoose";

export type UserType = {
  _id?: string;
  name: string;
  email: string;
  password: string;
};

const UserSchema = new Schema<UserType>({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

export default model<UserType>("User", UserSchema);
