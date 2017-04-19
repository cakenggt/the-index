import React from 'react';
import {connect} from 'react-redux';
import {IndexLink} from 'react-router';
import ModalContainer from './modal-container.jsx';
import PubsubReminderModal from './pubsub-reminder-modal.jsx';

var mapStateToProps = state => {
	return {
		modal: state.modal.modal
	};
};

var IndexView = React.createClass({
	propTypes: {
		children: React.PropTypes.object,
		modal: React.PropTypes.node
	},
	render: function () {
		var modal;
		switch (this.props.modal) {
			case 'PUBSUB_REMINDER':
				modal = <PubsubReminderModal/>;
				break;
			default:
				modal = null;
		}
		return (
			<div
				className="container"
				>
				<ModalContainer
					modal={modal}
					>
					<h1>
						<IndexLink
							to="/"
							>
							The Index
						</IndexLink>
					</h1>
					{this.props.children}
				</ModalContainer>
			</div>
		);
	}
});

export default connect(
	mapStateToProps
)(IndexView);
