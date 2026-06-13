import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});
  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _form = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  String _patronType = 'adult';

  @override
  void dispose() {
    _nameCtrl.dispose(); _emailCtrl.dispose(); _phoneCtrl.dispose(); _passCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_form.currentState!.validate()) return;
    await ref.read(authProvider.notifier).register({
      'fullName': _nameCtrl.text,
      'email': _emailCtrl.text,
      'phone': _phoneCtrl.text,
      'password': _passCtrl.text,
      'patronType': _patronType,
    });
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Đăng ký thành công!')));
      context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Đăng ký thẻ thư viện')),
    body: SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: _form,
        child: Column(children: [
          const SizedBox(height: 20),
          TextFormField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Họ tên *', prefixIcon: Icon(Icons.person)), validator: (v) => v?.isEmpty == true ? 'Nhập họ tên' : null),
          const SizedBox(height: 16),
          TextFormField(controller: _emailCtrl, decoration: const InputDecoration(labelText: 'Email *', prefixIcon: Icon(Icons.email)), keyboardType: TextInputType.emailAddress, validator: (v) => v?.contains('@') == true ? null : 'Email không hợp lệ'),
          const SizedBox(height: 16),
          TextFormField(controller: _phoneCtrl, decoration: const InputDecoration(labelText: 'Số điện thoại', prefixIcon: Icon(Icons.phone)), keyboardType: TextInputType.phone),
          const SizedBox(height: 16),
          TextFormField(controller: _passCtrl, obscureText: true, decoration: const InputDecoration(labelText: 'Mật khẩu *', prefixIcon: Icon(Icons.lock)), validator: (v) => (v?.length ?? 0) < 6 ? 'Ít nhất 6 ký tự' : null),
          const SizedBox(height: 16),
          DropdownButtonFormField(
            value: _patronType,
            decoration: const InputDecoration(labelText: 'Đối tượng', prefixIcon: Icon(Icons.people)),
            items: const [DropdownMenuItem(value: 'adult', child: Text('Người lớn')), DropdownMenuItem(value: 'child', child: Text('Thiếu nhi'))],
            onChanged: (v) => setState(() => _patronType = v!),
          ),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _submit,
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F3460), foregroundColor: Colors.white),
              child: const Text('Đăng ký', style: TextStyle(fontSize: 16)),
            ),
          ),
        ]),
      ),
    ),
  );
}
