import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:dyad_flutter_app/main.dart';

void main() {
  testWidgets('Counter increments smoke test', (WidgetTester tester) async {
    // Build our app and trigger a frame.
    await tester.pumpWidget(const MyApp());

    // Verify that our app starts with the welcome message.
    expect(find.text('Welcome to your Flutter macOS app!'), findsOneWidget);
    expect(find.text('Built with ❤️ using Dyad'), findsOneWidget);

    // Tap the floating action button and trigger a frame.
    await tester.tap(find.byIcon(Icons.waving_hand));
    await tester.pump();

    // Verify that the snackbar appears.
    expect(find.text('Hello from Dyad Flutter!'), findsOneWidget);
  });
}
