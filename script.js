// Global variable to hold data
let sheetData = [];

function loadProjections(sheetName) {
    const apiUrl = getApiUrl(sheetName);

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Process and display the data
            processProjectionData(data);
        })
        .catch(error => console.error('Error fetching projection data:', error));
}

// Function to construct the API URL
function getApiUrl(sheetName) {
    const sheetId = '1KRsABdUN_udlAde7TE5aIrYHQ9-2HbnHwlHQTrN-R4E';
    const apiKey = 'AIzaSyCQtpGO-z7Nh2bzQXMT4PIs3qviIqNeVIo';
    return `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;
}

// Function to process and display the data
function processProjectionData(data) {
    // Save the data to the global variable
    sheetData = data.values; // Assuming data.values contains the array of arrays

    // Populate the discipline select dropdown
    populateDisziplinSelect(sheetData);

    // Render the overall standings initially
    renderOverallStandings(sheetData);
}

// Populate Disziplin dropdown
function populateDisziplinSelect(data) {
    const disziplinSelect = document.getElementById('disziplinSelect');

    // Clear any existing options except the first one
    disziplinSelect.options.length = 1; // Keep the "Gesamtübersicht" option

    const disciplines = [...new Set(data.slice(1).map(row => row[1]).filter(d => d))]; // Get unique disciplines, filtering out any empty values

    disciplines.forEach(discipline => {
        const option = document.createElement('option');
        option.value = discipline;
        option.text = discipline;
        disziplinSelect.appendChild(option);
    });

    // Add event listener for selection change
    disziplinSelect.addEventListener('change', function() {
        const selectedDisziplin = this.value;
        if (selectedDisziplin) {
            renderChartForDisziplin(selectedDisziplin, sheetData);
        } else {
            renderOverallStandings(sheetData);  // Render overall standings if no discipline is selected
        }
    });
}

// Function to adjust chart configuration for small screens
function getChartOptions() {
    const isSmallScreen = window.innerWidth < 768;

    return {
        indexAxis: 'y', // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        aspectRatio: isSmallScreen ? 1.5 : 2.5, // Adjust aspect ratio for small screens
        scales: {
            x: {
                beginAtZero: true,
                stacked: true // Stack the "Definitiv" and "Projektion" bars
            },
            y: {
                stacked: true // "Definitiv" and "Projektion" bars are stacked
            }
        },
        plugins: {
            legend: {
                display: true // Show the legend to differentiate between Definitiv and Projektion
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const datasetIndex = context.datasetIndex;
                        const value = context.raw;

                        if (datasetIndex === 0) {
                            return `Definitiv: ${value}`;
                        } else if (datasetIndex === 1) {
                            return `Projektion: ${value}`;
                        }
                    }
                }
            },
            title: {
                display: true,
                text: 'Aktueller Stand',
                font: {
                    size: isSmallScreen ? 12 : 16 // Adjust font size for small screens
                }
            }
        }
    };
}

// Set canvas height based on screen size
function setCanvasHeight(chartCanvas) {
    const isSmallScreen = window.innerWidth < 768;
    chartCanvas.height = isSmallScreen ? 600 : 1000;
}

// Render Overall Standings
function renderOverallStandings(data) {
    const headers = data[0];
    const clubs = Array.from(new Set(headers.slice(3))); // Extract unique club names
    const clubData = {};

    // Initialize club data structure
    clubs.forEach(club => {
        clubData[club] = { projection: 0, definitive: 0 };
    });

    data.slice(1).forEach(row => {
        const status = row[2]; // Status (Projektion or Definitiv)
        clubs.forEach((club, index) => {
            const points1 = parseInt(row[index * 2 + 3] || 0);
            const points2 = parseInt(row[index * 2 + 4] || 0);
            if (status === "Projektion") {
                clubData[club].projection += points1 + points2;
            } else if (status === "Definitiv") {
                clubData[club].definitive += points1 + points2;
            }
        });
    });

    // Sort clubs by total points (definitive + projection)
    const sortedClubs = Object.keys(clubData).sort((a, b) => {
        const totalA = clubData[a].projection + clubData[a].definitive;
        const totalB = clubData[b].projection + clubData[b].definitive;
        return totalB - totalA;
    });

    // Prepare data for Chart.js
    const definitiveData = sortedClubs.map(club => clubData[club].definitive);
    const projectionData = sortedClubs.map(club => clubData[club].projection);

    // Clear previous chart
    document.getElementById('charts-container').innerHTML = '';
    const chartCanvas = document.createElement('canvas');
    document.getElementById('charts-container').appendChild(chartCanvas);

    setCanvasHeight(chartCanvas);

    const ctx = chartCanvas.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedClubs, // Each club appears once
            datasets: [
                {
                    label: 'Definitiv',
                    data: definitiveData, // Data for the stacked bar (Definitiv)
                    backgroundColor: sortedClubs.map((club) => {
                        return adjustColorBrightness(clubColorClasses[club], -0.1);
                    }) // Base color for definitive
                },
                {
                    label: 'Projektion',
                    data: projectionData, // Data for the stacked bar (Projektion)
                    backgroundColor: sortedClubs.map((club) => {
                        return adjustColorBrightness(clubColorClasses[club], 0.1);
                    }) // Base color for projection
                }
            ]
        },
        options: getChartOptions()
    });
}

// Render chart based on selected Disziplin
function renderChartForDisziplin(discipline, data) {
    const filteredRows = data.slice(1).filter(row => row[1] === discipline);
    const headers = data[0];
    const clubs = Array.from(new Set(headers.slice(3))); // Extract unique club names

    const clubData = {};

    // Initialize club data structure
    clubs.forEach(club => {
        clubData[club] = { athlete1: 0, athlete2: 0 };
    });

    let status = "Projektion";  // Default to Projektion

    filteredRows.forEach(row => {
        status = row[2];  // Update status based on data, assuming it's consistent across the discipline
        clubs.forEach((club, index) => {
            const points1 = parseInt(row[index * 2 + 3] || 0);
            const points2 = parseInt(row[index * 2 + 4] || 0);
            clubData[club].athlete1 += points1;
            clubData[club].athlete2 += points2;
        });
    });

    // Sort clubs by total points (athlete1 + athlete2)
    const sortedClubs = Object.keys(clubData).sort((a, b) => {
        const totalA = clubData[a].athlete1 + clubData[a].athlete2;
        const totalB = clubData[b].athlete1 + clubData[b].athlete2;
        return totalB - totalA;
    });

    // Prepare data for Chart.js
    const athlete1Data = sortedClubs.map(club => clubData[club].athlete1);
    const athlete2Data = sortedClubs.map(club => clubData[club].athlete2);

    // Clear previous chart
    document.getElementById('charts-container').innerHTML = '';
    const chartCanvas = document.createElement('canvas');
    document.getElementById('charts-container').appendChild(chartCanvas);

    setCanvasHeight(chartCanvas);

    const ctx = chartCanvas.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedClubs, // Each club appears once
            datasets: [
                {
                    label: 'Athlet 1',
                    data: athlete1Data, // Data for the first athlete
                    backgroundColor: sortedClubs.map((club) => {
                        return adjustColorBrightness(clubColorClasses[club], -0.1);
                    }) // Base color for Athlete 1
                },
                {
                    label: 'Athlet 2',
                    data: athlete2Data, // Data for the second athlete
                    backgroundColor: sortedClubs.map((club) => {
                        return adjustColorBrightness(clubColorClasses[club], 0.1);
                    }) // Base color for Athlete 2
                }
            ]
        },
        options: {
            ...getChartOptions(),
            plugins: {
                ...getChartOptions().plugins,
                title: {
                    display: true,
                    text: `${discipline} - ${status}`, // Display the discipline name and status as the title
                    font: {
                        size: window.innerWidth < 768 ? 12 : 16 // Adjust font size for small screens
                    }
                }
            }
        }
    });
}

// Utility function to adjust color brightness based on CSS class names
function adjustColorBrightness(colorClass, percent) {
    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    tempDiv.className = colorClass;
    document.body.appendChild(tempDiv);

    const color = window.getComputedStyle(tempDiv).backgroundColor;
    const rgb = color.match(/\d+/g);

    const r = Math.min(255, Math.max(0, parseInt(rgb[0]) + percent * 255));
    const g = Math.min(255, Math.max(0, parseInt(rgb[1]) + percent * 255));
    const b = Math.min(255, Math.max(0, parseInt(rgb[2]) + percent * 255));

    document.body.removeChild(tempDiv);
    return `rgb(${r},${g},${b})`;
}
