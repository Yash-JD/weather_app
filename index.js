const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");

const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const notFound = document.querySelector('.errorContainer');
const errorText = document.querySelector('[data-errorText]');
const errorImage = document.querySelector('[data-errorImg]');

// initially variables needed are
// When user enter or refresh it opens userTab 

let currentTab = userTab;
const API_KEY = "abe74668cb5495b8b5bb8d7dd9d077d4";
currentTab.classList.add("current-tab");    // adds css property (line 3)
getfromSessionStorage();


// functions when user clicks diffrent tabs

function switchTab(clickedTab) {
    if(clickedTab != currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");
        
        // if searchTab is not active or invisible, then activate it
        if(!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            // if userTab is not active or invisible then activate it
            searchForm.classList.remove("active");
            userInfoContainer.classList.add("active");
            // if you get in your weather tab, then you need to display the current weather, so let's check local storage first
            // for coordinates if we have saved them there.
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // pass clicked tab as input parameter
    switchTab(searchTab);
});

// check if the coordinates are already present in the local storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        // if coordinates are not present means that grant is not accessed, so display the grant access container
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

// we are calling API call, so use async function
async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    
    // make grant container invisible
    grantAccessContainer.classList.remove("active");
    
    // make loader visible
    loadingScreen.classList.add("active"); 
    
    // API Call
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await response.json();
        
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        notFound.classList.add('active');
        errorImage.style.display = 'none';
        errorText.innerText = `Error: ${err?.message}`;
    }
}

function renderWeatherInfo(weatherInfo) {
    
    // first fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert("No geolocaion support available!");
    }
}

function showPosition(position) {
    
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    
    // now store this coordinates in the local / session storage with name user-coordinates
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    
    // now show them on UI, so fetch the coordinates
    fetchUserWeatherInfo(userCoordinates);
}

// add event listener to the grant access button
const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

// add event listerner to the search form
const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if(searchInput.value === "") {
        return;
    }
    fetchSearchWeatherInfo(searchInput.value);
    searchInput.value = "";
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFound.classList.remove("active");
    
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch (err) {   
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.remove('active');
        notFound.classList.add('active');
        errorText.innerText = `${err?.message}`;
    }
}


