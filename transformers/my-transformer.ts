// (base: https://qiita.com/Quramy/items/1c9c2f7da2a6548f6901)

import * as ts from 'typescript';

// Transformer for alert("...") => console.log("[alert]: ...");
export default function (ctx: ts.TransformationContext) {
  function visitNode(node: ts.Node): ts.Node {
    if (!isAlert(node)) {
      return ts.visitEachChild(node, visitNode, ctx);
    }
    return createHelper(node);
  }

  function createHelper(node: ts.Node) {
    ctx.requestEmitHelper({
      name: "ts:say",
      priority: 0,
      scoped: false,
      text: "var __alert_console__ = function(msg) { console.log('[alert]: ' + msg); };",
    });
    return ts.setTextRange(ts.createIdentifier("__alert_console__" ), node);
  }

  function isAlert(node: ts.Node): node is ts.PropertyAccessExpression {
    return node.kind === ts.SyntaxKind.Identifier && node.getText() === "alert";
  }

  return (source: ts.SourceFile) => ts.updateSourceFileNode(source, ts.visitNodes(source.statements, visitNode));
}
