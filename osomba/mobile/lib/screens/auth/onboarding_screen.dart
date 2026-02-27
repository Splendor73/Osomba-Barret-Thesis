import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/user_provider.dart';
import '../../models/user_model.dart';
import '../../utils/location_data.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _userNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _countryController = TextEditingController();
  final _bioController = TextEditingController();
  UserRole _selectedRole = UserRole.buyer;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _fullNameController.dispose();
    _userNameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _countryController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _submitOnboarding() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final data = {
        'full_name': _fullNameController.text.trim(),
        'user_name': _userNameController.text.trim(),
        'phone_number': _phoneController.text.trim().isEmpty ? null : _phoneController.text.trim(),
        'address': _addressController.text.trim(),
        'city': _cityController.text.trim(),
        'country': _countryController.text.trim(),
        'bio': _bioController.text.trim().isEmpty ? null : _bioController.text.trim(),
        'role': _selectedRole.name.toUpperCase(),
      };

      await context.read<UserProvider>().onboardUser(data);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Onboarding complete! Welcome to Osomba.')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitting = false);
      }
    }
  }

  Widget _buildRoleTile({
    required UserRole role,
    required String title,
    required String subtitle,
  }) {
    final selected = _selectedRole == role;
    final activeColor = Theme.of(context).colorScheme.primary;
    return ListTile(
      onTap: () => setState(() => _selectedRole = role),
      leading: Icon(
        selected ? Icons.radio_button_checked : Icons.radio_button_off,
        color: selected ? activeColor : Colors.grey,
      ),
      title: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.bold),
      ),
      subtitle: Text(subtitle),
      trailing: selected ? Icon(Icons.check_circle, color: activeColor) : null,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Complete Your Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Tell us more about yourself',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text('This information helps other users trust you in the marketplace.'),
              const SizedBox(height: 24),
              
              TextFormField(
                controller: _fullNameController,
                decoration: const InputDecoration(
                  labelText: 'Full Name',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Please enter your full name';
                  if (val.trim().length < 3) return 'Name too short';
                  if (val.trim().split(' ').length < 2) return 'Please enter at least two names';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _userNameController,
                decoration: const InputDecoration(
                  labelText: 'Username',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.alternate_email),
                  helperText: 'Alphanumeric, no spaces',
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Please enter a username';
                  if (val.trim().length < 3) return 'Username too short';
                  if (val.contains(' ')) return 'Username cannot contain spaces';
                  if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(val)) {
                    return 'Only letters, numbers, and underscores allowed';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(
                  labelText: 'Phone Number (Optional)',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.phone),
                  hintText: '+243...',
                ),
                keyboardType: TextInputType.phone,
                validator: (val) {
                  if (val == null || val.isEmpty) return null; // Optional
                  if (!RegExp(r'^\+?[0-9]{7,15}$').hasMatch(val.replaceAll(RegExp(r'[\s\-\(\)]'), ''))) {
                    return 'Please enter a valid phone number';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16),
              
              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(
                  labelText: 'Street Address',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.location_on),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) return 'Please enter your address';
                  if (val.trim().length < 5) return 'Address too short';
                  return null;
                },
              ),
              const SizedBox(height: 16),
              
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _cityController,
                      decoration: const InputDecoration(
                        labelText: 'City / Region',
                        border: OutlineInputBorder(),
                      ),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Required';
                        if (val.trim().length < 2) return 'Too short';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        return RawAutocomplete<String>(
                          textEditingController: _countryController,
                          focusNode: FocusNode(),
                          optionsBuilder: (TextEditingValue textEditingValue) {
                            if (textEditingValue.text == '') {
                              return const Iterable<String>.empty();
                            }
                            return africanCountries.where((String option) {
                              return option.toLowerCase().contains(textEditingValue.text.toLowerCase());
                            });
                          },
                          fieldViewBuilder: (context, controller, focusNode, onFieldSubmitted) {
                            return TextFormField(
                              controller: controller,
                              focusNode: focusNode,
                              decoration: const InputDecoration(
                                labelText: 'Country',
                                border: OutlineInputBorder(),
                              ),
                              validator: (val) {
                                if (val == null || val.isEmpty) return 'Required';
                                if (!africanCountries.contains(val)) return 'Invalid country';
                                return null;
                              },
                            );
                          },
                          optionsViewBuilder: (context, onSelected, options) {
                            return Align(
                              alignment: Alignment.topLeft,
                              child: Material(
                                elevation: 4.0,
                                child: SizedBox(
                                  height: 200,
                                  width: constraints.maxWidth,
                                  child: ListView.builder(
                                    padding: EdgeInsets.zero,
                                    itemCount: options.length,
                                    itemBuilder: (BuildContext context, int index) {
                                      final String option = options.elementAt(index);
                                      return ListTile(
                                        title: Text(option),
                                        onTap: () => onSelected(option),
                                      );
                                    },
                                  ),
                                ),
                              ),
                            );
                          },
                        );
                      }
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),
              
              const Text(
                'Choose Your Role',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const Text('You can change this later in settings.'),
              const SizedBox(height: 8),
              
              Card(
                child: Column(
                  children: [
                    _buildRoleTile(
                      role: UserRole.buyer,
                      title: 'Buyer',
                      subtitle: 'I want to browse and purchase items.',
                    ),
                    const Divider(height: 1),
                    _buildRoleTile(
                      role: UserRole.seller,
                      title: 'Seller',
                      subtitle: 'I want to list items and create auctions.',
                    ),
                    const Divider(height: 1),
                    _buildRoleTile(
                      role: UserRole.both,
                      title: 'Both',
                      subtitle: 'I want to both buy and sell.',
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              ElevatedButton(
                onPressed: _isSubmitting ? null : _submitOnboarding,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                child: _isSubmitting 
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Text('Complete Onboarding', style: TextStyle(fontSize: 18)),
              ),
              
              const SizedBox(height: 16),
              
              TextButton(
                onPressed: () => context.read<UserProvider>().logout(),
                child: const Text('Sign Out'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
