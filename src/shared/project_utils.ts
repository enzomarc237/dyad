/**
 * Helper function to detect if an app is a Flutter project
 * by checking the files array (for renderer side usage)
 */
export function isFlutterProjectFromFiles(files: string[]): boolean {
  return files.some((file: string) => file.endsWith('/pubspec.yaml') || file === 'pubspec.yaml');
}
