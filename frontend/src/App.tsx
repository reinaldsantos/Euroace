import React, { useEffect, useState } from 'react';
import { api, Receita } from './services/api';
import './App.css';

function App() {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceita, setSelectedReceita] = useState<Receita | null>(null);
  const [activeCategoria, setActiveCategoria] = useState<string>('entrada');

  useEffect(() => {
    api.getReceitas()
      .then(setReceitas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categorias = [
    { id: 'entrada', nome: 'Entrada', icon: '🍽️' },
    { id: 'carne', nome: 'Prato de Carne', icon: '🥩' },
    { id: 'peixe', nome: 'Prato de Peixe', icon: '🐟' },
    { id: 'sobremesa', nome: 'Sobremesa', icon: '🍰' },
    { id: 'pastelaria', nome: 'Pastelaria', icon: '🥐' },
  ];

  const getReceitasPorCategoria = (catId: string) => {
    return receitas.filter(r => r.categoria === catId);
  };

  return (
    <div className="App">
      <header className="header">
        <h1>EuroACE - Dia da Europa 2025</h1>
        <nav className="main-nav">
          <a href="#home">Início</a>
          <a href="#ementa" className="active">Ementa</a>
          <a href="#escolas">Escolas</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      <main>
        <section id="ementa" className="ementa-section">
          <div className="ementa-header">
            <h2>🍽️ Ementa Especial</h2>
            <p>Pratos de Boa Memória | receitas com alma</p>
          </div>

          {/* SUBMENUS HORIZONTAIS */}
          <div className="submenu-container">
            {categorias.map(cat => (
              <button
                key={cat.id}
                className={`submenu-btn ${activeCategoria === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategoria(cat.id)}
              >
                <span className="submenu-icon">{cat.icon}</span>
                <span className="submenu-text">{cat.nome}</span>
                <span className="submenu-count">({getReceitasPorCategoria(cat.id).length})</span>
              </button>
            ))}
          </div>

          {/* CONTEÚDO DA CATEGORIA SELECIONADA */}
          <div className="categoria-content">
            {loading ? (
              <div className="loading">Carregando receitas...</div>
            ) : (
              <div className="receitas-grid">
                {getReceitasPorCategoria(activeCategoria).length === 0 ? (
                  <div className="empty-message">
                    <p>Nenhuma receita cadastrada nesta categoria ainda.</p>
                    <p>Acesse o painel administrativo para adicionar receitas.</p>
                  </div>
                ) : (
                  getReceitasPorCategoria(activeCategoria).map(receita => (
                    <div key={receita.id} className="receita-card" onClick={() => setSelectedReceita(receita)}>
                      {receita.imagem_filename && (
                        <div className="receita-imagem">
                          <img src={`http://localhost:3005/uploads/${receita.imagem_filename}`} alt={receita.nome_prato} />
                        </div>
                      )}
                      <div className="receita-info">
                        <h3>{receita.nome_prato}</h3>
                        <p className="receita-ficha">Ficha Nº {receita.numero_ficha}</p>
                        <p className="receita-detalhe">🍽️ {receita.numero_porcoes} porções</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* MODAL DA RECEITA */}
      {selectedReceita && (
        <div className="modal-overlay" onClick={() => setSelectedReceita(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedReceita(null)}>×</button>
            <h2>{selectedReceita.nome_prato}</h2>
            {selectedReceita.imagem_filename && (
              <img src={`http://localhost:3005/uploads/${selectedReceita.imagem_filename}`} alt={selectedReceita.nome_prato} className="modal-img" />
            )}
            <div className="modal-info">
              <p><strong>📋 Nº Ficha:</strong> {selectedReceita.numero_ficha}</p>
              <p><strong>🍽️ Porções:</strong> {selectedReceita.numero_porcoes}</p>
              <p><strong>⏱️ Tempo:</strong> {selectedReceita.tempo_preparacao || 'Não informado'}</p>
              <p><strong>🔥 Forma:</strong> {selectedReceita.forma_preparacao || 'Não informado'}</p>
            </div>
            
            <h3>📝 Ingredientes</h3>
            <ul className="ingredientes-list">
              {(selectedReceita.ingredientes || []).map((ing, idx) => (
                <li key={idx}>• {ing.quantidade} {ing.produto}</li>
              ))}
            </ul>
            
            <h3>👨‍🍳 Modo de Preparação</h3>
            <ol className="preparacao-list">
              {(selectedReceita.preparacao || []).map((passo, idx) => (
                <li key={idx}>{passo.descricao}</li>
              ))}
            </ol>
            
            {selectedReceita.material_necessario && (
              <>
                <h3>🔧 Material Necessário</h3>
                <p className="material-text">{selectedReceita.material_necessario}</p>
              </>
            )}
          </div>
        </div>
      )}

      <footer className="footer">
        <p>EuroACE 2025 - Dia da Europa | Sabores com história</p>
      </footer>

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
        
        .App { max-width: 1280px; margin: 0 auto; background: white; min-height: 100vh; }
        
        .header {
          background: linear-gradient(135deg, #24449b, #45c974);
          color: white;
          padding: 2rem;
          text-align: center;
        }
        .header h1 { font-size: 2rem; margin-bottom: 1rem; }
        .main-nav { display: flex; justify-content: center; gap: 2rem; }
        .main-nav a { color: white; text-decoration: none; font-weight: bold; padding: 0.5rem 1rem; border-radius: 8px; }
        .main-nav a.active { background: rgba(255,255,255,0.3); }
        
        .ementa-section { padding: 2rem; }
        .ementa-header { text-align: center; margin-bottom: 2rem; }
        .ementa-header h2 { color: #24449b; font-size: 2rem; }
        .ementa-header p { color: #666; font-size: 1.1rem; }
        
        .submenu-container {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
          border-bottom: 2px solid #eee;
          padding-bottom: 1rem;
        }
        .submenu-btn {
          background: #f0f0f0;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 40px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .submenu-btn:hover {
          background: #e0e0e0;
          transform: translateY(-2px);
        }
        .submenu-btn.active {
          background: #24449b;
          color: white;
        }
        .submenu-icon { font-size: 1.2rem; }
        .submenu-count { font-size: 0.8rem; opacity: 0.7; }
        
        .receitas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .receita-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          cursor: pointer;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .receita-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .receita-imagem {
          height: 180px;
          overflow: hidden;
        }
        .receita-imagem img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .receita-card:hover .receita-imagem img {
          transform: scale(1.05);
        }
        .receita-info { padding: 1rem; }
        .receita-info h3 { color: #24449b; margin-bottom: 0.5rem; }
        .receita-ficha { color: #666; font-size: 0.8rem; margin-bottom: 0.25rem; }
        .receita-detalhe { color: #45c974; font-size: 0.8rem; font-weight: bold; }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal-content {
          background: white;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
          border-radius: 20px;
          padding: 2rem;
          position: relative;
        }
        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          font-size: 1.2rem;
        }
        .modal-img {
          width: 100%;
          border-radius: 12px;
          margin: 1rem 0;
        }
        .modal-info { background: #f5f5f5; padding: 1rem; border-radius: 12px; margin: 1rem 0; }
        .ingredientes-list, .preparacao-list { margin-left: 1.5rem; margin-bottom: 1rem; }
        .ingredientes-list li, .preparacao-list li { margin-bottom: 0.5rem; }
        .material-text { background: #f9f9f9; padding: 1rem; border-radius: 8px; margin-top: 0.5rem; }
        
        .footer {
          background: #24449b;
          color: white;
          text-align: center;
          padding: 1.5rem;
          margin-top: 2rem;
        }
        
        .loading, .empty-message {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
        
        @media (max-width: 768px) {
          .submenu-btn { padding: 0.5rem 1rem; font-size: 0.8rem; }
          .receitas-grid { grid-template-columns: 1fr; }
          .ementa-section { padding: 1rem; }
        }
      `}</style>
    </div>
  );
}

export default App;
