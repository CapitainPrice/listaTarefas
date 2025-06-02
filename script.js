document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const tarefaInput = document.getElementById('tarefaInput');
    const adicionarBtn = document.getElementById('adicionarBtn');
    const listaTarefas = document.getElementById('listaTarefas');
    const limparConcluidasBtn = document.getElementById('limparConcluidasBtn');
    const limparTudoBtn = document.getElementById('limparTudoBtn');
    const conselhoContainer = document.getElementById('conselhoContainer');
    const conselhoTexto = document.getElementById('conselhoTexto');
    const fecharConselhoBtn = document.getElementById('fecharConselhoBtn');
    const totalTasksSpan = document.getElementById('totalTasks');
    const completedTasksSpan = document.getElementById('completedTasks');
    const filtroBtns = document.querySelectorAll('.filtro-btn');

    // Estado da aplicação
    let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
    let filtroAtual = 'todas';

    // Inicialização
    renderizarTarefas();
    atualizarContadores();

    // Event Listeners
    adicionarBtn.addEventListener('click', adicionarTarefa);
    tarefaInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') adicionarTarefa();
    });
    
    limparConcluidasBtn.addEventListener('click', limparTarefasConcluidas);
    limparTudoBtn.addEventListener('click', limparTodasTarefas);
    fecharConselhoBtn.addEventListener('click', fecharConselho);
    
    filtroBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filtroBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filtroAtual = this.dataset.filtro;
            renderizarTarefas();
        });
    });

    // Funções principais
    function adicionarTarefa() {
        const texto = tarefaInput.value.trim();
        if (texto) {
            const novaTarefa = {
                id: Date.now(),
                texto,
                concluida: false,
                dataCriacao: new Date().toISOString()
            };
            
            tarefas.unshift(novaTarefa);
            salvarTarefas();
            renderizarTarefas();
            tarefaInput.value = '';
            tarefaInput.focus();
        }
    }

    function renderizarTarefas() {
        listaTarefas.innerHTML = '';
        
        const tarefasFiltradas = tarefas.filter(tarefa => {
            if (filtroAtual === 'ativas') return !tarefa.concluida;
            if (filtroAtual === 'concluidas') return tarefa.concluida;
            return true;
        });
        
        if (tarefasFiltradas.length === 0) {
            const mensagem = document.createElement('li');
            mensagem.className = 'mensagem-vazia';
            mensagem.textContent = filtroAtual === 'todas' ? 'Nenhuma tarefa adicionada ainda!' :
                                 filtroAtual === 'ativas' ? 'Nenhuma tarefa ativa!' :
                                 'Nenhuma tarefa concluída!';
            listaTarefas.appendChild(mensagem);
            return;
        }
        
        tarefasFiltradas.forEach(tarefa => {
            const li = document.createElement('li');
            if (tarefa.concluida) li.classList.add('tarefa-concluida');
            
            li.innerHTML = `
                <div class="tarefa-conteudo">
                    <input type="checkbox" class="tarefa-checkbox" ${tarefa.concluida ? 'checked' : ''}>
                    <span class="tarefa-texto">${tarefa.texto}</span>
                </div>
                <div class="tarefa-botoes">
                    <button class="tarefa-btn excluir" title="Excluir tarefa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            const checkbox = li.querySelector('.tarefa-checkbox');
            const btnExcluir = li.querySelector('.excluir');
            
            checkbox.addEventListener('change', function() {
                toggleConclusaoTarefa(tarefa.id, this.checked);
            });
            
            btnExcluir.addEventListener('click', function(e) {
                e.stopPropagation();
                excluirTarefa(tarefa.id);
            });
            
            listaTarefas.appendChild(li);
        });
    }

    function toggleConclusaoTarefa(id, concluida) {
        const tarefaIndex = tarefas.findIndex(t => t.id === id);
        if (tarefaIndex !== -1) {
            tarefas[tarefaIndex].concluida = concluida;
            salvarTarefas();
            renderizarTarefas();
            atualizarContadores();
            
            if (concluida) {
                buscarConselhoMotivacional();
            }
        }
    }

    function excluirTarefa(id) {
        tarefas = tarefas.filter(t => t.id !== id);
        salvarTarefas();
        renderizarTarefas();
        atualizarContadores();
    }

    function limparTarefasConcluidas() {
        tarefas = tarefas.filter(t => !t.concluida);
        salvarTarefas();
        renderizarTarefas();
        atualizarContadores();
    }

    function limparTodasTarefas() {
        if (confirm('Tem certeza que deseja apagar todas as tarefas?')) {
            tarefas = [];
            salvarTarefas();
            renderizarTarefas();
            atualizarContadores();
            fecharConselho();
        }
    }

    async function buscarConselhoMotivacional() {
        try {
            conselhoTexto.textContent = "Buscando conselho...";
            conselhoContainer.classList.remove('hidden');
            
            const response = await fetch('https://api.adviceslip.com/advice');
            const data = await response.json();
            
            conselhoTexto.textContent = data.slip.advice;
        } catch (error) {
            console.error('Erro ao buscar conselho:', error);
            conselhoTexto.textContent = "Parabéns por completar sua tarefa! Continue assim!";
        }
    }

    function fecharConselho() {
        conselhoContainer.classList.add('hidden');
    }

    function salvarTarefas() {
        localStorage.setItem('tarefas', JSON.stringify(tarefas));
    }

    function atualizarContadores() {
        totalTasksSpan.textContent = tarefas.length;
        const concluidas = tarefas.filter(t => t.concluida).length;
        completedTasksSpan.textContent = concluidas;
    }
});