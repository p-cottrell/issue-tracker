import { Bars3Icon } from '@heroicons/react/24/outline';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import apiClient from '../../api/apiClient';
import Logo from '../../components/Logo';
import Sidebar from '../../components/Sidebar';
import { useUser } from '../../context/UserContext';

import '../../styles/base.css';
import '../../styles/loadingRing.css';

import { BarGraph } from '../../components/graphs/Bar';
import { LineGraph } from '../../components/graphs/Line';
import { PieChart } from '../../components/graphs/Pie';

const DataVisualisation = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Used for loading the issues.
  const [fetched, setFetched] = useState(false);

  const { user } = useUser(); // Fetch authenticated user data from the context
  const [noIssuesMessage, setNoIssuesMessage] = useState(''); // Holds message to display when no issues are found
  const [allIssues, setAllIssues] = useState([]); // All issues retrieved from the API
  const [filteredIssues, setFilteredIssues] = useState([]); // Issues filtered based on search term or filter type
  const [updateTrigger, setUpdateTrigger] = useState(0); // Trigger to force re-fetch of issues
  const [filterType, setFilterType] = useState(localStorage.getItem('filterType') || 'all'); // Filter type for issues, initialized from localStorage
  const [statusFilter, setStatusFilter] = useState('all'); // State for the status filter

  const [graphType, setGraphType] = useState("added"); // Used for changing which graph is displayed.

  /**
  * Fetches issues from the API based on the filter type and user context.
  * Uses useCallback to memorize the function, preventing unnecessary re-fetching on re-renders.
  */
  const fetchIssues = useCallback(async () => {
    if (!user || !user.id) {
      console.error('User data is not available yet.');
      return;
    }

    setFetched(false); // Ensure UI shows loading wheel when fetching begins

    try {
      // Clear previous issues state
      setAllIssues([]);
      setFilteredIssues([]);
      setNoIssuesMessage(''); // Clear any existing messages

      let endpoint = 'api/issues'; // Default endpoint to fetch all issues
      if (filterType === 'myIssues' && user.id) {
        endpoint = `api/issues?userId=${user.id}`; // Fetch only issues reported by the current user
      }

      const response = await apiClient.get(endpoint); // Fetch issues from API

      if (response.data.success) {
        let issues = response.data.data;

        // Apply status filter
        if (statusFilter !== 'all') {
          issues = issues.filter((issue) => {
            // Extract the latest status_id from status_history
            const latestStatus = issue.status_history.length > 0 ? issue.status_history[issue.status_history.length - 1].status_id : null;
            return latestStatus === parseInt(statusFilter);
          });
        }

        setAllIssues(issues); // Set the issues data
        setFilteredIssues(issues);
        setNoIssuesMessage(''); // Clear any existing message
      } else {
        setNoIssuesMessage(response.data.message); // Display the message from the backend
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setNoIssuesMessage('Error fetching issues. Please try again later.');
    } finally {
      setFetched(true); // Ensure UI shows that fetching is complete
    }
  }, [filterType, statusFilter, user]);

  /**
  * useEffect hook to fetch issues whenever the filter type, update trigger, or user context changes.
  */
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues, updateTrigger]);

  /**
  * Handles changes in the filter type dropdown.
  * Saves the selected filter type to localStorage for persistence across sessions.
  * @param {Object} event - The event object from the filter dropdown.
  */
  const handleFilterChange = (event) => {
    const selectedFilter = event.target.value;
    setFilterType(selectedFilter);
    localStorage.setItem('filterType', selectedFilter); // Persist filter type to localStorage
  };

  // Return loading screen if issues have not been fetched yet
  if (!fetched) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }


  // For counting how many issues were added per month.
  let addedIssuesPerMonth = {
    "January": 0,
    "February": 0,
    "March": 0,
    "April": 0,
    "May": 0,
    "June": 0,
    "July": 0,
    "August": 0,
    "September": 0,
    "October": 0,
    "November": 0,
    "December": 0
  }

  // For counting how many issues were added per month.
  let solvedIssuesPerMonth = {
    "January": 0,
    "February": 0,
    "March": 0,
    "April": 0,
    "May": 0,
    "June": 0,
    "July": 0,
    "August": 0,
    "September": 0,
    "October": 0,
    "November": 0,
    "December": 0
  }

  // For counting the statuses of issues.
  let issueStatusCount = {
    "Complete": 0,
    "In Progress": 0,
    "Cancelled": 0,
    "Pending": 0
  }

  let date = '';
  let issueMonth = '';
  let last = 0;
  filteredIssues && filteredIssues.map((issue) => { // For each issue retrieved from the database...
    date = new Date(issue.created_at); // ... convert the date it was created to a Date object...
    issueMonth = date.toLocaleString('default', { month: 'long' }); // ... get only the month...
    addedIssuesPerMonth[issueMonth] += 1 // ... and count the issue's occurrence in that month.

    last = issue.status_history.length - 1 // Used to get the last item in the status_history array.

    // For counting issue statuses.
    switch (issue.status_history[last].status_id) { // Gets the most recent status_id for the given issue.
      case 1:
        issueStatusCount["Complete"] += 1;
        solvedIssuesPerMonth[issueMonth] += 1;
        break;
      case 2:
        issueStatusCount["In Progress"] += 1;
        break;
      case 3:
        issueStatusCount["Cancelled"] += 1;
        break;
      default:
        issueStatusCount["Pending"] += 1;
        break;
    }
  })

  // Puts the added issue per month data into a format Chart.JS is happy with.
  const graphData = {
    labels: [ // X-axis.
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: "Issues Added",
        data: addedIssuesPerMonth, // Y-axis.
        borderColor: ["#185D78"],
        backgroundColor: ["#185D78"],
        borderWidth: 1,
      },
    ]
  }

  // Puts the solved issue per month data into a format Chart.JS is happy with.
  const lineData = {
    labels: [ // X-axis.
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    datasets: [
      {
        label: "Issues Solved",
        data: solvedIssuesPerMonth, // Y-axis.
        borderColor: ["#185D78"],
      },
    ]
  }

  // Puts the issue status data into a format Chart.JS is happy with.
  var pieData = [];
  for (var i in issueStatusCount) {
    pieData.push(issueStatusCount[i])
  }
  const pieChartData = {
    labels: ["Complete", "In Progress", "Cancelled", "Pending"],
    datasets: [
      {
        label: "Issue Status",
        data: pieData,
        backgroundColor: [
          "#FFCDB2",
          "#FFB4A2",
          "#E5989B",
          "#B5838D",
        ],
        hoverOffset: 4,
      }
    ]
  }

  // Used to control which graph is being displayed on screen.
  function displayGraph() {
    switch (graphType) {
      case 'added':
        return (
          <div className="chart-container flex flex-auto relative min-w-3.5 max-w-4xl">
            <BarGraph graphData={graphData} />
          </div>
        );
      case 'solved':
        return (
          <div className="chart-container flex flex-auto relative min-w-3.5 max-w-4xl">
            <LineGraph graphData={lineData} />
          </div>
        );
      case 'status':
        return (
          <div className="chart-container flex flex-auto relative min-w-3.5 max-w-2xl">
            <PieChart graphData={pieChartData} />
          </div>
        );
      default:
        return 'Error.';
    }
  }

  // Function to export the chart as PNG
  const exportToPNG = () => {
    const chartElement = document.querySelector('.chart-container');
    if (!chartElement) return;

    toPng(chartElement)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'chart.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Error exporting to PNG:', err);
      });
  };

  // Function to export the chart as PDF
  const exportToPDF = () => {
    const chartElement = document.querySelector('.chart-container');
    if (!chartElement) return;

    toPng(chartElement)
      .then((dataUrl) => {
        const pdf = new jsPDF();
        pdf.addImage(dataUrl, 'PNG', 10, 10, 180, 160);
        pdf.save('chart.pdf');
      })
      .catch((err) => {
        console.error('Error exporting to PDF:', err);
      });
  };

  // Function to export data as Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredIssues);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Issues');
    XLSX.writeFile(workbook, 'issues.xlsx');
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-dark">
      {/* Header */}
      <header className="relative bg-primary shadow p-4 flex items-center justify-between">
        {/* Left: Logo and Hamburger */}
        <div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 lg:hidden">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <span className="hidden lg:inline">
            <Logo className="truncate text-neutral xs:text-base md:text-lg lg:text-4xl" navigate={navigate} useClick={true} />
          </span>
        </div>
      </header>

      <div className="flex flex-grow">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} navigate={navigate} />

        {/* Main Content */}
        <main className="flex-grow p-6">

          {/* Drop down menus */}
          <div className="flex space-x-4 justify-center mb-4">

            {/* Filter Dropdown */}
            <div>
              <select
                onChange={handleFilterChange}
                value={filterType}
                className="bg-white text-primary-600 px-2 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg">
                <option value="all">All Issues</option>
                <option value="myIssues">My Issues</option>
              </select>
            </div>

            {/* "Sort by category" dropdown */}
            <div>
              <select
                onChange={(e) => setGraphType(e.target.value)}
                value={graphType}
                className="bg-white text-primary-600 px-2 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg">
                <option value="added">Added issues / month</option>
                <option value="solved">Completed issues / month</option>
                <option value="status">Status of current issues</option>
              </select>
            </div>

          </div>

          {/* Export buttons */}
          <div className="flex justify-end mb-4 space-x-2">
            <button
              onClick={exportToPNG}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
            >
              Export to PNG
            </button>
            <button
              onClick={exportToPDF}
              className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600"
            >
              Export to PDF
            </button>
            <button
              onClick={exportToExcel}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-600"
            >
              Export to Excel
            </button>
          </div>

          {/* Graph display */}
          <div className='flex justify-center'>
            {displayGraph()}
          </div>

        </main>
      </div>
    </div>
  );
}

export default DataVisualisation;