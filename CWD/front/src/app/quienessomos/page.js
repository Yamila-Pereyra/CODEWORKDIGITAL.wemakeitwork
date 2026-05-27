export const metadata = {
  title: "Code Work Digital - Quiénes Somos",
  description: "Soluciones web que impulsan tu negocio",
};

export default function QuienesSomos() {
  return (
      <main className="qs-page">
        <section className="qs-hero">
            <div className="qs-hero-layout">
            <div className="qs-hero-content">
              <span className="qs-label">Quiénes somos</span>

              <h1>
                Creamos sitios web,
                <br />
                aplicaciones y experiencias
                <br />
                digitales que generan resultados.
              </h1>

              <p>
                Creamos sitios web, aplicaciones y soluciones digitales que
                combinan diseño, tecnología y estrategia para impulsar marcas,
                mejorar experiencias y generar resultados reales.
              </p>

              <div className="qs-actions">
                <a href="/contacto" className="qs-btn-primary">
                  Hablemos de tu proyecto
                </a>

                <a href="/servicios" className="qs-btn-secondary">
                  Ver servicios
                </a>
              </div>
            </div>

            <div className="qs-hero-image">
              <img
                  src="/imagenes/quienes-somos-hero.png"
                  alt="Oficina de Code Work Digital"
                  loading="eager"
              />
            </div>
          </div>
        </section>

        <section className="qs-manifiesto">
          <div className="qs-manifiesto-grid">
            <p>
              Cada proyecto comienza escuchando tus necesidades y entendiendo tus
              objetivos. Combinamos diseño, desarrollo y estrategia para crear
              soluciones claras, efectivas y pensadas para crecer junto a tu
              negocio.
            </p>

            <div>
              <span className="qs-label">Nuestra forma de trabajar</span>

              <h2>
                Tecnología, diseño y estrategia trabajando juntos.
              </h2>
            </div>
          </div>
        </section>

        <section className="qs-valores">
          <div className="qs-valores-grid">
            <article className="qs-card">
              <span>01</span>

              <h3>Diseño con propósito</h3>

              <p>
                Creamos interfaces modernas que reflejan la identidad de tu marca
                y generan confianza desde el primer vistazo.
              </p>
            </article>

            <article className="qs-card">
              <span>02</span>

              <h3>Tecnología sólida</h3>

              <p>
                Desarrollamos sitios rápidos, seguros y optimizados para ofrecer
                una experiencia fluida en cualquier dispositivo.
              </p>
            </article>

            <article className="qs-card">
              <span>03</span>

              <h3>Acompañamiento real</h3>

              <p>
                Te acompañamos durante todo el proceso, desde la planificación
                inicial hasta la publicación y evolución del proyecto.
              </p>
            </article>
          </div>
        </section>
      </main>
  );
}
