// create variable to hold db connection
let db;
// establish connection to IndexedDB called 'budget' and set to version 1
const request = indexedDB.open('budget', 1);

// this event will emit if the database version changes (non-existant to version 1, v2, etc.)
request.onupgradeneeded = function(event) {
    // save a reference to the database
    const db = event.target.result;
    // create an object store called 'new_transaction', set it to have an auto incrementing primary key
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// upon successful
request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradeneeded event above) or simply established a connection, save reference
    db = event.target.result;

    // check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// this function will be executed if we attempt to submit a new pizza and there is no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the object store for 'new_transaction'
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to your store with add method
    transactionObjectStore.add(record);
};

function uploadTransaction() {
    // open transaction on the db
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the object store
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // get all records from the store and set it to a variable
    const getAll = transactionObjectStore.getAll();

    // upon successful .getAll() execution, run this function
    getAll.onsuccess = function() {
        // if there was data in indexedDB's store, send it to the API server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                // open one more transaction
                const transaction = db.transaction(['new_transaction'], 'readwrite');
                // access the new_transaction object store
                const transactionObjectStore = transaction.objectStore('new_transaction');
                // clear all items in the store
                transactionObjectStore.clear();

                alert('All saved transactions have been submitted.');
            })
            .catch(err => {
                console.log(err);
            });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);