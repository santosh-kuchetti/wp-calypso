import { TranslateResult, useTranslate } from 'i18n-calypso';
import creditCardAmexImage from 'calypso/assets/images/upgrades/cc-amex.svg';
import creditCardDinersImage from 'calypso/assets/images/upgrades/cc-diners.svg';
import creditCardDiscoverImage from 'calypso/assets/images/upgrades/cc-discover.svg';
import creditCardJCBImage from 'calypso/assets/images/upgrades/cc-jcb.svg';
import creditCardMasterCardImage from 'calypso/assets/images/upgrades/cc-mastercard.svg';
import creditCardPlaceholderImage from 'calypso/assets/images/upgrades/cc-placeholder.svg';
import creditCardUnionPayImage from 'calypso/assets/images/upgrades/cc-unionpay.svg';
import creditCardVisaImage from 'calypso/assets/images/upgrades/cc-visa.svg';
import payPalImage from 'calypso/assets/images/upgrades/paypal.svg';

export const PARTNER_PAYPAL_EXPRESS = 'paypal_express';
export const PAYMENT_AGREEMENTS_PARTNERS = [ PARTNER_PAYPAL_EXPRESS ];

export interface PaymentMethod {
	added: string;
	card: string;
	card_type: string;
	email: string;
	expiry: string;
	is_expired: boolean;
	last_service: string;
	last_used: string;
	meta: PaymentMethodMeta[];
	mp_ref: string;
	name: string;
	payment_partner: string;
	remember: '1' | '0';
	stored_details_id: string;
	user_id: string;
}

export interface PaymentMethodMeta {
	meta_key: string;
	meta_value: string;
	stored_details_id: string;
}

export const isPaymentAgreement = ( method: PaymentMethod ): boolean =>
	PAYMENT_AGREEMENTS_PARTNERS.includes( method.payment_partner );

export const isCreditCard = ( method: PaymentMethod ): boolean => ! isPaymentAgreement( method );

interface ImagePathsMap {
	[ key: string ]: string;
}

const CREDIT_CARD_SELECTED_PATHS: ImagePathsMap = {
	amex: creditCardAmexImage,
	diners: creditCardDinersImage,
	discover: creditCardDiscoverImage,
	jcb: creditCardJCBImage,
	mastercard: creditCardMasterCardImage,
	unionpay: creditCardUnionPayImage,
	visa: creditCardVisaImage,
	paypal_express: payPalImage,
	paypal: payPalImage,
};

const CREDIT_CARD_DEFAULT_PATH = creditCardPlaceholderImage;

export const getPaymentMethodImageURL = ( type: string ): string => {
	const paths = CREDIT_CARD_SELECTED_PATHS;
	const imagePath: string = paths[ type ] || CREDIT_CARD_DEFAULT_PATH;
	return `${ imagePath }`;
};

export const PaymentMethodSummary = ( {
	type,
	digits,
	email,
}: {
	type: string;
	digits?: string;
	email?: string;
} ) => {
	const translate = useTranslate();
	if ( type === PARTNER_PAYPAL_EXPRESS ) {
		return <>{ email || '' }</>;
	}
	let displayType: TranslateResult;
	switch ( type && type.toLocaleLowerCase() ) {
		case 'american express':
		case 'amex':
			displayType = translate( 'American Express' );
			break;

		case 'diners':
			displayType = translate( 'Diners Club' );
			break;

		case 'discover':
			displayType = translate( 'Discover', {
				context: 'Name of credit card',
			} );
			break;

		case 'jcb':
			displayType = translate( 'JCB' );
			break;

		case 'mastercard':
			displayType = translate( 'Mastercard' );
			break;

		case 'unionpay':
			displayType = translate( 'UnionPay' );
			break;

		case 'visa':
			displayType = translate( 'VISA' );
			break;

		default:
			displayType = type;
	}

	if ( ! digits ) {
		return <>{ displayType }</>;
	}

	return (
		<>
			{ translate( '%(displayType)s ****%(digits)s', {
				args: { displayType, digits },
			} ) }
		</>
	);
};
