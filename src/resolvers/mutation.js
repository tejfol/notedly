import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { AuthenticationError, ForbiddenError } from 'apollo-server-express';

import dotenv from 'dotenv';
dotenv.config();

import gravatar from '../util/gravatar.js';

export default {
  Mutation: {
    newNote: async (parent, args, { models }) => {
      return await models.Note.create({
        content: args.content,
        author: 'Adam Scott'
      });
    },

    deleteNote: async (parent, { id }, { models }) => {
      try {
        await models.Note.findOneAndRemove({ _id: id });
        return true;
      } catch (e) {
        return false;
      }
    },

    updateNote: async (parent, { content, id }, { models }) => {
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
    }
  }
};
