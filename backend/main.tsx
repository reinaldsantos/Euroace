import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Mail, MapPin, ShieldCheck, UserCog, ChevronDown } from 'lucide-react';
import { api, Receita } from './services/api';
import './styles.css';
import headerImage from './assets/images/header.png';
import footerLogos from './assets/images/footer.png';

const menuItems = [
  { label: 'Introdução', href: '#introducao' },
  { label: 'Região', href: '#regiao' },
  { label: 'Ementa', href: '#ementa' },
  { label: 'Escolas', href: '#escolas' },
  { label: 'Contacto', href: '#contacto' },
];

function Navigation() {
  return (
    <nav className="nav" aria-label="Menu principal">
      {menuItems.map((item) => (
        <a key={item.href} href={item.href}>{item.label}</a>
      ))}
    </nav>
  );
}

function EmentaSection() {
  const [receitas, setReceitas] = useState<{
    entrada: Receita[];
    carne: Receita[];
    peixe: Receita[];
    sobremesa: Receita[];
    pastelaria: Receita[];
  }>({
    entrada: [],
    carne: [],
    peixe: [],
    sobremesa: [],
    pastelaria: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedReceita, setSelectedReceita] = useState<Receita | null>(null);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  useEffect(() => {
    const fetchReceitas = async () => {
      try {
        const [entrada, carne, peixe, sobremesa, pastelaria] = await Promise.all([
          api.getReceitasByCategoria('entrada'),
          api.getReceitasByCategoria('carne'),
          api.getReceitasByCategoria('peixe'),
          api.getReceitasByCategoria('sobremesa'),
          api.getReceitasByCategoria('pastelaria')
        ]);
        setReceitas({ entrada, carne, peixe, sobremesa, pastelaria });
      } catch (error) {
        console.error('Erro ao carregar receitas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReceitas();
  }, []);

  const categorias = [
    { id: 'entrada', nome: '🍽️ Entrada', receitas: receitas.entrada },
    { id: 'carne', nome: '🥩 Prato de Carne', receitas: receitas.carne },
    { id: 'peixe', nome: '🐟 Prato de Peixe', receitas: receitas.peixe },
    { id: 'sobremesa', nome: '🍰 Sobremesa', receitas: receitas.sobremesa },
    { id: 'pastelaria', nome: '🥐 Pastelaria', receitas: receitas.pastelaria }
  ];

  return (
    <section id="ementa" className="section-card">
      <div className="ementa-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <p className="eyebrow">Ementa</p>
          <h2>Pratos de Boa Memória | receitas com alma</h2>
        </div>
        <button 
          onClick={() => setSubmenuOpen(!submenuOpen)}
          className="submenu-toggle"
          style={{
            background: 'var(--blue)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          Categorias <ChevronDown size={18} style={{ transform: submenuOpen ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
        </button>
      </div>

      {/* Submenu Vertical */}
      {submenuOpen && (
        <div className="submenu-vertical" style={{
          marginTop: '1rem',
          marginBottom: '2rem',
          background: '#f0f0f0',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {categorias.map(cat => (
            <a
              key={cat.id}
              href={`#categoria-${cat.id}`}
              className="submenu-item"
              style={{
                display: 'block',
                padding: '0.75rem 1.5rem',
                borderBottom: '1px solid #ddd',
                textDecoration: 'none',
                color: 'var(--dark)',
                fontWeight: '500',
                transition: '0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--blue)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--dark)'; }}
            >
              {cat.nome} ({cat.receitas.length})
            </a>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando ementa...</div>
      ) : (
        <div>
          {categorias.map(categoria => (
            <div key={categoria.id} id={`categoria-${categoria.id}`} className="categoria-section" style={{ marginBottom: '2rem' }}>
              <h3 style={{ 
                color: 'var(--blue)', 
                borderBottom: '3px solid var(--gold)', 
                display: 'inline-block', 
                marginBottom: '1rem',
                paddingBottom: '0.5rem'
              }}>
                {categoria.nome}
              </h3>
              <div className="cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                {categoria.receitas.length === 0 ? (
                  <p>Nenhuma receita cadastrada nesta categoria.</p>
                ) : (
                  categoria.receitas.map(receita => (
                    <article key={receita.id} className="receita-card" style={{
                      background: 'var(--light)',
                      borderRadius: '16px',
                      padding: '1rem',
                      cursor: 'pointer',
                      transition: '0.2s',
                      border: '1px solid #eee'
                    }}
                    onClick={() => setSelectedReceita(receita)}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      {receita.imagem_filename && (
                        <img 
                          src={`http://localhost:3005/uploads/${receita.imagem_filename}`} 
                          alt={receita.nome_prato}
                          style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '12px', marginBottom: '0.75rem' }}
                        />
                      )}
                      <h4 style={{ marginBottom: '0.5rem', color: 'var(--blue)' }}>{receita.nome_prato}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#666' }}>Nº Ficha: {receita.numero_ficha}</p>
                      <button className="receita-detalhe-btn" style={{
                        background: 'var(--green)',
                        color: 'white',
                        border: 'none',
                        padding: '0.4rem 1rem',
                        borderRadius: '8px',
                        marginTop: '0.5rem',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                      }}>
                        Ver detalhes
                      </button>
                    </article>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal da Receita */}
      {selectedReceita && (
        <div className="modal-overlay" onClick={() => setSelectedReceita(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedReceita(null)}>×</button>
            <h2>{selectedReceita.nome_prato}</h2>
            {selectedReceita.imagem_filename && (
              <img 
                src={`http://localhost:3005/uploads/${selectedReceita.imagem_filename}`} 
                alt={selectedReceita.nome_prato}
                style={{ maxWidth: '100%', borderRadius: '16px', marginBottom: '1rem' }}
              />
            )}
            <p><strong>Nº Ficha:</strong> {selectedReceita.numero_ficha}</p>
            <p><strong>Porções:</strong> {selectedReceita.numero_porcoes} | <strong>Pax:</strong> {selectedReceita.pax}</p>
            <p><strong>Tempo:</strong> {selectedReceita.tempo_preparacao}</p>
            <p><strong>Forma:</strong> {selectedReceita.forma_preparacao}</p>
            
            <h3>Ingredientes</h3>
            <ul>
              {selectedReceita.ingredientes.map((ing, idx) => (
                <li key={idx}>{ing.quantidade} {ing.produto}</li>
              ))}
            </ul>
            
            <h3>Preparação</h3>
            <ol>
              {selectedReceita.preparacao.map((passo, idx) => (
                <li key={idx}>{passo.descricao}</li>
              ))}
            </ol>
            
            <h3>Material Necessário</h3>
            <p>{selectedReceita.material_necessario}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function App() {
  return (
    <div className="site-shell">
      <header className="hero">
        <img src={headerImage} alt="Dia da Europa Euroace 26" />
      </header>

      <Navigation />

      <main>
        <section id="introducao" className="intro-section section-card">
          <p className="eyebrow">Euroace '26</p>
          <h1>Proposta da Página Principal</h1>
          <p>
            Plataforma dedicada ao Dia da Europa, reunindo conteúdos sobre a região,
            ementas, escolas participantes e contactos do projeto.
          </p>
          <div className="actions">
            <a className="btn primary" href="#ementa">Ver ementa</a>
            <a className="btn secondary" href="#contacto">Contactar</a>
          </div>
        </section>

        <section id="regiao" className="grid-two">
          <article className="section-card">
            <p className="eyebrow">A região</p>
            <h2>Sabores com história</h2>
            <p>
              Um espaço para valorizar a identidade cultural, gastronómica e educativa
              da região EUROACE, aproximando escolas, entidades e comunidade.
            </p>
          </article>
          <article className="section-card highlight">
            <ShieldCheck size={42} />
            <h2>Gestão simples</h2>
            <p>
              A estrutura já prevê ligação futura a uma área administrativa para gestão
              de notícias, escolas, ementas e contactos.
            </p>
          </article>
        </section>

        <EmentaSection />

        <section id="escolas" className="section-card">
          <p className="eyebrow">Escolas</p>
          <h2>Escolas participantes</h2>
          <p>
            Área preparada para listar escolas, projetos, turmas, fotografias e recursos.
          </p>
        </section>

        <section id="contacto" className="contact section-card">
          <div>
            <p className="eyebrow">Contacto</p>
            <h2>Fale connosco</h2>
            <p>Use esta secção para apresentar email, telefone, morada e formulário.</p>
          </div>
          <div className="contact-items">
            <span><Mail size={18} /> geral@euroace26.pt</span>
            <span><MapPin size={18} /> Portugal / Espanha</span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-angle" />
        <div className="footer-content">
          <div>
            <h2>somos<span>EPF</span></h2>
            <p>
              Com experiência na formação e no desenvolvimento de projetos educativos,
              promovemos competências, inovação e valor para a comunidade.
            </p>
            <div className="socials">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Instagram">◎</a>
            </div>
          </div>

          <div>
            <h3>Menu</h3>
            <ul>{menuItems.map((item) => <li key={item.href}><a href={item.href}>{item.label}</a></li>)}</ul>
          </div>

          <div>
            <h3>Oferta Formativa</h3>
            <ul>
              <li><a href="#">Cursos Profissionais</a></li>
              <li><a href="#">Cursos CEF</a></li>
              <li><a href="#">Outras Ofertas Formativas</a></li>
              <li><a href="#">Alumni e Parceiros</a></li>
            </ul>
          </div>

          <div>
            <h3>Newsletter</h3>
            <p>Inscreva-se para receber informações e novidades do projeto.</p>
            <form className="newsletter">
              <input type="email" placeholder="seu e-mail" aria-label="Email" />
              <button type="submit">Subscrever</button>
            </form>
            <a className="admin-link" href="/admin/login.html"><UserCog size={18} /> Área administrativa</a>
          </div>
        </div>
        <div className="logo-strip">
          <img src={footerLogos} alt="Logótipos dos parceiros e entidades financiadoras" />
        </div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
