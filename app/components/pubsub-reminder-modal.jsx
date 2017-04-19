import React from 'react';
import {connect} from 'react-redux';

var PubsubReminderModal = React.createClass({
	propTypes: {
		removeModal: React.PropTypes.func
	},
	render: function () {
		return (
			<div
				className="bordered"
				>
				<div>
					Remember to have your IPFS Daemon started using:
				</div>
				<div>
					ipfs daemon --enable-pubsub-experiment
				</div>
			</div>
		);
	}
});

var mapDispatchToProps = dispatch => {
	return {
		removeModal: function () {
			dispatch({
				type: 'REMOVE_MODAL'
			});
		}
	};
};

export default connect(
	null,
	mapDispatchToProps
)(PubsubReminderModal);
