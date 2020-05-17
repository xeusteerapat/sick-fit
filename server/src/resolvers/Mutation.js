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
  }
};

module.exports = Mutation;
