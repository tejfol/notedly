import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    //Assigns createdAt and updtedAt fields with a Data type
    timestamps: true
  }
);

const Note = mongoose.model('Note', noteSchema);

export default Note;
