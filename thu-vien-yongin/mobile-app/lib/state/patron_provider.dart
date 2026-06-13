import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/patron_service.dart';
import '../models/patron.dart';

class PatronState {
  final Patron? profile;
  final List<Checkout> checkouts;
  final List<Checkout> history;
  final List<Book> wishlist;
  final bool isLoading;

  const PatronState({this.profile, this.checkouts = const [], this.history = const [], this.wishlist = const [], this.isLoading = false});

  PatronState copyWith({Patron? profile, List<Checkout>? checkouts, List<Checkout>? history, List<Book>? wishlist, bool? isLoading}) => PatronState(
    profile: profile ?? this.profile,
    checkouts: checkouts ?? this.checkouts,
    history: history ?? this.history,
    wishlist: wishlist ?? this.wishlist,
    isLoading: isLoading ?? this.isLoading,
  );
}

class PatronNotifier extends StateNotifier<PatronState> {
  final PatronService _service;

  PatronNotifier(this._service) : super(const PatronState());

  Future<void> loadProfile(int id) async {
    state = state.copyWith(isLoading: true);
    try {
      final profile = await _service.getProfile(id);
      final checkouts = await _service.getCheckouts(id);
      final wishlist = await _service.getWishlist(id);
      state = PatronState(profile: profile, checkouts: checkouts, wishlist: wishlist);
    } catch (_) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> renewBook(int circulationId) async {
    await _service.renewBook(circulationId);
    if (state.profile != null) await loadProfile(state.profile!.id);
  }
}

final patronProvider = StateNotifierProvider<PatronNotifier, PatronState>((ref) => PatronNotifier(PatronService()));
