import chalk from "chalk";
import fs from 'fs'
import path from 'path'
import * as astring from 'astring'
import stringProcessor from './stringProcessor'

export default class Reporter {

    static report({ errors, ast, outputFilePath }) {
        errors
            .sort((err1, err2) => {
                const [aLine, aColumn] = err1.errorLocation.split(":").slice(1);
                const [bLine, bColumn] = err2.errorLocation.split(":").slice(1);
                if (aLine !== bLine) return aLine - bLine;
                return aColumn - bColumn
            })
            .forEach(({ message, errorLocation }) => {
                const errorMessage = `${chalk.red('Error:')} ${message}`
                const finalMessage = `${errorMessage}\n${chalk.grey(errorLocation)}`
                // console.error(finalMessage);
            });
        let updatedCode = astring.generate(ast)
        updatedCode = new stringProcessor().handleWhitespaces(updatedCode);

        fs.writeFileSync(outputFilePath, updatedCode, 'utf-8')

        if (!errors.length) {
            console.log(chalk.green('linting completed without errorss.'))
        } else {
            console.log(chalk.red(`linting completed with ${errors.length} error(s)`))
        }
        console.log(
            chalk.green('\n code fixed and saved at'),
            chalk.yellow('./' + path.basename(outputFilePath)),
            chalk.green('successfully'),
        )
    }


}