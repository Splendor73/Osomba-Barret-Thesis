/*
 * File: main.dart
 * Purpose: Application entry point and routing configuration.
 * Usage: Initialized by Flutter framework. Sets up MultiProvider and GoRouter.
 * Architecture: Root level - Orchestrates global state and navigation.
 */
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:amplify_auth_cognito/amplify_auth_cognito.dart';
import 'package:amplify_authenticator/amplify_authenticator.dart';

import 'amplify_outputs.dart';
import 'providers/user_provider.dart';
import 'screens/marketplace/providers/marketplace_provider.dart';
import 'screens/marketplace/providers/cart_provider.dart';
import 'services/api_service.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/register_screen.dart';
import 'screens/auth/start_screen.dart';
import 'screens/auth/forgot_password_screen.dart';

import 'home_placeholder_screen.dart';
import 'screens/marketplace/categories_screen.dart';
import 'screens/marketplace/cart_screen.dart';
import 'screens/profile/profile_screen.dart';
import 'screens/auth/onboarding_screen.dart';
import 'screens/common/splash_screen.dart';
import 'theme/app_theme.dart';

Future<void> _configureAmplify() async {
  try {
    await Amplify.addPlugins([
      AmplifyAuthCognito(),
    ]);
    await Amplify.configure(amplifyConfig);
    safePrint('Amplify configured successfully');
  } on AmplifyAlreadyConfiguredException {
    safePrint('Amplify was already configured.');
  } catch (e) {
    safePrint('Amplify configuration failed: $e');
  }
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await _configureAmplify();
  ApiService.init();
  runApp(const SombaApp());
}

class SombaApp extends StatefulWidget {
  const SombaApp({super.key});

  @override
  State<SombaApp> createState() => _SombaAppState();
}

class _SombaAppState extends State<SombaApp> {
  late final UserProvider _userProvider;
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    _userProvider = UserProvider()..checkAuthStatus();
    _router = _createRouter(_userProvider);
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: _userProvider),
        ChangeNotifierProvider(create: (_) => MarketplaceProvider()..loadDemoData()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: Authenticator(
        authenticatorBuilder: (context, state) {
          if (state.currentStep == AuthenticatorStep.signUp) {
            return RegisterScreen(state: state);
          }
          if (state.currentStep == AuthenticatorStep.signIn) {
            return LoginScreen(state: state);
          }
          if (state.currentStep == AuthenticatorStep.resetPassword ||
              state.currentStep == AuthenticatorStep.confirmResetPassword) {
            return ForgotPasswordScreen(state: state);
          }
          return null;
        },
        child: MaterialApp.router(
          title: 'Somba Marketplace',
          theme: AppTheme.lightTheme,
          routerConfig: _router,
          builder: Authenticator.builder(),
        ),
      ),
    );
  }

  GoRouter _createRouter(UserProvider userProvider) {
    return GoRouter(
      initialLocation: '/',
      refreshListenable: userProvider,
      debugLogDiagnostics: true,
      redirect: (context, state) {
        final isInitialized = userProvider.isInitialized;
        final path = state.uri.path;
        final isSplash = path == '/';

        safePrint('GoRouter: Redirect check - Path: $path, Initialized: $isInitialized');
        
        // If not initialized yet, stay on splash
        if (!isInitialized) {
          return isSplash ? null : '/';
        }

        final isAuthenticated = userProvider.isAuthenticated;
        final isOnboarded = userProvider.isOnboarded;
        final isOnboardingRoute = path == '/onboarding';
        final isStartRoute = path == '/start';
        final isLoginRoute = path == '/login';

        // If we are initialized and on splash, move to the appropriate home
        if (isSplash) {
          if (!isAuthenticated) return '/start';
          return isOnboarded ? '/marketplace' : '/onboarding';
        }

        // 1. If NOT authenticated and NOT on /login or /start, go to /start
        if (!isAuthenticated && !isLoginRoute && !isStartRoute) {
          return '/start';
        }

        // 2. If authenticated and on /login or /start, move to appropriate home
        if (isAuthenticated && (isLoginRoute || isStartRoute)) {
          return isOnboarded ? '/marketplace' : '/onboarding';
        }

        // 3. If authenticated but hasn't onboarded, force them to onboarding.
        if (isAuthenticated && !isOnboarded && !isOnboardingRoute) {
          return '/onboarding';
        }

        // 4. If onboarded, don't allow staying on onboarding page
        if (isAuthenticated && isOnboarded && isOnboardingRoute) {
          return '/marketplace';
        }

        return null;
      },
      routes: [
        // Splash Route
        GoRoute(
          path: '/',
          builder: (context, state) => const SplashScreen(),
        ),
        GoRoute(
          path: '/login',
          builder: (context, state) => const SizedBox.shrink(),
        ),
        // Start Route
        GoRoute(
          path: '/start',
          builder: (context, state) => const StartScreen(),
        ),

        // Onboarding Route
        GoRoute(
          path: '/onboarding',
          builder: (context, state) => const OnboardingScreen(),
        ),
        
        // Marketplace Routes
        GoRoute(
          path: '/marketplace',
          builder: (context, state) => const HomePlaceholderScreen(),
        ),
        GoRoute(
          path: '/categories',
          builder: (context, state) => const CategoriesScreen(),
        ),
        GoRoute(
          path: '/cart',
          builder: (context, state) => const CartScreen(),
        ),
        GoRoute(
          path: '/profile',
          builder: (context, state) => const ProfileScreen(),
        ),
      ],
    );
  }
}
