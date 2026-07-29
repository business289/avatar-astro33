import mongoose, { Schema, Document } from 'mongoose';

export interface ITemple extends Document {
  name: string;
  slug: string;
  youtubeChannelId: string;
  currentLiveVideoId: string | null;
  isLive: boolean;
  lastCheckedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const templeSchema = new Schema<ITemple>(
  {
    name: {
      type: String,
      required: [true, 'Temple name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    youtubeChannelId: {
      type: String,
      default: '',
      trim: true,
    },
    currentLiveVideoId: {
      type: String,
      default: null,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    lastCheckedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ITemple>('Temple', templeSchema);
