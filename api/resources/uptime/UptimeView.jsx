const React = require('react')
const PropTypes = require('prop-types')

class UptimeView extends React.Component {
  render() {
    return (
      <p>
        {this.props.uptime}
      </p>
    )
  }
}

UptimeView.propTypes = {
  uptime: PropTypes.number.isRequired,
}

module.exports = UptimeView
