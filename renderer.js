const { ipcRenderer } = require('electron');

let taskInput = document.getElementById('taskInput');
let categorySelect = document.getElementById('categorySelect');
let prioritySelect = document.getElementById('prioritySelect');
let dueDateInput = document.getElementById('dueDateInput');
let addTaskButton = document.getElementById('addTaskButton');
let taskList = document.getElementById('taskList');
let sortByNameButton = document.getElementById('sortByNameButton');
let sortByDueDateButton = document.getElementById('sortByDueDateButton');
let sortByPriorityButton = document.getElementById('sortByPriorityButton');

let filter = 'all';
let sort = 'none';

function filterTasks(tasks) {
  switch(filter) {
    case 'all':
      return tasks;
    case 'incomplete':
      return tasks.filter(task => !task.completed);
    case 'completed':
      return tasks.filter(task => task.completed);
  }
}

function sortTasks(tasks) {
  let sortedTasks = [...tasks];
  switch(sort) {
    case 'name':
      sortedTasks.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'dueDate':
      sortedTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      break;
    case 'priority':
      sortedTasks.sort((a, b) => a.priority - b.priority);
      break;
  }
  return sortedTasks;
}

function updateTaskList(tasks) {
  let filteredTasks = filterTasks(tasks);
  let sortedTasks = sortTasks(filteredTasks);
  taskList.innerHTML = '';
  sortedTasks.forEach((task, index) => {
    let listItem = document.createElement('li');
    listItem.innerHTML = `${task.completed ? '<s>' : ''}${task.name} (${task.category}, ${task.priority} priority, Due: ${task.dueDate})${task.completed ? '</s>' : ''} 
    <button class="complete" data-index="${index}">Complete</button> 
    <button class="edit" data-index="${index}">Edit</button>
    <button class="delete" data-index="${index}">Delete</button>`;
    taskList.appendChild(listItem);
  });
}

let originalAddTaskButtonOnclick = addTaskButton.onclick = () => {
  ipcRenderer.send('add-task', { 
    name: taskInput.value, 
    category: categorySelect.value, 
    priority: prioritySelect.value, 
    dueDate: dueDateInput.value 
  });
  taskInput.value = '';
  ipcRenderer.send('get-tasks');  // Add this line
};

sortByNameButton.onclick = () => {
  sort = 'name';
  ipcRenderer.send('get-tasks');
};

sortByDueDateButton.onclick = () => {
  sort = 'dueDate';
  ipcRenderer.send('get-tasks');
};

sortByPriorityButton.onclick = () => {
  sort = 'priority';
  ipcRenderer.send('get-tasks');
};

taskList.onclick = (event) => {
  if (event.target.classList.contains('delete')) {
    let index = event.target.getAttribute('data-index');
    ipcRenderer.send('delete-task', index);
  } else if (event.target.classList.contains('complete')) {
    let index = event.target.getAttribute('data-index');
    ipcRenderer.send('complete-task', index);
  } else if (event.target.classList.contains('edit')) {
    let index = event.target.getAttribute('data-index');
    ipcRenderer.send('edit-task', index);
  }
};

window.onload = () => {
  ipcRenderer.send('get-tasks');
};

ipcRenderer.on('get-tasks', (event, tasks) => {
  updateTaskList(tasks);
});

ipcRenderer.on('edit-task', (event, task) => {
  taskInput.value = task.name;
  categorySelect.value = task.category;
  prioritySelect.value = task.priority;
  dueDateInput.value = task.dueDate;
  addTaskButton.onclick = () => {
    ipcRenderer.send('update-task', { 
      name: taskInput.value, 
      category: categorySelect.value, 
      priority: prioritySelect.value, 
      dueDate: dueDateInput.value,
      completed: task.completed 
    });
    taskInput.value = '';
    addTaskButton.onclick = originalAddTaskButtonOnclick;
  };
});
