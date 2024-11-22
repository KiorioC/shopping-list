const spezial = "Marco";
function spezialFunc() {
    document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
                <img src="svg/marco.png" alt="Marco" style="max-width: 100%; max-height: 100%;">
            </div>
        `;
}



class Task {
    actions = [];
    #isInEditing = false;

    constructor(id, title, isMovable, isEditable, isDeletable) {
        this.title = title;
        this.id = id;
        this.isMovable = isMovable;

        if (isMovable)
            this.actions.push(new Action("up", "up", this)
                            , new Action("down", "down", this));
        if (isEditable)
            this.actions.push(new Action("edit", "edit", this));
        if (isDeletable)
            this.actions.push(new Action("delete", "delete", this));
    }

    get onEditMode() {
        return this.#isInEditing
    }

    setEditMode(editMode) {
        this.#isInEditing = editMode;
    }

    setTitle(newTitle) {
        this.title = newTitle;
    }

    render(index, totalTasks){
        return `
        <div data-task-id="${this.id}" class="task">
            <div class="title">
                ${
            this.#isInEditing
                ? `<input id="input-${this.id}" data-task-id="${this.id}" type="text" value="${this.title}">`
                : this.title
        }
            </div>
            <div class="actions">
                ${this.actions
            .map(action => {
                if (action.className === "up" && index === 0) {
                    return action.render({ disabled: true });
                }
                if (action.className === "down" && index === totalTasks - 1) {
                    return action.render({ disabled: true });
                }
                return action.render({ disabled: false });
            })
            .join("")}
            </div>
        </div>
        `;
    }
}

class Action {
    constructor(imageName, className, task) {
        this.imageName = imageName;
        this.className = className;
        this.task = task;
    }

    render({ disabled }) {
        return `
        <span class="${this.className.toLowerCase()}">
            <img
                data-type="${this.imageName}"
                data-task-id="${this.task.id}"
                src="svg/${this.imageName.toLowerCase()}.svg"
                alt="${this.imageName}"
                style="width: 1rem; height: 1rem; ${disabled ? "filter: grayscale(100%); opacity: 0.5; cursor: not-allowed;" : ""}"
            />
        </span>
        `;
    }
}

class TaskManager {
    #tasks = [];

    constructor(htmlElementId) {
        this.htmlElement = document.getElementById(htmlElementId)
    }

    render() {
        this.htmlElement.innerHTML = this.#tasks
            .map((task, index) => task.render(index, this.#tasks.length))
            .join("");
    }

    addTask(newTask) {
        if (this.#tasks.find(task => task.title === newTask.title))
            return alert("This task already exists!");

        this.#tasks.push(newTask);
        this.render();
    }

    resetTasks() {
        this.#tasks = [];
        this.render();
    }

    deleteTask(taskId) {
        console.log("Task ID to delete:", taskId);
        console.log("Tasks before deletion:", this.#tasks);
        this.#tasks = this.#tasks.filter(task => task.id !== taskId);
        console.log("Tasks after deletion:", this.#tasks);
        this.render();
    }

    setEditingTask(taskId) {
        console.log("Task ID to StartEdit:", taskId);

        this.#tasks.forEach(task => {
            if (task.onEditMode && task.id !== taskId) {
                task.setEditMode(false);
            }
        });

        const taskToEdit = this.#tasks.find(task => task.id === taskId);
        if (!taskToEdit) return;

        taskToEdit.setEditMode(true);
        this.render();

        const inputElement = document.getElementById(`input-${taskId}`);
        if (inputElement) inputElement.focus()

    }

    editTask(taskId ,event) {
        console.log("Task ID to edit:", taskId);
        console.log("event.target.value", event.target.value);

        const taskToEdit = this.#tasks.find(task => task.id === taskId);
        if (!taskToEdit) return;

        const newTitle = event.target.value;
        const isExisting = this.#tasks.find(task => task.title === newTitle && task.id !== taskId);

        if (isExisting) return alert("This task already exists!");

        taskToEdit.setTitle(newTitle)
        taskToEdit.setEditMode(false);
        this.render();
    }

    moveTask(taskId , actionType) {
        console.log("Task ID to move:", taskId);
        console.log("Action to do:", actionType);
        const taskIndex = this.#tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) return;

        switch (actionType) {
            case "up":
                if (taskIndex === 0) return console.log("Task is already at the top, cannot move up.");

                const taskToMoveUp = this.#tasks.splice(taskIndex, 1)[0];
                this.#tasks.splice(taskIndex - 1, 0, taskToMoveUp);
                this.render();
                break;

            case "down":
                if (taskIndex === this.#tasks.length - 1) return console.log("Task is already at the bottom, cannot move down.");

                const taskToMoveDown = this.#tasks.splice(taskIndex, 1)[0];
                this.#tasks.splice(taskIndex + 1, 0, taskToMoveDown);
                this.render();
                break;
        }
    }

    getId() {
        return this.#tasks.length;
    }
}


// Main Flow
const resetButton = document.getElementById("reset");
const addButton = document.getElementById("add");
const taskTitle = document.getElementById("task");
const elementId = "tasks";
const taskManagerElement = document.getElementById(elementId);
const taskManager = new TaskManager(elementId);

// Add Task if not Exist
function addTask() {
    if (!taskTitle.value)
        return alert("Please enter a task!");

    if (taskTitle.value === spezial) {
        spezialFunc();
        return;
    }

    console.log("Input Value > " + taskTitle.value);

    const task = new Task(taskManager.getId(), taskTitle.value, true, true, true);
    taskManager.addTask(task);
    taskTitle.value = "";
    taskTitle.focus();
}

// Click Add / Press Enter Add / Click Reset
addButton.addEventListener("click", addTask);
taskTitle.addEventListener("keydown", event => event.key === "Enter" ? addTask() : null);
resetButton.addEventListener("click", () => taskManager.resetTasks());

// Edit Delete Up Down
taskManagerElement.addEventListener("click", (event) => {
    //logs
    console.log("Event Target >> ", event.target,"Dataset >> " , event.target.dataset);
    console.log("Type of Event >> ", event.target.dataset.type);

    switch (event.target.dataset.type) {
        case "delete":
            taskManager.deleteTask(Number(event.target.dataset.taskId));
            break;
        case "edit":
            taskManager.setEditingTask(Number(event.target.dataset.taskId));
            break;
        case "up":
        case "down":
            taskManager.moveTask(Number(event.target.dataset.taskId), event.target.dataset.type);
            break;
    }
});
// Submit after setting new Task Title
taskManagerElement.addEventListener("keydown", (event) => {
    const textFieldId = event.target.dataset.taskId;
    if (event.key === "Enter") taskManager.editTask(Number(textFieldId), event);
})

