'use server';

import { createAuthSession, destorySession, verifyAuth } from '@/lib/auth';
import { hashUserPassword, verifyPassword } from '@/lib/hash';
import { createUser, getUserByEmail } from '@/lib/user';
import { redirect } from 'next/navigation';

export async function signup(prevData, formData) {
	const email = formData.get('email');
	const password = formData.get('password');

	//validation
	let errors = {};

	if (!email.includes('@')) {
		errors.email = 'Please enter a valid email address.';
	}

	if (password.trim().length < 6) {
		errors.password = 'Please enter a password of at least 6 characters.';
	}

	if (Object.keys(errors).length > 0) return errors;

	//add new user into db

	const hashedPassword = hashUserPassword(password);

	try {
		const id = createUser(email, hashedPassword);
		await createAuthSession(id);
		redirect('/training');
	} catch (error) {
		if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
			errors.email = 'This email seems to have been registered.';
			return errors;
		}
		throw error;
	}
}

export async function login(prevState, formData) {
    let errors = {}
	const email = formData.get('email');
	const password = formData.get('password');

	const existingUser = getUserByEmail(email);
	if (!existingUser) {
		errors.email = 'This user does not seem to exist.';
		return errors;
	}
	if (!verifyPassword(existingUser.password, password)) {
		errors.password = 'The password is wrong, please check the credentials.';
		return errors;
	}
	await createAuthSession(existingUser.id);
	redirect('/training');
}

export async function auth(mode, prevState, formData) {
	if (mode === 'login') {
		return login(prevState, formData);
	}
	return signup(prevState, formData);
}

export async function logout() {
    await destorySession()
    redirect('/')
}
