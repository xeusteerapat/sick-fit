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
  }
};

module.exports = Mutation;
