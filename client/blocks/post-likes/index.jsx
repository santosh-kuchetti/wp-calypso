import config from '@automattic/calypso-config';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import QueryPostLikes from 'calypso/components/data/query-post-likes';
import Gravatar from 'calypso/components/gravatar';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { countPostLikes } from 'calypso/state/posts/selectors/count-post-likes';
import { getPostLikes } from 'calypso/state/posts/selectors/get-post-likes';

import './style.scss';

class PostLikes extends PureComponent {
	static defaultProps = {
		postType: 'post',
		showDisplayNames: false,
	};

	trackLikeClick = () => {
		this.props.recordGoogleEvent( 'Post Likes', 'Clicked on Gravatar' );
	};

	renderLike = ( like ) => {
		const { showDisplayNames } = this.props;

		const likeUrl = like.site_ID && like.site_visible ? '/read/blogs/' + like.site_ID : null;
		const LikeWrapper = likeUrl ? 'a' : 'span';

		const isFeatured = config.isEnabled( 'stats/enhance-post-detail' );

		return (
			<LikeWrapper
				key={ like.ID }
				href={ likeUrl }
				className="post-likes__item"
				onClick={ likeUrl ? this.trackLikeClick : null }
			>
				<Gravatar
					user={ like }
					alt={ like.login }
					title={ like.login }
					size={ isFeatured ? 32 : 24 }
				/>
				{ showDisplayNames && <span className="post-likes__display-name">{ like.name }</span> }
			</LikeWrapper>
		);
	};

	renderExtraCount() {
		const { likes, likeCount, showDisplayNames, translate, numberFormat } = this.props;

		const isFeatured = config.isEnabled( 'stats/enhance-post-detail' );

		if ( ! likes || likeCount <= likes.length ) {
			return null;
		}

		const extraCount = likeCount - likes.length;

		let message;
		if ( showDisplayNames ) {
			message = translate( '+ %(extraCount)s more', '+ %(extraCount)s more', {
				count: extraCount,
				args: { extraCount: numberFormat( extraCount ) },
			} );
		} else {
			message = '+ ' + numberFormat( extraCount );
		}

		if ( isFeatured ) {
			message = translate( '%(extraCount)s more', {
				args: { extraCount: numberFormat( extraCount ) },
			} );
		}

		return (
			<span key="placeholder" className="post-likes__count">
				{ message }
			</span>
		);
	}

	render() {
		const {
			likeCount,
			likes,
			postId,
			postType,
			siteId,
			translate,
			showDisplayNames,
			onMouseEnter,
			onMouseLeave,
		} = this.props;

		let noLikesLabel;

		if ( postType === 'page' ) {
			noLikesLabel = translate( 'There are no likes on this page yet.' );
		} else {
			noLikesLabel = translate( 'There are no likes on this post yet.' );
		}

		const isLoading = ! likes;

		const classes = classnames( 'post-likes', {
			'has-display-names': showDisplayNames,
			'no-likes': likeCount === 0,
		} );
		const extraProps = { onMouseEnter, onMouseLeave };

		return (
			<div className={ classes } { ...extraProps }>
				<QueryPostLikes siteId={ siteId } postId={ postId } needsLikers={ true } />
				{ isLoading && (
					<span key="placeholder" className="post-likes__count is-loading">
						…
					</span>
				) }
				{ likes && likes.map( this.renderLike ) }
				{ this.renderExtraCount() }
				{ likeCount === 0 && noLikesLabel }
			</div>
		);
	}
}

export default connect(
	( state, { siteId, postId } ) => {
		const likeCount = countPostLikes( state, siteId, postId );
		const likes = getPostLikes( state, siteId, postId );
		return {
			likeCount,
			likes,
		};
	},
	{ recordGoogleEvent }
)( localize( PostLikes ) );
