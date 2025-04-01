// Store country list (you can expand this list)
const countries = ["India", "USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "Brazil", "South Africa"];

// Fetch JSON Data
async function fetchSchemes() {
    let country = document.getElementById("countryInput").value.trim();
    
    if (!countries.includes(country)) {
        alert("Please enter a valid country.");
        return;
    }

    let response = await fetch("schemes.json");
    let data = await response.json();

    if (data[country]) {
        document.getElementById("countryTitle").innerText = `Government Schemes in ${country}`;
        
        // Display schemes
        let schemesList = document.getElementById("schemesList");
        schemesList.innerHTML = "";
        data[country].schemes.forEach(scheme => {
            let li = document.createElement("li");
            li.innerHTML = `<strong>${scheme.name}:</strong> ${scheme.description}`;
            schemesList.appendChild(li);
        });

        // Display crime laws
        document.getElementById("crimeLaws").innerText = data[country].crimeLaws;

        document.getElementById("results").style.display = "block";
    } else {
        alert("No data available for this country.");
    }
}

// Autocomplete Country Dropdown
function autocompleteCountry() {
    let input = document.getElementById("countryInput").value.toLowerCase();
    let suggestionsDiv = document.getElementById("suggestions");

    // Clear previous suggestions
    suggestionsDiv.innerHTML = "";

    if (input.length === 0) {
        suggestionsDiv.style.display = "none";
        return;
    }

    let filteredCountries = countries.filter(c => c.toLowerCase().startsWith(input));
    
    if (filteredCountries.length === 0) {
        suggestionsDiv.style.display = "none";
        return;
    }

    filteredCountries.forEach(country => {
        let div = document.createElement("div");
        div.classList.add("suggestion-item");
        div.innerText = country;
        div.onclick = function () {
            document.getElementById("countryInput").value = country;
            suggestionsDiv.style.display = "none";
        };
        suggestionsDiv.appendChild(div);
    });

    suggestionsDiv.style.display = "block";
}
