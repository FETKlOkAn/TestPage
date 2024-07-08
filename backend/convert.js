const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const files = [
    { fileName: './questions/list1.csv', category: 1 },
    { fileName: './questions/list2.csv', category: 2 },
    { fileName: './questions/list3.csv', category: 3 },
    { fileName: './questions/list4.csv', category: 4 },
    { fileName: './questions/list5.csv', category: 5 },
];

// const categories = {
//     1: "botanika",
//     2: "fyziologie rostlin",
//     3: "zoologie a biologie člověka",
//     4: "ekologie",
//     5: "genetika",
// };

const outputDir = 'questions_converted';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

files.forEach(file => {
    const questions = [];

    fs.createReadStream(file.fileName)
        .pipe(csv())
        .on('data', (row) => {
            const id = questions.length + 1;
            const name = row.question;
            const category = file.category;
            const correctAnswer = row.correct;
            const options = [row.option1, row.option2, row.option3];

            questions.push({ id, name, category, correctAnswer, options });
        })
        .on('end', () => {
            const jsonFileName = path.join(outputDir, path.basename(file.fileName, '.csv') + '.json');
            fs.writeFileSync(jsonFileName, JSON.stringify(questions, null, 2));
            console.log(`Successfully converted ${file.fileName} to ${jsonFileName}`);
        });
});
