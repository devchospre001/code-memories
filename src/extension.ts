import * as vscode from "vscode";
import { CaptureMemory } from "./views/webviews/view/CaptureMemory";

export function activate({
  subscriptions,
  extensionUri,
}: vscode.ExtensionContext) {
  const captureMemoryProvider = new CaptureMemory(extensionUri);

  subscriptions.push(
    vscode.commands.registerCommand("cm.captureMemory", async () => {
      await vscode.commands.executeCommand(
        "workbench.view.extension.codeMemories"
      );

      const memoryDescription =
        captureMemoryProvider.getTextSelectionAsMemory();
      const memoryTitle = await vscode.window.showInputBox({
        placeHolder: "Enter Captured Memory title",
      });

      captureMemoryProvider.postMessageToWebView({
        type: "auto",
        message: "Added new memory!",
      });
      captureMemoryProvider.postMessageToWebView({
        type: "title",
        message: memoryTitle!,
      });
      captureMemoryProvider.postMessageToWebView({
        type: "description",
        message: memoryDescription!,
      });

      await vscode.window.showInformationMessage("Added new memory!");
    })
  );

  subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "captured-memories",
      captureMemoryProvider
    )
  );
}

// TODO!: don't forget extension icon and webview (view) icons!!!!;
// - **Capture Moments:** Easily capture and annotate memorable moments while coding. //TODO*: (done)
/* 
- **Personal Annotations:** Add personal annotations, comments, and reflections to your code files.
- **Timeline View:** Visualize your coding journey with a timeline view that highlights significant events and milestones.
- **Search and Filter:** Easily search and filter through your code memories to find specific moments or themes.
- **Share and Collaborate:** Share your code memories with friends, colleagues, and fellow developers.
- **Privacy and Security:** Your code memories are private and secure, ensuring only you have access to your personal annotations and reflections.
*/
