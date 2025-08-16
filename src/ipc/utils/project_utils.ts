import fs from "node:fs";
import path from "node:path";

/**
 * Helper function to detect if an app is a Flutter project
 * by checking for the presence of pubspec.yaml file
 */
export function isFlutterProject(appPath: string): boolean {
  const pubspecPath = path.join(appPath, "pubspec.yaml");
  return fs.existsSync(pubspecPath);
}
