import { db } from "../../db";
import { messages } from "../../db/schema";
import { eq } from "drizzle-orm";
import { Message } from "../ipc_types";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";

export const execPromise = promisify(exec);

// Helper function to detect if an app is a Flutter project
function isFlutterProject(appPath: string): boolean {
  const pubspecPath = path.join(appPath, "pubspec.yaml");
  return fs.existsSync(pubspecPath);
}

export async function executeAddDependency({
  packages,
  message,
  appPath,
}: {
  packages: string[];
  message: Message;
  appPath: string;
}) {
  const packageStr = packages.join(" ");
  let command: string;
  
  // Check if this is a Flutter project
  if (isFlutterProject(appPath)) {
    // For Flutter projects, use flutter pub add
    command = `flutter pub add ${packageStr}`;
  } else {
    // For web projects, use npm/pnpm
    command = `(pnpm add ${packageStr}) || (npm install --legacy-peer-deps ${packageStr})`;
  }

  const { stdout, stderr } = await execPromise(command, {
    cwd: appPath,
  });
  const installResults = stdout + (stderr ? `\n${stderr}` : "");

  // Update the message content with the installation results
  const updatedContent = message.content.replace(
    new RegExp(
      `<dyad-add-dependency packages="${packages.join(
        " ",
      )}">[^<]*</dyad-add-dependency>`,
      "g",
    ),
    `<dyad-add-dependency packages="${packages.join(
      " ",
    )}">${installResults}</dyad-add-dependency>`,
  );

  // Save the updated message back to the database
  await db
    .update(messages)
    .set({ content: updatedContent })
    .where(eq(messages.id, message.id));
}
