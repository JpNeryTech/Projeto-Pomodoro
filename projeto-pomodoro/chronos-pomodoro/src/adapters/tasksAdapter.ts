const API_URL = 'http://localhost:3333';

export const tasksAdapter = {
  async getTasks() {
    const response = await fetch(`${API_URL}/tasks`);
    if (!response.ok) throw new Error('Erro ao buscar tarefas');
    return response.json();
  },

  async createTask(task: {
    id: string;
    name: string;
    duration: number;
    type: string;
    startDate: number;
  }) {
    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!response.ok) throw new Error('Erro ao criar tarefa');
    return response.json();
  },

  async completeTask(id: string, completeDate: number) {
    const response = await fetch(`${API_URL}/tasks/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completeDate }),
    });
    if (!response.ok) throw new Error('Erro ao completar tarefa');
    return response.json();
  },

  async interruptTask(id: string, interruptDate: number) {
    const response = await fetch(`${API_URL}/tasks/${id}/interrupt`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interruptDate }),
    });
    if (!response.ok) throw new Error('Erro ao interromper tarefa');
    return response.json();
  },

  async deleteTasks() {
    const response = await fetch(`${API_URL}/tasks`, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) throw new Error('Erro ao deletar tarefas');
  },
};