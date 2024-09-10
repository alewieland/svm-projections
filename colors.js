// colors.js

const clubColorClasses = {
    "LCZ": 'team-color-lcz',
    "STB": 'team-color-stb',
    "LG Züri +": 'team-color-lgzuri',
    "LG Basel Regio": 'team-color-lgregio',
    "LC Schaffhausen": 'team-color-lcs',
    "Stade Gèneve": 'team-color-stadeg',
    "COA Valais Romand": 'team-color-coa',
    "LG Thun": 'team-color-lgt',
    "LV Winterthur": 'team-color-lvw',
    "LG LZO": 'team-color-lglzo',
    "BTV Aarau": 'team-color-btva',
    "LG Oberthurgau": 'team-color-lgot'
};

// Podium color classes
const podiumColorClasses = {
    gold: 'podium-color-gold',
    silver: 'podium-color-silver',
    bronze: 'podium-color-bronze'
};

// Function to get the appropriate colors
function getBarColor(index) {
    if (index === 0) return podiumColorClasses.gold; // Gold
    if (index === 1) return podiumColorClasses.silver; // Silver
    if (index === 2) return podiumColorClasses.bronze; // Bronze

    const club = sortedClubs[index];
    return clubColorClasses[club]; // Return the CSS class for the club color
}

// Function to create the team color overview dynamically
function createTeamColorOverview(clubNames, containerId) {
    const container = document.getElementById(containerId);
    clubNames.forEach(club => {
        const listItem = document.createElement('li');
        listItem.className = 'team-color-item';
        
        const colorBox = document.createElement('span');
        colorBox.className = `team-color-box ${clubColorClasses[club]}`; // Use the CSS class for background color
        listItem.appendChild(colorBox);
        
        const label = document.createElement('span');
        label.textContent = ` ${club}`;
        listItem.appendChild(label);

        container.appendChild(listItem);
    });
}
