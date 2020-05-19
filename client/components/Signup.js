import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import ErrorMessage from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';

const SIGNUP_MUTATION = gql`
  mutation SIGNUP_MUTATION(
    $email: String!
    $name: String!
    $password: String!
  ) {
    signup(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`;

export default class Signup extends Component {
  state = {
    email: '',
    name: '',
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
        mutation={SIGNUP_MUTATION}
        variables={this.state}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
      >
        {(signup, { error, loading }) => (
          <Form
            method="post"
            onSubmit={async e => {
              e.preventDefault();
              await signup();
              this.setState({
                email: '',
                name: '',
                password: ''
              });
            }}
          >
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Signup for An Acctount</h2>
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
              <label htmlFor="name">
                Name
                <input
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={this.state.name}
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
              <button type="submit">Sing Up!</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}
