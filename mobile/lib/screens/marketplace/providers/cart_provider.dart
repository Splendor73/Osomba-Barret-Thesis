/*
 * File: screens/marketplace/providers/cart_provider.dart
 * Purpose: Manages shopping cart state (add/remove items, total calc).
 * Usage: Accessible globally to add items; used by CartScreen to display.
 * Architecture: Provider Layer - Marketplace Feature State.
 */
import 'package:flutter/material.dart';
import '../../../models/product_model.dart';

class CartProvider with ChangeNotifier {
  final List<Map<String, dynamic>> _cartItems = [];

  // Demo initial data loading mechanism could be separate, but for now we init empty or with demo
  CartProvider() {
    _loadDemoCart();
  }

  List<Map<String, dynamic>> get cartItems => _cartItems;

  double get subtotal {
    return _cartItems.fold(0.0, (sum, item) {
      final product = item['product'] as ProductModel;
      final quantity = item['quantity'] as int;
      return sum + (product.price * quantity);
    });
  }

  double get shipping => 9.99;
  double get total => subtotal + shipping;

  void _loadDemoCart() {
     // Intentionally empty for production readiness
  }

  void addToCart(ProductModel product) {
    // Check if exists
    final index = _cartItems.indexWhere((item) => (item['product'] as ProductModel).id == product.id);
    if (index >= 0) {
      _cartItems[index]['quantity'] = (_cartItems[index]['quantity'] as int) + 1;
    } else {
      _cartItems.add({'product': product, 'quantity': 1});
    }
    notifyListeners();
  }

  void incrementQuantity(int index) {
    if (index >= 0 && index < _cartItems.length) {
      _cartItems[index]['quantity'] = (_cartItems[index]['quantity'] as int) + 1;
      notifyListeners();
    }
  }

  void decrementQuantity(int index) {
    if (index >= 0 && index < _cartItems.length) {
      final currentQty = _cartItems[index]['quantity'] as int;
      if (currentQty > 1) {
        _cartItems[index]['quantity'] = currentQty - 1;
      } else {
        _cartItems.removeAt(index);
      }
      notifyListeners();
    }
  }

  void removeItem(int index) {
    if (index >= 0 && index < _cartItems.length) {
      _cartItems.removeAt(index);
      notifyListeners();
    }
  }

  void clearCart() {
    _cartItems.clear();
    notifyListeners();
  }
}
