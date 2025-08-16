/**
 * Helper function to detect if an app is a Flutter project
 * by checking the files array (for renderer side usage)
 */
export function isFlutterProjectFromFiles(files: string[]): boolean {
  return files.some((file: string) => {
    const normalizedFile = file.replace(/\\/g, '/');
    return normalizedFile.endsWith('/pubspec.yaml') || normalizedFile === 'pubspec.yaml';
  });
}
