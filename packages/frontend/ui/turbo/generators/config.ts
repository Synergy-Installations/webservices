import type { PlopTypes } from "@turbo/gen";

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // create a generator
  plop.setGenerator("frontend/ui next component", {
    description: "Create a next component in frontend/ui.",
    // gather information from the user
    prompts: [
      {
        type: "input",
        name: "folderName",
        message: "What is the folder name of the component?",
      },
      {
        type: "input",
        name: "fileName",
        message: "What is the file name of the component?",
      },
    ],
    // perform actions based on the prompts
    actions: [
      {
        type: "add",
        path: "src/{{folderName}}/{{pascalCase fileName}}.tsx",
        templateFile: "templates/component.hbs",
      },
      {
        type: "append",
        path: "package.json",
        pattern: /^[\s\S]*"exports": {/g,
        template:
          '    "./{{pascalCase fileName}}": "./src/{{folderName}}/{{pascalCase fileName}}.tsx",',
      },
      // Append in index.tsx file
      // {
      //   type: "append",
      //   path: "index.tsx",
      //   pattern: /"exports": {(?<insertion>)/g,
      //   template: '"./{{pascalCase name}}": "./src/{{pascalCase name}}.tsx",',
      // },
    ],
  });
}
