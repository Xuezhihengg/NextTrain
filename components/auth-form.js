'use client';
import Link from 'next/link';
import { useFormState } from 'react-dom';

import { auth } from '@/actions/auth-action';

export default function AuthForm({ mode }) {
	const [formState, formActon] = useFormState(auth.bind(null,mode), {
		email: undefined,
		password: undefined,
	});

	return (
		<form id="auth-form" action={formActon}>
			<div>
				<img src="/images/auth-icon.jpg" alt="A lock icon" />
			</div>
			<p>
				<label htmlFor="email">Email</label>
				<input type="email" name="email" id="email" />
			</p>
			{formState.email && <p className="error">{formState.email}</p>}
			<p>
				<label htmlFor="password">Password</label>
				<input type="password" name="password" id="password" />
			</p>
			{formState.password && <p className="error">{formState.password}</p>}
			<p>
				<button type="submit">{mode === 'login' ? 'Login' : 'Create Account'}</button>
			</p>
			<p>
				{mode === 'login' && <Link href="/?mode=signup">Create new Account</Link>}
				{mode === 'signup' && <Link href="/?mode=login">Login with existing account.</Link>}
			</p>
		</form>
	);
}
