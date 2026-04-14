const ts = require('typescript');
const path = require('path');
const fs = require('fs');

const configPath = ts.findConfigFile(
  './',
  ts.sys.fileExists,
  'tsconfig.json'
);

if (!configPath) {
  console.log("Could not find a valid 'tsconfig.json'.");
  process.exit(1);
}

const parseConfigHost = {
  fileExists: fs.existsSync,
  readFile: fs.readFileSync,
  readDirectory: ts.sys.readDirectory,
  useCaseSensitiveFileNames: true
};

const parsedCommandLine = ts.parseJsonConfigFileContent(
  JSON.parse(fs.readFileSync(configPath, 'utf8')),
  parseConfigHost,
  './'
);

const program = ts.createProgram({
  rootNames: parsedCommandLine.fileNames,
  options: parsedCommandLine.options
});

const emitResult = program.emit();
const allDiagnostics = ts
  .getPreEmitDiagnostics(program)
  .concat(emitResult.diagnostics);

let hasError = false;
allDiagnostics.forEach(diagnostic => {
  if (diagnostic.file) {
    let { line, character } = ts.getLineAndCharacterOfPosition(
      diagnostic.file,
      diagnostic.start
    );
    let message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      '\n'
    );
    console.log(
      `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
    );
    hasError = true;
  } else {
    console.log(
      ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    );
    hasError = true;
  }
});

if (!hasError) {
  console.log("No TypeScript errors found.");
} else {
  console.log("TypeScript errors were found.");
}
