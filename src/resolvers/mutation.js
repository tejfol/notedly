import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import mongoose from 'mongoose';

import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

import dotenv from 'dotenv';
dotenv.config();

import gravatar from '../util/gravatar.js';

export const Mutation = {
  newNote: async (parent, args, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to create a note.');
    }
    return await models.Note.create({
      content: args.content,
      author: mongoose.Types.ObjectId(user.id)
    });
  },

  deleteNote: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note');
    }

    const note = await models.Note.findById(id);

    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError('You dont have premission to delete the note.');
    }

    try {
      await note.remove();
      return true;
    } catch (e) {
      return false;
    }
  },

  updateNote: async (parent, { content, id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to update a note');
    }

    const note = await models.Note.findById(id);

    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have premission to update the note");
    }

    return await models.Note.findOneAndUpdate(
      {
        _id: id
      },
      {
        $set: {
          content
        }
      },
      {
        new: true
      }
    );
  },

  signUp: async (parent, { username, email, password }, { models }) => {
    email = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        avatar,
        password: hashed
      });
      return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    } catch (e) {
      console.log(e);
      throw new Error('Error creating account');
    }
  },

  signIn: async (parent, { username, email, password }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({
      $or: [{ email }, { username }]
    });

    if (!user) {
      throw new AuthenticationError('Error signing in.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Not valid password.');
    }

    return jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  },

  toggleFavorite: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError();
    }
    //check if the user already favorited the note
    let noteCheck = await models.Note.findById(id);
    const hasUser = noteCheck.favoritedBy.indexOf(user.id);
    //if the user exists in the list
    //pull them from the list and reduce the favoriteCount by 1
    if (hasUser >= 0) {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: -1
          }
        },
        {
          new: true
        }
      );
    } else {
      return await models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1
          }
        },
        {
          new: true
        }
      );
    }
  }
};
