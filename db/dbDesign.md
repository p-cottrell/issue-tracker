# Database Design for Intermittent Issue Tracker

## Tables/Entities

1. **Projects**: Multiple projects with unique statuses.
2. **Status Types**: Custom status types (e.g., "In Progress," "Done") that are scoped to each project.
3. **Users**: Users who can report, comment, and track issues.
4. **Issues**: Each issue has a reporter, basic info like description, charm, attachments, and comments.
5. **Occurrences**: Each issue can have multiple re-occurrences, which are stored with timestamps and optional extra info.

## Entity-Relationship Diagram (ERD)

---

### **1. Tables**

#### **Projects Table**

| Column Name  | Data Type    | Constraints                 |
|--------------|--------------|-----------------------------|
| project_id   | INT          | PRIMARY KEY, AUTO_INCREMENT |
| project_name | VARCHAR(255) | NOT NULL                    |
| description  | TEXT         | NULL                        |
| created_at   | DATETIME     | DEFAULT CURRENT_TIMESTAMP   |

#### **Status Types Table** (Scoped to a Project)

| Column Name  | Data Type  | Constraints                       |
|--------------|------------|-----------------------------------|
| status_id    | INT        | PRIMARY KEY, AUTO_INCREMENT       |
| project_id   | INT        | FOREIGN KEY (References Projects) |
| status_name  | VARCHAR(50)| NOT NULL                          |

#### **Users Table**

> Note: Instead of storing passwords directly, we only store a salted hash.
> We can limit the VARCHAR to the maximum known output length of any hash in the chosen algorithm once we decide on one (e.g., 512 characters for SHA-512).
> It may be worth looking at the Australian Signals Directorate (ASD)'s own published [Information Security Manual (ISM)](https://www.cyber.gov.au/acsc/view-all-content/ism) for guidance on secure password storage, which recommends either SHA-256 or SHA-512 for the hashing algorithm (noting that both MD5 and SHA-1 are deprecated due to known vulnerabilities); the inclusion of a salt; and PBKDF2, bcrypt, or scrypt for the key derivation function.
>
> Emails are limited to 255 characters (though it was originally described in [RFC 3696](https://www.rfc-editor.org/errata_search.php?rfc=3696) to be 320, an incorrect value was accepted which limited it to 254 characters. Read more [here](https://stackoverflow.com/a/574698) if interested.)
>
> Roles could optionally be made into another project-scoped table, so project owners can define additional custom roles with their own sets of permissions - but for simplicity, we'll keep it as an ENUM here.

| Column Name   | Data Type    | Constraints                 |
|---------------|--------------|-----------------------------|
| user_id       | INT          | PRIMARY KEY, AUTO_INCREMENT |
| username      | VARCHAR(50)  | UNIQUE, NOT NULL            |
| email         | VARCHAR(255) | UNIQUE, NOT NULL            |
| password_hash | VARCHAR(512) | NOT NULL                    |
| role          | VARCHAR(50)  | ENUM('Admin', 'User')       |

#### **Issues Table**

> No need for an "assignee" anymore
>
> Charm is just a single unicode character for decoration (i.e. an emoji to use as the icon of the issue)

| Column Name   | Data Type    | Constraints                           |
|---------------|--------------|---------------------------------------|
| issue_id      | INT          | PRIMARY KEY, AUTO_INCREMENT           |
| project_id    | INT          | FOREIGN KEY (References Projects)     |
| reporter_id   | INT          | FOREIGN KEY (References Users)        |
| status_id     | INT          | FOREIGN KEY (References Status Types) |
| title         | VARCHAR(255) | NOT NULL                              |
| description   | TEXT         | NULL                                  |
| charm         | VARCHAR(1)   | NOT NULL                              |
| created_at    | DATETIME     | DEFAULT CURRENT_TIMESTAMP             |
| updated_at    | DATETIME     | DEFAULT CURRENT_TIMESTAMP             |

#### **Issue Occurrences Table**

| Column Name    | Data Type | Constraints                     |
|----------------|-----------|---------------------------------|
| occurrence_id  | INT       | PRIMARY KEY, AUTO_INCREMENT     |
| issue_id       | INT       | FOREIGN KEY (References Issues) |
| reporter_id    | INT       | FOREIGN KEY (References Users)  |
| description    | TEXT      | NULL                            |
| created_at     | DATETIME  | DEFAULT CURRENT_TIMESTAMP       |
| updated_at     | DATETIME  | DEFAULT CURRENT_TIMESTAMP       |

#### **Attachments Table**

> File path is the location where the file is stored (e.g., on the server)
>
> We limit this to 255 for maximum cross-platform compatibility
> (i.e. Windows has a [260 character limit](https://learn.microsoft.com/en-us/windows/win32/fileio/maximum-file-path-limitation?tabs=registry) for file paths,
> Linux-based systems have a [4096 byte limit*](https://insanecoding.blogspot.com/2007/11/pathmax-simply-isnt.html),
> MacOS has anywhere between a 255 and 1024 byte limit depending on the version and filesystem, etc.)
>
> Alternatively, we could store the file in a database as a BLOB, but this is generally not recommended for large files due to performance issues. (i.e. Postgres' [Large Object](https://www.postgresql.org/docs/9.0/largeobjects.html), MySQL's [BLOB](https://dev.mysql.com/doc/refman/8.0/en/blob.html), etc.).
> If we instead use a object storage service like [S3](https://aws.amazon.com/s3/), we could store the file path as a URL to the file in the cloud.
> For simplicity however, we'll just locally download the file locally to the server and store the path to it (assuming it's a small file - it would be worthwhile in the future implementing a file size limit and/or virus scanning).

| Column Name   | Data Type    | Constraints                     |
|---------------|--------------|---------------------------------|
| attachment_id | INT          | PRIMARY KEY, AUTO_INCREMENT     |
| issue_id      | INT          | FOREIGN KEY (References Issues) |
| file_path     | VARCHAR(255) | NOT NULL                        |
| created_at    | DATETIME     | DEFAULT CURRENT_TIMESTAMP       |

#### **Comments Table**

> Purposefully not allowing editing of comments (no updated_at field) for auditability, though this could be added if needed

| Column Name  | Data Type | Constraints                     |
|--------------|-----------|---------------------------------|
| comment_id   | INT       | PRIMARY KEY, AUTO_INCREMENT     |
| issue_id     | INT       | FOREIGN KEY (References Issues) |
| user_id      | INT       | FOREIGN KEY (References Users)  |
| comment_text | TEXT      | NOT NULL                        |
| created_at   | DATETIME  | DEFAULT CURRENT_TIMESTAMP       |

---

### **2. Relationships and Constraints**

- **Projects** have many **Issues**.
- **Projects** have many **Status Types**.
- **Issues** belong to a **Project** and have a **Status Type** (which is scoped to the project).
- **Issues** have one **Reporter**.
- **Issues** have many **Occurrences**.
- **Issues** can have multiple **Attachments** and **Comments**.
- **Users** can report issues, add comments, and be assigned to issues.

---

### **3. Additional Considerations**

1. **Indexing**: Use indexes on columns frequently used in queries (like `status_id`, `project_id`, `issue_id`), and even composite indexes where necessary (e.g., `project_id` and `status_id` together).

2. **Normalisation**: The schema is normalised to at least 3NF, ensuring minimal data redundancy. Of note though, for large-scale systems, it could be worth denormalising certain parts of the schema (i.e. maintaining a history table for status changes instead of tracking changes directly in the issue tables), as this can improve performance for frequently ran queries involving status transitions or reporting.

3. **Flexible Status Management**: Since status types are scoped per project, each project can define its workflow independently.

4. **Scalability**: The schema is flexible enough to handle large-scale data with multiple projects and issues.

5. **Auditability and Compliance**: It's noted that comments cannot be edited, which is important for auditability. However, we may want to consider extending this principle to other entities like issues and occurrences. Implementing soft deletes and versioning on critical tables (e.g., issues and comments) might be beneficial for compliance requirements. Alternatively if we decide not to go down this path, we may instead decide to re-enable editing of comments and add an `updated_at` field, for consistency.

6. **Foreign Key Relations**: Ensure when implemented that the appropriate cascading actions are taken on delete or update. For example, when a user is deleted, we may want to delete all their comments and issues as well. Similarly, if an issue or project is deleted, we may want to delete all its occurrences, attachments, and comments.

## Generating the Database (MongoDB)

Converting this relational database design into a MongoDB schema involves rethinking the structure to take advantage of MongoDB's document-oriented nature. Below is a MongoDB schema design that reflects the original above requirements, while embracing the best practices for NoSQL.

### MongoDB Design Strategy

- **Documents**: Entities like `Projects`, `Users`, and `Issues` can each be represented as collections of documents.
- **Embedded Documents**: Some relationships (like status types scoped to projects) can be embedded within documents instead of split into separate collections.
- **References**: Where relationships between collections are essential (like between `Issues` and `Users`), we can use references.

### MongoDB Schema Example

Below is how we can structure the collections and embedded documents.

#### 1. **Projects Collection**

```json
{
  "_id": ObjectId("64e8a024c707c293ecd486e1"), // Project ID
  "project_name": "Project Alpha",
  "description": "This project tracks issues for the Alpha release.",
  "created_at": ISODate("2024-08-19T00:00:00Z"),
  "status_types": [
    { "status_id": 1, "status_name": "To Do" },
    { "status_id": 2, "status_name": "In Progress" },
    { "status_id": 3, "status_name": "Done" }
  ]
}
```

- **Status Types**: Embedded within the project document, scoped specifically to that project.

#### 2. **Users Collection**

```json
{
  "_id": ObjectId("64e8a024c707c293ecd486e2"), // User ID
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password_hash": "hashed_password_here",
  "role": "User"
}
```

#### 3. **Issues Collection**

```json
{
  "_id": ObjectId("64e8a024c707c293ecd486e3"), // Issue ID
  "project_id": ObjectId("64e8a024c707c293ecd486e1"), // Reference to Project
  "reporter_id": ObjectId("64e8a024c707c293ecd486e2"), // Reference to User
  "status_id": 1, // Reference to status within the Project document
  "title": "Bug in authentication",
  "description": "Users are unable to log in with special characters in their passwords.",
  "charm": "🐞",
  "created_at": ISODate("2024-08-19T00:00:00Z"),
  "updated_at": ISODate("2024-08-19T00:00:00Z"),
  "occurrences": [
    {
      "occurrence_id": ObjectId("64e8a024c707c293ecd486e4"), // Occurrence ID
      "description": "Reproduced issue with the new build.",
      "created_at": ISODate("2024-08-19T01:00:00Z"),
      "updated_at": ISODate("2024-08-19T01:30:00Z")
    }
  ],
  "attachments": [
    {
      "attachment_id": ObjectId("64e8a024c707c293ecd486e5"), // Attachment ID
      "file_path": "/uploads/screenshots/issue_1.png",
      "created_at": ISODate("2024-08-19T02:00:00Z")
    }
  ],
  "comments": [
    {
      "comment_id": ObjectId("64e8a024c707c293ecd486e6"), // Comment ID
      "user_id": ObjectId("64e8a024c707c293ecd486e2"),
      "comment_text": "I also encountered this issue on my setup.",
      "created_at": ISODate("2024-08-19T02:30:00Z")
    }
  ]
}
```

- **Occurrences, Attachments, and Comments**: Embedded as arrays within the issue document. This keeps related data together and allows efficient retrieval.

#### 4. **Example MongoDB Operations**

Here are some examples of operations we might decide to perform.

- **Insert a Project**:

```javascript
db.projects.insertOne({
  "project_name": "Project Alpha",
  "description": "This project tracks issues for the Alpha release.",
  "created_at": new Date(),
  "status_types": [
    { "status_id": 1, "status_name": "To Do" },
    { "status_id": 2, "status_name": "In Progress" },
    { "status_id": 3, "status_name": "Done" }
  ]
});
```

- **Insert an Issue**:

```javascript
db.issues.insertOne({
  "project_id": ObjectId("64e8a024c707c293ecd486e1"),
  "reporter_id": ObjectId("64e8a024c707c293ecd486e2"),
  "status_id": 1,
  "title": "Bug in authentication",
  "description": "Users are unable to log in with special characters in their passwords.",
  "charm": "🐞",
  "created_at": new Date(),
  "updated_at": new Date(),
  "occurrences": [],
  "attachments": [],
  "comments": []
});
```

- **Update Issue Status**:

```javascript
db.issues.updateOne(
  { "_id": ObjectId("64e8a024c707c293ecd486e3") },
  { "$set": { "status_id": 2, "updated_at": new Date() } }
);
```

- **Add a Comment to an Issue**:

```javascript
db.issues.updateOne(
  { "_id": ObjectId("64e8a024c707c293ecd486e3") },
  {
    "$push": {
      "comments": {
        "comment_id": new ObjectId(),
        "user_id": ObjectId("64e8a024c707c293ecd486e2"),
        "comment_text": "I also encountered this issue on my setup.",
        "created_at": new Date()
      }
    }
  }
);
```

### MongoDB Schema Design Summary

- **Embedded Documents**: Status types are scoped within each project, and occurrences, attachments, and comments are embedded within issues.
- **References**: Foreign key-like relationships are implemented using `ObjectId` references where necessary.
- **Scalability and Flexibility**: MongoDB allows us to scale horizontally and adapt the schema over time. For example, we can add new fields to documents without altering the overall schema.

## Generating Sample Data (Mongoose + Faker)

### Step 1: Install the required packages

First, ensure you have both `mongoose` and `faker-js` installed:

```bash
npm install mongoose @faker-js/faker
```

### Step 2: Define the Mongoose schema

```javascript
const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  project_name: String,
  description: String,
  created_at: { type: Date, default: Date.now },
  status_types: [
    {
      status_id: Number,
      status_name: String,
    },
  ],
});

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password_hash: String,
  role: { type: String, enum: ['Admin', 'User'] },
});

const IssueSchema = new mongoose.Schema({
  project_id: mongoose.Schema.Types.ObjectId,
  reporter_id: mongoose.Schema.Types.ObjectId,
  status_id: Number,
  title: String,
  description: String,
  charm: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  occurrences: [
    {
      occurrence_id: mongoose.Schema.Types.ObjectId,
      description: String,
      created_at: { type: Date, default: Date.now },
      updated_at: { type: Date, default: Date.now },
    },
  ],
  attachments: [
    {
      attachment_id: mongoose.Schema.Types.ObjectId,
      file_path: String,
      created_at: { type: Date, default: Date.now },
    },
  ],
  comments: [
    {
      comment_id: mongoose.Schema.Types.ObjectId,
      user_id: mongoose.Schema.Types.ObjectId,
      comment_text: String,
      created_at: { type: Date, default: Date.now },
    },
  ],
});

const Project = mongoose.model('Project', ProjectSchema);
const User = mongoose.model('User', UserSchema);
const Issue = mongoose.model('Issue', IssueSchema);
```

### Step 3: Create a script to generate fake data using Faker

```javascript
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

// Connect to the MongoDB database
mongoose.connect('mongodb+srv://iit:LfdTdr1hEKkSNIoF@intermittentissuetracke.7oyxe.mongodb.net/?retryWrites=true&w=majority&appName=IntermittentIssueTracker', { useNewUrlParser: true, useUnifiedTopology: true });

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

    issues.push(new Issue({
      project_id: randomProject._id,
      reporter_id: randomUser._id,
      status_id: faker.datatype.number({ min: 1, max: 3 }),
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      charm: faker.random.arrayElement(['🐞', '⚠️', '🚀']),
      created_at: faker.date.recent(),
      updated_at: faker.date.recent(),
      occurrences: [
        {
          description: faker.lorem.sentence(),
          created_at: faker.date.recent(),
          updated_at: faker.date.recent(),
        }
      ],
      attachments: [
        {
          file_path: faker.system.filePath(),
          created_at: faker.date.recent(),
        }
      ],
      comments: [
        {
          user_id: randomUser._id,
          comment_text: faker.lorem.sentence(),
          created_at: faker.date.recent(),
        }
      ]
    }));
  }

  await Issue.insertMany(issues);

  console.log('Fake data generated successfully!');
  mongoose.disconnect();
}

// Run the script
generateFakeData();
```

### Step 4: Run the script

You can run the script using:

```bash
node path/to/your/script.js
```
