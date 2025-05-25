/**
 * Copyright 2025 Alexis Bize
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import XSAPIFetchClient from '../../../../../classes/Fetch/Clients/XSAPIFetchClient';
import { config } from '../../../config';
import type { XNETDummyDeviceTokenResponse } from '../requests.types';

export const createDummyWin32DeviceToken = async (): Promise<XNETDummyDeviceTokenResponse> => {
	const serviceTrustedParty = 'https://xboxreplay.net/';
	const serviceDeviceId = '{51354D2F-352F-472F-5842-5233706C6179}';
	const serviceSignature =
		'AAAAAQHbSkl5oWVQaUcyd9w0phS546Pj7OMt0pXjJsBq2kzwS5iLVxIpkqqt5fqtYh3T9Z42LoHarn58wD6JP27zC8uVOSkQYIoXiA==';

	const serviceProofKey = {
		crv: 'P-256',
		alg: 'ES256',
		use: 'sig',
		kty: 'EC',
		x: 'v0pdipnZ5pVB5F8FhJy8B2StVRjB6tiQc1YsOFuABNY',
		y: 'PuRfclnYeqBroHVhX_QLPmOMGB6zUjK4bIScxpKIVh4',
	};

	return XSAPIFetchClient.post<XNETDummyDeviceTokenResponse>(
		config.urls.deviceAuthenticate,
		{
			RelyingParty: 'http://auth.xboxlive.com',
			TokenType: 'JWT',
			Properties: {
				AuthMethod: 'ProofOfPossession',
				Id: serviceDeviceId,
				DeviceType: 'Win32',
				Version: '10.0.19042',
				ProofKey: serviceProofKey,
				TrustedParty: serviceTrustedParty,
			},
		},
		{ options: { signature: serviceSignature } }
	).then(res => res.data);
};
