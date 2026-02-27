/*
 * File: screens/marketplace/providers/marketplace_provider.dart
 * Purpose: Manages state for products, categories, and search filters.
 * Usage: Used by MarketplaceHomeScreen to display data.
 * Architecture: Provider Layer - Marketplace Feature State.
 */
import 'package:flutter/material.dart';
import '../../../models/product_model.dart';
import '../../../models/category_model.dart';

class MarketplaceProvider with ChangeNotifier {
  List<ProductModel> _products = [];
  List<CategoryModel> _categories = [];
  bool _isLoading = false;

  List<ProductModel> get products => _products;
  List<CategoryModel> get categories => _categories;
  bool get isLoading => _isLoading;

  void loadDemoData() {
    _isLoading = true;
    notifyListeners();
    
    // Simulate API delay if needed, or just set data
    // _products = ProductModel.getDemoProducts();
    // _categories = CategoryModel.getDemoCategories();
    _products = [];
    _categories = [];
    
    _isLoading = false;
    notifyListeners();
  }

  // Add search logic, filter logic here later
}
