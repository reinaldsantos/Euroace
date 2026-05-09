import React from 'react';
import ReactDOM from 'react-dom/client';
import { Mail, MapPin, ShieldCheck, UserCog } from 'lucide-react';
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

        <section id="ementa" className="section-card">
          <p className="eyebrow">Ementa</p>
          <h2>Pratos de Boa Memória | receitas com alma</h2>
          <div className="cards">
            <article><h3>Entrada</h3><p>Receitas tradicionais e produtos regionais.</p></article>
            <article><h3>Prato principal</h3><p>Sabores partilhados à volta da mesa.</p></article>
            <article><h3>Sobremesa</h3><p>Memórias doces da gastronomia local.</p></article>
          </div>
        </section>

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
            <a className="admin-link" href="/admin"><UserCog size={18} /> Área administrativa</a>
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
