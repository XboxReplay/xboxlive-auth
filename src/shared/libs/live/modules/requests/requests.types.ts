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

import type { Email } from '../../../../../types/lib.types';

export type LiveCredentials = {
	email: Email;
	password: string;
};

export type LiveAuthResponse = {
	token_type: 'bearer';
	expires_in: number;
	access_token: string;
	refresh_token: string | null;
	scope: string;
	user_id: string;
};

export type LivePreAuthMatchedParameters = {
	PPFT: string;
	urlPost: string;
};

export type LivePreAuthResponse = {
	cookie: string;
	matches: LivePreAuthMatchedParameters;
};

export type LivePreAuthOptions = {
	clientId?: string;
	scope?: string;
	responseType?: 'token' | 'code';
	redirectUri?: string;
};
