# Dummy Flutter Auth Sandbox (AWS Amplify Gen 2 + Cognito + Amplify Authenticator)

> **Note:** This document served as the initial guide for creating this sandbox. For current setup and running instructions, please refer to the project's [README.md](../README.md).

## Purpose

This guide defines linear steps to build a minimal Flutter app that demonstrates **user registration and authentication** using:

- **AWS Amplify (Gen 2)**
- **Amazon Cognito** (created by Amplify Auth)
- **Amplify Authenticator UI** (prebuilt Flutter auth screens)

This is a **sandbox/spike** meant to validate feasibility and create a reference implementation. It is **not** production-hardening.

---

## Definition of Done

The sandbox is complete when:

- A Flutter app runs locally (Android emulator or physical device is fine).
- Amplify backend resources deploy successfully (Cognito User Pool exists in AWS).
- The app displays **Authenticator** UI when signed out.
- A user can:
  - Sign up with **email + password**
  - Receive and confirm a verification code (email)
  - Sign in
  - Sign out
  - Reset password
- The repo contains enough artifacts to reproduce the setup (Flutter app + Amplify backend definitions).

---

## Constraints / Out of Scope (Sprint-1 Spike)

- Email + password authentication only
- No MFA
- No social login (Google/Apple/etc.)
- No custom auth UI
- No role-based authorization/groups
- No production environment separation (dev/staging/prod)
- No automated tests (manual smoke test only)

---

## Part 0 — Quick Glossary (minimal mental model)

- **Amplify (Gen 2)**: Developer tooling + SDKs that create and connect cloud resources to an app.
- **Cognito User Pool**: The AWS service that stores users, passwords, verification state, and issues tokens.
- **Authenticator UI**: Prebuilt Flutter UI that handles sign-in/sign-up/forgot-password flows.

**Data flow:** Flutter app → Amplify Auth SDK → Cognito User Pool.

---

## Part 1 — Local prerequisites

### 1.1 Flutter installed and working

Confirm Flutter installation:

```bash
flutter --version
flutter doctor
```

Resolve any red ❌ items for the target platform.

**Recommended for fastest success:** Android Studio + Android emulator, or a physical Android device.

---

### 1.2 Node.js installed (required for Amplify Gen 2 tooling)

Confirm Node + npm:

```bash
node -v
npm -v
```

Use a current Node LTS version if installation is needed.

---

### 1.3 AWS account access

An AWS account is required (personal or team). During deployment, a browser login will occur.

No AWS Console work is required at first, but the account must have permissions to create Cognito + related resources.

---

## Part 2 — Create the Flutter auth sandbox app

### 2.1 Create a new Flutter project

From a parent directory where projects live:

```bash
flutter create auth_sandbox
cd auth_sandbox
```

---

### 2.2 Verify the default Flutter app runs

```bash
flutter run
```

If the default counter app launches, Flutter tooling is good.

---

## Part 3 — Add Amplify Gen 2 backend (Auth only)

### 3.1 Generate Amplify Gen 2 project scaffold

From the **Flutter project root** (`auth_sandbox/`):

```bash
npm create amplify@latest -y
```

This creates an `amplify/` folder containing backend definitions.

Expected directory additions (names may vary slightly):

- `amplify/`
  - `backend.ts`
  - `auth/`
    - `resource.ts`

---

### 3.2 Confirm Auth is configured for email login

Open:

- `amplify/auth/resource.ts`

Confirm the auth definition enables email login. The exact code differs by template, but the intent should be:

- email sign-in enabled
- username sign-in optional/disabled unless explicitly desired

Do not enable MFA/social/roles in the sandbox.

---

### 3.3 Deploy a sandbox backend and generate frontend outputs

Run:

```bash
npx ampx sandbox --outputs-format dart --outputs-out-dir lib
```

What this does:

1. Prompts for AWS authentication in the browser.
2. Deploys backend resources into AWS (including a Cognito User Pool).
3. Writes a generated outputs/config file into the Flutter project, typically under `lib/`.

Expected result in `lib/` (exact filenames vary):

- `amplify_outputs.dart` **or**
- `amplify_outputs.json` **or**
- another generated configuration artifact referenced by the docs/template

**Important:** The Flutter app must configure Amplify using exactly what is generated.

---

### 3.4 Common deployment failure modes (and what they usually mean)

- **Browser auth loop / cannot sign in:** AWS SSO/account permissions issue.
- **No outputs generated:** sandbox deploy failed; scroll up for the first error.
- **Node/ESM errors:** Node version mismatch; update to Node LTS and retry.

If deployment fails, fix the earliest error first and rerun the sandbox command.

---

## Part 4 — Add Flutter dependencies

### 4.1 Add packages to `pubspec.yaml`

In `pubspec.yaml`, add the following dependencies (versions may be omitted to let `flutter pub get` resolve them):

- `amplify_flutter`
- `amplify_auth_cognito`
- `amplify_authenticator`

Example:

```yaml
dependencies:
  flutter:
    sdk: flutter

  amplify_flutter: ^2.0.0
  amplify_auth_cognito: ^2.0.0
  amplify_authenticator: ^2.0.0
```

Then fetch dependencies:

```bash
flutter pub get
```

---

## Part 5 — Configure Amplify in Flutter

### 5.1 Identify the generated config artifact

After running the sandbox command, inspect `lib/`:

```bash
ls lib
```

Look for a generated file such as:

- `amplify_outputs.dart`
- `amplify_outputs.json`
- other Amplify-generated configuration file

**The app must import and use this configuration.**

---

### 5.2 Create Amplify configuration function

Edit `lib/main.dart` to:

1. Configure Amplify once at startup.
2. Render an Authenticator-wrapped `MaterialApp`.

> NOTE: The exact `Amplify.configure(...)` input depends on the generated file.  
> Replace the config variable/import below with the one generated in `lib/`.

#### Reference `main.dart` skeleton

```dart
import 'package:flutter/material.dart';

import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:amplify_authenticator/amplify_authenticator.dart';

// Replace this import with the generated output from the sandbox step.
// Common examples include:
// import 'amplify_outputs.dart';
// import 'amplifyconfiguration.dart'; // (Gen 1 style, avoid unless required by template)
import 'amplify_outputs.dart';

Future<void> _configureAmplify() async {
  try {
    // 1) Add the Cognito Auth plugin
    await Amplify.addPlugin(AmplifyAuthCognito());

    // 2) Configure Amplify using generated outputs/config
    // Replace `amplifyConfig` with the actual generated variable/constant.
    await Amplify.configure(amplifyConfig);

    safePrint('Amplify configured successfully');
  } on AmplifyAlreadyConfiguredException {
    safePrint('Amplify was already configured.');
  } catch (e) {
    safePrint('Amplify configuration failed: $e');
    rethrow;
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await _configureAmplify();
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Authenticator(
      child: MaterialApp(
        builder: Authenticator.builder(),
        home: const SignedInHome(),
      ),
    );
  }
}

class SignedInHome extends StatelessWidget {
  const SignedInHome({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Signed in'),
            SizedBox(height: 12),
            SignOutButton(),
          ],
        ),
      ),
    );
  }
}
```

**Expected behavior:**
- When not signed in: Authenticator UI appears.
- After signing in: `SignedInHome` appears.
- Clicking `SignOutButton()` returns to Authenticator UI.

---

### 5.3 If configuration fails

Typical causes:

- Wrong import (not using the generated config file).
- Wrong config variable name (e.g., `amplifyConfig` vs something else).
- Outputs file missing or stale (sandbox deploy didn’t run, or outputs weren’t generated into `lib/`).

Fix by:
1. Re-running sandbox outputs generation:

```bash
npx ampx sandbox --outputs-format dart --outputs-out-dir lib
```

2. Updating imports/variables to match generated artifacts.

---

## Part 6 — Run the sandbox and validate flows

### 6.1 Run the app

```bash
flutter run
```

Confirm the Authenticator UI renders.

---

### 6.2 Manual test checklist (smoke test)

Run the following flows in order:

#### A) Sign up + email verification
- Choose **Create account**
- Enter a real email + password
- Confirm verification code arrives by email
- Enter code to confirm account

#### B) Sign in / sign out
- Sign in with the confirmed account
- Confirm app shows **Signed in** screen
- Press **Sign out**

#### C) Forgot password / reset
- Use **Forgot password**
- Receive reset code by email
- Set new password
- Sign in using new password

#### D) Session persistence (optional quick check)
- Sign in
- Kill the app
- Relaunch app
- Observe whether the session persists automatically

---

## Part 7 — Verification in AWS (optional but helpful)

This is optional for the spike, but confirms resources exist:

- Open AWS Console
- Navigate to **Amazon Cognito**
- Locate the **User Pool** created by Amplify
- Confirm the test user exists after sign up

No manual Cognito changes should be made during the sandbox spike.

---

## Part 8 — What to commit to Git

Commit:
- Flutter project code
- `amplify/` folder (Gen 2 backend definitions)
- Non-secret generated outputs as appropriate for the team’s workflow

Do not commit:
- Random `.env` files or any credentials
- Anything containing sensitive tokens (Amplify Gen 2 typically avoids placing secrets in frontend outputs, but review diffs)

---

## Part 9 — Sprint-ready deliverables for Jira/Confluence

- Screenshot: Authenticator sign-in screen
- Screenshot: “Signed in” screen
- Notes:
  - command used to deploy sandbox backend
  - location and name of generated outputs/config
  - any issues encountered + resolutions
- Manual test checklist results (pass/fail)

---

## Appendix — One-command recap (high level)

```bash
flutter create auth_sandbox
cd auth_sandbox
npm create amplify@latest -y
npx ampx sandbox --outputs-format dart --outputs-out-dir lib
# edit pubspec.yaml to add amplify packages
flutter pub get
# edit lib/main.dart to configure Amplify + Authenticator
flutter run
```

This appendix is **not** sufficient by itself; it exists to summarize the workflow once the detailed steps are understood.
