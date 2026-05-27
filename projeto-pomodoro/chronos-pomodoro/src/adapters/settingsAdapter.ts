const API_URL = 'http://localhost:3333';

export const settingsAdapter = {
  async getSettings() {
    const response = await fetch(`${API_URL}/settings`);
    if (!response.ok) throw new Error('Erro ao buscar configurações');
    return response.json();
  },

  async saveSettings(data: {
    workTime: number;
    shortBreakTime: number;
    longBreakTime: number;
  }) {
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao salvar configurações');
    return response.json();
  },
};