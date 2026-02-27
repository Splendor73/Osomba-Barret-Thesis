# Demo Cheatsheet

This guide shows how to demo the branded auth experience that is already wired up in the mobile app.

## Prerequisites
- Run `flutter pub get` after pulling to ensure the new assets in `assets/images/` are bundled.
- Launch with `flutter run` (Chrome or a device). The routes and Amplify Authenticator wiring behave the same on every platform.

## Entry Points
- `/start` – `StartScreen` with the “Continue” CTA. This is the default route (see `lib/main.dart::_createRouter`).
- `/marketplace` – Protected. Navigating here while signed out triggers the Amplify Authenticator and shows the login screen.

## Start Screen
- File: `lib/screens/auth/start_screen.dart`.
- Continue button calls `context.go('/marketplace')`, which in turn displays the Amplify authenticator when the user is logged out.
- Logo uses `assets/images/logo_text_white_orange.png`. If it does not render, re-run `flutter pub get`.

## Login Screen
- File: `lib/screens/auth/login_screen.dart`.
- Rendered when `AuthenticatorStep.signIn` is active (`lib/main.dart`).
- Username & password fields are Amplify `SignInFormField` widgets themed with the Osomba styling.
- Buttons:
  - `Login` -> `AuthenticatorState.signIn()` (real Cognito sign in).
  - `Forgot password?` -> `state.changeStep(AuthenticatorStep.resetPassword)`.
  - `Sign Up` link -> `state.changeStep(AuthenticatorStep.signUp)` to show the register screen.
  - Social buttons are placeholders only.

## Register Screen
- File: `lib/screens/auth/register_screen.dart`.
- Mirrors the Figma mock (stacked orange background, curved greens, rounded white fields).
- Fields: `SignUpFormField.email/password/passwordConfirmation`.
- Checkbox gating:
  - Users must accept Terms + Privacy before the `Register` button calls `_handleRegister()` which
    1. Persists JIT choices via `UserProvider.saveRegistrationChoices`.
    2. Invokes `AuthenticatorState.signUp()` for Cognito signup.
  - Marketing checkbox is optional and persisted locally.
- `Already have an account?` link uses `state.changeStep(AuthenticatorStep.signIn)` to return to login.

## Forgot Password (built-in)
- Triggered from the login screen or by calling `state.changeStep(AuthenticatorStep.resetPassword)`.
- Uses Amplify Authenticator defaults; no additional wiring needed.

## Demo Flow Tips
1. Launch the app (`flutter run`).
2. You land on `/start`. Tap **Continue** to force the auth flow.
3. Show the Login screen, enter a valid username/password, and tap **Login**.
4. Use **Sign Up** to switch to the Register screen. Demonstrate checkbox gating and how Terms/Privacy dialogs appear.
5. Use **Forgot password?** to illustrate the recovery flow, or switch back with the built-in back arrow in the Authenticator header.

Everything above runs using the Amplify Authenticator state machine, so no manual routing is required.
