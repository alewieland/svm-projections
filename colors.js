const clubColors = {
    "LCZ": 'rgb(50, 55, 60)',        // Blue
    "STB": 'rgb(255, 99, 132)',      // Red
    "LG Züri +": 'rgb(255, 206, 86)', // Yellow
    "LG Basel Regio": 'rgb(75, 192, 192)', // Teal
    "LC Schaffhausen": 'rgb(153, 102, 255)', // Purple
    "Stade Gèneve": 'rgb(255, 159, 64)', // Orange
    "COA Valais Romand": 'rgb(54, 162, 235)', // Blue
    "LG Thun": 'rgb(255, 206, 86)', // Yellow
    "LV Winterthur": 'rgb(50, 55, 60)', // Blue
    "LG LZO": 'rgb(50, 55, 60)', // Blue
    "BTV Aarau": 'rgb(255, 99, 132)', // Red
    "LG Oberthurgau": 'rgb(255, 99, 132)', // Red
};

// Colors for first, second, and third positions
const podiumColors = {
    gold: 'rgb(255, 215, 0)',     // Gold
    silver: 'rgb(192, 192, 192)', // Silver
    bronze: 'rgb(205, 127, 50)'   // Bronze
};

// Function to get the appropriate colors
function getBarColor(index) {
    if (index === 0) return podiumColors.gold; // Gold
    if (index === 1) return podiumColors.silver; // Silver
    if (index === 2) return podiumColors.bronze; // Bronze

    const club = sortedClubs[index];
    return clubColors[club]; // Return the main color
}
