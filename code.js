const task_name = document.getElementById("name_task");
const addButton = document.getElementById("add");
const tasks_block = document.getElementById("tasks_block");
const eduBlock = document.getElementById("tasks_edu");
const homeBlock = document.getElementById("tasks_home");
const workBlock = document.getElementById("tasks_work");

const sortSelect = document.getElementById("sort-select");

let currentFilter = "all";
let currentSort = "time-desc";
let draggedIndex = -1;
let draggedCategory = null;

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
    const text = task_name.value.trim();
    if (text === "") return;
    tasks.push({ text, completed: false, type: "edu", timestamp: Date.now()});
    saveTasks();
    task_name.value = "";
    displayTasks();
}

addButton.addEventListener("click", addTask);
task_name.addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
});

const filterBar = document.createElement("div");
filterBar.style.display = "flex";
filterBar.style.gap = "10px";
filterBar.style.marginBottom = "20px";
filterBar.style.justifyContent = "center";

["all", "active", "completed"].forEach(filter => {
    const btn = document.createElement("button");
    btn.textContent = filter === "all" ? "Все" : filter === "active" ? "В процессе" : "Выполнено";
    btn.style.padding = "8px 16px";
    btn.style.border = "2px solid #ffb6c1";
    btn.style.borderRadius = "20px";
    btn.style.background = currentFilter === filter ? "#ffb6c1" : "white";
    btn.style.color = currentFilter === filter ? "white" : "#8a3a6b";
    btn.style.cursor = "pointer";
    btn.style.transition = "all 0.2s";
    btn.addEventListener("click", () => {
        currentFilter = filter;
        document.querySelectorAll(".filter-btn").forEach(b => {
            b.style.background = "white";
            b.style.color = "#8a3a6b";
        });
        btn.style.background = "#ffb6c1";
        btn.style.color = "white";
        displayTasks();
    });
    btn.classList.add("filter-btn");
    filterBar.appendChild(btn);
});

const contentBlock = document.querySelector(".content-block:last-of-type");
contentBlock.insertBefore(filterBar, document.querySelector(".my_list"));

function sortTasks(list) {
    const copy = [...list];
    switch (currentSort) {
         case "time-desc": return copy.sort((a, b) => a.timestamp - b.timestamp);
        case "time-asc": return copy.reverse();
        case "alpha-asc": return copy.sort((a, b) => a.text.localeCompare(b.text, 'ru'));
        case "alpha-desc": return copy.sort((a, b) => b.text.localeCompare(a.text, 'ru'));
        case "completed-first": return copy.sort((a, b) => b.completed - a.completed);
        case "active-first": return copy.sort((a, b) => a.completed - b.completed);
        default: return copy;
    }
}

sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    displayTasks();
});

function getCategoryBlock(category) {
    switch(category) {
        case "edu": return eduBlock;
        case "home": return homeBlock;
        case "work": return workBlock;
        default: return eduBlock;
    }
}

function displayTasks() {
    let filtered = tasks;
    if (currentFilter === "active") filtered = tasks.filter(t => !t.completed);
    else if (currentFilter === "completed") filtered = tasks.filter(t => t.completed);

    const sorted = sortTasks(filtered);

    eduBlock.innerHTML = "📚";
    homeBlock.innerHTML = "🏠";
    workBlock.innerHTML = "💼";

    sorted.forEach((task, idx) => {
        const realIndex = tasks.findIndex(t => t === task);
        if (realIndex === -1) return;

        const taskEl = document.createElement("div");
        taskEl.draggable = true;
        taskEl.dataset.index = realIndex;
        taskEl.dataset.category = task.type || "edu";

        taskEl.className = "task-item";
        taskEl.style.display = "flex";
        taskEl.style.alignItems = "center";
        taskEl.style.gap = "8px";
        taskEl.style.padding = "6px 10px";
        taskEl.style.margin = "4px 0";
        taskEl.style.borderRadius = "6px";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => {
            tasks[realIndex].completed = checkbox.checked;
            saveTasks();
            displayTasks();
        });

        const taskText = document.createElement("span");
        taskText.textContent = task.text;
        if (task.completed) {
            taskText.style.textDecoration = "line-through";
            taskText.style.color = "#999";
        }
        taskText.style.flex = "1";

        const input_edit = document.createElement("input");
        input_edit.type = "text";
        input_edit.value = task.text;
        input_edit.style.display = "none";
        input_edit.style.border = "1px solid #ccc";
        input_edit.style.padding = "2px 6px";
        input_edit.style.color = "black";
        input_edit.style.width = "120px";
        input_edit.style.borderRadius = "4px";

        input_edit.addEventListener("keydown", e => {
            if (e.key === "Enter") {
                const newText = input_edit.value.trim();
                if (newText !== "") {
                    tasks[realIndex].text = newText;
                    saveTasks();
                }
                taskText.textContent = tasks[realIndex].text;
                taskText.style.display = "inline";
                input_edit.style.display = "inline-block";
                input_edit.style.display = "none";
            } else if (e.key === "Escape") {
                input_edit.value = tasks[realIndex].text;
                taskText.style.display = "inline";
                input_edit.style.display = "none";
            }
        });

        input_edit.addEventListener("blur", () => {
            const newText = input_edit.value.trim();
            if (newText !== "") {
                tasks[realIndex].text = newText;
                saveTasks();
            }
            taskText.textContent = tasks[realIndex].text;
            taskText.style.display = "inline";
            input_edit.style.display = "none";
        });

        const btnedit = document.createElement("button");
        btnedit.textContent = "✎";
        btnedit.style.width = "24px";
        btnedit.style.height = "24px";
        btnedit.style.borderRadius = "50%";
        btnedit.style.border = "1px solid #aaa";
        btnedit.style.background = "grey";
        btnedit.style.cursor = "pointer";
        btnedit.style.fontSize = "12px";
        
        btnedit.addEventListener("click", () => {
            input_edit.value = tasks[realIndex].text;
            taskText.style.display = "none";
            input_edit.style.display = "inline-block";
            input_edit.focus();
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "✕";
        deleteBtn.style.width = "24px";
        deleteBtn.style.height = "24px";
        deleteBtn.style.borderRadius = "50%";
        deleteBtn.style.border = "1px solid #ff6b6b";
        deleteBtn.style.background = "white";
        deleteBtn.style.color = "#ff6b6b";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.fontSize = "14px";
        
        deleteBtn.addEventListener("click", () => {
            tasks.splice(realIndex, 1);
            saveTasks();
            displayTasks();
        });

        taskEl.append(checkbox, taskText, input_edit, btnedit, deleteBtn);

        const category = task.type || "edu";
        const targetBlock = getCategoryBlock(category);
        targetBlock.appendChild(taskEl);
    });
}

tasks_block.addEventListener("dragstart", (evt) => {
    if (!evt.target.classList.contains("task-item")) return;
    draggedIndex = parseInt(evt.target.dataset.index);
    draggedCategory = evt.target.dataset.category;
    evt.target.classList.add("selected");
    evt.dataTransfer.effectAllowed = "move";
});

tasks_block.addEventListener("dragover", (evt) => {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = "move";
});

tasks_block.addEventListener("dragenter", (evt) => {
    if (evt.target.classList.contains("block_tasks")) {
        evt.target.style.backgroundColor = "#ffccdd";
    }
});

tasks_block.addEventListener("dragleave", (evt) => {
    if (evt.target.classList.contains("block_tasks")) {
        evt.target.style.backgroundColor = "";
    }
});

tasks_block.addEventListener("drop", (evt) => {
    evt.preventDefault();
    if (!evt.target.classList.contains("block_tasks")) return;

    const targetCategory = evt.target.dataset.category;
    if (draggedIndex !== -1 && targetCategory && tasks[draggedIndex]) {
        tasks[draggedIndex].type = targetCategory;
        saveTasks();
    }

    evt.target.style.backgroundColor = "";
    displayTasks();
});

tasks_block.addEventListener("dragend", (evt) => {
    if (evt.target.classList.contains("task-item")) {
        evt.target.classList.remove("selected");
    }
    draggedIndex = -1;
    draggedCategory = null;
});

displayTasks();