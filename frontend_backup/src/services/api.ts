const API_URL = 'http://localhost:3005/api';

export interface Receita {
  id: number;
  numero_ficha: string;
  nome_prato: string;
  categoria: string;
  numero_porcoes: number;
  pax: number;
  tempo_preparacao: string;
  forma_preparacao: string;
  ingredientes: any[];
  preparacao: any[];
  material_necessario: string;
  imagem_filename: string | null;
  created_at: string;
}

export const api = {
  async getReceitas(): Promise<Receita[]> {
    const response = await fetch(`${API_URL}/receitas`);
    if (!response.ok) throw new Error('Erro ao buscar receitas');
    return response.json();
  },

  async getReceitasByCategoria(categoria: string): Promise<Receita[]> {
    const response = await fetch(`${API_URL}/receitas/categoria/${categoria}`);
    if (!response.ok) throw new Error('Erro ao buscar receitas');
    return response.json();
  },

  async login(username: string, password: string): Promise<{ token: string }> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!response.ok) throw new Error('Login falhou');
    return response.json();
  },

  async createReceita(data: FormData, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/receitas`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: data
    });
    if (!response.ok) throw new Error('Erro ao criar receita');
    return response.json();
  }
};
