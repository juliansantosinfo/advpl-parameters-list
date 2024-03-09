const vscode = require("vscode");

class SideBarMenuProvider {
  constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;

    vscode.workspace.onDidChangeTextDocument(() => {
      this.refresh();
    });

    vscode.window.onDidChangeActiveTextEditor(() => {
      this.refresh();
    });

    vscode.workspace.onDidCloseTextDocument(() => {
      this.refresh();
    });
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element) {
    if (element.children) {
      return {
        label: element.name,
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      };
    } else {
      return {
        label: `${element.label}`,
        collapsibleState: vscode.TreeItemCollapsibleState.None,
        command: {
          command: "sideBarMenu.openFile",
          title: "Abrir arquivo",
          arguments: [element.lineNumber],
        },
      };
    }
  }

  async getChildren(element) {
    if (!element) {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        return [];
      }

      const text = activeEditor.document.getText();
      const configItems = [];

      getCallsGetNewPar(text, configItems);

      getCallsGetMV(text, configItems);

      getCallsSuperGetMV(text, configItems);

      configItems.sort((a, b) => a.name.localeCompare(b.name));

      return configItems;
    } else {
      return element.children.map((child) => ({
        label: child.label,
        lineNumber: child.lineNumber,
        collapsibleState: vscode.TreeItemCollapsibleState.None,
      }));
    }
  }
}

function getCallsGetNewPar(text, configItems) {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return [];
  }

  let matches;
  let regex;

  regex = /(\w+)\s*:=\s*GetNewPar\(\s*"(.+?)"\s*,/gi;
  while ((matches = regex.exec(text)) !== null) {
    configItems.push({
      name: matches[2], // Nome da configuração
      children: [
        {
          label: matches[1],
          lineNumber: activeEditor.document.positionAt(matches.index).line + 1,
        },
      ],
    });
  }
}

function getCallsGetMV(text, configItems) {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return [];
  }

  const regex = /(\w+)\s*:=\s*GetMV\(\s*"(.+?)"/gi;
  let matches;

  while ((matches = regex.exec(text)) !== null) {
    configItems.push({
      name: matches[2],
      children: [
        {
          label: matches[1],
          lineNumber: activeEditor.document.positionAt(matches.index).line + 1,
        },
      ],
    });
  }
}

function getCallsSuperGetMV(text, configItems) {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return [];
  }

  const regex = /(\w+)\s*:=\s*SuperGetMV\(\s*"(.+?)"/gi;
  let matches;

  while ((matches = regex.exec(text)) !== null) {
    configItems.push({
      name: matches[2],
      children: [
        {
          label: matches[1],
          lineNumber: activeEditor.document.positionAt(matches.index).line + 1,
        },
      ],
    });
  }
}

function activate(context) {
  console.log("Extensão AdvPL Parameters List foi ativada.");
  vscode.window.showInformationMessage(
    "Extensão AdvPL Parameters List foi ativada."
  );

  const sideBarMenu = vscode.window.createTreeView("sideBarMenu", {
    treeDataProvider: new SideBarMenuProvider(),
  });

  context.subscriptions.push(sideBarMenu);

  // Adicionar um manipulador de eventos para abrir o arquivo na linha correspondente
  vscode.commands.registerCommand("sideBarMenu.openFile", (lineNumber) => {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      const newPosition = new vscode.Position(lineNumber - 1, 0); // Linhas são baseadas em zero
      const newSelection = new vscode.Selection(newPosition, newPosition);
      activeEditor.selection = newSelection;
      activeEditor.revealRange(
        new vscode.Range(newPosition, newPosition),
        vscode.TextEditorRevealType.InCenter
      );
    }
  });
}

function deactivate() {
  console.log("Extensão AdvPL Parameters List foi desativada.");
  vscode.window.showInformationMessage(
    "Extensão AdvPL Parameters List foi desativada."
  );
}

module.exports = {
  activate,
  deactivate,
};
