require('dotenv').config({
	path: require('path').join(__dirname, '..', '.env.test')
});

const {
	xbl,
	authenticate,
	authenticateWithUserCredentials,
	authenticateWithUserRefreshToken
} = require('../src');

const credentials = {
	email: process.env.XBL_TEST_EMAIL,
	password: process.env.XBL_TEST_PASSWORD
};

const liveRefreshToken = process.env.LIVE_REFRESH_TOKEN;

const hasMissingEnv =
	credentials.email === void 0 ||
	credentials.password === void 0 ||
	liveRefreshToken === void 0;

if (hasMissingEnv === true) {
	throw new Error('Could not load credentials from .env.test file');
}

//#region tests (success)

const TEST_SUCCESS_createDummyDeviceToken = () =>
	xbl.EXPERIMENTAL_createDummyWin32DeviceToken();

const TEST_SUCCESS_authenticateBasic = () =>
	Promise.all([
		authenticate(credentials.email, credentials.password),
		authenticateWithUserCredentials(credentials.email, credentials.password)
	]);

const TEST_SUCCESS_authenticateBasicWithRefreshToken = () =>
	authenticateWithUserRefreshToken(liveRefreshToken);

const TEST_SUCCESS_authenticateWithDummyDeviceToken = async () =>
	authenticate(credentials.email, credentials.password, {
		deviceToken: (await xbl.EXPERIMENTAL_createDummyWin32DeviceToken())
			.Token
	});

const TEST_SUCCESS_authenticateWithOptionalClaims = async () =>
	authenticate(credentials.email, credentials.password, {
		optionalDisplayClaims: ['mgt']
	});

const TEST_SUCCESS_authenticateWithCustomXSTSRelyingParty = async () =>
	authenticate(credentials.email, credentials.password, {
		XSTSRelyingParty: 'https://gameservices.xboxlive.com/'
	});

//#endregion
//#region tests (failure)

const TEST_FAILURE_authenticateBasic = () =>
	authenticate('xboxlive-auth-test@xboxreplay.net', 'dummy123456')
		.then(() => false)
		.catch(() => true);

const TEST_FAILURE_authenticateWithOptionalClaims = () =>
	authenticate(credentials.email, credentials.password, {
		optionalDisplayClaims: ['xxx']
	})
		.then(() => false)
		.catch(() => true);

const TEST_FAILURE_authenticateWithCustomXSTSRelyingParty = async () =>
	authenticate(credentials.email, credentials.password, {
		XSTSRelyingParty: 'https://dummy-xsts.xboxreplay.net/'
	})
		.then(() => false)
		.catch(() => true);

//#endregion

const runSuccessTests = () =>
	Promise.all([
		TEST_SUCCESS_createDummyDeviceToken(),
		TEST_SUCCESS_authenticateBasic(),
		TEST_SUCCESS_authenticateBasicWithRefreshToken(),
		TEST_SUCCESS_authenticateWithDummyDeviceToken(),
		TEST_SUCCESS_authenticateWithOptionalClaims(),
		TEST_SUCCESS_authenticateWithCustomXSTSRelyingParty()
	]);

const runFailureTests = () =>
	Promise.all([
		TEST_FAILURE_authenticateBasic().then(res => {
			if (res === false)
				throw new Error(
					'"TEST_FAILURE_authenticateBasic" has not failed as excepted'
				);
		}),
		TEST_FAILURE_authenticateWithOptionalClaims().then(res => {
			if (res === false)
				throw new Error(
					'"TEST_FAILURE_authenticateWithOptionalClaims"  has not failed as excepted'
				);
		}),
		TEST_FAILURE_authenticateWithCustomXSTSRelyingParty().then(res => {
			if (res === false)
				throw new Error(
					'"TEST_FAILURE_authenticateWithCustomXSTSRelyingParty" has not failed as excepted'
				);
		})
	]);

return runSuccessTests()
	.then(() => runFailureTests())
	.catch(err => {
		console.error(err);
		setTimeout(() => {
			process.exit(1);
		}, 100);
	});
