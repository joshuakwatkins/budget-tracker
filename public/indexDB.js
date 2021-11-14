const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
  let db = target.result;
  db.createObjectStore("toStore", { autoIncrement: true });
};

request.onerror = ({ target }) => console.log(target.errorCode);

request.onsuccess = ({ target }) => {
  db = target.result;
  if (navigator.onLine) {
    readData();
  }
};

const pendingSave = (monies) => {
  const ledgerUpdate = db.transaction(["toStore"], "readwrite");
  const storage = ledgerUpdate.objectStore("toStore");
  storage.add(monies);
};

const readData = () => {
  const ledger = db.transaction(["toStore"], "readwrite");
  const storage = ledger.objectStore("toStore");
  const readAll = storage.getAll();
  readAll.onsuccess = () => {
    if (readAll.result.length >= 1) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(readAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then(() => {
          const ledger = db.transaction(["toStore"], "readwrite");
          const storage = ledger.objectStore("toStore");
          storage.clear();
        });
    }
  };
};

window.addEventListener("online", readData);
