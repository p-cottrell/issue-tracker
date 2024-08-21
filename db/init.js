const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// Connect to the MongoDB database
// mongoose.connect('mongodb+srv://iit:LfdTdr1hEkSNIoF@intermittentissuetracke.7oyxe.mongodb.net/?retryWrites=true&w=majority&appName=IntermittentIssueTracker');
mongoose.connect('mongodb://localhost:27017/intermittent_issue_tracker', {})
    .then(() => console.log("Database connected!"))
    .catch(err => console.log(err));

// Define your schemas and models here
const ProjectSchema = new mongoose.Schema({
    project_name: String,
    description: String,
    status_types: Array,
});

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password_hash: String,
    role: String,
});

const IssueSchema = new mongoose.Schema({
    project_id: mongoose.Schema.Types.ObjectId,
    reporter_id: mongoose.Schema.Types.ObjectId,
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

const Project = mongoose.model('Project', ProjectSchema);
const User = mongoose.model('User', UserSchema);
const Issue = mongoose.model('Issue', IssueSchema);

// Function to generate fake data
async function generateFakeData() {
    // Generate fake projects
    const projects = [];
    for (let i = 0; i < 5; i++) {
        projects.push(new Project({
            project_name: faker.company.name(),
            description: faker.lorem.sentence(),
            status_types: [
                { status_id: 1, status_name: 'To Do' },
                { status_id: 2, status_name: 'In Progress' },
                { status_id: 3, status_name: 'Done' }
            ]
        }));
    }

    await Project.insertMany(projects);

    // Generate fake users
    const users = [];
    for (let i = 0; i < 10; i++) {
        users.push(new User({
            username: faker.internet.userName(),
            email: faker.internet.email(),
            password_hash: faker.internet.password(),
            role: faker.helpers.arrayElement(['Admin', 'User']),
        }));
    }

    await User.insertMany(users);

    // Generate fake issues
    const issues = [];
    for (let i = 0; i < 20; i++) {
        const randomProject = projects[Math.floor(Math.random() * projects.length)];
        const randomUser = users[Math.floor(Math.random() * users.length)];

        // Generate multiple occurrences, attachments, and comments
        const occurrences = [];
        for (let j = 0; j < faker.datatype.int({ min: 1, max: 5 }); j++) {
            occurrences.push({
                description: faker.lorem.sentence(),
                created_at: faker.date.recent(),
                updated_at: faker.date.recent(),
            });
        }

        const attachments = [];
        for (let j = 0; j < faker.datatype.int({ min: 1, max: 3 }); j++) {
            attachments.push({
                file_path: faker.system.filePath(),
                created_at: faker.date.recent(),
            });
        }

        const comments = [];
        for (let j = 0; j < faker.datatype.int({ min: 1, max: 5 }); j++) {
            comments.push({
                user_id: randomUser._id,
                comment_text: faker.lorem.sentence(),
                created_at: faker.date.recent(),
            });
        }

        issues.push(new Issue({
            project_id: randomProject._id,
            reporter_id: randomUser._id,
            status_id: faker.datatype.int({ min: 1, max: 3 }),
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            charm: faker.helpers.arrayElement(['🐞', '⚠️', '🚀']),
            created_at: faker.date.recent(),
            updated_at: faker.date.recent(),
            occurrences: occurrences,
            attachments: attachments,
            comments: comments,
        }));
    }

    await Issue.insertMany(issues);

    console.log('Fake data generated successfully!');
    mongoose.disconnect();
}

// Run the script
generateFakeData();