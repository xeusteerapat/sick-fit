import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const SIGNIN_MUTATION = gql`
  mutation SIGNIN_MUTATION($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`;

export default class SignIn extends Component {
  state = {
    email: '',
    password: ''
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  render() {
    return (
      <Mutation
        mutation={SIGNIN_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signin, { error, loading }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await signin();
              this.setState({
                email: '',
                password: ''
              });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Signin to Your Acctount</h2>
              <ErrorMessage error={error} />
              <label htmlFor="email">
                Email
                <input
                  name="email"
                  type="text"
                  placeholder="Enter your email"
                  value={this.state.email}
                  onChange={this.handleChange}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={this.state.password}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Sing In!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}
