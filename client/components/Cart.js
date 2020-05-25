import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import User from './User';
import CartStyles from './styles/CartStyles';
import Supreme from './styles/Supreme';
import CloseButton from './styles/CloseButton';
import SickButton from './styles/SickButton';
import CartItem from './CartItem';

import calTotalPrice from '../lib/calTotalPrice';

export const LOCAL_STATE_QUERY = gql`
  query {
    cartOpen @client
  }
`;

export const TOGGLE_CART_MUTATION = gql`
  mutation {
    toggleCart @client
  }
`;

const Cart = () => {
  return (
    <User>
      {({ data }) => {
        if (!data) return <p>Loading...</p>;
        if (!data.me) return null;
        const { me } = data;

        return (
          <Mutation mutation={TOGGLE_CART_MUTATION}>
            {toggleCart => (
              <Query query={LOCAL_STATE_QUERY}>
                {({ data }) => {
                  if (!data) return <p>Loading...</p>;
                  return (
                    <CartStyles open={data.cartOpen}>
                      <header>
                        <CloseButton title="close" onClick={toggleCart}>
                          &times;
                        </CloseButton>
                        <Supreme>{me.name} Cart</Supreme>
                        <p>
                          You have {me.cart.length} Item
                          {me.cart.length <= 1 ? '' : 's'} in your cart
                        </p>
                      </header>
                      <ul>
                        {me.cart.map(cartItem => (
                          <CartItem key={cartItem.id} cartItem={cartItem} />
                        ))}
                      </ul>
                      <footer>
                        <p>{calTotalPrice(me.cart)}</p>
                        <SickButton>Checkout</SickButton>
                      </footer>
                    </CartStyles>
                  );
                }}
              </Query>
            )}
          </Mutation>
        );
      }}
    </User>
  );
};

export default Cart;
