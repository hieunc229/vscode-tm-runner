import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "tmRunner.runCommand",
      async (line?: number) => {
        await runCommand(line);
      }
    ),
    vscode.commands.registerCommand("tmRunner.runAllCommands", async () => {
      await runAllCommands();
    })
  );

  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      [{ language: "tm" }, { language: "markdown" }],
      new TmCodeLensProvider()
    )
  );

  async function runCommand(lineNumber?: number) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    let command = "";

    if (lineNumber !== undefined) {
      // Run a single line, handling multi-line commands with '\'
      let currentLine = lineNumber;
      command = document.lineAt(currentLine).text.trim();
      // For markdown: strip "$ " prefix
      if (document.languageId === "markdown" && command.startsWith("$ ")) {
        command = command.slice(2).trim();
      }
      while (command.endsWith("\\") && currentLine + 1 < document.lineCount) {
        command = command.slice(0, -1); // Remove '\'
        currentLine++;
        let nextLine = document.lineAt(currentLine).text.trim();
        // For markdown: strip "$ " prefix on continued lines too
        if (document.languageId === "markdown" && nextLine.startsWith("$ ")) {
          nextLine = nextLine.slice(2).trim();
        }
        command += nextLine;
      }
    } else {
      // Run the line under the cursor
      const position = editor.selection.active;
      let currentLine = position.line;
      command = document.lineAt(currentLine).text.trim();
      if (document.languageId === "markdown" && command.startsWith("$ ")) {
        command = command.slice(2).trim();
      }
      while (command.endsWith("\\") && currentLine + 1 < document.lineCount) {
        command = command.slice(0, -1);
        currentLine++;
        let nextLine = document.lineAt(currentLine).text.trim();
        if (document.languageId === "markdown" && nextLine.startsWith("$ ")) {
          nextLine = nextLine.slice(2).trim();
        }
        command += nextLine;
      }
    }

    if (command && !command.startsWith("#")) {
      const terminal =
        vscode.window.activeTerminal || vscode.window.createTerminal();
      terminal.show();
      terminal.sendText(command);
    }
  }

  async function runAllCommands() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
  
    const document = editor.document;
    const selection = editor.selection;
    let lines: string[] = [];
  
    if (selection.isEmpty) {
      // Run all lines in the document
      lines = document.getText().split("\n");
    } else {
      // Run selected lines
      for (let i = selection.start.line; i <= selection.end.line; i++) {
        lines.push(document.lineAt(i).text);
      }
    }
  
    let commands: string[] = [];
    let currentCommand = "";
    const isMd = document.languageId === "markdown";
    for (const line of lines) {
      let trimmedLine = line.trim();
  
      // For markdown: only lines starting with "$ "
      if (isMd) {
        if (!trimmedLine.startsWith("$ ")) continue;
        trimmedLine = trimmedLine.slice(2).trim();
      }
  
      if (trimmedLine && !trimmedLine.startsWith("#")) {
        currentCommand += trimmedLine;
        if (!trimmedLine.endsWith("\\")) {
          commands.push(currentCommand);
          currentCommand = "";
        } else {
          currentCommand = currentCommand.slice(0, -1); // Remove '\'
        }
      }
    }
  
    const terminal =
      vscode.window.activeTerminal || vscode.window.createTerminal();
    terminal.show();
    for (const command of commands) {
      terminal.sendText(command);
      await new Promise((resolve) => setTimeout(resolve, 100)); // Small delay to ensure commands execute sequentially
    }
  }
}

class TmCodeLensProvider implements vscode.CodeLensProvider {
  onDidChangeCodeLenses?: vscode.Event<void> | undefined;

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const lenses: vscode.CodeLens[] = [];
    const isMd = document.languageId === "markdown";
    let i = 0;
    while (i < document.lineCount) {
      let line = document.lineAt(i);
      let trimmed = line.text.trim();

      // For .md: only lines starting with "$ "
      if (isMd) {
        if (!trimmed.startsWith("$ ")) {
          i++;
          continue;
        }
        // Only single-line commands for markdown
        const range = new vscode.Range(i, 0, i, 0);
        lenses.push(
          new vscode.CodeLens(range, {
            title: "▶ Run",
            command: "tmRunner.runCommand",
            arguments: [i],
          })
        );
        i++;
        continue;
      }

      // For .tm: skip empty lines and comments
      if (!trimmed || trimmed.startsWith("#")) {
        i++;
        continue;
      }

      // Multi-line command block for .tm
      let startLine = i;
      let command = trimmed;
      while (command.endsWith("\\") && i + 1 < document.lineCount) {
        i++;
        let nextLine = document.lineAt(i).text.trim();
        command = command.slice(0, -1) + nextLine;
      }
      const range = new vscode.Range(startLine, 0, startLine, 0);
      lenses.push(
        new vscode.CodeLens(range, {
          title: "▶ Run",
          command: "tmRunner.runCommand",
          arguments: [startLine],
        })
      );
      i++;
    }
    return lenses;
  }
}

export function deactivate() {}
