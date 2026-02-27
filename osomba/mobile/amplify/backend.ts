import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { authCustomMessages } from './functions/auth-custom-messages/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  auth,
  authCustomMessages,
});