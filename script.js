// Variáveis globais e referências
const taskList = document.getElementById('task-list');
const taskModal = new bootstrap.Modal(document.getElementById('task-modal'));
const taskForm = document.getElementById('task-form');
const taskName = document.getElementById('task-name');
const taskCost = document.getElementById('task-cost');
const taskDeadline = document.getElementById('task-deadline');
const errorMessage = document.getElementById('error-message');
let editingTask = null;
let tasks = [];

// Carrega tarefas ao iniciar a página
document.addEventListener('DOMContentLoaded', loadTasks);

function loadTasks() {
    // Tenta carregar tarefas do localStorage
    const storedTasks = localStorage.getItem('tasks');
    tasks = storedTasks ? JSON.parse(storedTasks) : []; // Se não houver, inicializa como array vazio

    tasks.sort((a, b) => a.ordem - b.ordem);  // Ordena pela "Ordem de apresentação"
    renderTaskList();
}

function renderTaskList() {
    taskList.innerHTML = '';
    tasks.forEach(task => renderTask(task));
}

// Renderiza cada tarefa na lista
function renderTask(task) {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
    listItem.draggable = true; // Permite arrastar

    // Estiliza tarefa com fundo amarelo claro se o custo for maior ou igual a 1000
    if (task.custo >= 1000) listItem.style.backgroundColor = '#ffeeba'; // Amarelo claro

    listItem.innerHTML = `
        <span>${task.nome} - R$${task.custo.toFixed(2)} - ${formatDate(task.data_limite)}</span>
        <div>
            <button class="btn btn-warning btn-sm me-2" onclick="moveTask(${task.id}, -1)" ${task.ordem === 1 ? 'disabled' : ''}>
                <i class="bi bi-arrow-up"></i>
            </button>
            <button class="btn btn-warning btn-sm me-2" onclick="moveTask(${task.id}, 1)" ${task.ordem === tasks.length ? 'disabled' : ''}>
                <i class="bi bi-arrow-down"></i>
            </button>
            <button class="btn btn-success btn-sm me-2" onclick="editTask(${task.id})">
                <i class="bi bi-pencil-fill"></i>
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">
                <i class="bi bi-trash-fill"></i>
            </button>
        </div>
    `;

    // Eventos de drag-and-drop
    listItem.ondragstart = (e) => e.dataTransfer.setData('text/plain', task.id);
    listItem.ondragover = (e) => e.preventDefault();
    listItem.ondrop = (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        swapTasks(draggedId, task.id);
    };

    taskList.appendChild(listItem);
}

// Funções para mover tarefas
function moveTask(id, direction) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if ((direction === -1 && taskIndex === 0) || (direction === 1 && taskIndex === tasks.length - 1)) {
        return; // Não permite mover além dos limites
    }

    const swapIndex = taskIndex + direction;
    // Troca as tarefas
    [tasks[taskIndex], tasks[swapIndex]] = [tasks[swapIndex], tasks[taskIndex]];

    // Atualiza as ordens
    updateTaskOrder();
}

function swapTasks(draggedId, targetId) {
    const draggedTaskIndex = tasks.findIndex(task => task.id == draggedId);
    const targetTaskIndex = tasks.findIndex(task => task.id == targetId);

    // Troca as posições no array de tarefas
    if (draggedTaskIndex !== -1 && targetTaskIndex !== -1) {
        [tasks[draggedTaskIndex], tasks[targetTaskIndex]] = [tasks[targetTaskIndex], tasks[draggedTaskIndex]];
        
        // Atualiza a ordem de apresentação
        updateTaskOrder();
    }
}

// Atualiza a ordem no objeto e salva no localStorage
function updateTaskOrder() {
    tasks.forEach((task, index) => {
        task.ordem = index + 1; // Atualiza a ordem
    });
    saveTasks(); // Salva as tarefas no localStorage
    renderTaskList(); // Recarrega a lista
}

// Abre modal para adicionar nova tarefa
function showAddTaskModal() {
    editingTask = null;
    taskForm.reset();
    errorMessage.textContent = '';  // Limpa mensagens de erro
    taskModal.show();
}

// Função para formatar a data
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
}

// Função para adicionar ou editar uma tarefa
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const data = {
        nome: taskName.value,
        custo: parseFloat(taskCost.value),
        data_limite: taskDeadline.value,
        ordem: tasks.length + 1
    };

    // Validação para nome duplicado
    const isDuplicate = tasks.some(task => task.nome === data.nome && (!editingTask || editingTask !== task.id));
    
    if (isDuplicate) {
        errorMessage.textContent = 'Erro: já existe uma tarefa com esse nome!';
        return;
    }
    
    if (editingTask) {
        // Edita a tarefa existente
        tasks = tasks.map(task => {
            if (task.id === editingTask) {
                return { ...task, ...data }; // Atualiza apenas a tarefa editada
            }
            return task;
        });
    } else {
        // Adiciona nova tarefa
        data.id = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;  // Gera novo ID
        tasks.push(data);
    }

    saveTasks(); // Salva as tarefas no localStorage
    renderTaskList();
    taskModal.hide();
});

// Funções de excluir e editar tarefa
function deleteTask(id) {
    if (confirm('Deseja excluir esta tarefa?')) {
        tasks = tasks.filter(task => task.id !== id); // Filtra a tarefa a ser excluída
        saveTasks(); // Salva as alterações no localStorage
        renderTaskList();
    }
}

function editTask(id) {
    editingTask = id;
    const task = tasks.find(t => t.id === id);

    if (task) {
        taskName.value = task.nome;
        taskCost.value = task.custo;
        taskDeadline.value = task.data_limite;
        errorMessage.textContent = ''; // Limpa mensagens de erro
        taskModal.show();
    }
}

// Função para salvar tarefas no localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
