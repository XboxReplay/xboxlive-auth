export namespace XboxLiveAuth {
	export {
		IAuthUserResponse,
		IUserCredentials,
		IExchangeUserTokenResponse,
		IExchangeRPSTicketResponse
	} from './__typings__';

	export function exchangeAccessTokenForUserToken(
		accessToken: string
	): Promise<IExchangeRPSTicketResponse>;

	export function exchangeUserTokenForXSTSIdentity(
		userToken: string,
		XSTSRelyingParty: string
	): Promise<IExchangeRPSTicketResponse>;

	export function authenticate(
		email: string,
		password: string
	): Promise<IAuthUserResponse>;
}
