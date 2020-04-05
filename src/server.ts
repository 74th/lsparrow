import * as ls from "vscode-languageserver";

let connection = ls.createConnection(ls.ProposedFeatures.all);


connection.onInitialize((params: ls.InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: ls.TextDocumentSyncKind.Full,
        }
    };
});

connection.onInitialized(() => {
    connection.client.register(
        ls.DidChangeConfigurationNotification.type,
        undefined
    );
});

interface LllSettings {
    maxLength: number;
}

let documentSettings: Map<string, Thenable<LllSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
    documentSettings.clear();
});

function getDocumentSettings(resource: string): Thenable<LllSettings> {
    let result = documentSettings.get(resource);
    if (!result) {
        result = connection.workspace.getConfiguration({
            scopeUri: resource,
            section: "lsparrow"
        });
        documentSettings.set(resource, result);
    }
    return result;
}

connection.onDidOpenTextDocument(param => {
    validateTextDocument(param.textDocument.uri)
});

connection.onDidCloseTextDocument(e => {
    documentSettings.delete(e.textDocument.uri);
});

connection.onDidOpenTextDocument(e => {
    validateTextDocument(e.textDocument.uri);
});

connection.onDidSaveTextDocument(e => {
    validateTextDocument(e.textDocument.uri);
});


async function validateTextDocument(uri: ls.DocumentUri): Promise<void> {

    const filePath = ls.Files.uriToFilePath(uri);
    if (!filePath) {
        // ファイルが特定できない場合は何もしない
        return;
    }

    let config = await getDocumentSettings(uri);

    // lsparrowの実行
    console.log(config);
    console.log(uri);
    let diagnostics: ls.Diagnostic[] = [];
    const message = "lsparrow error"

    let diagnostic: ls.Diagnostic = {
        severity: ls.DiagnosticSeverity.Warning,
        range: {
            start: { line: 0, character: 0 },
            end: { line: 0, character: Number.MAX_VALUE }
        },
        message: message,
        source: "lsparrow"
    };
    diagnostics.push(diagnostic);

    // Send the computed diagnostics to VSCode.
    connection.sendDiagnostics({ uri, diagnostics });
}

connection.listen();