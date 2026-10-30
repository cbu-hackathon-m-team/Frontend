export default {
  rules: {
    "toggle-group-direction": {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          orientation:
            'Use orientation="vertical" instead of flex-col on ToggleGroup. The component must own its corner and keyboard behavior.',
        },
      },
      create(context) {
        const groups = new Set();
        return {
          ImportDeclaration(node) {
            if (
              !/\/ui\/toggle-group$|^\.\/toggle-group$/.test(node.source.value)
            )
              return;
            for (const specifier of node.specifiers) {
              if (
                specifier.type === "ImportSpecifier" &&
                specifier.imported.name === "ToggleGroup"
              )
                groups.add(specifier.local.name);
            }
          },
          JSXOpeningElement(node) {
            if (
              node.name.type !== "JSXIdentifier" ||
              !groups.has(node.name.name)
            )
              return;
            const className = node.attributes.find(
              (attribute) =>
                attribute.type === "JSXAttribute" &&
                attribute.name.name === "className",
            );
            if (
              className &&
              /(?:^|[\s"'`])(?:[^\s"'`]*:)?!?flex-col(?:-reverse)?(?=$|[\s"'`])/.test(
                context.sourceCode.getText(className),
              )
            ) {
              context.report({ node: className, messageId: "orientation" });
            }
          },
        };
      },
    },
  },
};
