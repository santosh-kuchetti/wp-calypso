import classNames from 'classnames';
import { createElement } from 'react';
import ReactDomServer from 'react-dom/server';
import { deserialize } from 'calypso/lib/media-serialization';
import * as MediaUtils from 'calypso/lib/media/utils';
import { parse, stringify } from 'calypso/lib/shortcode';

/**
 * Module variables
 */
const Markup = {
	/**
	 * Given a media object and a site, returns a markup string representing that object
	 * as HTML.
	 *
	 * @param  {Object} site    A site object
	 * @param  {Object} media   A media object
	 * @param  {Object} options Appearance options
	 * @returns {string}         A markup string
	 */
	get: function ( site, media, options ) {
		if ( ! media || media.hasOwnProperty( 'status' ) ) {
			return '';
		}

		const mimePrefix = MediaUtils.getMimePrefix( media );

		// Attempt to find a matching function in the mimeTypes object using
		// the MIME type prefix
		if ( mimePrefix && 'function' === typeof Markup.mimeTypes[ mimePrefix ] ) {
			return Markup.mimeTypes[ mimePrefix ]( site, media, options );
		}

		return Markup.link( media );
	},

	/**
	 * Given a media object, returns a link markup string representing that
	 * object.
	 *
	 * @param  {Object} media A media object
	 * @returns {string}       A link markup string
	 */
	link: function ( media ) {
		const element = createElement(
			'a',
			{
				href: media.URL,
				title: media.title,
			},
			media.title
		);

		return ReactDomServer.renderToStaticMarkup( element );
	},

	/**
	 * Given a media object or markup string and a site, returns a caption React element.
	 *
	 * Adapted from WordPress.
	 *
	 * @copyright 2015 by the WordPress contributors.
	 * @license LGPL-2.1
	 * @see https://github.com/WordPress/WordPress/blob/4.3/wp-includes/js/tinymce/plugins/wpeditimage/plugin.js#L97-L157
	 * @param  {Object} site           A site object
	 * @param  {(Object | string)} media A media object or markup string
	 * @returns {string}                A caption React element, or null if not
	 *                                 a captioned item.
	 */
	caption: function ( site, media ) {
		let img;
		let caption;
		let width;

		if ( 'string' !== typeof media ) {
			media = Markup.get( site, media );
		}

		const parsed = parse( media );
		if ( ! parsed || ! parsed.content ) {
			return null;
		}

		const match = parsed.content.match( /((?:<a [^>]+>)?<img [^>]+>(?:<\/a>)?)([\s\S]*)/i );
		if ( match ) {
			img = match[ 1 ].trim();
			caption = match[ 2 ].trim();
		}

		width = parsed.attrs.named.width;
		if ( ! width ) {
			width = deserialize( img ).width;
		}

		/*eslint-disable react/no-danger*/
		return (
			<dl
				className={ classNames(
					'wp-caption',
					parsed.attrs.named.align,
					parsed.attrs.named.classes
				) }
				style={ { width: parseInt( width, 10 ) } }
			>
				<dt className="wp-caption-dt" dangerouslySetInnerHTML={ { __html: img } } />
				<dd className="wp-caption-dd">{ caption }</dd>
			</dl>
		);
		/*eslint-enable react/no-danger*/
	},

	mimeTypes: {
		/**
		 * Given an image media object and a site, returns a markup string representing that
		 * image object as HTML.
		 *
		 * @param  {Object} site    A site object
		 * @param  {Object} media   An image media object
		 * @param  {Object} options Appearance options
		 * @returns {string}         An image markup string
		 */
		image: function ( site, media, options ) {
			options = {
				size: 'full',
				align: 'none',
				forceResize: false,
				...options,
			};

			let width;
			let height;
			if ( 'full' === options.size ) {
				width = media.width;
				height = media.height;
			} else {
				const dimensions = MediaUtils.getThumbnailSizeDimensions( options.size, site );
				const ratio = Math.min(
					dimensions.width / media.width || Infinity,
					dimensions.height / media.height || Infinity
				);

				width = Math.round( media.width * ratio );
				height = Math.round( media.height * ratio );
			}

			let urlOptions;
			if ( options.forceResize || ( site && ! site.jetpack && width && width !== media.width ) ) {
				urlOptions = { maxWidth: width };
			} else {
				urlOptions = { size: options.size };
			}

			const img = createElement( 'img', {
				src: MediaUtils.url( media, urlOptions ),
				alt: media.alt || media.title,
				width: isFinite( width ) ? width : null,
				height: isFinite( height ) ? height : null,
				className: classNames(
					'align' + options.align,
					'size-' + options.size,
					'wp-image-' + media.ID
				),
				// make data-istransient a boolean att https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attribute
				// it is false if it doesn't exist
				'data-istransient': media.transient ? 'istransient' : null,
			} );

			let markup = ReactDomServer.renderToStaticMarkup( img );
			if ( media.caption && width ) {
				markup = stringify( {
					tag: 'caption',
					attrs: {
						id: 'attachment_' + media.ID,
						width: width,
					},
					content: [ markup, media.caption ].join( ' ' ),
				} );
			}

			return markup;
		},

		/**
		 * Given an audio media object, returns a markup string representing that
		 * audio object as HTML.
		 *
		 * @param  {Object} site  A site object
		 * @param  {Object} media An audio media object
		 * @returns {string}       An audio markup string
		 */
		audio: function ( site, media ) {
			return stringify( {
				tag: 'audio',
				attrs: {
					src: media.URL,
				},
			} );
		},

		/**
		 * Given a video media object, returns a markup string representing that
		 * video object as HTML.
		 *
		 * @param  {Object} site  A site object
		 * @param  {string} media A video media object
		 * @returns {string}       A video markup string
		 */
		video: function ( site, media ) {
			if ( MediaUtils.isVideoPressItem( media ) ) {
				return stringify( {
					tag: 'wpvideo',
					attrs: [ media.videopress_guid ],
					type: 'single',
				} );
			}

			return stringify( {
				tag: 'video',
				attrs: {
					src: media.URL,
					height: media.height,
					width: media.width,
				},
			} );
		},
	},
};

export default Markup;
