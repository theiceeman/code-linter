export default class SyntaxTreeProcessor {
    // to declare private instance variables.
    #filepath;
    #errors = new Map()
    #variables = new Map()
    #messages = {
        singleQuote: () => "use single quotes instead of double quotes",
        useConst: (variableKind) => `use "const" instead of "${variableKind}"`,
        useLet: (variableKind) => `use "let" instead of "${variableKind}"`,
    };
    #stages = {
        declaration: 'declaration',
        expressionDeclaration: 'expressionDelcaration'
    }
    #variableKinds = {
        const: 'const',
        let: 'let',
        var: 'var',
    }


    constructor(filePath) {
        this.#filepath = filePath;
    }

    #storeError(message, { line, column }) {
        const errorLocation = `${this.#filepath}:${line}:${column + 1}`
        this.#errors.set(errorLocation, { message, errorLocation })
    }

    #handleLiteral(nodeDeclaration) {
        if (!nodeDeclaration.raw && typeof nodeDeclaration.value === 'string') {
            return;
        }
        if (!nodeDeclaration.raw.includes(`"`)) return;
        nodeDeclaration.raw = nodeDeclaration.raw.replace(/"/g, "'")

        this.#storeError(
            this.#messages.singleQuote(),
            nodeDeclaration.loc.start
        )
    }

    #enforceCamelCase(ast) {
        ast.body.forEach(nodeDeclaration => {
            let nodeType = nodeDeclaration?.type;
            let varName;
            switch (nodeType) {
                case 'VariableDeclaration':
                    varName = nodeDeclaration.declarations[0].id.name;
                    if (varName) {
                        nodeDeclaration.declarations[0].id.name = toCamelCase(varName)
                    }
                    break;

                case 'ExpressionStatement':
                    varName = nodeDeclaration.expression.left?.object?.name
                    if (varName) {
                        nodeDeclaration.expression.left.object.name = toCamelCase(varName)
                        return;
                    }
                    varName = nodeDeclaration.expression.left?.name
                    if (varName) {
                        nodeDeclaration.expression.left.name = toCamelCase(varName)
                        return;
                    }

                    break;

                default:
                    break;
            }
        });
    }

    // track all VariableDeclaration's.
    #handleVariableDeclaration(nodeDeclaration) {
        // checks the type of variable declaration. (eg. let, var, const...)
        const originalKind = nodeDeclaration.kind
        for (const declaration of nodeDeclaration.declarations) {
            // store all VariableDeclaration
            this.#variables.set(declaration.id.name, {
                originalKind, stage: this.#stages.declaration, nodeDeclaration
            })
        }
        // this.#enforceCamelCase(nodeDeclaration)
    }

    /* 
        get where there are variable declarations, 
        that never got reassigned 
        and are not declared as const. 
    */
    #handleExpressionStatement(node) {
        const { expression } = node
        // if no identifier, means there is no variable declaration
        if (!expression.left) return
        // checking for .left ppty means, there is an assignment operation here.
        const varName = (expression.left.object || expression.left).name;

        // if it has name ppty(corresponding to a prev declared variable) then a reassignment is going on.
        if (!this.#variables.has(varName)) return;
        const variable = this.#variables.get(varName);
        const { nodeDeclaration, originalKind, stage } = variable;

        // this.#enforceCamelCase(nodeDeclaration)

        // if this is an object/array assignment & is in the declaration stage.
        if (expression.left.type === 'MemberExpression' && stage === this.#stages.declaration) {
            if (originalKind === this.#variableKinds.const) return
            this.#storeError(
                this.#messages.useConst(originalKind),
                nodeDeclaration.loc.start
            )
        }

        // if let, leave as it is
        if ([nodeDeclaration.kind, originalKind].includes(this.#variableKinds.let)) {
            this.#variables.set(varName, {
                ...variable,
                stage: this.#stages.expressionDeclaration,
                nodeDeclaration
            })
            return
        }

        // 
        this.#storeError(
            this.#messages.useLet(originalKind),
            nodeDeclaration.loc.start
        )
        nodeDeclaration.kind = this.#variableKinds.let
        this.#variables.set(varName, {
            ...variable,
            stage: this.#stages.expressionDeclaration,
            nodeDeclaration
        })

        return

    }

    #traverse(nodeDeclaration) {
        const hooks = {
            Literal: (node) => { this.#handleLiteral(node) },
            VariableDeclaration: (node) => { this.#handleVariableDeclaration(node) },
            ExpressionStatement: (node) => { this.#handleExpressionStatement(node) }
        }
        hooks[nodeDeclaration?.type]?.(nodeDeclaration)
        for (const key in nodeDeclaration) {
            if (typeof nodeDeclaration[key] !== 'object') continue
            this.#traverse(nodeDeclaration[key]);
        }
    }

    #checkDeclarationThatNeverChanged() {
        [...this.#variables.values()]
            .filter(({ stage, nodeDeclaration }) =>
                stage === this.#stages.declaration && nodeDeclaration.kind !== this.#variableKinds.const
            )
            .forEach(({ nodeDeclaration }) => {
                this.#storeError(
                    this.#messages.useConst(nodeDeclaration.kind),
                    nodeDeclaration.loc.start
                )
                nodeDeclaration.kind = this.#variableKinds.const
            })
    }





    process(ast, code) {
        this.#traverse(ast)
        this.#checkDeclarationThatNeverChanged()
        this.#enforceCamelCase(ast)
        // this.#handleComments(ast, code)
        return [...this.#errors.values()];
    }
}




function toCamelCase(inputString) {
    if (/^[a-z][a-zA-Z0-9]*$/.test(inputString)) {
        return inputString;
    }

    const words = inputString.split(/[\s_]+/);
    for (let i = 1; i < words.length; i++) {
        words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        return words.join('');
    }
}