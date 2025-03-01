import { map, chunk } from 'lodash';
import { useState, Children } from 'react';
import ReadmeViewer from 'calypso/components/readme-viewer';
import ComponentPlayground from 'calypso/devdocs/design/component-playground';
import Placeholder from 'calypso/devdocs/devdocs-async-load/placeholder';
import { camelCaseToSlug, getComponentName } from 'calypso/devdocs/docs-example/util';
import DocsExampleWrapper from 'calypso/devdocs/docs-example/wrapper';
import { useInView } from 'calypso/lib/use-in-view';
import { getExampleCodeFromComponent } from './playground-utils';

const shouldShowInstance = ( example, filter, component ) => {
	const name = getComponentName( example );

	// let's show only one instance
	if ( component ) {
		const slug = camelCaseToSlug( name );
		return component === slug;
	}

	let searchPattern = name;

	if ( example.props.searchKeywords ) {
		searchPattern += ' ' + example.props.searchKeywords;
	}

	return ! filter || searchPattern.toLowerCase().indexOf( filter ) > -1;
};

const getReadmeFilePath = ( section, example ) => {
	let path = example.props.readmeFilePath;

	if ( ! path ) {
		return null;
	}

	if ( ! path.startsWith( '/' ) ) {
		path = `/client/${ section === 'design' ? 'components' : section }/${ path }`;
	}

	if ( ! path.endsWith( 'README.md' ) ) {
		path = `${ path }/README.md`;
	}

	return path;
};

const Collection = ( {
	children,
	component,
	examplesToMount = 10,
	filter,
	section = 'design',
} ) => {
	let showCounter = 0;
	const summary = [];

	const scroll = () => {
		window.scrollTo( 0, 0 );
	};

	const examples = Children.map( children, ( example ) => {
		if ( ! example || ! shouldShowInstance( example, filter, component ) ) {
			return null;
		}

		const exampleName = getComponentName( example );
		const exampleLink = `/devdocs/${ section }/${ encodeURIComponent(
			camelCaseToSlug( exampleName )
		) }`;
		const readmeFilePath = getReadmeFilePath( section, example );

		showCounter++;

		if ( filter ) {
			summary.push(
				<span key={ `instance-link-${ showCounter }` } className="design__instance-link">
					<a href={ exampleLink }>{ exampleName }</a>
				</span>
			);
		}

		const exampleCode = getExampleCodeFromComponent( example );
		if ( exampleCode ) {
			return (
				<div>
					<ComponentPlayground
						code={ exampleCode }
						name={ exampleName }
						unique={ !! component }
						url={ exampleLink }
						component={ component }
						section={ section }
					/>
					{ component && <ReadmeViewer readmeFilePath={ readmeFilePath } /> }
				</div>
			);
		}

		return (
			<div>
				<DocsExampleWrapper
					name={ exampleName }
					unique={ !! component }
					url={ exampleLink }
					onTitleClick={ scroll }
				>
					{ example }
				</DocsExampleWrapper>
				{ component && <ReadmeViewer readmeFilePath={ readmeFilePath } /> }
			</div>
		);
	} );

	return (
		<div className="design__collection">
			{ showCounter > 1 && filter && (
				<div className="design__instance-links">
					<span className="design__instance-links-label">Results:</span>
					{ summary }
				</div>
			) }

			{ /* Load first chunk, lazy load all others as needed. */ }

			{ examples.slice( 0, examplesToMount ) }

			{ map( chunk( examples.slice( examplesToMount ), examplesToMount ), ( exampleGroup ) => {
				const groupKey = map( exampleGroup, ( example ) => example.key ).join( '_' );
				return (
					<LazyExampleGroup
						key={ groupKey }
						exampleGroup={ exampleGroup }
						examplesToMount={ examplesToMount }
					/>
				);
			} ) }
		</div>
	);
};

function LazyExampleGroup( { exampleGroup, examplesToMount } ) {
	const [ inView, setInView ] = useState( false );
	const ref = useInView( () => setInView( true ) );
	return (
		<div ref={ ref }>{ inView ? exampleGroup : <Placeholder count={ examplesToMount } /> }</div>
	);
}

export default Collection;
