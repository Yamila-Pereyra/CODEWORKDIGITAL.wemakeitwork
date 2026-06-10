"use client";

import Head from "next/head";import "@/app/home1.css";import "@/styles/contacto.css";

import Link from "next/link";import ContactForm from "@/components/ContactForm";

import {useEffect,useState,useRef} from "react";

export default function Home() {

  const frases = ["Desarrollo Web Profesional","Tiendas Online y E-commerce","Optimización y SEO","Aplicaciones Web y Móviles","Diseño que convierte"];

  const [index, setIndex] = useState(0);const [fade, setFade] = useState(true);

  const beneficiosRef = useRef(null);

  const slides = [{image: "/imagenes/CARROUSEL-1.png",title: "Creamos experiencias visuales",text: "Que transmiten confianza, modernidad y credibilidad para tu marca."},{image: "/imagenes/CARROUSEL-2.png",title: "Apps móviles que conectan con tus usuarios",text: "Desarrollamos aplicaciones para Android e iOS con experiencias intuitivas, rápidas y escalables."},{image: "/imagenes/CARROUSEL-3.png",title: "Más visibilidad. Más clientes. Más resultados.",text: "Optimizamos tu presencia digital para atraer más tráfico, mejorar tu posicionamiento y convertir visitas en oportunidades."}];

  const [slideIndex, setSlideIndex] = useState(0);

  /* =========================NOSOTROS========================= */

  const nosotrosRef = useRef(null);

  const [x, setX] = useState(-120);const [opacity, setOpacity] = useState(0);

  /* =========================SERVICIOS========================= */

  const sectionRef = useRef(null);

  /* =========================HERO CARRUSEL========================= */

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

  useEffect(() => {

    const interval = setInterval(() => {

      setSlideIndex((prev) =>
          (prev + 1) % slides.length
      );

    }, 5000);

    return () => clearInterval(interval);

  }, []);

  /* =========================BENEFICIOS========================= */

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

  /* =========================NOSOTROS APPLE EFFECT========================= */

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

  /* =========================SERVICIOS SCROLL EFFECT========================= */

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
        {/* ================= HERO SECTION ================= */}
        <section className="hero">
          <h1 className="hero-title">
  <span className="line1 glitch-line" data-text="CodeWork">
    CodeWork
  </span>
            <span className="line2 glitch-line" data-text="Digital">
    Digital
  </span>
          </h1>
          <p
              className={`carousel-text ${
                  fade ? "fade-in" : "fade-out"
              }`}
          >
            {frases[index]}
          </p>
        </section>
          {/* ================= SHOWCASE ================= */}

          <section className="premium-carousel">

              {slides.map((slide, i) => (

                  <div
                      key={i}
                      className={`premium-slide ${
                          i === slideIndex ? "active" : ""
                      }`}
                  >

                      <img
                          src={slide.image}
                          alt={slide.title}
                      />

                      <div className={`slide-content slide-${i}`}>
                          <h2>{slide.title}</h2>
                          <p>{slide.text}</p>
                      </div>

                  </div>

              ))}

          </section>

          <div className="premium-dots outside-dots">

              {slides.map((_, i) => (

                  <button
                      key={i}
                      onClick={() => setSlideIndex(i)}
                      className={
                          i === slideIndex
                              ? "active"
                              : ""
                      }
                  />

              ))}

          </div>
          {/* ================= BENEFICIOS / NOSOTROS ================= */}
          <section className="beneficios" ref={beneficiosRef}>
              <div className="beneficios-layout">

                  <div className="beneficios-grid">
                      {[
                          {
                              image: "/imagenes/cards1.jpeg",
                              title: "Websites que convierten",
                              text: "Diseñamos y desarrollamos sitios web rápidos, claros y preparados para crecer."
                          },
                          {
                              image: "/imagenes/cards2.jpeg",
                              title: "Apps mobile a medida",
                              text: "Creamos aplicaciones móviles pensadas para resolver problemas reales."
                          },
                          {
                              image: "/imagenes/cards3.jpeg",
                              title: "Backend robusto",
                              text: "Construimos APIs, servicios y lógica de negocio."
                          },
                          {
                              image: "/imagenes/cards4.jpeg",
                              title: "Integraciones inteligentes",
                              text: "Conectamos sistemas, plataformas y servicios externos."
                          },
                          {
                              image: "/imagenes/cards5.jpeg",
                              title: "Performance y estabilidad",
                              text: "Optimizamos aplicaciones para que respondan mejor."
                          },
                          {
                              image: "/imagenes/cards6.jpeg",
                              title: "Evolución continua",
                              text: "Acompañamos mejoras y nuevas funcionalidades."
                          }
                      ].map((item, index) => (
                          <article className="beneficio-card" key={index}>
                              <div className="beneficio-card-img">
                                  <img src={item.image} alt={item.title} />
                              </div>

                              <div className="beneficio-card-text">
                                  <span>{String(index + 1).padStart(2, "0")}</span>
                                  <h3>{item.title}</h3>
                                  <p>{item.text}</p>
                              </div>
                          </article>
                      ))}
                  </div>

                  <div className="beneficios-header">
                      <span>Por qué elegirnos</span>
                      <h2>
                          Tecnología pensada para crear,
                          crecer y evolucionar.
                      </h2>
                  </div>

              </div>
          </section>
        {/* ================= SERVICIOS ================= */}
          <section className="services-clean">

              <div className="services-bg-title">
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

                  <div className="service-item right">
                      <span>04</span>
                      <h3>Desarrollo de Apps Mobile</h3>
                      <p>
                          Aplicaciones móviles personalizadas para Android y iOS.
                      </p>
                  </div>

              </div>

          </section>
        {/* ================= CTA FINAL ================= */}
          <section className="cta-final">

              <div className="cta-glow" />

              <div className="cta-content">

                  <span>HABLEMOS DE TU PROYECTO</span>

                  <h2>
                      Transformemos tu idea en una experiencia digital que genere resultados.
                  </h2>

                  <p>
                      Desarrollo web, aplicaciones móviles, optimización y soluciones tecnológicas pensadas para crecer junto a tu negocio.
                  </p>

                  <Link
                      href="/contacto"
                      className="btn-contactar"
                  >
                      Iniciar proyecto
                  </Link>

              </div>

          </section>
      </main>

  );}