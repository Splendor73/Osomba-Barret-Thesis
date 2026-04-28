import { Amplify } from 'aws-amplify';
import { signIn, signUp, signOut, confirmSignUp, fetchAuthSession, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';

// Amplify reads the Cognito pool/client IDs from Vite env so auth can point at each deploy's pool.
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    },
  },
});

// Starts the Cognito sign-in flow and lets AuthContext refresh React state afterward.
export async function loginUser(email: string, password: string) {
  const result = await signIn({ username: email, password });
  return result;
}

// Registers a Cognito user with email/name attributes used later for display.
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

// Confirms the verification code Cognito emails before the user can log in.
export async function confirmRegistration(email: string, code: string) {
  const result = await confirmSignUp({ username: email, confirmationCode: code });
  return result;
}

// Ends the Cognito browser session; AuthContext clears local React state too.
export async function logoutUser() {
  await signOut();
}

// Returns the active Cognito session, including tokens used by the Axios interceptor.
export async function getSession() {
  try {
    const session = await fetchAuthSession();
    return session;
  } catch {
    return null;
  }
}

// Pulls Cognito user attributes into a lightweight profile for the UI header/sidebar.
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

// Maps Cognito groups to app roles so routes and backend role checks use the same idea.
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

export async function getSupportSessionUser() {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString() || session.tokens?.accessToken?.toString();
    if (!token) return null;

    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}
