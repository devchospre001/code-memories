import * as vscode from "vscode";
import { CaptureMemory } from "./views/webviews/view/CaptureMemory";

export function activate({
  subscriptions,
  extensionUri,
}: vscode.ExtensionContext) {
  subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "captured-memories",
      new CaptureMemory(extensionUri)
    )
  );
}

// TODO!: don't forget extension icon and webview (view) icons!!!!;
// - **Capture Moments:** Easily capture and annotate memorable moments while coding. //TODO: (in progress)
/* 
- **Personal Annotations:** Add personal annotations, comments, and reflections to your code files.
- **Timeline View:** Visualize your coding journey with a timeline view that highlights significant events and milestones.
- **Search and Filter:** Easily search and filter through your code memories to find specific moments or themes.
- **Share and Collaborate:** Share your code memories with friends, colleagues, and fellow developers.
- **Privacy and Security:** Your code memories are private and secure, ensuring only you have access to your personal annotations and reflections.
*/
