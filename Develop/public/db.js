let db;
const request = indexedDB.open("budget", 1);

// Creates the objectStore when there is a new version of the DB is requested
request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    // Checks if application is online before the DB gets read
    if (navigator.online) {
        checkDB();
    }
};

// If there is an error with the request it is logged to the console
request.onerror = function (event) {
    console.log(event.target.error)
};

// Stores the transactions made when offline to the indexdb
function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
};

// Checks the indexdb for stored transactions and submits a post request to the mongoose db with the stored transactions
function checkDB() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "content-type": "application/json" 
                }
            })
            .then(response => response.json())
            .then(() => {
                // Deletes records in the indexdb if successful 
                const transaction = db.transaction(["pending"], "readwrite");
                const store = transaction.objectStore("pending");
                store.clear();
            });
        }
    };
};

// Listens for the application coming online
window.addEventListener("online", checkDB);
