const task_name = document.getElementById("name_task");
const addButton = document.getElementById("add");
const taskList = document.querySelector(".my_list");
const sortSelect = document.getElementById("sort-select");

let currentFilter = "all";
let currentSort = "time-desc";
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask() {
    const text = task_name.value.trim();
    if (text === "") return;
    tasks.push({ text, completed: false });
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
        document.querySelectorAll(".filter-btn").forEach(b => b.style.background = "white");
        btn.style.background = "#ffb6c1";
        btn.style.color = "white";
        displayTasks();
    });
    btn.classList.add("filter-btn");
    filterBar.appendChild(btn);
});

const contentBlock = document.querySelector(".content-block:last-of-type");//для вставки объекта вверх блока списка
contentBlock.insertBefore(filterBar, taskList);

function sortTasks(list) {
    const copy = [...list];
    switch (currentSort) {
        case "time-desc": return copy;
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

function displayTasks() {
    const originalTasks = tasks;

    let filtered = tasks;
    if (currentFilter === "active") filtered = tasks.filter(t => !t.completed);
    else if (currentFilter === "completed") filtered = tasks.filter(t => t.completed);

    const sorted = sortTasks(filtered);

    taskList.innerHTML = "";
    if (sorted.length === 0) {
        taskList.innerHTML = `<p style="text-align:center;color:#999;">Нет задач</p>`;
        return;
    }

    sorted.forEach(task => {
        const realIndex = tasks.findIndex(t => t === task);
        if (realIndex === -1) return;

        const taskEl = document.createElement("div");
        taskEl.className = "task-item";

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

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "✕";
        deleteBtn.addEventListener("click", () => {
            tasks.splice(realIndex, 1);
            saveTasks();
            displayTasks();
        });

        taskEl.append(checkbox, taskText, deleteBtn);
        taskList.appendChild(taskEl);
    });
}

displayTasks();//для загрузки списка при открытии страницы