const userList = document.getElementById('user-list');
const genderFilter = document.getElementById('gender-filter');
const countryFilter = document.getElementById('country-filter');
let allUsers = []; // Przechowuje wszystkich użytkowników

function fetchUsers() {
    fetch('https://randomuser.me/api/?results=20') // Zwiększamy liczbę użytkowników
        .then(response => response.json())
        .then(data => {
            allUsers = data.results;
            updateCountryFilter(allUsers);
            filterUsers();
        });
}

function updateCountryFilter(users) {
    const countries = [...new Set(users.map(user => user.location.country))].sort();
    countryFilter.innerHTML = '<option value="all">Wszystkie kraje</option>';
    countries.forEach(country => {
        countryFilter.innerHTML += `<option value="${country}">${country}</option>`;
    });
}

function filterUsers() {
    const selectedGender = genderFilter.value;
    const selectedCountry = countryFilter.value;

    const filteredUsers = allUsers.filter(user => {
        const matchGender = selectedGender === 'all' || user.gender === selectedGender;
        const matchCountry = selectedCountry === 'all' || user.location.country === selectedCountry;
        return matchGender && matchCountry;
    });

    displayUsers(filteredUsers);
}

function displayUsers(users) {
    userList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.className = 'user-card';
        li.innerHTML = `
            <div class="card-basic-info">
                <img src="${user.picture.large}" alt="User photo">
                <h2>${user.name.first} ${user.name.last}</h2>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Location:</strong> ${user.location.city}, ${user.location.country}</p>
                <button class="details-btn">Pokaż więcej</button>
            </div>
            <div class="card-details hidden">
                <p><strong>Telefon:</strong> ${user.phone}</p>
                <p><strong>Data urodzenia:</strong> ${new Date(user.dob.date).toLocaleDateString()}</p>
                <p><strong>Wiek:</strong> ${user.dob.age} lat</p>
                <p><strong>Adres:</strong> ${user.location.street.name} ${user.location.street.number}</p>
                <p><strong>Kod pocztowy:</strong> ${user.location.postcode}</p>
                <p><strong>Stan/Region:</strong> ${user.location.state}</p>
            </div>
        `;

        const detailsBtn = li.querySelector('.details-btn');
        const cardDetails = li.querySelector('.card-details');

        detailsBtn.addEventListener('click', () => {
            cardDetails.classList.toggle('hidden');
            detailsBtn.textContent = cardDetails.classList.contains('hidden') ? 'Pokaż więcej' : 'Pokaż mniej';
        });

        userList.appendChild(li);
    });
}

function exportToCSV(users) {
    // Definiujemy nagłówki
    const headers = [
        'Imię',
        'Nazwisko',
        'Email',
        'Płeć',
        'Miasto',
        'Kraj',
        'Telefon',
        'Data urodzenia',
        'Wiek',
        'Ulica',
        'Kod pocztowy'
    ].join(',');

    // Przygotowujemy dane
    const csvRows = users.map(user => {
        return [
            user.name.first,
            user.name.last,
            user.email,
            user.gender === 'female' ? 'Kobieta' : 'Mężczyzna',
            user.location.city,
            user.location.country,
            user.phone,
            new Date(user.dob.date).toLocaleDateString(),
            user.dob.age,
            `${user.location.street.name} ${user.location.street.number}`,
            user.location.postcode
        ].join(',');
    });

    // Łączymy wszystko w jeden string CSV
    const csvString = [headers, ...csvRows].join('\n');

    // Tworzymy blob i link do pobrania
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Ustawiamy nazwę pliku z aktualną datą
    const date = new Date().toISOString().slice(0,10);
    link.setAttribute('href', url);
    link.setAttribute('download', `users-export-${date}.csv`);
    
    // Symulujemy kliknięcie i czyścimy
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event Listeners
document.getElementById('refresh-btn').addEventListener('click', fetchUsers);
genderFilter.addEventListener('change', filterUsers);
countryFilter.addEventListener('change', filterUsers);
document.getElementById('export-btn').addEventListener('click', () => {
    // Eksportujemy aktualnie wyfiltrowane dane
    const currentlyDisplayedUsers = allUsers.filter(user => {
        const selectedGender = genderFilter.value;
        const selectedCountry = countryFilter.value;
        const matchGender = selectedGender === 'all' || user.gender === selectedGender;
        const matchCountry = selectedCountry === 'all' || user.location.country === selectedCountry;
        return matchGender && matchCountry;
    });
    exportToCSV(currentlyDisplayedUsers);
});

// Inicjalne załadowanie
fetchUsers();