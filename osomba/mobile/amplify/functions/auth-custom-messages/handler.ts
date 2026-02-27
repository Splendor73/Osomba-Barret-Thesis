import type { CustomMessageTriggerHandler } from 'aws-lambda';

export const handler: CustomMessageTriggerHandler = async (event) => {
  if (event.triggerSource === 'CustomMessage_ForgotPassword') {
    event.response.emailSubject = 'Reset your Osomba password';
    event.response.emailMessage = `
      Hello,<br><br>
      We received a request to reset your Osomba password. Use the following code to complete the process:<br><br>
      <strong style="font-size: 24px; letter-spacing: 2px;">${event.request.codeParameter}</strong><br><br>
      If you did not request this, you can safely ignore this email.
    `.trim();
  } else if (event.triggerSource === 'CustomMessage_SignUp' || event.triggerSource === 'CustomMessage_ResendCode') {
    event.response.emailSubject = 'Welcome to Osomba! Verify your account';
    event.response.emailMessage = `
      Welcome to the Osomba Marketplace!<br><br>
      Thank you for joining us. Please use the following verification code to activate your account:<br><br>
      <strong style="font-size: 24px; letter-spacing: 2px;">${event.request.codeParameter}</strong>
    `.trim();
  }
  
  return event;
};