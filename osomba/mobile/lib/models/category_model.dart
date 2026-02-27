class CategoryModel {
  final String id;
  final String name;
  final String description;
  final String icon;
  final int productCount;
  final String? imageUrl;

  CategoryModel({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    this.productCount = 0,
    this.imageUrl,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      icon: json['icon'],
      productCount: json['product_count'] ?? 0,
      imageUrl: json['image_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'icon': icon,
      'product_count': productCount,
      'image_url': imageUrl,
    };
  }
}
