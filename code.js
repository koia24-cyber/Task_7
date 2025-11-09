const task_name = document.getElementById("name_task");
const addButton = document.getElementById("add");
const taskList = document.querySelector(".my_list");

let currentFilter = "all";
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


addButton.onclick = () => {
    const text = task_name.value.trim();
    if (text) {
        tasks.push({ text, completed: false, timestamp: Date.now() });
        saveTasks();
        task_name.value = "";
        displayTasks();
    }
};

function addTask() {
    const text = task_name.value.trim();
    if (text === "") return;

    tasks.push({ text, completed: false });
    saveTasks();
    task_name.value = "";
    renderTasks();
}

task_name.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
});

function displayTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === "active") return !task.completed;
        if (currentFilter === "completed") return task.completed;
        return true; // "all"
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<p style="text-align:center;color:#999;">Нет задач</p>`;
        return;
    }

    filteredTasks.forEach((task, index) => {
        const taskEl = document.createElement("div");
        taskEl.className = "task-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => {
            tasks[index].completed = checkbox.checked;
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
            tasks.splice(index, 1);
            saveTasks();
            displayTasks();
        });

        taskEl.append(checkbox, taskText, deleteBtn);
        taskList.appendChild(taskEl);
    });
}

displayTasks();//для загрузки списка при открытии страницы