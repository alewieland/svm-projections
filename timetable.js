// Google Sheets API settings
const sheetId = '1KRsABdUN_udlAde7TE5aIrYHQ9-2HbnHwlHQTrN-R4E';  
const apiKey = 'AIzaSyCQtpGO-z7Nh2bzQXMT4PIs3qviIqNeVIo';    

let sheetData = [];
// script.js

// timetable.js

// Function to get the league from the cookie
function getLeague() {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; league=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return 'nla'; // Default to NLA
}

// Get the current league
const league = getLeague();

// Update API URLs based on the league
const sheetNameMen = league === 'nlb' ? 'men_nlb' : 'men';
const sheetNameWomen = league === 'nlb' ? 'women_nlb' : 'women';

const apiUrlMen = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetNameMen}?key=${apiKey}`;
const apiUrlWomen = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetNameWomen}?key=${apiKey}`;

// Fetch data from Google Sheets for the timetable
function fetchTimetable(apiUrl, targetElementId) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const sheetData = data.values;
            populateTimetable(sheetData, targetElementId);
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Populate the timetable on the landing page
function populateTimetable(data, targetElementId) {
    const timetableBody = document.getElementById(targetElementId);

    data.slice(1).forEach(row => {
        const time = row[0];
        const discipline = row[1];
        const status = row[2];

        const rowElement = document.createElement('tr');
        rowElement.innerHTML = `
            <td>${time}</td>
            <td>${discipline}</td>
            <td>${status}</td>
        `;
        timetableBody.appendChild(rowElement);
    });
}

// Call fetchTimetable for both men’s and women’s timetables when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchTimetable(apiUrlMen, 'timetable-body-men');
    fetchTimetable(apiUrlWomen, 'timetable-body-women');
});
