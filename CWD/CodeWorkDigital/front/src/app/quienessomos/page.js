import "@/styles/quienessomos.css";

export const metadata = {
  title: "Code Work Digital - Quiénes Somos",
  description: "Soluciones web que impulsan tu negocio",
};

export default function QuienesSomos() {
  return (
    <main>
      {/* SECCION HERO */}
      <section className="hero-section1">
        <div className="container">
          <h2>Creamos sitios web profesionales que impulsan tu negocio</h2>

          <p className="subtitulo">
            <strong>CodeWork Digital</strong> somos un pequeño equipo dedicado al
            desarrollo de sitios web modernos, funcionales y pensados para generar
            resultados reales.
            <br /><br />
            Creemos en el trabajo transparente, el buen diseño y las soluciones simples
            pero efectivas. Nuestro objetivo es acompañarte en cada etapa: desde la idea
            hasta la publicación final, asegurando que tu presencia online sea
            profesional, confiable y competitiva.
          </p>

          <h2>¿Por qué elegirnos?</h2>

          <p className="subtitulo">
            Porque tu web es la primera impresión de tu negocio.
            En <strong>CodeWork Digital</strong> nos enfocamos en crear sitios que no
            solo se vean bien, sino que funcionen perfecto, carguen rápido y generen
            confianza.
          </p>

          <h2>Elegirnos significa elegir:</h2>

          <ul>
            <li className="elegirnos1">🔹 Diseño moderno y adaptable</li>
            <li className="elegirnos1">🔹 Código limpio, seguro y optimizado</li>
            <li className="elegirnos1">🔹 SEO básico incluido para mejor alcance</li>
            <li className="elegirnos1">🔹 Acompañamiento durante todo el proceso</li>
            <li className="elegirnos1">🔹 Entrega puntual y atención personalizada</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
