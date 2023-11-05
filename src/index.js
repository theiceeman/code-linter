#! /usr/bin/env node

import chalk from 'chalk'
import * as espree from 'espree'
import { parseArgs } from 'util'
import fs from 'fs'
import Reporter from './Reporter.js'
import path from 'path'
import SyntaxTreeProcessor from './syntaxTreeProcessor.js'

function getFilePathFromCLI() {
    try {
        const { values: { file } } = parseArgs({
            options: {
                file: {
                    type: 'string',
                    alias: 'f'
                }
            }
        })
        if (!file) throw new Error();
        return file
    } catch {
        console.error(chalk.redBright('Error: please provide a valid file path as arg using -f or --file'))
        process.exit(1)
    }
}

// extract the code from the file
const filePath = getFilePathFromCLI()
const outputFilePath = path.join(process.cwd(), `${path.basename(filePath, '.js')}.linted.js`)

const code = fs.readFileSync(filePath, 'utf-8');

// parse the code and generate its AST using espree
const ast = espree.parse(code, {
    ecmaVersion: 2020,
    loc: true,
    sourceType: 'module',
    attachComment: true,
    comments: true,
})
// console.log({ ast });
// store ast
fs.writeFileSync(process.cwd() + '/ast.json', JSON.stringify(ast), 'utf-8')

const syntaxTreeProcessor = new SyntaxTreeProcessor(filePath);
const errors = syntaxTreeProcessor.process(ast, code)

// console.log({ code })
// for reporting the errors to console
Reporter.report({
    errors,
    ast,
    outputFilePath,
    prevCode:code
})

