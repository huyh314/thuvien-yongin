import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../state/search_provider.dart';
import '../../models/book.dart';
import 'widgets/book_card.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});
  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(searchProvider);
    final notifier = ref.read(searchProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _controller,
          autofocus: true,
          decoration: InputDecoration(
            hintText: 'Tìm kiếm sách...',
            filled: true,
            fillColor: Colors.white.withOpacity(0.2),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
            suffixIcon: IconButton(icon: const Icon(Icons.search), onPressed: () { notifier.setQuery(_controller.text); notifier.search(); }),
          ),
          style: const TextStyle(color: Colors.white),
          cursorColor: Colors.white,
          onChanged: (v) => notifier.setQuery(v),
          onSubmitted: (_) => notifier.search(),
        ),
      ),
      body: Column(
        children: [
          if (state.suggestions.isNotEmpty && state.results.isEmpty)
            Expanded(child: ListView(
              children: state.suggestions.map((s) => ListTile(
                leading: const Icon(Icons.lightbulb_outline, color: Colors.amber),
                title: Text(s),
                onTap: () { _controller.text = s; notifier.setQuery(s); notifier.search(); },
              )).toList(),
            )),
          if (state.isLoading) const Expanded(child: Center(child: CircularProgressIndicator())),
          if (state.error != null) Expanded(child: Center(child: Text(state.error!, style: const TextStyle(color: Colors.red)))),
          if (state.results.isNotEmpty)
            Expanded(child: ListView.builder(
              itemCount: state.results.length + 1,
              itemBuilder: (_, i) {
                if (i == state.results.length) {
                  if (state.results.length < state.total) {
                    notifier.loadMore();
                    return const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator(strokeWidth: 2)));
                  }
                  return const SizedBox();
                }
                return BookCard(book: state.results[i], onTap: () => context.go('/works/${state.results[i].id}'));
              },
            )),
        ],
      ),
    );
  }
}
