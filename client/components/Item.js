import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Item extends Component {
  static propTypes = {
    item: PropTypes.object.isRequired
  };

  render() {
    return <div></div>;
  }
}
