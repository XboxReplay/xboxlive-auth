import config from '../config';

//#region public methods

export const getBaseHeaders = (
	additionalHeaders: Record<string, string> = {}
) => ({
	Pragma: 'no-cache',
	Accept: '*/*',
	'User-Agent': config.request.defaultUserAgent,
	'Cache-Control': 'no-store, must-revalidate, no-cache',
	'Accept-Encoding': 'gzip, deflate, compress',
	'Accept-Language': `${config.request.defaultLanguage}, ${
		config.request.defaultLanguage.split('-')[0]
	};q=0.9`,
	...additionalHeaders
});

//#endregion
