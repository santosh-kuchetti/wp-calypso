import { Gridicon } from '@automattic/components';
import classnames from 'classnames';
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ExternalLink from 'calypso/components/external-link';

const noop = () => {};

export default class PopoverMenuItem extends Component {
	static propTypes = {
		href: PropTypes.string,
		className: PropTypes.string,
		isSelected: PropTypes.bool,
		icon: PropTypes.oneOfType( [ PropTypes.object, PropTypes.string ] ),
		focusOnHover: PropTypes.bool,
		onClick: PropTypes.func,
		onMouseOver: PropTypes.func,
		isExternalLink: PropTypes.bool,
		itemComponent: PropTypes.oneOfType( [ PropTypes.func, PropTypes.string ] ),
	};

	static defaultProps = {
		isSelected: false,
		focusOnHover: true,
		onMouseOver: noop,
		itemComponent: 'button',
	};

	handleMouseOver = ( event ) => {
		const { focusOnHover } = this.props;

		if ( focusOnHover ) {
			event.target.focus();
		}

		this.props.onMouseOver();
	};

	render() {
		const { children, className, href, icon, isExternalLink, isSelected } = this.props;
		const itemProps = omit(
			this.props,
			'icon',
			'focusOnHover',
			'isSelected',
			'isExternalLink',
			'className',
			'itemComponent'
		);
		const classes = classnames( 'popover__menu-item', className, {
			'is-selected': isSelected,
		} );

		let ItemComponent = this.props.itemComponent;
		if ( isExternalLink && href ) {
			ItemComponent = ExternalLink;
			itemProps.icon = true;
		} else if ( href ) {
			ItemComponent = 'a';
		}

		let itemIcon = icon;
		if ( typeof icon === 'string' ) {
			itemIcon = <Gridicon icon={ icon } size={ 18 } />;
		}

		return (
			<ItemComponent
				role="menuitem"
				tabIndex="-1"
				className={ classes }
				{ ...itemProps }
				onMouseOver={ this.handleMouseOver }
			>
				{ itemIcon }
				{ children }
			</ItemComponent>
		);
	}
}
