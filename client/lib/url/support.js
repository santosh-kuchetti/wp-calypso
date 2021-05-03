/**
 * Internal dependencies
 */
import { localizeUrl } from 'calypso/lib/i18n-utils';

const root = localizeUrl( 'https://wordpress.com/support/' ).replace( /\/$/, '' );

export const ACCOUNT_RECOVERY = `${ root }/account-recovery`;
export const ADDING_GSUITE_TO_YOUR_SITE = `${ root }/add-email/adding-g-suite-to-your-site/`;
export const ADDING_USERS = `${ root }/adding-users`;
export const AUTO_RENEWAL = `${ root }/auto-renewal`;
export const BANDPAGE_WIDGET = `${ root }/widgets/bandpage-widget`;
export const CATEGORIES_VS_TAGS = `${ root }/posts/categories-vs-tags`;
export const CHANGE_NAME_SERVERS = `${ root }/domains/custom-dns/#changing-name-servers-to-point-to-wordpress-com`;
export const CHANGE_NAME_SERVERS_FINDING_OUT_NEW_NS = `${ root }/domains/change-name-servers/#finding-out-your-new-name-server`;
export const COMMENTS = `${ root }/category/comments`;
export const COMMUNITY_TRANSLATOR = `${ root }/community-translator`;
export const CONCIERGE_SUPPORT = `${ root }/concierge-support`;
export const CONNECT = `${ root }/connect`;
export const CONTACT = `${ root }/contact`;
export const CALYPSO_CONTACT = '/help/contact';
export const CALYPSO_COURSES = '/help/courses';
export const CREATE = `${ root }/create`;
export const CUSTOM_DNS = `${ root }/domains/custom-dns`;
export const DESIGNATED_AGENT = `${ root }/update-contact-information/#designated-agent`;
export const DOMAIN_REGISTRATION_AGREEMENTS = `${ root }/domain-registration-agreements/`;
export const DOMAIN_WAITING = `${ root }/domains/register-domain/#waiting-for-domain-changes`;
export const DOMAINS = `${ root }/domains`;
export const DOMAIN_CANCEL = `${ root }/domains/#cancel-a-domain-name`;
export const DOMAIN_CONNECT = `${ root }/domain-connect`;
export const DOMAIN_EXPIRATION = `${ root }/domains/domain-expiration/`;
export const DOMAIN_EXPIRATION_REDEMPTION = `${ root }/domains/domain-expiration/#renewing-a-domain-in-the-redemption-period`;
export const DOMAIN_RECENTLY_REGISTERED = `${ root }/domains/register-domain/#waiting-for-domain-changes`;
export const DOMAIN_PRICING_AND_AVAILABLE_TLDS = `${ root }/domains/domain-pricing-and-available-tlds`;
export const ECOMMERCE = `${ root }/ecommerce`;
export const INCOMING_DOMAIN_TRANSFER_STATUSES = `${ root }/move-domain/incoming-domain-transfer/#checking-your-transfer-status-and-failed-transfers`;
export const INCOMING_DOMAIN_TRANSFER_STATUSES_PENDING_CONFIRMATION = `${ root }/incoming-domain-transfer/status-and-failed-transfers/#confirmation`;
export const INCOMING_DOMAIN_TRANSFER_STATUSES_IN_PROGRESS = `${ root }/incoming-domain-transfer/status-and-failed-transfers/#pending`;
export const INCOMING_DOMAIN_TRANSFER_STATUSES_FAILED = `${ root }/incoming-domain-transfer/status-and-failed-transfers/#failed`;
export const INCOMING_DOMAIN_TRANSFER_STATUSES_CANCEL = `${ root }/incoming-domain-transfer/status-and-failed-transfers/#cancel`;
export const INCOMING_DOMAIN_TRANSFER = `${ root }/incoming-domain-transfer/`;
export const INCOMING_DOMAIN_TRANSFER_PREPARE_UNLOCK = `${ root }/incoming-domain-transfer/prepare-domain-for-transfer/#unlock`;
export const INCOMING_DOMAIN_TRANSFER_PREPARE_AUTH_CODE = `${ root }/incoming-domain-transfer/prepare-domain-for-transfer/#auth-code`;
export const INCOMING_DOMAIN_TRANSFER_AUTH_CODE_INVALID = `${ root }/incoming-domain-transfer/#auth-code-invalid`;
export const EDIT_PAYMENT_DETAILS = `${ root }/payment/#edit-payment-details`;
export const EMAIL_FORWARDING = `${ root }/email-forwarding`;
export const EMAIL_VALIDATION_AND_VERIFICATION = `${ root }/domains/register-domain/#email-validation-and-verification`;
export const EMPTY_SITE = `${ root }/empty-site/`;
export const ENABLE_DISABLE_COMMENTS = `${ root }/enable-disable-comments`;
export const EVENTBRITE = `${ root }/eventbrite`;
export const EVENTBRITE_EVENT_CALENDARLISTING_WIDGET = `${ root }/widgets/eventbrite-event-calendarlisting-widget`;
export const EXPORT = `${ root }/export`;
export const FACEBOOK_EMBEDS = `${ root }/facebook-integration/facebook-embeds`;
export const FACEBOOK_LIKE_BOX = `${ root }/facebook-integration/#facebook-like-box`;
export const FOLLOWERS = `${ root }/followers`;
export const FORMS = `${ root }/forms`;
export const GETTING_MORE_VIEWS_AND_TRAFFIC = `${ root }/getting-more-views-and-traffic`;
export const GOOGLE_ANALYTICS = `${ root }/google-analytics`;
export const GSUITE_LEARNING_CENTER = 'https://gsuite.google.com/learning-center/';
export const GOOGLE_PLUS_EMBEDS = `${ root }/google-plus-embeds`;
export const GRAVATAR_HOVERCARDS = `${ root }/gravatar-hovercards`;
export const GUIDED_TRANSFER = `${ root }/guided-transfer`;
export const HTTPS_SSL = `${ root }/https-ssl`;
export const IMPORT = `${ root }/import`;
export const INSTAGRAM_WIDGET = `${ root }/instagram/instagram-widget`;
export const JETPACK_SUPPORT = 'https://jetpack.com/support/';
export const JETPACK_CONTACT_SUPPORT = 'https://jetpack.com/contact-support/?rel=support';
export const JETPACK_PRICING_PAGE = 'https://jetpack.com/pricing/';
export const JETPACK_SERVICE_VAULTPRESS = 'https://help.vaultpress.com/install-vaultpress/';
export const JETPACK_SERVICE_AKISMET = 'https://akismet.com/support/';
export const JETPACK_SERVICE_CROWDSIGNAL = 'https://crowdsignal.com/support/';
export const LIVE_CHAT = `${ root }/live-chat`;
export const MANAGE_PURCHASES = `${ root }/manage-purchases`;
export const MANAGE_PURCHASES_AUTOMATIC_RENEWAL = `${ root }/manage-purchases/#automatic-renewal`;
export const MANAGE_PURCHASES_FAQ_CANCELLING = `${ root }/manage-purchases/#faq-cancelling-your-plans-and-domains`;
export const MAP_EXISTING_DOMAIN = `${ root }/domains/map-existing-domain`;
export const MAP_EXISTING_DOMAIN_UPDATE_DNS = `${ root }/domains/map-existing-domain#2-ask-your-domain-provider-to-update-your-dns-settings`;
export const MAP_EXISTING_DOMAIN_UPDATE_A_RECORDS = `${ root }/domains/map-existing-domain/#using-a-records`;
export const MAP_SUBDOMAIN = `${ root }/domains/map-subdomain`;
export const MAP_SUBDOMAIN_WITH_CNAME_RECORDS = `${ root }/domains/map-subdomain/#adding-cname-records-with-your-registrar`;
export const MAP_DOMAIN_CHANGE_NAME_SERVERS = `${ root }/domains/map-existing-domain/#change-your-domains-name-servers`;
export const MOVE_DOMAIN = `${ root }/domains/#move-a-domain-name`;
export const MEDIA = `${ root }/media`;
export const PUBLICIZE = `${ root }/publicize`;
export const PUBLIC_VS_PRIVATE = `${ root }/domains/register-domain/#public-versus-private-registration-and-gdpr`;
export const REFUNDS = `${ root }/manage-purchases/#refund-policy`;
export const REGISTER_DOMAIN = `${ root }/domains/register-domain/`;
export const SEO_TAGS = `${ root }/getting-more-views-and-traffic/#use-appropriate-tags`;
export const SETTING_PRIMARY_DOMAIN = `${ root }/domains/#set-a-primary-address`;
export const SETTING_UP_PREMIUM_SERVICES = `${ root }/setting-up-premium-services`;
export const STRONG_PASSWORD = `${ root }/selecting-a-strong-password/`;
export const SHARING = `${ root }/sharing`;
export const SITE_REDIRECT = `${ root }/site-redirect`;
export const START = `${ root }/start`;
export const STATS_CLICKS = `${ root }/stats/#clicks`;
export const STATS_REFERRERS = `${ root }/stats/#referrers`;
export const STATS_SEO_TERMS = `${ root }/stats/#search-engine-terms`;
export const STATS_SPAM_REFERRER = `${ root }/stats/#marking-spam-referrers`;
export const STATS_TOP_POSTS_PAGES = `${ root }/stats/#top-posts-pages`;
export const STATS_VIEWS_BY_COUNTRY = `${ root }/stats/#views-by-country`;
export const SUPPORT_ROOT = `${ root }/`;
export const TRANSFER_DOMAIN_REGISTRATION = `${ root }/transfer-domain-registration`;
export const TWITTER_TIMELINE_WIDGET = `${ root }/widgets/twitter-timeline-widget`;
export const UPDATE_CONTACT_INFORMATION = `${ root }/update-contact-information/`;
export const UPDATE_CONTACT_INFORMATION_EMAIL_OR_NAME_CHANGES = `${ root }/update-contact-information/#email-or-name-changes`;
export const UPDATE_NAMESERVERS = `${ root }/domains/domain-management/#update-nameservers`;
export const USERS = `${ root }/category/users`;
export const USER_ROLES = `${ root }/user-roles`;
export const VIDEOS = `${ root }/videos`;
export const WPCC = `${ root }/wpcc-faq`;
