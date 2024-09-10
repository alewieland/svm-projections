// Google Sheets API settings
const sheetId = '1KRsABdUN_udlAde7TE5aIrYHQ9-2HbnHwlHQTrN-R4E';  // Replace with your Google Sheet ID
const apiKey = 'AIzaSyCQtpGO-z7Nh2bzQXMT4PIs3qviIqNeVIo';    // Replace with your Google API Key

// Global variable to hold data
let sheetData = [];

// Function to load projections based on sheet name
function loadProjections(sheetName) {
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${apiKey}`;

    // Fetch data from Google Sheets
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            sheetData = data.values;
            populateDisziplinSelect(sheetData);
            renderOverallStandings(sheetData);  // Render overall standings on load
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Populate Disziplin dropdown
function populateDisziplinSelect(data) {
    const disziplinSelect = document.getElementById('disziplinSelect');
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
                stacked: true // Stack the bars
            },
            y: {
                stacked: true // Stack the bars
            }
        },
        plugins: {
            legend: {
                display: false // Hide the legend for simplicity
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const datasetIndex = context.datasetIndex;
                        const value = context.raw;
                        const definitvValue = context.chart.data.datasets[0].data[context.dataIndex];
                        const projektionValue = context.chart.data.datasets[1].data[context.dataIndex];
                        const total = definitvValue + projektionValue;

                        if (datasetIndex === 0) {
                            return `Definitiv: ${value}`;
                        } else if (datasetIndex === 1) {
                            return `Projektion: ${value} (Total: ${total})`;
                        }
                    }
                }
            },
            title: {
                display: true,
                text: 'Overall Club Standings',
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

    // Assign podium colors to the top 3 clubs with adjustments
    const getBarColor = (index, isProjection) => {
        if (index === 0) return adjustColorBrightness(podiumColors.gold, isProjection ? 0.1 : -0.1);
        if (index === 1) return adjustColorBrightness(podiumColors.silver, isProjection ? 0.1 : -0.1);
        if (index === 2) return adjustColorBrightness(podiumColors.bronze, isProjection ? 0.1 : -0.1);
        return isProjection ? adjustColorBrightness(clubColors[sortedClubs[index]], 0.1) : clubColors[sortedClubs[index]];
    };

    // Prepare data for Chart.js
    const definitiveData = sortedClubs.map(club => clubData[club].definitive);
    const projectionData = sortedClubs.map(club => clubData[club].projection);

    // Clear previous chart
    document.getElementById('charts-container').innerHTML = '';
    const chartCanvas = document.createElement('canvas');
    document.getElementById('charts-container').appendChild(chartCanvas);

    // Set canvas height based on screen size
    setCanvasHeight(chartCanvas);

    const ctx = chartCanvas.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedClubs,
            datasets: [
                {
                    label: 'Definitiv',
                    data: definitiveData,
                    backgroundColor: sortedClubs.map((_, index) => getBarColor(index, false)) // Adjust for Definitiv
                },
                {
                    label: 'Projektion',
                    data: projectionData,
                    backgroundColor: sortedClubs.map((_, index) => getBarColor(index, true)) // Adjust for Projektion
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

    filteredRows.forEach(row => {
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

    // Determine brightness adjustment based on status
    const status = filteredRows[0] && filteredRows[0][2]; // Assuming status is the same for all rows in a discipline
    const brightnessAdjustmentAthlete1 = (status === "Definitiv") ? -0.15 : 0;
    const brightnessAdjustmentAthlete2 = (status === "Definitiv") ? -0.05 : 0.1;

    // Assign podium colors to the top 3 clubs with adjustments
    const getAthleteColor = (index, isAthlete1) => {
        if (index === 0) return adjustColorBrightness(podiumColors.gold, isAthlete1 ? brightnessAdjustmentAthlete1 : brightnessAdjustmentAthlete2);
        if (index === 1) return adjustColorBrightness(podiumColors.silver, isAthlete1 ? brightnessAdjustmentAthlete1 : brightnessAdjustmentAthlete2);
        if (index === 2) return adjustColorBrightness(podiumColors.bronze, isAthlete1 ? brightnessAdjustmentAthlete1 : brightnessAdjustmentAthlete2);
        return adjustColorBrightness(clubColors[sortedClubs[index]], isAthlete1 ? brightnessAdjustmentAthlete1 : brightnessAdjustmentAthlete2);
    };

    // Prepare data for Chart.js
    const athlete1Data = sortedClubs.map(club => clubData[club].athlete1);
    const athlete2Data = sortedClubs.map(club => clubData[club].athlete2);

    // Clear previous chart
    document.getElementById('charts-container').innerHTML = '';
    const chartCanvas = document.createElement('canvas');
    document.getElementById('charts-container').appendChild(chartCanvas);

    // Set canvas height based on screen size
    setCanvasHeight(chartCanvas);

    const ctx = chartCanvas.getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedClubs,
            datasets: [
                {
                    label: 'Athlete 1',
                    data: athlete1Data,
                    backgroundColor: sortedClubs.map((_, index) => getAthleteColor(index, true)) // Adjusted based on status
                },
                {
                    label: 'Athlete 2',
                    data: athlete2Data,
                    backgroundColor: sortedClubs.map((_, index) => getAthleteColor(index, false)) // Adjusted based on status
                }
            ]
        },
        options: getChartOptions()
    });
}

// Utility function to adjust color brightness
function adjustColorBrightness(color, percent) {
    const rgb = color.match(/\d+/g);
    const r = Math.min(255, Math.max(0, parseInt(rgb[0]) + percent * 255));
    const g = Math.min(255, Math.max(0, parseInt(rgb[1]) + percent * 255));
    const b = Math.min(255, Math.max(0, parseInt(rgb[2]) + percent * 255));
    return `rgb(${r},${g},${b})`;
}
