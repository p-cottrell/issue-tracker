import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import fs from 'fs';
import mongoose from 'mongoose';
import readline from 'readline';

import User from '../backend/models/User.js';
import Issue from './../backend/models/Issue.js';
import Project from './../backend/models/Project.js';

// Constants for the number of each type of data
const numProjects = 5;
const numUsers = 10;
const numIssues = 50;
const numOccurrences = 10;
const numAttachments = 2;
const numComments = 5;

// Function to generate fake data
async function generateFakeData() {
    // Generate fake users
    const users = [];
    const userPasswords = {}; // Lookup dictionary for user passwords
    for (let i = 0; i < numUsers; i++) {
        const password = faker.internet.password();
        const password_hash = await bcrypt.hash(password, 10);
        const user = new User({
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password_hash,
            role: faker.helpers.arrayElement(['admin', 'user'])
        });
        users.push(user);
        userPasswords[user.username] = password;
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
                project_id: project._id,
                reporter_id: faker.helpers.arrayElement(users)._id,
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

    // Create a modified user collection with passwords
    const usersWithPasswords = users.map(user => ({
        ...user.toObject(),
        password: userPasswords[user.username]
    }));
    fs.writeFileSync('generated/users_with_passwords.json', JSON.stringify(usersWithPasswords, null, 2));
}

// Convert the collections to MongoDB insertMany statements
function generateInsertManyStatements(collectionName, documents) {
    return `db.${collectionName}.insertMany(${JSON.stringify(documents, null, 2)});`;
}

// Generate and save the insert scripts
async function generateInsertScripts() {
    await generateFakeData();

    const projects = JSON.parse(fs.readFileSync('generated/projects.json'));
    const users = JSON.parse(fs.readFileSync('generated/users.json'));
    const issues = JSON.parse(fs.readFileSync('generated/issues.json'));

    const projectInserts = generateInsertManyStatements('projects', projects);
    const userInserts = generateInsertManyStatements('users', users);
    const issueInserts = generateInsertManyStatements('issues', issues);

    fs.writeFileSync('generated/scripts/projectInserts.js', projectInserts);
    fs.writeFileSync('generated/scripts/userInserts.js', userInserts);
    fs.writeFileSync('generated/scripts/issueInserts.js', issueInserts);
}

async function runScripts() {
    await generateInsertScripts();

    console.log('Insert scripts generated successfully!');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Do you want to connect to MongoDB and run the scripts now? This will nuke the current data! [y]es/[N]o: ', async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            try {
                await mongoose.connect('mongodb+srv://iit:LfdTdr1hEKkSNIoF@intermittentissuetracke.7oyxe.mongodb.net/?retryWrites=true&w=majority&appName=IntermittentIssueTracker', { useNewUrlParser: true, useUnifiedTopology: true });
                console.log('MongoDB Connected...');

                console.log('Dropping all collections...');
                const collections = await mongoose.connection.db.collections();
                for (let collection of collections) {
                    await collection.drop();
                    console.log(`\tDropped collection: ${collection.collectionName}`);
                }

                const projects = JSON.parse(fs.readFileSync('generated/projects.json'));
                const users = JSON.parse(fs.readFileSync('generated/users.json'));
                const issues = JSON.parse(fs.readFileSync('generated/issues.json'));

                console.log('Inserting data...');
                console.log(`\tInserting ${numProjects} projects...`);
                await Project.insertMany(projects);
                console.log(`\tInserting ${numUsers} users...`);
                await User.insertMany(users);
                console.log(`\tInserting ${numIssues} issues...`);
                await Issue.insertMany(issues);

                console.log('Data inserted successfully!');
            } catch (err) {
                console.error('Error connecting to MongoDB or inserting data:', err.message);
            } finally {
                mongoose.connection.close();
            }
        } else {
            console.log('You can run the scripts manually later.');
        }
        rl.close();
    });
}

runScripts();