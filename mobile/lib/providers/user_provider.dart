/*
 * File: providers/user_provider.dart
 * Purpose: Manages global user session and authentication state.
 * Usage: Use context.read<UserProvider>() to login/logout or check auth status.
 * Architecture: Provider Layer - Global state management for User entity.
 */
import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:amplify_flutter/amplify_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

class UserProvider with ChangeNotifier {
  UserModel? _user;
  bool _isLoading = false;
  bool _isInitialized = false;
  StreamSubscription<AuthHubEvent>? _authSubscription;
    final _storage = const FlutterSecureStorage();
    final AuthService authService;
  
    UserProvider({AuthService? authService}) : authService = authService ?? AuthService() {
      safePrint('UserProvider: Initialized with authService: ${this.authService.runtimeType}');
      _listenToAuthEvents();
    }
  
    UserModel? get user => _user;
    bool get isLoading => _isLoading;
    bool get isInitialized => _isInitialized;
  
    /// User is authenticated if we have a valid record in our backend.
  
  bool get isAuthenticated => _user != null;
  
  /// Whether the user has completed the onboarding wizard.
  bool get isOnboarded => _user?.isOnboarded ?? false;

  void _listenToAuthEvents() {
    _authSubscription = Amplify.Hub.listen(HubChannel.Auth, (AuthHubEvent event) {
      switch (event.type) {
        case AuthHubEventType.signedIn:
          safePrint('UserProvider: User signed in, fetching profile...');
          checkAuthStatus();
          break;
        case AuthHubEventType.signedOut:
          safePrint('UserProvider: User signed out, clearing state.');
          _user = null;
          _isInitialized = false;
          notifyListeners();
          break;
        case AuthHubEventType.sessionExpired:
          _user = null;
          _isInitialized = false;
          notifyListeners();
          break;
        default:
          break;
      }
    });
  }

  /// Check if the user is already signed in via Amplify and fetch their backend profile.
  Future<void> checkAuthStatus() async {
    safePrint('UserProvider: Checking auth status...');
    _isInitialized = false;
    _setLoading(true);
    try {
      final sessions = await Amplify.Auth.fetchAuthSession();
      safePrint('UserProvider: Sessions fetched. Signed in: ${sessions.isSignedIn}');
      if (sessions.isSignedIn) {
        // Check if we have pending T&C choices to provision
        final termsVersion = await _storage.read(key: 'pending_terms_version');
        final marketingOptInStr = await _storage.read(key: 'pending_marketing_opt_in');
        safePrint('UserProvider: Pending T&C version: $termsVersion');

        if (termsVersion != null) {
          safePrint('UserProvider: Found pending T&C choices, provisioning user...');
          await provisionNewUser(
            termsVersion: termsVersion,
            marketingOptIn: marketingOptInStr == 'true',
          );
          // Clear after successful provisioning
          await _clearStorage();
        } else {
          // Normal profile fetch (will succeed if user already exists)
          safePrint('UserProvider: Fetching profile from backend...');
          _user = await authService.getProfile();
          safePrint('UserProvider: Profile fetched: ${_user?.email}');
        }
      } else {
        _user = null;
      }
    } catch (e) {
      safePrint('UserProvider: Error checking auth status: $e');
      _user = null;
    } finally {
      safePrint('UserProvider: Initialization complete.');
      _isInitialized = true;
      _setLoading(false);
    }
  }

  /// Store T&C choices during registration to be used during initial provisioning.
  Future<void> saveRegistrationChoices({
    required String termsVersion,
    required bool marketingOptIn,
  }) async {
    await _storage.write(key: 'pending_terms_version', value: termsVersion);
    await _storage.write(key: 'pending_marketing_opt_in', value: marketingOptIn.toString());
  }

  Future<void> _clearStorage() async {
    await _storage.delete(key: 'pending_terms_version');
    await _storage.delete(key: 'pending_marketing_opt_in');
  }

  /// Explicitly provision a new user after registration.
  Future<void> provisionNewUser({
    required String termsVersion,
    required bool marketingOptIn,
  }) async {
    _setLoading(true);
    try {
      _user = await authService.provisionUser(
        termsVersion: termsVersion,
        marketingOptIn: marketingOptIn,
      );
    } catch (e) {
      safePrint('UserProvider: Error provisioning user: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  /// Complete the onboarding process.
  Future<void> onboardUser(Map<String, dynamic> data) async {
    _setLoading(true);
    try {
      _user = await authService.onboardUser(data);
    } catch (e) {
      safePrint('UserProvider: Error onboarding user: $e');
      rethrow;
    } finally {
      _setLoading(false);
    }
  }

  /// Sign out from Amplify and clear local state.
  Future<void> logout() async {
    _setLoading(true);
    try {
      await Amplify.Auth.signOut();
      // State is cleared by Hub listener
    } catch (e) {
      safePrint('UserProvider: Error during sign out: $e');
    } finally {
      _setLoading(false);
    }
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    super.dispose();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
