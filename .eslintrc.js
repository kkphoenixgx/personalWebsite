module.exports = {
  "root": true,
  "ignorePatterns": ["dist/**/*", "coverage/**/*", "logs/**/*", "node_modules/**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "parserOptions": {
        "project": ["tsconfig.json"],
        "createDefaultProgram": true
      },
      "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@angular-eslint/recommended",
        "plugin:@angular-eslint/template/process-inline-templates"
      ],
      "rules": {
        "complexity": ["warn", { "max": 20 }],
        "max-lines": ["warn", { "max": 600, "skipBlankLines": true, "skipComments": true }],
        "max-lines-per-function": ["warn", { "max": 150, "skipBlankLines": true, "skipComments": true }]
      }
    }
  ]
}