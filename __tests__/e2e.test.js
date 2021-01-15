const { authenticate, xbl, live } = require('../src');

(async () => {
	const { Token } = await xbl.EXPERIMENTAL_createDummyWin32DeviceToken();
	authenticate(process.env.XBL_TEST_EMAIL, process.env.XBL_TEST_PASSWORD, {
		deviceToken: Token,
		optionalDisplayClaims: ['mgt'],
		raw: false
	}).then(console.log);
})();
