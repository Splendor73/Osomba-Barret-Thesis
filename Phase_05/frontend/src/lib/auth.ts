import { Amplify } from 'aws-amplify';
import { signIn, signUp, signOut, confirmSignUp, fetchAuthSession, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

// Configure Amplify with Cognito settings from env
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    },
  },
});

export async function loginUser(email: string, password: string) {
  const result = await signIn({ username: email, password });
  return result;
}

export async function registerUser(email: string, password: string, name: string) {
  const result = await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name,
      },
    },
  });
  return result;
}

export async function confirmRegistration(email: string, code: string) {
  const result = await confirmSignUp({ username: email, confirmationCode: code });
  return result;
}

export async function logoutUser() {
  await signOut();
}

export async function getSession() {
  try {
    const session = await fetchAuthSession();
    return session;
  } catch {
    return null;
  }
}

export async function getUser() {
  try {
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    const displayName = attributes.name || attributes.given_name || attributes.preferred_username
      || (attributes.email ? attributes.email.split('@')[0] : null)
      || user.username;
    return { ...user, name: displayName, email: attributes.email };
  } catch {
    return null;
  }
}

export async function getUserRole(): Promise<'customer' | 'agent' | 'admin'> {
  try {
    const session = await fetchAuthSession();
    const groups = (session.tokens?.accessToken?.payload?.['cognito:groups'] as string[]) || [];
    if (groups.includes('Admins')) return 'admin';
    if (groups.includes('Agents')) return 'agent';
    return 'customer';
  } catch {
    return 'customer';
  }
}
