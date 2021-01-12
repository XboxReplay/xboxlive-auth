export const defaultClientId = '000000004C12AE6F'; // Xbox App
export const defaultScope = 'service::user.auth.xboxlive.com::MBI_SSL';
export const defaultRedirectUri = 'https://login.live.com/oauth20_desktop.srf';
export const defaultResponseType = 'token';

export default {
	urls: {
		authorize: 'https://login.live.com/oauth20_authorize.srf',
		token: 'https://login.live.com/oauth20_token.srf'
	},
	client: {
		id: defaultClientId,
		redirectUri: defaultRedirectUri,
		scope: defaultScope,
		responseType: defaultResponseType
	}
};
