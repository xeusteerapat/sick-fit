const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require('../utils');

const Mutation = {
  createItem: async (parent, args, ctx, info) => {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in to do that!');
    }
    // TODO: Check if user is logged in
    const item = await ctx.db.mutation.createItem(
      {
        data: {
          user: {
            // create relationship between user and item
            connect: {
              id: ctx.request.userId
            }
          },
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
      `{ id, title user { id } }`
    );

    // check if they own that item or have the permission
    const ownItem = item.user.id === ctx.request.userId;
    const hasPermissions = ctx.request.user.permissions.some(permission =>
      ['ADMIN', 'ITEMDELETE'].includes(permission)
    );

    if (!ownItem && !hasPermissions) {
      throw new Error(`You don't have permission to do that`);
    }

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
  },
  signout: (parent, args, ctx, info) => {
    ctx.response.clearCookie('token');
    return { message: 'Goodbye' };
  },
  requestReset: async (parent, args, ctx, info) => {
    // find user according to email request
    const user = await ctx.db.query.user({
      where: { email: args.email }
    });

    if (!user) {
      throw new Error('No such user found for this email');
    }

    // set a reset token
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry }
    });

    // send email for reset token
    const mailRes = await transport.sendMail({
      from: 'sickfits@sickfits.com',
      to: user.email,
      subject: 'Your Password Reset Token',
      html: makeANiceEmail(`
      Your Password Reset Token is here!
      \n\n
      <a href="${process.env.FRONT_END_URL}/reset?resetToken=${resetToken}">
        Click Here to Reset
      </a>
      `)
    });

    return { message: 'Successfully' };
  },
  resetPassword: async (parent, args, ctx, info) => {
    if (args.password !== args.confirmPassword) {
      throw new Error('Password not match');
    }

    // check if token expire
    const [user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000
      }
    });

    if (!user) {
      throw new Error('Invalid token or expired!');
    }

    const password = await bcrypt.hash(args.password, 10);
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    });

    return updatedUser;
  },
  updatePermissions: async (parent, args, ctx, info) => {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in');
    }

    const currentUser = await ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );

    hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.mutation.updateUser(
      {
        data: {
          permissions: {
            set: args.permissions
          }
        },
        where: {
          id: args.userId
        }
      },
      info
    );
  },
  addToCart: async (parent, args, ctx, info) => {
    // Make sure user signed in
    const { userId } = ctx.request;
    if (!userId) {
      throw new Error('You must be signed in');
    }

    // Query the users current cart
    const [existingCartItem] = await ctx.db.query.cartItems({
      user: { id: userId },
      item: { id: args.is }
    });

    // Check if that item is already in cart and increment by 1 if it is
    if (existingCartItem) {
      console.log('this item already in your cart');
      return ctx.db.mutation.updateCartItem(
        {
          where: { id: existingCartItem.id },
          data: {
            quantity: existingCartItem.quantity + 1
          }
        },
        info
      );
    }

    // If it's not, create fresh CartItem for that user
    return ctx.db.mutation.createCartItem(
      {
        data: {
          user: {
            connect: { id: userId }
          },
          item: {
            connect: { id: args.id }
          }
        }
      },
      info
    );
  }
};

module.exports = Mutation;
