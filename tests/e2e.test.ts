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
import { createDummyWin32DeviceToken } from '../src/shared/libs/xbox-network/modules/requests/experimental';
import type { Email } from '../src/types/lib.types';

describe('authenticate (e2e)', () => {
	const email = `${process.env.ACCOUNT_TEST_EMAIL}` as Email;
	const password = `${process.env.ACCOUNT_TEST_PASSWORD}`;

	if (!email || !password) {
		console.warn('Skipping authenticate E2E tests: ACCOUNT_TEST_EMAIL and ACCOUNT_TEST_PASSWORD must be set.');
		return;
	}

	it('should authenticate and return a valid simplified response', async () => {
		const result = await authenticate(email, password);

		expect(result).toHaveProperty('xuid');
		expect(result).toHaveProperty('user_hash');
		expect(result).toHaveProperty('xsts_token');
		expect(result).toHaveProperty('display_claims');
		expect(result).toHaveProperty('expires_on');
		expect(typeof result.xsts_token).toBe('string');
		expect(result.xsts_token.length).toBeGreaterThan(0);
	});

	it('should authenticate and return a valid raw response', async () => {
		const result = await authenticate(email, password, { raw: true });

		expect(result['login.live.com']).toHaveProperty('access_token');
		expect(result['user.auth.xboxlive.com']).toHaveProperty('Token');
		expect(result['xsts.auth.xboxlive.com']).toHaveProperty('Token');
	});

	it('should create a valid Win32 device token', async () => {
		const result = await createDummyWin32DeviceToken();

		expect(result).toHaveProperty('Token');
		expect(result.Token.length).toBeGreaterThan(0);
	});

	it('should fail with invalid credentials', async () => {
		await expect(authenticate('invalid@example.com', 'wrongpassword')).rejects.toThrow();
	});
});
