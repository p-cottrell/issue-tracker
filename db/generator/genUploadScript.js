const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('fakeData.json'));

// Extract the collections
const projects = data.projects;
const users = data.users;
const issues = data.issues;

// Convert the collections to MongoDB insert statements
function generateInsertStatements(collectionName, documents) {
    return documents.map(doc => `db.${collectionName}.insert(${JSON.stringify(doc)});`).join('\n');
}

const projectsInserts = generateInsertStatements('projects', projects);
const usersInserts = generateInsertStatements('users', users);
const issuesInserts = generateInsertStatements('issues', issues);

// Combine all insert statements into a single script
const fullScript = `
use(yourDatabaseName); // Replace with your actual database name

${projectsInserts}

${usersInserts}

${issuesInserts}
`;

// Write the script to a .js file that can be run with mongosh
fs.writeFileSync('uploadScript.js', fullScript);
console.log('MongoDB upload script generated successfully!');
