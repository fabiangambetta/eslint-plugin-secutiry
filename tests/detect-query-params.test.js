const { RuleTester } = require('eslint');
const rule = require('../rules/detect-query-params-no-validated');

const ruleTester = new RuleTester();

ruleTester.run('detect-query-param-names', rule, {
    valid: [
        {
            code: `
                const express = require('express');
                const app = express();
                app.use((req, res, next) => {
                    const param = req.body.someParam;
                    isValid(param)
                    console.log(param);
                    next();
                });
                app.listen(3000);
            `
        }
    ],
    invalid: [
        {
            code: `
                const express = require('express');
                const app = express();
                app.use((req, res, next) => {
                    const { fruta, otraCosa } = req.query;
                    const valor = req.query.miValor;
                    console.log(fruta, otraCosa, valor);
                    next();
                });
                app.listen(3000);
            `,
            errors: [
                { message: 'Se detectó query param: fruta' },
                { message: 'Se detectó query param: otraCosa' },
                { message: 'Se detectó query param: valor' },
                { message: "El query param 'fruta' se utiliza en el método 'log' sin haber sido validado con isValid" },
                { message: "El query param 'otraCosa' se utiliza en el método 'log' sin haber sido validado con isValid" },
                { message: "El query param 'valor' se utiliza en el método 'log' sin haber sido validado con isValid"}
            ]
        },
        {
            code: `
                const task = (req, res, next) => {
                    const valor = req.query.miValor;
                    myService.getData(valor)
                };
            `,
            errors: [
                { message: "Se detectó query param: valor" },
                { message: "El query param 'valor' se utiliza en el método 'getData' sin haber sido validado con isValid" }
            ]
        },
        {
            code: `
                const task = (req, res, next) => {
                    const valor = req.query.miValor;
                    myService.getData(valor)
                };
            `,
            errors: [
                { message: "Se detectó query param: valor" },
                { message: "El query param 'valor' se utiliza en el método 'getData' sin haber sido validado con isValid" }
            ]
        },
        {
            code: `
                const task = (req, res, next) => {
                    const valor = req.query.miValor;
                    const {param1} = req.query:
                    isValid(param1);
                    myService.getData(valor)
                };
            `,
            errors: [
                { message: "Se detectó query param: valor" },
                { message: "El query param 'valor' se utiliza en el método 'getData' sin haber sido validado con isValid" }
            ]
        }
    ]
});