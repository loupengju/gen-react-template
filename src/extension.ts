import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { QuickPickItem } from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let genTemplate = vscode.commands.registerCommand(
    "gen-react-template.genTemplate",
    async (uri) => {
      // 获取选中文件的路径
      const dirPath = uri.path;
      // 获取输入的组件名称
      const componentName =
        (await vscode.window.showInputBox({
          placeHolder: "输入组件名称",
          validateInput(value) {
            if (!value) {
              return "组件名称不能为空";
            }
          },
        })) ?? "";

      if (!componentName) {
        vscode.window.showErrorMessage("组件名称不能为空!!!");
        return;
      }
      // 获取是否创建目录
      const quickPickList: QuickPickItem[] = [
        {
          label: "是",
          kind: 1,
        },
        {
          label: "否",
          kind: 0,
        },
      ];

      const createDirInfo = await vscode.window.showQuickPick(quickPickList, {
        placeHolder: "是否创建目录",
      });

      const templateAPPName = "APP_PLACEHODLER";
      // 首字母小写
      const lowerCaseComponentName = componentName.replace(componentName[0], componentName[0].toLowerCase());

      if (!!createDirInfo?.kind) {
        // 判断目录是否存在
        if (fs.existsSync(dirPath + "/" + componentName)) {
          vscode.window.showErrorMessage("目录已存在");
          return;
        }
        // 创建目录
        await vscode.workspace.fs.createDirectory(
          vscode.Uri.file(`${dirPath}/${componentName}`)
        );

        const templateLessFile = await fs
          .readFileSync(
            path.resolve(__dirname, "template/DirTemplate.less"),
            "utf-8"
          )
          .toString();

        await vscode.workspace.fs.writeFile(
          vscode.Uri.file(dirPath + "/" + componentName + "/index.less"),
          Buffer.from(
            templateLessFile.replace(
              new RegExp(templateAPPName, "ig"),
              lowerCaseComponentName
            )
          )
        );
      }

      const templateTsxFile = await fs
        .readFileSync(
          path.resolve(
            __dirname,
            `template/${!!createDirInfo?.kind ? "DirTemplate" : "FileTemplate"
            }.tsx`
          ),
          "utf-8"
        )
        .toString();
      const position = templateTsxFile.toString().indexOf("\n");
      const subFix = !!createDirInfo?.kind ? '/index.tsx' : ".tsx";

      await vscode.workspace.fs.writeFile(
        vscode.Uri.file(dirPath + "/" + componentName + subFix),
        Buffer.from(
          templateTsxFile
            .substring(position + 1)
            .replace(new RegExp(templateAPPName, "ig"), componentName)
            .replace(`styles.${componentName}Container`, `styles.${lowerCaseComponentName}Container`)
        )
      );

      vscode.window.showInformationMessage("创建成功！！！");
    }
  );

  context.subscriptions.push(genTemplate);
}

// This method is called when your extension is deactivated
export function deactivate() { }
