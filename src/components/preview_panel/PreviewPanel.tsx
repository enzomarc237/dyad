import { useAtom, useAtomValue } from "jotai";
import {
  appOutputAtom,
  previewModeAtom,
  previewPanelKeyAtom,
  selectedAppIdAtom,
} from "../../atoms/appAtoms";

import { CodeView } from "./CodeView";
import { PreviewIframe } from "./PreviewIframe";
import { FlutterPreview } from "./FlutterPreview";
import { Problems } from "./Problems";
import { ConfigurePanel } from "./ConfigurePanel";
import { ChevronDown, ChevronUp, Logs } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { Console } from "./Console";
import { useRunApp } from "@/hooks/useRunApp";
import { PublishPanel } from "./PublishPanel";
import { isFlutterProjectFromFiles } from "@/shared/project_utils";

interface ConsoleHeaderProps {
  isOpen: boolean;
  onToggle: () => void;
  latestMessage?: string;
}

// Console header component
const ConsoleHeader = ({
  isOpen,
  onToggle,
  latestMessage,
}: ConsoleHeaderProps) => (
  <div
    onClick={onToggle}
    className="flex items-start gap-2 px-4 py-1.5 border-t border-border cursor-pointer hover:bg-[var(--background-darkest)] transition-colors"
  >
    <Logs size={16} className="mt-0.5" />
    <div className="flex flex-col">
      <span className="text-sm font-medium">System Messages</span>
      {!isOpen && latestMessage && (
        <span className="text-xs text-gray-500 truncate max-w-[200px] md:max-w-[400px]">
          {latestMessage}
        </span>
      )}
    </div>
    <div className="flex-1" />
    {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
  </div>
);

// Main PreviewPanel component
export function PreviewPanel() {
  const [previewMode] = useAtom(previewModeAtom);
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const { runApp, stopApp, loading, app } = useRunApp();
  const runningAppIdRef = useRef<number | null>(null);
  const key = useAtomValue(previewPanelKeyAtom);
  const appOutput = useAtomValue(appOutputAtom);
  
  // Check if the current app is a Flutter project
  const isFlutter = app?.files ? isFlutterProjectFromFiles(app.files) : false;

  const messageCount = appOutput.length;
  const latestMessage =
    messageCount > 0 ? appOutput[messageCount - 1]?.message : undefined;

  // Effect to handle stopping previous app when selectedAppId changes
  useEffect(() => {
    const previousAppId = runningAppIdRef.current;

    // Stop the previously running app if the selected app ID has changed
    if (selectedAppId !== previousAppId && previousAppId !== null) {
      console.debug("Stopping previous app", previousAppId);
      stopApp(previousAppId);
      runningAppIdRef.current = null;
    }
  }, [selectedAppId, stopApp]);

  // Effect to handle auto-starting apps (but only after app data is loaded)
  useEffect(() => {
    // Only proceed if we have both selectedAppId and app data
    if (selectedAppId !== null && app !== null && app !== undefined) {
      const currentRunningApp = runningAppIdRef.current;
      
      // Only start if not already running this app
      if (currentRunningApp !== selectedAppId) {
        // Skip auto-start for Flutter projects - FlutterPreview will handle it manually
        if (!isFlutter) {
          console.debug("Starting new app", selectedAppId);
          runApp(selectedAppId);
          runningAppIdRef.current = selectedAppId;
        } else {
          console.debug("Skipping auto-start for Flutter app", selectedAppId);
          runningAppIdRef.current = null; // Flutter apps are controlled manually
        }
      }
    } else if (selectedAppId === null) {
      // If selectedAppId is null, ensure no app is marked as running
      runningAppIdRef.current = null;
    }
  }, [selectedAppId, app, isFlutter, runApp]);

  // Cleanup effect for unmounting
  useEffect(() => {
    return () => {
      const currentRunningApp = runningAppIdRef.current;
      if (currentRunningApp !== null) {
        console.debug("Component unmounting, stopping app", currentRunningApp);
        stopApp(currentRunningApp);
        runningAppIdRef.current = null;
      }
    };
  }, [stopApp]);
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="vertical">
          <Panel id="content" minSize={30}>
            <div className="h-full overflow-y-auto">
              {previewMode === "preview" ? (
                isFlutter ? (
                  <FlutterPreview />
                ) : (
                  <PreviewIframe key={key} loading={loading} />
                )
              ) : previewMode === "code" ? (
                <CodeView loading={loading} app={app} />
              ) : previewMode === "configure" ? (
                <ConfigurePanel />
              ) : previewMode === "publish" ? (
                <PublishPanel />
              ) : (
                <Problems />
              )}
            </div>
          </Panel>
          {isConsoleOpen && (
            <>
              <PanelResizeHandle className="h-1 bg-border hover:bg-gray-400 transition-colors cursor-row-resize" />
              <Panel id="console" minSize={10} defaultSize={30}>
                <div className="flex flex-col h-full">
                  <ConsoleHeader
                    isOpen={true}
                    onToggle={() => setIsConsoleOpen(false)}
                    latestMessage={latestMessage}
                  />
                  <Console />
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
      {!isConsoleOpen && (
        <ConsoleHeader
          isOpen={false}
          onToggle={() => setIsConsoleOpen(true)}
          latestMessage={latestMessage}
        />
      )}
    </div>
  );
}
