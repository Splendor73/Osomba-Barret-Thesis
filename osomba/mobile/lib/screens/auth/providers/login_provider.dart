import 'package:flutter/material.dart';

class LoginProvider with ChangeNotifier {
  bool _isLoading = false;
  String? _errorMessage;
  bool _isPasswordVisible = false;

  // We keep controllers here or in the UI? 
  // Strict "Logic in Provider" suggests holding data here, but Controllers are UI-bound.
  // Compromise: We don't hold controllers here. We just hold state.
  
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isPasswordVisible => _isPasswordVisible;

  void togglePasswordVisibility() {
    _isPasswordVisible = !_isPasswordVisible;
    notifyListeners();
  }

  void setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void setError(String? error) {
    _errorMessage = error;
    notifyListeners();
  }
}
