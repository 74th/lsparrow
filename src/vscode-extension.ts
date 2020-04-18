import * as path from "path";
import * as vscode from "vscode";
import * as ls from "vscode-languageclient";

let client: ls.LanguageClient;

export function activate(context: vscode.ExtensionContext) {

    let serverOptions: ls.ServerOptions;
    if (false) {
        let serverModule = context.asAbsolutePath(path.join('out', 'server.js'));
        serverOptions = {
            run: {
                module: serverModule,
                transport: ls.TransportKind.ipc
            },
            debug: {
                module: serverModule,
                transport: ls.TransportKind.ipc,
                options: {
                    execArgv: ["--nolazy", "--inspect=6010"]
                }
            }
        };
    } else {
        serverOptions = {
            run: {
                command: "node",
                args: [
                    context.asAbsolutePath(path.join('out', 'server.js')),
                    "--stdio",
                ],
            },
            debug: {
                command: context.asAbsolutePath(path.join('out', 'lsparrow')),
                args: [
                    "--stdio"
                ],
            }
        }
    }
    const documentSelector = [
        { scheme: "file" },
    ] as ls.DocumentSelector;

    const clientOptions: ls.LanguageClientOptions = {
        documentSelector,
        synchronize: {
            configurationSection: "lsparrow",
        }
    };

    client = new ls.LanguageClient(
        "lsparrow",
        "lsparrow",
        serverOptions,
        clientOptions
    );

    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}