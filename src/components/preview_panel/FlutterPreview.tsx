import React from "react";
import { Monitor, Play, Square, RotateCcw, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRunApp } from "@/hooks/useRunApp";
import { useAtomValue } from "jotai";
import { selectedAppIdAtom } from "@/atoms/appAtoms";
import { IpcClient } from "@/ipc/ipc_client";
import { showError } from "@/lib/toast";

export function FlutterPreview() {
  const { runApp, stopApp, loading } = useRunApp();
  const selectedAppId = useAtomValue(selectedAppIdAtom);
  const [isRunning, setIsRunning] = React.useState(false);

  const handleToggleApp = async () => {
    if (!selectedAppId) return;
    
    if (isRunning) {
      await stopApp(selectedAppId);
      setIsRunning(false);
    } else {
      await runApp(selectedAppId);
      setIsRunning(true);
    }
  };

  const handleHotReload = async () => {
    if (!selectedAppId) return;
    
    try {
      await IpcClient.getInstance().flutterHotReload(selectedAppId);
    } catch (error) {
      showError(error);
    }
  };

  const handleHotRestart = async () => {
    if (!selectedAppId) return;
    
    try {
      await IpcClient.getInstance().flutterHotRestart(selectedAppId);
    } catch (error) {
      showError(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <Monitor className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Flutter macOS App
          </h2>
          <p className="text-gray-600 mb-6">
            Your Flutter app runs natively on macOS. Use the controls below to manage your app.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleToggleApp}
            className={`w-full ${
              isRunning
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
            size="lg"
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop App
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run App
              </>
            )}
          </Button>

          {isRunning && (
            <>
              <div className="flex space-x-2">
                <Button
                  onClick={handleHotReload}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Hot Reload
                </Button>
                <Button
                  onClick={handleHotRestart}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Hot Restart
                </Button>
              </div>
              
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-800 font-medium">
                    App is running on macOS
                  </span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  Check your macOS desktop for the running application window.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>
            Flutter apps run natively and don't appear in this preview panel.
            Look for your app window on your macOS desktop.
          </p>
        </div>
      </div>
    </div>
  );
}
