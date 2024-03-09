const vscode = require("vscode");

let extensionSettings;
let regexGetNewPar;
let regexGetMV;
let regexSuperGetMV;

// Classe responsável por fornecer os itens para a barra lateral
class SideBarMenuProvider {
  constructor() {
    // EventEmitter para notificar quando os dados da árvore mudam
    this._onDidChangeTreeData = new vscode.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;

    // Registrar observadores para eventos de alteração no editor de texto
    vscode.workspace.onDidChangeTextDocument(() => {
      this.refresh(); // Atualizar os dados da árvore quando o documento for modificado
    });

    vscode.window.onDidChangeActiveTextEditor(() => {
      this.refresh(); // Atualizar os dados da árvore quando o editor ativo mudar
    });

    vscode.workspace.onDidCloseTextDocument(() => {
      this.refresh(); // Atualizar os dados da árvore quando um documento for fechado
    });
  }

  // Método para emitir um evento de atualização da árvore
  refresh() {
    this._onDidChangeTreeData.fire();
  }

  // Método para obter a representação do item de árvore
  getTreeItem(element) {
    return {
      label: element.label,
      collapsibleState: vscode.TreeItemCollapsibleState.None,
      // Comando para abrir o arquivo na linha correspondente ao item da árvore
      command: {
        command: "sideBarMenu.openFile",
        title: "Abrir arquivo",
        arguments: [element.lineNumber],
      },
    };
  }

  // Método assíncrono para obter os filhos da árvore
  async getChildren() {
    extensionSettings = vscode.workspace.getConfiguration(
      "advplParametersList"
    );
    regexGetNewPar = extensionSettings.regex.GetNewPar; // Expressão regular para encontrar chamadas da função GetNewPar
    regexGetMV = extensionSettings.regex.GetMV; // Expressão regular para encontrar chamadas da função GetMV
    regexSuperGetMV = extensionSettings.regex.SuperGetMV; // Expressão regular para encontrar chamadas da função SuperGetMV

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      return [];
    }

    const text = activeEditor.document.getText();
    const configItems = [];

    // Funções para identificar chamadas de função específicas e adicionar seus parâmetros à lista
    getCallsGetNewPar(text, configItems);
    getCallsGetMV(text, configItems);
    getCallsSuperGetMV(text, configItems);

    // Ordenar os itens de configuração pelo nome do parâmetro
    configItems.sort((a, b) => a.label.localeCompare(b.label));

    return configItems;
  }
}

// Função para identificar chamadas da função GetMV e adicionar seus parâmetros à lista
function getCallsGetMV(text, configItems) {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return [];
  }

  if (regexGetMV.length == 0) {
    return configItems;
  }

  let matches;
  let regex = new RegExp(regexGetMV, "gi");

  while ((matches = regex.exec(text)) !== null) {
    configItems.push({
      label: matches[1], // Nome do parâmetro
      lineNumber: activeEditor.document.positionAt(matches.index).line + 1, // Número da linha
    });
  }
}

// Função para identificar chamadas da função GetNewPar e adicionar seus parâmetros à lista
function getCallsGetNewPar(text, configItems) {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return configItems;
  }

  if (regexGetNewPar.length == 0) {
    return configItems;
  }

  let matches;
  let regex = new RegExp(regexGetNewPar, "gi");

  while ((matches = regex.exec(text)) !== null) {
    configItems.push({
      label: matches[1], // Nome do parâmetro
      lineNumber: activeEditor.document.positionAt(matches.index).line + 1, // Número da linha
    });
  }
}

// Função para identificar chamadas da função SuperGetMV e adicionar seus parâmetros à lista
function getCallsSuperGetMV(text, configItems) {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return [];
  }

  if (regexSuperGetMV.length == 0) {
    return configItems;
  }

  let matches;
  let regex = new RegExp(regexSuperGetMV, "gi");

  while ((matches = regex.exec(text)) !== null) {
    configItems.push({
      label: matches[1], // Nome do parâmetro
      lineNumber: activeEditor.document.positionAt(matches.index).line + 1, // Número da linha
    });
  }
}

// Função para ativar a extensão
function activate(context) {
  console.log("Extensão AdvPL Parameters List foi ativada.");
  vscode.window.showInformationMessage(
    "Extensão AdvPL Parameters List foi ativada."
  );

  // Criar a barra lateral e registrar a classe como provedor de dados
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

// Função para desativar a extensão
function deactivate() {
  console.log("Extensão AdvPL Parameters List foi desativada.");
  vscode.window.showInformationMessage(
    "Extensão AdvPL Parameters List foi desativada."
  );
}

// Exportar as funções de ativação e desativação da extensão
module.exports = {
  activate,
  deactivate,
};
