import React, { Component } from 'react'
import PropTypes from 'prop-types'

const propTypes = {
  children: PropTypes.node,
}

const defaultProps = {}

class Aside extends Component {

  render() {

    const { children, ...attributes } = this.props

    return (
      <React.Fragment>
        Aside
      </React.Fragment>
    );
  }
}

Aside.propTypes = propTypes
Aside.defaultProps = defaultProps

export default Aside
