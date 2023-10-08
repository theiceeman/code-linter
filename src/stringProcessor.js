class CodeStringProcessor {

    handleWhitespaces(inputString) {
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


}