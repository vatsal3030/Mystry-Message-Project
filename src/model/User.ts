import mongoose, { Schema, Document } from "mongoose";
// this is like defined each field with it's data type
export interface Message extends Document {
   content: string;
   createdAt: Date;
}

export interface User extends Document {
   username: string;
   email: string;
   password: string;
   verifyCode: string;
   verifyCodeExpiry: Date;
   isVerified: boolean;
   isAcceptingMessages: boolean;
   messages: Message[];
}


const MessageSchema: Schema<Message> = new Schema({
   content: {
      type: String,
      required: true
   },
   createdAt: {
      type: Date,
      default: Date.now,
      required: true
   }
})

const UserSchema: Schema<User> = new Schema({
   username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      unique: true,
      minLength: [3, 'Username must be at least 3 characters long']
   },
   email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      match: [/.+\@.+\..+/, 'please use a valid email address'],
   },
   password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [6, 'Password must be at least 6 characters long'],
      // select:true
   },
   verifyCode: {
      type: String,
      required: [true, 'Verification code is required']
   },
   verifyCodeExpiry: {
      type: Date,
      required: [true, 'Verification code expiry is required']
   },
   isVerified: {
      type: Boolean,
      default: false
   }, 
   isAcceptingMessages: {
      type: Boolean,
      default: true
   },
   messages: [MessageSchema]
});

// this help when redefining this will not re run this mongoose.model<User>('User', UserSchema); . cause re reuning this cause of error.
const UserModel  = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);

export default UserModel;   