const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Mutation = {
  createItem: async (parent, args, ctx, info) => {
    // TODO: Check if user is logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          ...args
        }
      },
      info
    );
    return item;
  },
  updateItem: async (parent, args, ctx, info) => {
    const updates = { ...args }; // copy args
    delete updates.id;

    return ctx.db.mutation.updateItem(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  },
  deleteItem: async (parent, args, ctx, info) => {
    const item = await ctx.db.query.item(
      {
        where: { id: args.id }
      },
      `{id, title }`
    );

    return ctx.db.mutation.deleteItem(
      {
        where: { id: args.id }
      },
      info
    );
  },
  signup: async (parent, args, ctx, info) => {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 10);

    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] }
        }
      },
      info
    );

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    return user;
  },
  signin: async (parent, { email, password }, ctx, info) => {
    const user = await ctx.db.query.user({
      where: { email }
    });

    if (!user) {
      throw new Error('No user found');
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);

    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    return user;
  }
};

module.exports = Mutation;
