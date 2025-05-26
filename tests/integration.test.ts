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

import { authenticate } from '../src';
import { authenticate as authenticateWithCredentials } from '../src/shared/libs/live/modules/requests';

import {
	exchangeRpsTicketForUserToken,
	exchangeTokensForXSTSToken,
} from '../src/shared/libs/xbox-network/modules/requests';

jest.mock('../src/shared/libs/live/modules/requests', () => {
	const originalModule = jest.requireActual('../src/shared/libs/live/modules/requests');
	return { ...originalModule, authenticate: jest.fn() };
});

jest.mock('../src/shared/libs/xbox-network/modules/requests', () => {
	const originalModule = jest.requireActual('../src/shared/libs/xbox-network/modules/requests');
	return { ...originalModule, exchangeRpsTicketForUserToken: jest.fn(), exchangeTokensForXSTSToken: jest.fn() };
});

describe('authenticate (integration)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should authenticate and return simplified response', async () => {
		const email = 'test@example.com';
		const password = 'password123';

		const mockAuthResponse = {
			access_token: 'mock_access_token',
			refresh_token: 'mock_refresh_token',
			expires_in: 3600,
		};

		const mockUserTokenResponse = {
			Token: 'mock_user_token',
		};

		const mockXSTSResponse = {
			DisplayClaims: { xui: [{ xid: '1234567890', uhs: 'user_hash_abc' }] },
			Token: 'mock_xsts_token',
			NotAfter: '2025-12-31T23:59:59.000Z',
		};

		(authenticateWithCredentials as jest.Mock).mockResolvedValue(mockAuthResponse);
		(exchangeRpsTicketForUserToken as jest.Mock).mockResolvedValue(mockUserTokenResponse);
		(exchangeTokensForXSTSToken as jest.Mock).mockResolvedValue(mockXSTSResponse);

		const result = await authenticate(email, password);

		expect(authenticateWithCredentials).toHaveBeenCalledWith({ email, password });
		expect(exchangeRpsTicketForUserToken).toHaveBeenCalledWith('mock_access_token', 't');
		expect(exchangeTokensForXSTSToken).toHaveBeenCalledWith(
			{ userTokens: ['mock_user_token'] },
			{
				XSTSRelyingParty: undefined,
				optionalDisplayClaims: undefined,
				sandboxId: undefined,
			}
		);

		expect(result).toEqual({
			xuid: '1234567890',
			user_hash: 'user_hash_abc',
			xsts_token: 'mock_xsts_token',
			display_claims: mockXSTSResponse.DisplayClaims,
			expires_on: '2025-12-31T23:59:59.000Z',
		});
	});

	it('should authenticate and return raw response', async () => {
		const email = 'test@example.com';
		const password = 'password123';

		const mockAuthResponse = {
			access_token: 'mock_access_token',
			refresh_token: 'mock_refresh_token',
			expires_in: 3600,
		};

		const mockUserTokenResponse = {
			Token: 'mock_user_token',
		};

		const mockXSTSResponse = {
			DisplayClaims: {
				xui: [
					{
						xid: '1234567890',
						uhs: 'user_hash_abc',
					},
				],
			},
			Token: 'mock_xsts_token',
			NotAfter: '2025-12-31T23:59:59.000Z',
		};

		(authenticateWithCredentials as jest.Mock).mockResolvedValue(mockAuthResponse);
		(exchangeRpsTicketForUserToken as jest.Mock).mockResolvedValue(mockUserTokenResponse);
		(exchangeTokensForXSTSToken as jest.Mock).mockResolvedValue(mockXSTSResponse);

		const result = await authenticate(email, password, { raw: true });

		expect(authenticateWithCredentials).toHaveBeenCalledWith({ email, password });
		expect(exchangeRpsTicketForUserToken).toHaveBeenCalledWith('mock_access_token', 't');
		expect(exchangeTokensForXSTSToken).toHaveBeenCalledWith(
			{ userTokens: ['mock_user_token'] },
			{
				XSTSRelyingParty: undefined,
				optionalDisplayClaims: undefined,
				sandboxId: undefined,
			}
		);

		expect(result).toEqual({
			'login.live.com': mockAuthResponse,
			'user.auth.xboxlive.com': mockUserTokenResponse,
			'xsts.auth.xboxlive.com': mockXSTSResponse,
		});
	});

	it('should authenticate with device and title tokens', async () => {
		const email = 'test@example.com';
		const password = 'password123';
		const deviceToken = 'mock_device_token';
		const titleToken = 'mock_title_token';

		const mockAuthResponse = {
			access_token: 'mock_access_token',
			refresh_token: 'mock_refresh_token',
			expires_in: 3600,
		};

		const mockUserTokenResponse = {
			Token: 'mock_user_token',
		};

		const mockXSTSResponse = {
			DisplayClaims: { xui: [{ xid: '1234567890', uhs: 'user_hash_abc' }] },
			Token: 'mock_xsts_token',
			NotAfter: '2025-12-31T23:59:59.000Z',
		};

		(authenticateWithCredentials as jest.Mock).mockResolvedValue(mockAuthResponse);
		(exchangeRpsTicketForUserToken as jest.Mock).mockResolvedValue(mockUserTokenResponse);
		(exchangeTokensForXSTSToken as jest.Mock).mockResolvedValue(mockXSTSResponse);

		const result = await authenticate(email, password, { deviceToken, titleToken });

		expect(authenticateWithCredentials).toHaveBeenCalledWith({ email, password });
		expect(exchangeRpsTicketForUserToken).toHaveBeenCalledWith('mock_access_token', 't');
		expect(exchangeTokensForXSTSToken).toHaveBeenCalledWith(
			{ userTokens: ['mock_user_token'], deviceToken, titleToken },
			{
				XSTSRelyingParty: undefined,
				optionalDisplayClaims: undefined,
				sandboxId: undefined,
			}
		);

		expect(result).toEqual({
			xuid: '1234567890',
			user_hash: 'user_hash_abc',
			xsts_token: 'mock_xsts_token',
			display_claims: mockXSTSResponse.DisplayClaims,
			expires_on: '2025-12-31T23:59:59.000Z',
		});
	});

	it('should throw on invalid credentials', async () => {
		const email = 'invalid@example.com';
		const password = 'wrongpassword';

		const error = new Error('Invalid credentials');
		(authenticateWithCredentials as jest.Mock).mockRejectedValue(error);

		await expect(authenticate(email, password)).rejects.toThrow('Invalid credentials');
		expect(authenticateWithCredentials).toHaveBeenCalledWith({ email, password });
	});

	it('should handle external service unavailability', async () => {
		const email = 'test@example.com';
		const password = 'password123';

		const mockAuthResponse = {
			access_token: 'mock_access_token',
			refresh_token: 'mock_refresh_token',
			expires_in: 3600,
		};

		(authenticateWithCredentials as jest.Mock).mockResolvedValue(mockAuthResponse);
		(exchangeRpsTicketForUserToken as jest.Mock).mockRejectedValue(new Error('Service unavailable'));

		await expect(authenticate(email, password)).rejects.toThrow('Service unavailable');
	});
});
