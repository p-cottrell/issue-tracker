const fs = require('fs');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

// Define your schemas and models here
const ProjectSchema = {
    project_name: String,
    description: String,
    status_types: Array,
};

const UserSchema = {
    username: String,
    email: String,
    password_hash: String,
    role: String,
};

const IssueSchema = {
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
};

// Function to generate fake data
async function generateFakeData() {
    // Generate fake projects
    const projects = [];
    for (let i = 0; i < 5; i++) {
        projects.push({
            project_name: faker.company.name(),
            description: faker.lorem.sentence(),
            status_types: [
                { status_id: 1, status_name: 'To Do' },
                { status_id: 2, status_name: 'In Progress' },
                { status_id: 3, status_name: 'Done' }
            ]
        });
    }

    // Generate fake users
    const users = [];
    const userCredentials = [];
    for (let i = 0; i < 10; i++) {
        const password = faker.internet.password();
        const password_hash = await bcrypt.hash(password, 10);
        users.push({
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password_hash,
            role: faker.helpers.randomize(['admin', 'user'])
        });
        userCredentials.push({ username: users[i].username, email: users[i].email, password, role: users[i].role });
    }

    // Generate fake issues
    const issues = [];
    for (let i = 0; i < 20; i++) {
        issues.push({
            project_id: faker.datatype.uuid(),
            reporter_id: faker.datatype.uuid(),
            status_id: faker.helpers.randomize([1, 2, 3]),
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            charm: faker.helpers.randomize(['⚠️', '🚀', '🐞']),
            created_at: faker.date.past(),
            updated_at: faker.date.recent(),
            occurrences: Array.from({ length: 3 }, () => ({
                description: faker.lorem.sentence(),
                created_at: faker.date.past(),
                updated_at: faker.date.recent()
            })),
            attachments: Array.from({ length: 2 }, () => ({
                file_path: faker.system.filePath(),
                created_at: faker.date.past()
            })),
            comments: Array.from({ length: 3 }, () => ({
                comment_text: faker.lorem.sentence(),
                created_at: faker.date.past()
            }))
        });
    }

    // Write data to files
    fs.writeFileSync('projects.json', JSON.stringify(projects, null, 2));
    fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
    fs.writeFileSync('userCredentials.json', JSON.stringify(userCredentials, null, 2));
    fs.writeFileSync('issues.json', JSON.stringify(issues, null, 2));
}

// Convert the collections to MongoDB insert statements
function generateInsertStatements(collectionName, documents) {
    return documents.map(doc => `db.${collectionName}.insert(${JSON.stringify(doc)});`).join('\n');
}

// Generate and save the insert scripts
async function generateInsertScripts() {
    await generateFakeData();

    const projects = JSON.parse(fs.readFileSync('projects.json'));
    const users = JSON.parse(fs.readFileSync('users.json'));
    const issues = JSON.parse(fs.readFileSync('issues.json'));

    const projectInserts = generateInsertStatements('projects', projects);
    const userInserts = generateInsertStatements('users', users);
    const issueInserts = generateInsertStatements('issues', issues);

    fs.writeFileSync('projectInserts.js', projectInserts);
    fs.writeFileSync('userInserts.js', userInserts);
    fs.writeFileSync('issueInserts.js', issueInserts);
}

generateInsertScripts();