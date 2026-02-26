let date = new Date();
let dateString = `${date.getDate()}-${date.getMonth()+1}-${date.getFullYear()}`;
let timeout = null;

// പേജ് ലോഡ് ആകുമ്പോൾ ലൊക്കേഷൻ പരിശോധിക്കുന്നു
window.onload = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        showError();
    }
};

function showPosition(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    let url = `https://api.aladhan.com/v1/timings/${dateString}?latitude=${lat}&longitude=${lon}&method=2`;
    fetchData(url, "📍 നിങ്ങളുടെ ലൊക്കേഷൻ കണ്ടെത്തി");
}

function showError(error) {
    document.getElementById("location-msg").innerHTML = "📍 ലൊക്കേഷൻ ലഭ്യമല്ല. ദയവായി സ്ഥലം ടൈപ്പ് ചെയ്യുക.";
}

// ടൈപ്പ് ചെയ്യുമ്പോൾ സ്ഥലങ്ങൾ സജസ്റ്റ് ചെയ്യുന്നു
function getSuggestions() {
    clearTimeout(timeout);
    let query = document.getElementById("cityInput").value;
    let suggestionsBox = document.getElementById("suggestions");

    if (!suggestionsBox) return;

    if (query.length < 3) {
        suggestionsBox.style.display = "none";
        return;
    }

    timeout = setTimeout(() => {
        let url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                suggestionsBox.innerHTML = "";
                if (data.length > 0) {
                    data.forEach(place => {
                        let li = document.createElement("li");
                        li.innerText = place.display_name;
                        
                        li.onclick = function() {
                            document.getElementById("cityInput").value = place.display_name;
                            suggestionsBox.style.display = "none";
                            fetchByAddress();
                        };
                        suggestionsBox.appendChild(li);
                    });
                    suggestionsBox.style.display = "block";
                } else {
                    suggestionsBox.style.display = "none";
                }
            }).catch(err => console.log(err));
    }, 500);
}

// പുറത്ത് ക്ലിക്ക് ചെയ്താൽ സജഷൻ ബോക്സ് മറയുന്നു
document.addEventListener("click", function(e) {
    let suggestionsBox = document.getElementById("suggestions");
    if(suggestionsBox && e.target.id !== "cityInput") {
        suggestionsBox.style.display = "none";
    }
});

// തിരഞ്ഞെടുത്ത അഡ്രസ്സ് വെച്ച് സമയം കണ്ടെത്തുന്നു
function fetchByAddress() {
    let address = document.getElementById("cityInput").value;
    if (address === "") {
        alert("ദയവായി സ്ഥലത്തിന്റെ പേര് നൽകുക!");
        return;
    }
    document.getElementById("location-msg").innerHTML = "സമയം ലോഡ് ചെയ്യുന്നു...";
    let url = `https://api.aladhan.com/v1/timingsByAddress/${dateString}?address=${address}&method=2`;
    fetchData(url, `📍 തിരഞ്ഞെടുത്ത സ്ഥലം: ${address.split(',')[0]}`);
}

// API-ൽ നിന്നും ഡാറ്റ എടുത്ത് സ്ക്രീനിൽ കാണിക്കുന്നു
function fetchData(url, successMessage) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if(data.code === 200) {
                let times = data.data.timings;
                document.getElementById("fajr").innerText = times.Fajr;
                document.getElementById("dhuhr").innerText = times.Dhuhr;
                document.getElementById("asr").innerText = times.Asr;
                document.getElementById("maghrib").innerText = times.Maghrib;
                document.getElementById("isha").innerText = times.Isha;
                
                document.getElementById("location-msg").innerHTML = successMessage;
                document.getElementById("prayer-times").style.display = "block";
            } else {
                document.getElementById("location-msg").innerHTML = "❌ സ്ഥലം കണ്ടെത്താനായില്ല.";
            }
        })
        .catch(error => {
            document.getElementById("location-msg").innerHTML = "❌ ഡാറ്റ ലോഡ് ചെയ്യുന്നതിൽ പിശക്.";
        });
      }
              
