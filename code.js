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

function displayTasks() {
    
}