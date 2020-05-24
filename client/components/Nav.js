import Link from 'next/link';
import NavStyles from './styles/NavStyles';
import { Mutation } from 'react-apollo';
import { TOGGLE_CART_MUTATION } from './Cart';
import User from './User';
import Signout from './Signout';

const Nav = () => {
  return (
    <User>
      {({ data, loading }) => {
        if (loading) return <p>loading...</p>;
        return (
          <NavStyles>
            <Link href="/items">
              <a>Shop</a>
            </Link>
            {data.me && (
              <>
                <Link href="/me">
                  <a>{data.me.name}</a>
                </Link>
                <Link href="/sell">
                  <a>Sell</a>
                </Link>
                <Link href="/orders">
                  <a>Orders</a>
                </Link>
                <Link href="/me">
                  <a>Account</a>
                </Link>
                <Signout />
                <Mutation mutation={TOGGLE_CART_MUTATION}>
                  {toggleCart => <button onClick={toggleCart}>My Cart</button>}
                </Mutation>
              </>
            )}
            {!data.me && (
              <Link href="/signup">
                <a>Sign In</a>
              </Link>
            )}
          </NavStyles>
        );
      }}
    </User>
  );
};

export default Nav;
