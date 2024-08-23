
# Intermittent Issue Tracker

[Shared Folder (OneDrive)](https://edithcowanuni-my.sharepoint.com/:f:/r/personal/pcottrel_our_ecu_edu_au/Documents/CSG3101%20Applied%20Project?csf=1&web=1&e=3xdVdA) ・ [GitHub](https://github.com/p-cottrell/issue-tracker/) ・ [Git Branching Procedure](https://github.com/p-cottrell/issue-tracker/blob/main/Git%20Branching%20Procedure.md)

## 📋 Track and Manage Intermittent Issues with Ease

The Intermittent Issue Tracker is a mobile-compatible web application designed to help users keep track of recurring issues. Whether it's a technical glitch, a health symptom, or any other type of intermittent problem, this tool enables you to log instances, track patterns, and gain insights over time.


## Summary

The Intermittent Issue Tracker allows users to:

- **Log Issues:** Quickly add new issues you wish to monitor.
- **Track Occurrences:** Record each instance of an issue and view a history of logged occurrences.
- **Visualise Data:** Use charts and graphs to understand the frequency and patterns of issues over time.
- **User Profiles:** Manage your personal data, view logged instances, and adjust notification preferences.

## Technologies Used

- **Frontend:** Built using <img alt="React" src="https://custom-icon-badges.demolab.com/badge/React-025E9F.svg?logo=react&logoColor=white">, <img alt="HTML" src="https://img.shields.io/badge/HTML-E34F26.svg?logo=html5&logoColor=white">, <img alt="CSS" src="https://img.shields.io/badge/CSS-1572B6.svg?logo=css3&logoColor=white"> and <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?logo=javascript&logoColor=black">.
- **Backend:** Powered by <img alt="Node.js" src="https://img.shields.io/badge/Node.js-8CC84C.svg?logo=node.js&logoColor=white"> and <img alt="Express.js" src="https://img.shields.io/badge/Express.js-000000.svg?logo=express&logoColor=white">.
- **Database:** <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248.svg?logo=mongodb&logoColor=white"> with Mongoose for data management.
- **Visualisation:** <img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-F7D03C.svg?logo=chart.js&logoColor=black"> for creating dynamic data visualisations.
- **Authentication**: <img alt="JWT" src="https://img.shields.io/badge/JSON_Web_Tokens-000000.svg?logo=json-web-tokens&logoColor=white"> for secure user authentication.

## Installation

To get started with the Intermittent Issue Tracker on your local machine:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/p-cottrell/issue-tracker
   ```
2. **Navigate to the backend project directory:**

   ```bash
   cd issue-tracker/backend
   ```

3. **Install the dependencies:**

   ```bash
   npm install
   ```

4. **Set up the environment variables:**

   Create a `.env` file in the backend directory with your MongoDB URI and other information
   ```bash
   PORT=5000
   MONGO_URI= ***
   ACCESS_TOKEN_SECRET= ****
   ```

5. **Run the server:**

   ```bash
   node server.js
   ```

6. **Create a new terminalinstance and navigate to the frontend project directory:**

   ```bash
   cd issue-tracker/frontend
   ```

7. **Install the dependencies:**

   ```bash
   npm install
   ```

8. **Start the application:**

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
