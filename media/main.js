let db;

const vscodeApi = acquireVsCodeApi();
const createOrOpenDB = indexedDB.open("code_memory", 1);

createOrOpenDB.addEventListener("error", () => {
  throw Error("Error opening DB!");
});

createOrOpenDB.addEventListener("success", () => {
  console.log("Successfully opened DB!");
  db = createOrOpenDB.result;
  showMemories();
});

createOrOpenDB.addEventListener("upgradeneeded", (init) => {
  db = init.target.result;

  db.onerror = () => {
    throw Error("Error loading database!");
  };

  const objectStore = db.createObjectStore("memories", {
    keyPath: "id",
    autoIncrement: true,
  });

  objectStore.createIndex("title", "title", { unique: false });
  objectStore.createIndex("description", "description", { unique: false });
});

const messageNotice = document.getElementById("notice");
const memoryContainer = document.getElementById("memory-container");
const memoryList = document.getElementById("memory-list");
const memoryItem = document.getElementById("memory-item");
const memoryTitleInputBox = document.getElementById("memory-title-box");
const memoryDescriptionInputBox = document.getElementById("memory-box");
const memoryButton = document.getElementById("memory-btn");
const errorMessage = document.createElement("p");

function addMemory() {
  if (
    memoryTitleInputBox.value === "".trim() &&
    memoryDescriptionInputBox.value === "".trim()
  ) {
    const message =
      "Adding memory failed - title or description input is/are empty!";
    vscodeApi.postMessage({ command: "addingAlert", alert: message });
    return;
  } else {
    const newMemory = {
      title: memoryTitleInputBox.value,
      description: memoryDescriptionInputBox.value,
    };
    const transaction = db.transaction(["memories"], "readwrite");
    const objectStore = transaction.objectStore("memories");
    const query = objectStore.add(newMemory);

    query.addEventListener("success", () => {
      memoryTitleInputBox.value = "";
      memoryDescriptionInputBox.value = "";
      showMemories();
    });

    transaction.addEventListener("error", () => {
      throw Error("DB: Transaction error!");
    });
  }
}

function showMemories() {
  const transaction = db.transaction(["memories"], "readonly");
  const objectStore = transaction.objectStore("memories");

  memoryList.innerHTML = "";

  objectStore.openCursor().onsuccess = function (event) {
    const cursor = event.target.result;
    if (cursor) {
      const listItem = document.createElement("li");
      const titleHeading = document.createElement("h3");
      const descriptionParagraph = document.createElement("p");
      const deleteButton = document.createElement("button");

      listItem.id = "memory-item";
      titleHeading.textContent = cursor.value.title;
      descriptionParagraph.textContent = cursor.value.description;
      deleteButton.textContent = "Remove";
      deleteButton.id = "remove-btn";

      listItem.appendChild(titleHeading);
      listItem.appendChild(descriptionParagraph);
      listItem.appendChild(deleteButton);

      memoryList.appendChild(listItem);

      listItem.setAttribute("data-id", cursor.value.id);

      deleteButton.addEventListener("click", deleteMemory);

      cursor.continue();
    } else {
      if (!memoryList.children[0]) {
        const listItem = document.createElement("li");
        listItem.textContent = "There are no memories";
        listItem.id = "memory-item";
        memoryList.appendChild(listItem);
      }
    }
  };
}

function deleteMemory(e) {
  const memoryId = Number(e.target.parentNode.getAttribute("data-id"));
  const transaction = db.transaction(["memories"], "readwrite");
  const objectStore = transaction.objectStore("memories");

  objectStore.delete(memoryId);
  transaction.addEventListener("complete", () => {
    e.target.parentNode.parentNode.removeChild(e.target.parentNode);
    showMemories();
    const message = `Memory with id: ${memoryId} - is successfully removed.`;
    vscodeApi.postMessage({ command: "deletionAlert", alert: message });
  });

  transaction.addEventListener("error", () => {
    throw Error("DB: Transaction error!");
  });
}

messageNotice.onclick = () => {
  messageNotice.className = "hidden";
  memoryContainer.classList.remove("hidden");
};

memoryButton.onclick = () => {
  addMemory();
};

window.addEventListener("message", (event) => {
  const { type } = event.data;

  if (type === "auto") {
    addMemoryFromEditor();
  }
});

function addMemoryFromEditor() {
  let newMemory = { title: "", description: "" };

  function handleMessage(event) {
    const { message, type } = event.data;
    switch (type) {
      case "title":
        newMemory.title = message;
        break;
      case "description":
        newMemory.description = message;
        break;
    }

    if (newMemory.title !== "" && newMemory.description !== "") {
      console.log("new memory: ", newMemory);
      const transaction = db.transaction(["memories"], "readwrite");
      const objectStore = transaction.objectStore("memories");
      const query = objectStore.add(newMemory);

      query.addEventListener("success", () => {
        showMemories();
      });

      transaction.addEventListener("error", () => {
        throw Error("DB: Transaction error!");
      });

      window.removeEventListener("message", handleMessage);
    }
  }

  window.addEventListener("message", handleMessage);
}
