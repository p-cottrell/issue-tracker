
# Intermittent Issue Tracker

## 📋 Track and Manage Intermittent Issues with Ease

The Intermittent Issue Tracker is a mobile-compatible web application designed to help users keep track of recurring issues. Whether it's a technical glitch, a health symptom, or any other type of intermittent problem, this tool enables you to log instances, track patterns, and gain insights over time.


## Summary

The Intermittent Issue Tracker allows users to:

- **Log Issues:** Quickly add new issues you wish to monitor.
- **Track Occurrences:** Record each instance of an issue and view a history of logged occurrences.
- **Visualise Data:** Use charts and graphs to understand the frequency and patterns of issues over time.
- **User Profiles:** Manage your personal data, view logged instances, and adjust notification preferences.

## Technologies Used

- **Frontend:** Built using React, HTML, CSS, and JavaScript.
- **Backend:** Powered by Node.js and Express.js.
- **Database:** MongoDB with Mongoose for data management.
- **Visualisation:** Chart.js for creating dynamic data visualisations.
- **Version Control:** Managed with Git and GitHub.
- **Editor:** Developed primarily using Visual Studio Code.


## Installation

To get started with the Intermittent Issue Tracker on your local machine:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/intermittent-issue-tracker.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd intermittent-issue-tracker
   ```

3. **Install the dependencies:**

   ```bash
   npm install
   ```

4. **Set up the environment variables:**

   Create a `.env` file in the root directory with your MongoDB URI and any other environment variables required.

5. **Run the application:**

   ```bash
   npm start
   ```

The application should now be running at `http://localhost:3000`.

## Usage

1. **Register an account** to start tracking your issues.
2. **Log in** to access your personal dashboard.
3. **Add new issues** by clicking the "Add Issue" button on the dashboard.
4. **Log instances** of an issue whenever it occurs.
5. **View the history** of logged instances and see visualizations of your data over time.

The dashboard provides an overview of all your tracked issues, while detailed views allow you to dive into specific problems and their occurrence patterns.

## API Documentation

The backend provides RESTful endpoints for interacting with the application. Here are a few key routes:

    POST /api/register: Register a new user.
    POST /api/login: Authenticate a user and return a token.
    GET /api/issues: Retrieve the list of issues being tracked.
    POST /api/issues: Create a new issue.
    PUT /api/issues/:id: Update an existing issue.
    DELETE /api/issues/:id: Delete an issue.

For detailed API documentation, refer to the API Docs.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.