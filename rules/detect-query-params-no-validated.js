module.exports = {
    meta: {
        type: "problem",
        docs: {
            description: "Detects and reports query parameters that are used without prior validation, ensuring that all parameters are properly checked before use.",
            category: "Security",
            recommended: false
        },
        schema: []
    },
    create: function (context) {
        const queryParamNames = new Set();
        const validatedParams = new Set();
        const validMethods = context.options[0] || ['isValid']; // Métodos de validación permitidos

        return {
            VariableDeclarator(node) {
                // Detectar destructuración: const { fruta, otraCosa } = req.query;
                if (node.id.type === 'ObjectPattern' && node.init && node.init.object && node.init.property &&
                    node.init.object.name === 'req' && node.init.property.name === 'query') {
                    node.id.properties.forEach(property => {
                        queryParamNames.add(property.key.name);
                        context.report({
                            node: property,
                            message: `Se detectó query param: ${property.key.name}`
                        });
                    });
                }

                // Detectar asignación directa: const valor = req.query.miValor;
                if (node.init && node.init.object && node.init.object.object &&
                    node.init.object.object.name === 'req' && node.init.object.property.name === 'query') {
                    queryParamNames.add(node.id.name);
                    context.report({
                        node: node.id,
                        message: `Se detectó query param: ${node.id.name}`
                    });
                }
            },
            CallExpression(node) {
                // Verificar si la llamada es a un método de validación y marcar los parámetros como validados
                if (validMethods.includes(node.callee.name)) {
                    node.arguments.forEach(arg => {
                        if (arg.type === 'Identifier' && queryParamNames.has(arg.name)) {
                            validatedParams.add(arg.name);
                        }
                    });
                }
                // Verificar si los argumentos de la llamada son parámetros query detectados y no validados
                node.arguments.forEach(arg => {
                    if (arg.type === 'Identifier' && queryParamNames.has(arg.name) && !validatedParams.has(arg.name)) {
                        context.report({
                            node: arg,
                            message: `El query param '${arg.name}' se utiliza en el método '${node.callee.name || (node.callee.property && node.callee.property.name)}' sin haber sido validado previamente`
                        });
                    }
                });
            }
        };
    }
};
