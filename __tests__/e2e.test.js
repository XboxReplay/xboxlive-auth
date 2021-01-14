const { authenticate } = require('../src');

authenticate(process.env.XBL_EMAIL, process.env.XBL_PASSWORD, {
	XSTSRelyingParty: 'http://accounts.xboxlive.com'
});
