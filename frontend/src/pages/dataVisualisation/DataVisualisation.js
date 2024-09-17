import Logo from '../../components/Logo';
import Sidebar from '../../components/Sidebar';
import apiClient from '../../api/apiClient';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon } from '@heroicons/react/24/outline';
import React from 'react';
import '../../styles/base.css';
import '../../styles/loadingRing.css';

import { LineGraph } from '../../components/graphs/Line';
import { BarGraph } from '../../components/graphs/Bar';
import { PieChart } from '../../components/graphs/Pie';

const DataVisualisation = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Used for loading the issues.
    const [issues, setIssues] = useState([]); 
    const [fetched, setFetched] = useState(false);

    const [graphType, setGraphType] = useState("added"); // Used for changing which graph is displayed.

    useEffect(() => {
        const fetchIssues = async () => {
          try {
            const response = await apiClient.get('api/issues');
            setIssues(response.data);
            setFetched(true);
          } catch (error) {
            console.error('Error fetching issues:', error);
            setFetched(true);
          }
        };
    
        fetchIssues();
    }, []);

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
    issues.length != 0 && issues.data.map((issue) => { // For each issue retrieved from the database...
      date = new Date(issue.created_at); // ... convert the date it was created to a Date object...
      issueMonth = date.toLocaleString('default', {month: 'long' }); // ... get only the month...
      addedIssuesPerMonth[issueMonth] += 1 // ... and count the issue's occurrence in that month.

      last = issue.status_history.length - 1 // Used to get the last item in the status_history array.
      
      // For counting issue statuses.
      switch(issue.status_history[last].status_id) { // Gets the most recent status_id for the given issue.
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
              borderColor: ["rgb(75, 192, 192)"],
              backgroundColor: ["rgb(75, 192, 192)"],
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
              borderColor: ["rgb(75, 192, 192)"],
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
            "#2ECC71",
            "#FFFC48",
            "#FF4848",
            "#ADADAD",
          ],
          hoverOffset: 4,
        }
      ]
    }

    const users = [
      {
        "username": "Phil Collins"
      },
      {
        "username": "Bill Fallins"
      }
    ]

    function displayUsers() {
      return (
        <div>
              {users.map((user) => {
                return (
                  <div className="bg-background shadow-md rounded-lg p-4 m-4 min-h-[100px] bg-white flex">
                    {user.username}
                  </div>
                )
              })}
            </div>
      )
    }

    // Used to control which graph is being displayed on screen.
    function displayGraph() {
      switch (graphType) {
        case 'added':
          return (
          <div>
            <BarGraph graphData={graphData}/>
          </div>
        )
        case 'solved':
          return (
            <div>
              <LineGraph graphData={lineData}/>
            </div>
          )
        case 'status':
          return (
            <div>
            <PieChart graphData={pieChartData} />
          </div>
          )
        case 'user':
          return (displayUsers())
        default:
          return 'Error.'
      }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
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

              <div className="justify-normal">
                <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg items-center space-x-2" onClick={() => setGraphType("added")}># Issues added per month</button>
                <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg items-center space-x-2" onClick={() => setGraphType("solved")}># Completed issues per month</button>
                <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg items-center space-x-2" onClick={() => setGraphType("status")}>Status of current issues</button>
                {/* <button className="bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold focus:outline-none transition-transform transform hover:scale-105 hover:shadow-lg items-center space-x-2" onClick={() => setGraphType("user")}># Issues added per user</button> */}
              </div>

                {displayGraph()}
            </main>
          </div>
        </div>
      );
}

export default DataVisualisation;