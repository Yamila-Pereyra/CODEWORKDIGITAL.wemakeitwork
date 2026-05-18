"use client";

import Head from "next/head";
import "@/app/home1.css";
import "@/styles/contacto.css";

import Link from "next/link";
import ContactForm from "@/components/ContactForm";

import {
  useEffect,
  useState,
  useRef
} from "react";

export default function Home() {

  const frases = [
    "Desarrollo Web Profesional",
    "Tiendas Online Modernas",
    "Optimización y SEO",
    "Diseño que convierte"
  ];

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const beneficiosRef = useRef(null);

  /* =========================
     NOSOTROS
  ========================= */

  const nosotrosRef = useRef(null);

  const [x, setX] = useState(-120);
  const [opacity, setOpacity] = useState(0);

  /* =========================
     SERVICIOS
  ========================= */

  const sectionRef = useRef(null);

  /* =========================
     HERO CARRUSEL
  ========================= */

  useEffect(() => {

    const intervalo = setInterval(() => {

      setFade(false);

      setTimeout(() => {

        setIndex((prev) =>
            (prev + 1) % frases.length
        );

        setFade(true);

      }, 300);

    }, 2500);

    return () => clearInterval(intervalo);

  }, []);

  /* =========================
     BENEFICIOS
  ========================= */

  useEffect(() => {

    if (!beneficiosRef.current) return;

    const items =
        beneficiosRef.current.querySelectorAll(
            ".beneficio-card"
        );

    const observer =
        new IntersectionObserver(

            (entries, obs) => {

              entries.forEach((entry) => {

                if (entry.isIntersecting) {

                  const el = entry.target;

                  const index =
                      [...items].indexOf(el);

                  el.style.transitionDelay =
                      `${index * 120}ms`;

                  el.classList.add("show");

                  obs.unobserve(el);

                }

              });

            },

            {
              threshold: 0.25,
            }

        );

    items.forEach((item) =>
        observer.observe(item)
    );

    return () => observer.disconnect();

  }, []);

  /* =========================
     NOSOTROS APPLE EFFECT
  ========================= */

  useEffect(() => {

    const handleScroll = () => {

      if (!nosotrosRef.current) return;

      const rect =
          nosotrosRef.current.getBoundingClientRect();

      const windowHeight =
          window.innerHeight;

      const progress =
          1 - (rect.top / windowHeight);

      const p =
          Math.max(0, Math.min(1, progress));

      setX(-120 + p * 240);

      setOpacity(p);

    };

    window.addEventListener(
        "scroll",
        handleScroll
    );

    handleScroll();

    return () =>
        window.removeEventListener(
            "scroll",
            handleScroll
        );

  }, []);

  /* =========================
     SERVICIOS SCROLL EFFECT
  ========================= */

  useEffect(() => {

    const cards =
        document.querySelectorAll(
            ".cinematic-card"
        );

    const handleScroll = () => {

      const section =
          sectionRef.current;

      if (!section) return;

      const rect =
          section.getBoundingClientRect();

      const scrollProgress =
          -rect.top;

      cards.forEach((card, index) => {

        const start =
            index * 500;

        const end =
            start + 700;

        let progress =
            (scrollProgress - start) /
            (end - start);

        progress =
            Math.max(0, Math.min(progress, 1));

        const y =
            300 - (progress * 600);

        const opacity =
            progress < 0.5
                ? progress * 2
                : (1 - progress) * 2;

        card.style.transform =
            `translate(-50%, ${y}px)`;

        card.style.opacity =
            opacity;

      });

    };

    window.addEventListener(
        "scroll",
        handleScroll
    );

    handleScroll();

    return () =>
        window.removeEventListener(
            "scroll",
            handleScroll
        );

  }, []);

  return (

      <main>

        <Head>
          <title>
            CodeWork Digital - Inicio
          </title>

          <meta
              name="description"
              content="Contáctanos para impulsar tu negocio con soluciones web"
          />
        </Head>

        {/* ================= HERO ================= */}

        <section className="hero">

          <h1>
            CodeWork Digital
          </h1>

          <p
              className={`carousel-text ${
                  fade ? "fade-in" : "fade-out"
              }`}
          >
            {frases[index]}
          </p>

        </section>

        {/* ================= HERO SECTION ================= */}

        <section className="hero-section">

          <div className="hero-grid">

            <div className="hero-left reveal-left">

              <h2>
                Creamos sitios web profesionales
                que impulsan tu negocio
              </h2>

            </div>

            <div className="hero-right reveal-right">

              <p>
                En <strong>CodeWork Digital</strong>
                desarrollamos páginas web modernas,
                seguras y optimizadas para que tu
                marca tenga una presencia profesional
                y atraiga más clientes.
              </p>

            </div>

          </div>

        </section>

        {/* ================= NOSOTROS ================= */}

        <section
            ref={nosotrosRef}
            className="nosotros"
        >

          <div className="container">

            <img
                src="/imagenes/quehacemos.jpeg"
                alt="Nosotros"
                className="nosotros-img"
                style={{
                  transform:
                      `translateX(${x}px)
                 scale(${0.95 + opacity * 0.05})`,
                  opacity: opacity,
                }}
            />

          </div>

        </section>

        {/* ================= BENEFICIOS ================= */}

        <section className="beneficios">

          <div className="container">

            <h2>
              ¿Por qué elegirnos?
            </h2>

            <div
                className="beneficios-grid"
                ref={beneficiosRef}
            >

              <div className="beneficio-card">
                <h3>🚀 Diseño moderno</h3>
                <p>
                  Interfaces atractivas y adaptadas
                  a tu marca.
                </p>
              </div>

              <div className="beneficio-card">
                <h3>⚡ Velocidad optimizada</h3>
                <p>
                  Sitios rápidos que mejoran
                  experiencia y SEO.
                </p>
              </div>

              <div className="beneficio-card">
                <h3>🔒 Seguridad</h3>
                <p>
                  Buenas prácticas y código limpio.
                </p>
              </div>

              <div className="beneficio-card">
                <h3>📱 Responsive</h3>
                <p>
                  Perfecto en celular y desktop.
                </p>
              </div>

              <div className="beneficio-card">
                <h3>📈 SEO básico</h3>
                <p>
                  Preparado para Google.
                </p>
              </div>

              <div className="beneficio-card">
                <h3>🤝 Soporte</h3>
                <p>
                  Te acompañamos en todo el proceso.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ================= SERVICIOS ================= */}
        {/* ================= SERVICIOS ================= */}

        <section className="services-clean">

          <div className="services-fixed-title">
            <h1>SERVICIOS</h1>
          </div>

          <div className="services-list">

            <div className="service-item left">
              <span>01</span>
              <h3>Desarrollo Web</h3>
              <p>
                Sitios modernos y optimizados.
              </p>
            </div>

            <div className="service-item right">
              <span>02</span>
              <h3>E-Commerce</h3>
              <p>
                Tiendas online enfocadas en ventas.
              </p>
            </div>

            <div className="service-item left">
              <span>03</span>
              <h3>SEO & Optimización</h3>
              <p>
                Velocidad y posicionamiento.
              </p>
            </div>

          </div>

        </section>
        {/* ================= CTA FINAL ================= */}

        <section className="cta-final">

          <div className="container">

            <h2>
              ¿Listo para una web profesional?
            </h2>

            <p>
              Escribinos y empezamos tu proyecto hoy.
            </p>

            <Link
                href="/contacto"
                className="btn-primary btn-contactar"
            >
              Contactar ahora
            </Link>

          </div>

        </section>

        {/* ================= FORM ================= */}

        <ContactForm
            postUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contacto`}
        />

      </main>
  );
}