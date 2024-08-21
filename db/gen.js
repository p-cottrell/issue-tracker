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
        const username = faker.internet.userName();
        const email = faker.internet.email();
        const password = faker.internet.password();
        const role = faker.helpers.arrayElement(['Admin', 'User']);

        // Hash the password using bcrypt
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        users.push({
            username: username,
            email: email,
            password_hash: passwordHash,
            role: role,
        });

        userCredentials.push({
            username: username,
            password: password,
        });
    }

    // Generate fake issues
    const issues = [];
    for (let i = 0; i < 20; i++) {
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        const randomUser = users[Math.floor(Math.random() * users.length)];

        // Generate multiple occurrences, attachments, and comments
        const occurrences = [];
        for (let j = 0; j < faker.datatype.number({ min: 1, max: 5 }); j++) {
            occurrences.push({
                description: faker.lorem.sentence(),
                created_at: faker.date.recent(),
                updated_at: faker.date.recent(),
            });
        }

        const attachments = [];
        for (let j = 0; j < faker.datatype.number({ min: 1, max: 3 }); j++) {
            attachments.push({
                file_path: faker.system.filePath(),
                created_at: faker.date.recent(),
            });
        }

        const comments = [];
        for (let j = 0; j < faker.datatype.number({ min: 1, max: 5 }); j++) {
            comments.push({
                user_id: randomUser._id,
                comment_text: faker.lorem.sentence(),
                created_at: faker.date.recent(),
            });
        }

        issues.push({
            project_id: randomProject._id,
            reporter_id: randomUser._id,
            status_id: faker.datatype.number({ min: 1, max: 3 }),
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            charm: faker.helpers.arrayElement(['🐞', '⚠️', '🚀']),
            created_at: faker.date.recent(),
            updated_at: faker.date.recent(),
            occurrences: occurrences,
            attachments: attachments,
            comments: comments,
        });
    }

    // Write data to JSON files
    const data = {
        projects: projects,
        users: users,
        issues: issues
    };

    fs.writeFileSync('fakeData.json', JSON.stringify(data, null, 2));
    fs.writeFileSync('userCredentials.json', JSON.stringify(userCredentials, null, 2));
    console.log('Fake data generated successfully!');
}

// Run the script
generateFakeData();
