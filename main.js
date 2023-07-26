const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

let win;

function createWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  win.on('closed', () => {
    win = null
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

let tasks = JSON.parse(fs.readFileSync('tasks.json'));

ipcMain.on('get-tasks', (event) => {
  event.reply('get-tasks', tasks);
});

ipcMain.on('add-task', (event, task) => {
  tasks.push(task);
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
});

ipcMain.on('delete-task', (event, index) => {
  tasks.splice(index, 1);
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
});

ipcMain.on('complete-task', (event, index) => {
  tasks[index].completed = true;
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
});

ipcMain.on('edit-task', (event, index) => {
  event.reply('edit-task', tasks[index]);
});

ipcMain.on('update-task', (event, updatedTask) => {
  let index = tasks.findIndex(task => task.name === updatedTask.name && task.dueDate === updatedTask.dueDate);
  tasks[index] = updatedTask;
  fs.writeFileSync('tasks.json', JSON.stringify(tasks));
});
