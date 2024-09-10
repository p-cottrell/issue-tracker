import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import fs from 'fs';
import mongoose from 'mongoose';

// Constants for the number of each type of data
const numProjects = 5;
const numUsers = 10;
const numIssues = 20;
const numOccurrences = 3;
const numAttachments = 2;
const numComments = 3;

// Define Mongoose schemas
const projectSchema = new mongoose.Schema({
    project_name: String,
    description: String,
    status_types: Array,
});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password_hash: String,
    role: String,
});

const issueSchema = new mongoose.Schema({
    project_id: String,
    reporter_id: String,
    status_id: Number,
    title: String,
    description: String,
    charm: String,
    created_at: Date,
    updated_at: Date,
    occurrences: Array,
    attachments: Array,
    comments: Array,
});

// Create Mongoose models
const Project = mongoose.model('Project', projectSchema);
const User = mongoose.model('User', userSchema);
const Issue = mongoose.model('Issue', issueSchema);

// Function to generate fake data
async function generateFakeData() {
    // Generate fake users
    const users = [];
    for (let i = 0; i < numUsers; i++) {
        const password = faker.internet.password();
        const password_hash = await bcrypt.hash(password, 10);
        users.push(new User({
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password_hash,
            role: faker.helpers.arrayElement(['admin', 'user'])
        }));
    }

    // Generate fake projects and related data
    const projects = [];
    const issues = [];
    for (let i = 0; i < numProjects; i++) {
        const project = new Project({
            project_name: faker.company.name(),
            description: faker.company.catchPhrase(),
            status_types: [
                { status_id: 1, status_name: 'Open' },
                { status_id: 2, status_name: 'In Progress' },
                { status_id: 3, status_name: 'Closed' },
                { status_id: 4, status_name: 'Cancelled' }
            ]
        });
        projects.push(project);

        // Generate issues for each project
        for (let j = 0; j < numIssues; j++) {
            const issue = new Issue({
                project_id: project._id.toString(),
                reporter_id: faker.helpers.arrayElement(users)._id.toString(),
                status_id: faker.helpers.arrayElement([1, 2, 3, 4]),
                title: faker.commerce.productName(),
                description: faker.commerce.productDescription(),
                charm: Math.random() < 0.7
                    ? faker.internet.emoji()
                    : faker.random.alphaNumeric(1).toLowerCase(),
                created_at: faker.date.past(),
                updated_at: faker.date.recent(),
                occurrences: Array.from({ length: numOccurrences }, () => ({
                    description: faker.company.bs(),
                    created_at: faker.date.past(),
                    updated_at: faker.date.recent()
                })),
                attachments: Array.from({ length: numAttachments }, () => ({
                    file_path: faker.system.filePath(),
                    created_at: faker.date.past()
                })),
                comments: Array.from({ length: numComments }, () => ({
                    comment_text: faker.music.songName(),
                    created_at: faker.date.past()
                }))
            });
            issues.push(issue);
        }
    }

    // Ensure the generated folder exists
    if (!fs.existsSync('generated')) {
        fs.mkdirSync('generated');
    }
    if (!fs.existsSync('generated/scripts')) {
        fs.mkdirSync('generated/scripts');
    }

    // Write data to files in the generated folder
    fs.writeFileSync('generated/projects.json', JSON.stringify(projects, null, 2));
    fs.writeFileSync('generated/users.json', JSON.stringify(users, null, 2));
    fs.writeFileSync('generated/issues.json', JSON.stringify(issues, null, 2));
}

// Convert the collections to MongoDB insert statements
function generateInsertStatements(collectionName, documents) {
    return documents.map(doc => `db.${collectionName}.insert(${JSON.stringify(doc)});`).join('\n');
}

// Generate and save the insert scripts
async function generateInsertScripts() {
    await generateFakeData();

    const projects = JSON.parse(fs.readFileSync('generated/projects.json'));
    const users = JSON.parse(fs.readFileSync('generated/users.json'));
    const issues = JSON.parse(fs.readFileSync('generated/issues.json'));

    const projectInserts = generateInsertStatements('projects', projects);
    const userInserts = generateInsertStatements('users', users);
    const issueInserts = generateInsertStatements('issues', issues);

    fs.writeFileSync('generated/scripts/projectInserts.js', projectInserts);
    fs.writeFileSync('generated/scripts/userInserts.js', userInserts);
    fs.writeFileSync('generated/scripts/issueInserts.js', issueInserts);
}

generateInsertScripts();

console.log('Insert scripts generated successfully! Run the scripts located in the "generated/scripts/" folder within a MongoDB shell to insert the data.');