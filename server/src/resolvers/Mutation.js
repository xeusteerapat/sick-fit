const Mutation = {
  createDog: (parent, args, ctx, info) => {
    // console.log(parent);
    // console.log(args);
    console.log(ctx);
    // console.log(info);
    return {
      name: args.name
    };
  }
};

module.exports = Mutation;
