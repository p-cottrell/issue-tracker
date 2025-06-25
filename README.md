
# Intermittent Issue Tracker

## Track and Manage Intermittent Issues with Ease

The Intermittent Issue Tracker is a mobile-compatible web application designed to help users keep track of recurring issues. Whether it's a technical glitch, a health symptom, or any other type of intermittent problem, this tool enables you to log instances, track patterns, and gain insights over time.


The Intermittent Issue Tracker allows users to:

- **Log Issues:** Quickly add new issues you wish to monitor, with a charm icon for easy visual reference.
- **Track Occurrences:** Record and timestamp each instance of an issue and view a chronological history of logged occurrences.
- **Visualise Data:** Generate dynamic charts and graphs to analyse how frequently issues arise and identify trends over time.
- **User Profiles:** Manage your personal data, update your username or password, and adjust notification settings all from a clean, intuitive profile interface.
- **Authentication:** Secure JWT-based login and registration system protects user data and ensures access control for all operations.
- **Attachments:** Upload and preview supporting images or documents with each issue or occurrence using a drag-and-drop interface.
- **Comments:** Leave comments or updates on any issue to create a living history of discussions, thoughts, or progress.

---

✨ The Intermittent Issue Tracker is also:

- **Fully Responsive:** Optimised for desktop, tablet, and mobile experiences using Tailwind CSS utility classes and custom breakpoints.
- **Dark Mode Friendly:** Adapts to user preference with a polished dark theme that enhances readability and visual comfort.
- **User-Friendly:** Clean and minimal interface with logical navigation ensures a smooth and distraction-free user experience.
- **Accessible:** Designed with accessibility best practices in mind, including semantic HTML, focus states, and keyboard navigation support.

---

## 🎬 Feature Previews

Below are short previews demonstrating key features of the Intermittent Issue Tracker in action. From logging new issues to searching and interacting with a fully responsive interface, these clips showcase the app’s smooth, user-friendly workflow across different devices.

- 📝 **Adding a New Issue** – Create a new issue with charm selection, rich text description, and optional attachments.
![Add Issue Preview](./previews/add_issue_preview.gif)
- 🔍 **Searching for Issues** – Instantly filter your issue list by keyword with real-time search.
![Search Preview](./previews/search_preview.gif)
- 📐 **Adaptive Layout** – The interface layout can be adjusted to user preference
![Adaptive Preview](./previews/adaptive_preview.gif)
- 📱 **Mobile Responsiveness** – Optimised for use on smartphones and tablets.
![Responsive Preview](./previews/responsive_preview.gif)
- 🌒 **Dark/Light Theme Support** – Seamlessly switches based on user preference.
![Theme Adaptation Preview](./previews/darkmode_preview.gif)

---


## Technologies Used

- **Frontend:** Built using <img alt="React" src="https://custom-icon-badges.demolab.com/badge/React-025E9F.svg?logo=react&logoColor=white">, <img alt="HTML" src="https://img.shields.io/badge/HTML-E34F26.svg?logo=html5&logoColor=white">, <img alt="CSS" src="https://img.shields.io/badge/CSS-1572B6.svg?logo=css3&logoColor=white">, <img alt="JavaScript" src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?logo=javascript&logoColor=black"> and <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC.svg?logo=tailwindcss&logoColor=white">.
- **Backend:** Powered by <img alt="Node.js" src="https://img.shields.io/badge/Node.js-8CC84C.svg?logo=node.js&logoColor=white">, <img alt="Express.js" src="https://img.shields.io/badge/Express.js-000000.svg?logo=express&logoColor=white">.
- **Database:** <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248.svg?logo=mongodb&logoColor=white"> with Mongoose for data management.
- **Data Visualisation:** <img alt="Chart.js" src="https://img.shields.io/badge/Chart.js-F7D03C.svg?logo=chart.js&logoColor=black"> for creating dynamic data visualisations.
- **Authentication**: <img alt="JWT" src="https://img.shields.io/badge/JSON_Web_Tokens-000000.svg?logo=json-web-tokens&logoColor=white"> for secure user authentication.

---

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

3. **Install backend dependencies:**
   ```bash
   npm install
   ```

4. **Create a `.env` file in the backend folder:**
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. **Start the backend server:**
   ```bash
   npm start
   ```

6. **In a new terminal, navigate to the frontend:**
   ```bash
   cd ../frontend
   ```

7. **Install frontend dependencies:**
   ```bash
   npm install
   ```

8. **Start the frontend app:**
   ```bash
   npm run dev
   ```

The application should now be running at:
```
Frontend: http://localhost:5173  
Backend: http://localhost:5000
```

---

## Usage

1. **Register an account** to start tracking your issues.
2. **Log in** to access your personal dashboard.
3. **Click "Add Issue"** to begin logging a new recurring problem.
4. **Record each occurrence** of that issue over time.
5. **Use charts and stats** to gain insights about frequency and patterns.
6. **Manage files and comments** on each issue entry.

---

## Database Documentation

The MongoDB schema supports users, issues, attachments, comments, and status history.

For more details on the schema structure and relationships, refer to the [📚 Database README](https://github.com/p-cottrell/issue-tracker/blob/main/db/README.md).

---

## API Documentation

The backend provides RESTful endpoints for interacting with all resources.

Example routes:

- `POST /api/users/register` – Register a new user
- `POST /api/users/login` – Login and receive a token
- `GET /api/issues` – Get all issues for the authenticated user
- `POST /api/issues` – Create a new issue
- `PUT /api/issues/:id` – Update an existing issue
- `DELETE /api/issues/:id` – Delete an issue
- `POST /api/attachments/:issueId` – Upload image/file attachments

View the [🔌 Full API Documentation](https://github.com/p-cottrell/issue-tracker/blob/main/api_documentation/API_DOCUMENTATION.md) for all available endpoints and examples.

---

## Contributing

Contributions are welcome! To contribute:

```bash
git checkout -b feature/your-feature-name
```

- Commit your changes with a meaningful message
- Submit a pull request with a description of your changes

---

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/p-cottrell/issue-tracker/blob/main/LICENSE) file for more details.

---
```