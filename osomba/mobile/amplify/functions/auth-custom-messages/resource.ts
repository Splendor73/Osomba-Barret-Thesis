import { defineFunction } from '@aws-amplify/backend';

export const authCustomMessages = defineFunction({
  name: 'auth-custom-messages',
  entry: './handler.ts'
});