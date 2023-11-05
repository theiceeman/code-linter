export default class StringProcessor {
    comments = [];

    static handleWhitespaces(inputString) {
        let lineOfCode = inputString.split('\n')
        // add spacing after major keywords
        for (let i = 1; i < lineOfCode.length; i++) {
            lineOfCode[i] = lineOfCode[i].replaceAll('const ', '\nconst ')
            lineOfCode[i] = lineOfCode[i].replaceAll('let ', '\nlet ')
            lineOfCode[i] = lineOfCode[i].replaceAll('var ', '\nvar ')
            lineOfCode[i] = lineOfCode[i].replaceAll('class ', '\nclass ')
            lineOfCode[i] = lineOfCode[i].replaceAll('function ', '\nfunction ')
        }
        const formattedCode = lineOfCode.join('\n');
        return formattedCode;
    }

    handleComments(prevCode, updatedCode) {
        console.log({ prevCode, updatedCode })
        let comments = [];
        let regex = /\/\/[^\n]*|\/\*[\s\S]*?\*\//g;
        let match;

        while ((match = regex.exec(prevCode)) !== null) {
            comments.push({
                text: match[0],
                start: match.index,
                end: regex.lastIndex
            });
        }
        console.log('zzzz', { comments })

        // Sort the comments by their start position in descending order.
        comments.sort((a, b) => b.start - a.start);

        // Iterate through the comments and add them back to the code.
        comments.forEach(comment => {
            updatedCode = updatedCode.slice(0, comment.start) + comment.text + updatedCode.slice(comment.end);
        });
        console.log({ updatedCode })
        // return code;

    }

    handle_comments(ast, updatedCode) {
        let code = updatedCode.split('\n');
        let index = 0;

        console.log({code})

        ast.comments.forEach(comment => {
            let value;
            if (comment.type == 'Line') {
                value = '//' + comment.value
            } else if (comment.type == 'Block') {
                value = '/*' + comment.value + '*/'
            }
            code.splice(comment.loc.start.line - 1, 0, value)
            index++
        })
        code = code.join('\n')
        return code;

    }


}