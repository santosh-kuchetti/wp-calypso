import { getCurrencyObject } from '@automattic/format-currency';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { Component, createElement } from 'react';
import Badge from 'calypso/components/badge';

import './style.scss';

export class PlanPrice extends Component< PlanPriceProps > {
	render() {
		const {
			currencyCode = 'USD',
			rawPrice,
			isSmallestUnit,
			original,
			discounted,
			className,
			displayFlatPrice,
			displayPerMonthNotation,
			productDisplayPrice,
			isOnSale,
			taxText,
			omitHeading,
			is2023OnboardingPricingGrid,
			isLargeCurrency,
		} = this.props;

		const classes = classNames( 'plan-price', className, {
			'is-original': original,
			'is-discounted': discounted,
			'is-large-currency': isLargeCurrency,
		} );

		const tagName = omitHeading ? 'span' : 'h4';

		const areThereMultipleRawPrices = rawPrice && Array.isArray( rawPrice ) && rawPrice.length > 1;

		if ( productDisplayPrice && ! areThereMultipleRawPrices ) {
			return createElement(
				tagName,
				{ className: classes },
				<span
					className="plan-price__integer"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ { __html: productDisplayPrice } }
				/>
			);
		}

		if ( ! currencyCode || rawPrice === undefined ) {
			return null;
		}

		// "Normalize" the input price or price range.
		const rawPriceRange = Array.isArray( rawPrice ) ? rawPrice.slice( 0, 2 ) : [ rawPrice ];

		// If zero is in an array of length 2, render nothing
		if ( Array.isArray( rawPrice ) && rawPriceRange.includes( 0 ) ) {
			return null;
		}

		if ( displayFlatPrice ) {
			return (
				<FlatPriceDisplay
					smallerPrice={ rawPriceRange[ 0 ] }
					higherPrice={ rawPriceRange[ 1 ] }
					currencyCode={ currencyCode }
					className={ classes }
					isSmallestUnit={ isSmallestUnit }
				/>
			);
		}

		return (
			<MultiPriceDisplay
				className={ classes }
				tagName={ tagName }
				smallerPrice={ rawPriceRange[ 0 ] }
				higherPrice={ rawPriceRange[ 1 ] }
				currencyCode={ currencyCode }
				taxText={ taxText }
				displayPerMonthNotation={ displayPerMonthNotation }
				isOnSale={ isOnSale }
				is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
				isSmallestUnit={ isSmallestUnit }
			/>
		);
	}
}

export default PlanPrice;

export interface PlanPriceProps {
	/**
	 * Can be either a floating point price to display, or a pair of floating
	 * point prices.
	 *
	 * If there are a pair of prices, they will be displayed as a range (eg:
	 * '$5-$10').
	 *
	 * If either of the numbers is a 0, nothing will be rendered at all.
	 *
	 * If specified along with `productDisplayPrice`, this will be ignored unless
	 * it is an array, in which case `productDisplayPrice` will be ignored.
	 */
	rawPrice?: number | [ number, number ];

	/**
	 * If true, the number(s) in `rawPrice` will be interpreted as integers in
	 * the currency's smallest unit rather than floating point numbers.
	 *
	 * Has no effect if `productDisplayPrice` is being used.
	 */
	isSmallestUnit?: boolean;

	/**
	 * Adds the `is-original` CSS class.
	 */
	original?: boolean;

	/**
	 * Adds the `is-discounted` CSS class.
	 */
	discounted?: boolean;

	/**
	 * The currency code for the price.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 *
	 * Defaults to `USD` if not set or if undefined, but if it is `null`, the
	 * component will render nothing at all (if using `rawPrice`).
	 */
	currencyCode?: string | null;

	/**
	 * A string to add to the className of the component's output.
	 */
	className?: string;

	/**
	 * Displays a "Sale" banner over the price if set.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 * Also ignored if `displayFlatPrice` is set.
	 */
	isOnSale?: boolean;

	/**
	 * Text to display adjacent to the price referring to taxes.
	 *
	 * It is rendered inside the string '(+X tax)' where `X` is this prop.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 * Also ignored if `displayFlatPrice` is set.
	 */
	taxText?: string;

	/**
	 * Whether to display a "per month" label adjacent to the price.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 * Also ignored if `displayFlatPrice` is set.
	 */
	displayPerMonthNotation?: boolean;

	/**
	 * A pre-formatted price to display.
	 *
	 * Ignored if `rawPrice` is set and is an array.
	 */
	productDisplayPrice?: string;

	/**
	 * If set, the component will render a `span` instead of an `h4`.
	 */
	omitHeading?: boolean;

	/**
	 * If set, the component will render without separating the integer part of
	 * the price from the decimal part of the price.
	 *
	 * If set, many of the other formatting options will be ignored.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 */
	displayFlatPrice?: boolean;

	/**
	 * If true, this renders each price inside a `div` with the class
	 * `plan-price__integer-fraction` but is otherwise identical to the output normally used by `rawPrice`.
	 *
	 * Ignored if `displayFlatPrice` is set.
	 *
	 * Ignored if `productDisplayPrice` is set and `rawPrice` is not an array.
	 */
	is2023OnboardingPricingGrid?: boolean;

	/**
	 * If true, this renders the price with a smaller font size by adding the `is-large-currency` class.
	 */
	isLargeCurrency?: boolean;
}

function PriceWithoutHtml( {
	price,
	currencyCode,
	isSmallestUnit,
}: {
	price: number;
	currencyCode: string;
	isSmallestUnit?: boolean;
} ) {
	const priceObj = getCurrencyObject( price, currencyCode, { isSmallestUnit } );
	if ( priceObj.hasNonZeroFraction ) {
		return <>{ `${ priceObj.integer }${ priceObj.fraction }` }</>;
	}
	return <>{ priceObj.integer }</>;
}

export function priceAsString( price: number, currencyCode: string, isSmallestUnit = false ) {
	const priceObj = getCurrencyObject( price, currencyCode, { isSmallestUnit } );
	return (
		priceObj.symbol +
		( priceObj.hasNonZeroFraction
			? `${ priceObj.integer }${ priceObj.fraction }`
			: priceObj.integer )
	);
}

function FlatPriceDisplay( {
	smallerPrice,
	higherPrice,
	currencyCode,
	className,
	isSmallestUnit,
}: {
	smallerPrice: number;
	higherPrice?: number;
	currencyCode: string;
	className?: string;
	isSmallestUnit?: boolean;
} ) {
	const { symbol: currencySymbol } = getCurrencyObject( smallerPrice, currencyCode );
	const translate = useTranslate();

	// TODO: render currencySymbol on the localized side (before or after) of
	// the price. We can use `symbolPosition` from `getCurrencyObject`.
	if ( ! higherPrice ) {
		return (
			<span className={ className }>
				{ currencySymbol }
				<PriceWithoutHtml
					price={ smallerPrice }
					currencyCode={ currencyCode }
					isSmallestUnit={ isSmallestUnit }
				/>
			</span>
		);
	}

	return (
		<span className={ className }>
			{ currencySymbol }
			{ translate( '%(smallerPrice)s-%(higherPrice)s', {
				args: {
					smallerPrice: (
						<PriceWithoutHtml
							price={ smallerPrice }
							currencyCode={ currencyCode }
							isSmallestUnit={ isSmallestUnit }
						/>
					),
					higherPrice: (
						<PriceWithoutHtml
							price={ higherPrice }
							currencyCode={ currencyCode }
							isSmallestUnit={ isSmallestUnit }
						/>
					),
				},
				comment: 'The price range for a particular product',
			} ) }
		</span>
	);
}

function MultiPriceDisplay( {
	tagName,
	className,
	smallerPrice,
	higherPrice,
	currencyCode,
	taxText,
	displayPerMonthNotation,
	isOnSale,
	is2023OnboardingPricingGrid,
	isSmallestUnit,
}: {
	tagName: 'h4' | 'span';
	className?: string;
	smallerPrice: number;
	higherPrice?: number;
	currencyCode: string;
	taxText?: string;
	displayPerMonthNotation?: boolean;
	isOnSale?: boolean;
	is2023OnboardingPricingGrid?: boolean;
	isSmallestUnit?: boolean;
} ) {
	const { symbol: currencySymbol } = getCurrencyObject( smallerPrice, currencyCode );
	const translate = useTranslate();

	// TODO: render currencySymbol on the localized side (before or after) of
	// the price. We can use `symbolPosition` from `getCurrencyObject`.
	return createElement(
		tagName,
		{ className },
		<>
			<sup className="plan-price__currency-symbol">{ currencySymbol }</sup>
			{ ! higherPrice && (
				<HtmlPriceDisplay
					price={ smallerPrice }
					currencyCode={ currencyCode }
					is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
					isSmallestUnit={ isSmallestUnit }
				/>
			) }
			{ higherPrice &&
				translate( '{{smallerPrice/}}-{{higherPrice/}}', {
					components: {
						smallerPrice: (
							<HtmlPriceDisplay
								price={ smallerPrice }
								currencyCode={ currencyCode }
								is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
								isSmallestUnit={ isSmallestUnit }
							/>
						),
						higherPrice: (
							<HtmlPriceDisplay
								price={ higherPrice }
								currencyCode={ currencyCode }
								is2023OnboardingPricingGrid={ is2023OnboardingPricingGrid }
								isSmallestUnit={ isSmallestUnit }
							/>
						),
					},
					comment: 'The price range for a particular product',
				} ) }
			{ taxText && (
				<sup className="plan-price__tax-amount">
					{ translate( '(+%(taxText)s tax)', { args: { taxText } } ) }
				</sup>
			) }
			{ displayPerMonthNotation && (
				<span className="plan-price__term">
					{ translate( 'per{{newline/}}month', {
						components: { newline: <br /> },
						comment:
							'Displays next to the price. You can remove the "{{newline/}}" if it is not proper for your language.',
					} ) }
				</span>
			) }
			{ isOnSale && (
				<Badge>
					{ translate( 'Sale', {
						comment: 'Shown next to a domain that has a special discounted sale price',
					} ) }
				</Badge>
			) }
		</>
	);
}

function HtmlPriceDisplay( {
	price,
	currencyCode,
	is2023OnboardingPricingGrid,
	isSmallestUnit,
}: {
	price: number;
	currencyCode: string;
	is2023OnboardingPricingGrid?: boolean;
	isSmallestUnit?: boolean;
} ) {
	const priceObj = getCurrencyObject( price, currencyCode, { isSmallestUnit } );

	if ( is2023OnboardingPricingGrid ) {
		return (
			<div className="plan-price__integer-fraction">
				<span className="plan-price__integer">{ priceObj.integer }</span>
				<sup className="plan-price__fraction">
					{ priceObj.hasNonZeroFraction && priceObj.fraction }
				</sup>
			</div>
		);
	}

	return (
		<>
			<span className="plan-price__integer">{ priceObj.integer }</span>
			<sup className="plan-price__fraction">
				{ priceObj.hasNonZeroFraction && priceObj.fraction }
			</sup>
		</>
	);
}
