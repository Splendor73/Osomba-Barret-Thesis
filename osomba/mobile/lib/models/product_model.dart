class ProductModel {
  final String id;
  final String name;
  final String description;
  final double price;
  final String currency;
  final List<String> images;
  final String category;
  final String sellerId;
  final String sellerName;
  final double rating;
  final int reviewCount;
  final bool isAvailable;
  final bool isFeatured;
  final DateTime createdAt;
  final Map<String, dynamic>? specifications;

  ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.currency = 'USD',
    required this.images,
    required this.category,
    required this.sellerId,
    required this.sellerName,
    this.rating = 0.0,
    this.reviewCount = 0,
    this.isAvailable = true,
    this.isFeatured = false,
    required this.createdAt,
    this.specifications,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: json['price'].toDouble(),
      currency: json['currency'] ?? 'USD',
      images: List<String>.from(json['images'] ?? []),
      category: json['category'],
      sellerId: json['seller_id'],
      sellerName: json['seller_name'],
      rating: json['rating']?.toDouble() ?? 0.0,
      reviewCount: json['review_count'] ?? 0,
      isAvailable: json['is_available'] ?? true,
      isFeatured: json['is_featured'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
      specifications: json['specifications'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'currency': currency,
      'images': images,
      'category': category,
      'seller_id': sellerId,
      'seller_name': sellerName,
      'rating': rating,
      'review_count': reviewCount,
      'is_available': isAvailable,
      'is_featured': isFeatured,
      'created_at': createdAt.toIso8601String(),
      'specifications': specifications,
    };
  }
}
