const dineroImport = 'dinero.js';
const soldiImportPath = '@soldi/dinero/index.mjs';

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Replace all the requires
  root
    .find(j.CallExpression, {
      callee: { type: 'Identifier', name: 'require' },
      arguments: [{ value: dineroImport }]
    })
    .replaceWith(j.callExpression(
      j.identifier('require'),
      [j.literal(soldiImportPath)],
    ));

  // Replace all the imports
  root
    .find(j.ImportDeclaration, { source: { value: dineroImport } })
    .replaceWith((path) =>
      j.importDeclaration(
        path.value.specifiers,
        j.literal(soldiImportPath),
      )
    );

  return root.toSource();
}
