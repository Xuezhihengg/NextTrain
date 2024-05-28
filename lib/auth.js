import { Lucia } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';

import db from './db';
import { useId } from 'react';
import { cookies } from 'next/headers';

const adapter = new BetterSqlite3Adapter(db, {
	user: 'users',
	session: 'sessions',
});

const lucia = new Lucia(adapter, {
	sessionCookie: {
		expires: false,
		attributes: {
			secure: process.env.NODE_ENV === 'production',
		},
	},
});

export async function createAuthSession(userId) {
	//Lucia creates a session with userId in the database.
	const session = await lucia.createSession(userId, {});
	//Lucia Help Set Cookies(cookie name ,cookie value, cookie attributes)
	const sessionCookis = lucia.createSessionCookie(session.id);
	//Nextjs sends out cookies
	cookies().set(sessionCookis.name, sessionCookis.value, sessionCookis.attributes);
}

export async function verifyAuth() {
	//Read HTTP incoming request cookies in server components.
	const sessionCookis = cookies().get(lucia.sessionCookieName);

	if (!sessionCookis) {
		return {
			user: null,
			session: null,
		};
	}

	const sessionId = sessionCookis.value;
	if (!sessionId) {
		return {
			user: null,
			session: null,
		};
	}
	//validate the session
	const result = await lucia.validateSession(sessionId);

	try {
		//If the verification is successful, refresh the session.
		if (result.session && result.session.fresh) {
			const sessionCookie = lucia.createSessionCookie(result.session.id);
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		}
		if (!result.session) {
			const sessionCookie = lucia.createBlankSessionCookie();
			cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
		}
	} catch {}

	return result;
}

export async function destorySession() {
	const { session } = await verifyAuth();
	if (!session) {
		throw new Error('something wrong');
	}
	//Lucia will enter the sessions table of the database to delete this session.
	await lucia.invalidateSession(session.id);
	//delete the cookie on client browser
	const sessionCookie = lucia.createBlankSessionCookie();
	cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
}
