const locationData = {
    western: {
        colombo: ['Colombo 1', 'Colombo 2', 'Colombo 3', 'Colombo 4', 'Colombo 5', 'Colombo 6', 'Colombo 7', 'Colombo 8', 'Colombo 9', 'Colombo 10', 'Colombo 11', 'Colombo 12', 'Colombo 13', 'Colombo 14', 'Colombo 15', 'Dehiwala', 'Mount Lavinia', 'Moratuwa', 'Ratmalana', 'Sri Jayawardenepura Kotte', 'Maharagama', 'Kesbewa', 'Piliyandala', 'Nugegoda', 'Kottawa', 'Pannipitiya', 'Battaramulla', 'Rajagiriya', 'Nawala', 'Kotahena', 'Maradana', 'Bambalapitiya', 'Wellawatta', 'Kirulapone', 'Narahenpita'],
        gampaha: ['Gampaha', 'Negombo', 'Katunayake', 'Ja-Ela', 'Wattala', 'Kelaniya', 'Peliyagoda', 'Seeduwa', 'Liyanagemulla', 'Kandana', 'Ragama', 'Kiribathgoda', 'Delgoda', 'Kadawatha', 'Mahara', 'Dompe', 'Veyangoda', 'Mirigama', 'Minuwangoda', 'Divulapitiya', 'Nittambuwa', 'Ganemulla', 'Yakkala', 'Meerigama'],
        kalutara: ['Kalutara', 'Panadura', 'Horana', 'Beruwala', 'Aluthgama', 'Matugama', 'Wadduwa', 'Payagala', 'Maggona', 'Ingiriya', 'Bulathsinhala', 'Palindanuwara', 'Millaniya', 'Bandaragama', 'Dodangoda', 'Mathugama', 'Agalawatta', 'Baduraliya']
    },
    central: {
        kandy: ['Kandy', 'Gampola', 'Nawalapitiya', 'Wattegama', 'Harispattuwa', 'Peradeniya', 'Katugastota', 'Kundasale', 'Digana', 'Teldeniya', 'Udunuwara', 'Yatinuwara', 'Akurana', 'Kadugannawa', 'Pilimatalawa', 'Daulagala', 'Poojapitiya', 'Galaha', 'Deltota', 'Panvila'],
        matale: ['Matale', 'Dambulla', 'Sigiriya', 'Galewela', 'Ukuwela', 'Naula', 'Pallepola', 'Rattota', 'Yatawatta', 'Laggala', 'Wilgamuwa', 'Rajakadaluwa', 'Ambanganga Korale'],
        'nuwara-eliya': ['Nuwara Eliya', 'Hatton', 'Talawakele', 'Bandarawela', 'Welimada', 'Ragala', 'Ginigathena', 'Kotagala', 'Maskeliya', 'Bogawantalawa', 'Agarapathana', 'Ambagamuwa', 'Kotmale', 'Walapane', 'Hanguranketha']
    },
    southern: {
        galle: ['Galle', 'Ambalangoda', 'Hikkaduwa', 'Bentota', 'Baddegama', 'Elpitiya', 'Karapitiya', 'Unawatuna', 'Koggala', 'Ahangama', 'Balapitiya', 'Induruwa', 'Kosgoda', 'Rathgama', 'Habaraduwa', 'Yakkalamulla', 'Neluwa', 'Nagoda', 'Imaduwa'],
        matara: ['Matara', 'Weligama', 'Mirissa', 'Akuressa', 'Hakmana', 'Deniyaya', 'Kamburupitiya', 'Devinuwara', 'Dickwella', 'Gandara', 'Kotapola', 'Malimbada', 'Pitabeddara', 'Thihagoda', 'Kirinda', 'Mulatiyana'],
        hambantota: ['Hambantota', 'Tangalle', 'Tissamaharama', 'Ambalantota', 'Beliatta', 'Weeraketiya', 'Kataragama', 'Kirinda', 'Bundala', 'Sooriyawewa', 'Lunugamvehera', 'Okewela', 'Ranna', 'Rekawa']
    },
    northern: {
        jaffna: ['Jaffna', 'Chavakachcheri', 'Point Pedro', 'Karainagar', 'Velanai', 'Nallur', 'Kopay', 'Tellippalai', 'Sandilipay', 'Delft', 'Kayts', 'Punkudutivu', 'Analativu'],
        kilinochchi: ['Kilinochchi', 'Pallai', 'Paranthan', 'Poonakary', 'Kandavalai', 'Akkarayankulam'],
        mannar: ['Mannar', 'Nanattan', 'Madhu', 'Pesalai', 'Erukkalampiddy', 'Thalvupadu', 'Adampan'],
        vavuniya: ['Vavuniya', 'Nedunkeni', 'Settikulam', 'Omanthai', 'Cheddikulam', 'Vengalacheddikulam'],
        mullaitivu: ['Mullaitivu', 'Oddusuddan', 'Puthukudiyiruppu', 'Weli Oya', 'Maritimepattu', 'Thunukkai']
    },
    eastern: {
        trincomalee: ['Trincomalee', 'Kinniya', 'Mutur', 'Kuchchaveli', 'Nilaveli', 'Uppuveli', 'Kantale', 'Seruvila', 'Gomarankadawala', 'Thambalagamuwa'],
        batticaloa: ['Batticaloa', 'Kaluwanchikudy', 'Valachchenai', 'Eravur', 'Kattankudy', 'Oddamavadi', 'Chenkalady', 'Kiran', 'Koralaipattu', 'Manmunai North', 'Manmunai South West', 'Manmunai West', 'Porativu Pattu'],
        ampara: ['Ampara', 'Kalmunai', 'Akkaraipattu', 'Sainthamaruthu', 'Addalachchenai', 'Nintavur', 'Sammanthurai', 'Karaitivu', 'Navagirinagar', 'Thirukovil', 'Pottuvil', 'Lahugala', 'Mahaoya', 'Padiyathalawa', 'Damana', 'Navithanveli']
    },
    'north-western': {
        kurunegala: ['Kurunegala', 'Kuliyapitiya', 'Narammala', 'Wariyapola', 'Pannala', 'Melsiripura', 'Bingiriya', 'Nikaweratiya', 'Galgamuwa', 'Giribawa', 'Ibbagamuwa', 'Mawathagama', 'Kobeigane', 'Polpithigama', 'Rideegama', 'Ambanpola', 'Bamunakotuwa'],
        puttalam: ['Puttalam', 'Chilaw', 'Wennappuwa', 'Nattandiya', 'Dankotuwa', 'Marawila', 'Madampe', 'Anamaduwa', 'Pallama', 'Karukupone', 'Kalpitiya', 'Mundel']
    },
    'north-central': {
        anuradhapura: ['Anuradhapura', 'Kekirawa', 'Thambuttegama', 'Eppawala', 'Medawachchiya', 'Galenbindunuwewa', 'Mihintale', 'Nochchiyagama', 'Galnewa', 'Nachchaduwa', 'Rambewa', 'Mahawilachchiya', 'Padaviya', 'Horowpothana', 'Kebithigollewa', 'Rajanganaya', 'Talawa', 'Thirappane', 'Kahatagasdigiliya'],
        polonnaruwa: ['Polonnaruwa', 'Kaduruwela', 'Medirigiriya', 'Hingurakgoda', 'Dimbulagala', 'Lankapura', 'Welikanda', 'Elahera', 'Aralaganwila', 'Manampitiya', 'Bakamuna', 'Somawathiya', 'Thamankaduwa']
    },
    uva: {
        badulla: ['Badulla', 'Bandarawela', 'Ella', 'Haputale', 'Welimada', 'Mahiyanganaya', 'Diyatalawa', 'Hali-Ela', 'Passara', 'Lunugala', 'Meegahakiula', 'Soranathota', 'Uva Paranagama', 'Rideemaliyadda', 'Kandaketiya', 'Girandurukotte'],
        monaragala: ['Monaragala', 'Wellawaya', 'Bibile', 'Buttala', 'Kataragama', 'Medagama', 'Madulla', 'Sevanagala', 'Thanamalwila', 'Siyambalanduwa', 'Badalkumbura']
    },
    sabaragamuwa: {
        ratnapura: ['Ratnapura', 'Embilipitiya', 'Balangoda', 'Pelmadulla', 'Kuruwita', 'Eheliyagoda', 'Godakawela', 'Kahawatta', 'Kalawana', 'Kolonne', 'Nivitigala', 'Opanayaka', 'Weligepola', 'Ayagama', 'Imbulpe', 'Palmadulla'],
        kegalle: ['Kegalle', 'Mawanella', 'Warakapola', 'Rambukkana', 'Yatiyantota', 'Kitulgala', 'Dehiowita', 'Galigamuwa', 'Ruwanwella', 'Bulathkohupitiya', 'Aranayaka', 'Deraniyagala']
    }
};

window.locationData = locationData;