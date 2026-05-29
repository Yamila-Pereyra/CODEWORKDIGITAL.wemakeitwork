"use client";

import Head from "next/head";import "@/app/home1.css";import "@/styles/contacto.css";

import Link from "next/link";import ContactForm from "@/components/ContactForm";

import {useEffect,useState,useRef} from "react";

export default function Home() {

  const frases = ["Desarrollo Web Profesional","Tiendas Online y E-commerce","Optimización y SEO","Aplicaciones Web y Móviles","Diseño que convierte"];

  const [index, setIndex] = useState(0);const [fade, setFade] = useState(true);

  const beneficiosRef = useRef(null);

  const slides = [{image: "/imagenes/carrucel-1.png",title: "Creamos experiencias visuales",text: "Que transmiten confianza, modernidad y credibilidad para tu marca."},{image: "/imagenes/carrucel-2.png",title: "Apps móviles que conectan con tus usuarios",text: "Desarrollamos aplicaciones para Android e iOS con experiencias intuitivas, rápidas y escalables."},{image: "/imagenes/carrucel-3.png",title: "Más visibilidad. Más clientes. Más resultados.",text: "Optimizamos tu presencia digital para atraer más tráfico, mejorar tu posicionamiento y convertir visitas en oportunidades."}];

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

              </div>

          ))}

          <div className="premium-dots">

            {slides.map((_, i) => (

                <button
                    key={i}
                    onClick={() =>
                        setSlideIndex(i)
                    }
                    className={
                      i === slideIndex
                          ? "active"
                          : ""
                    }
                />

            ))}

          </div>

        </section>

        {/* ================= NOSOTROS ================= */}
        {/* ================= BENEFICIOS / NOSOTROS ================= */}

        <section className="beneficios">
          <div className="container beneficios-layout">

            <div className="beneficios-grid" ref={beneficiosRef}>

              {[
                {
                  front: "/imagenes/diseno-front.png",
                  back: "/imagenes/diseno-back.png",
                  alt: "Diseño moderno",
                },
                {
                  front: "/imagenes/rendimiento-front.png",
                  back: "/imagenes/rendimiento-back.png",
                  alt: "Mayor rendimiento",
                },
                {
                  front: "/imagenes/proteccion-front.png",
                  back: "/imagenes/proteccion-back.png",
                  alt: "Protección avanzada",
                },
                {
                  front: "/imagenes/responsive-front.png",
                  back: "/imagenes/responsive-back.png",
                  alt: "Diseño responsive",
                },
                {
                  front: "/imagenes/seo-front-cortado.png",
                  back: "/imagenes/seo-back-cortado.png",
                  alt: "SEO & E-commerce",
                },
                {
                  front: "/imagenes/acompanamiento-front-codework.png",
                  back: "/imagenes/acompanamiento-back-codework.png",
                  alt: "Acompañamiento",
                },
              ].map((item, index) => (
                  <div className="beneficio-card" key={index}>
                    <div className="beneficio-img beneficio-front">
                      <img src={item.front} alt={item.alt} />
                    </div>

                    <div className="beneficio-img beneficio-back">
                      <img src={item.back} alt={item.alt} />
                    </div>
                  </div>
              ))}

            </div>
            <div className="beneficios-texto">
              <div>
                <span>Por qué</span>
                <strong>elegirnos</strong>
              </div>
            </div>

          </div>
        </section>
        {/* ================= SERVICIOS ================= */}
        <section className="services-clean">

          <div className="services-fixed-title">
            <h1>SERVICIOS</h1>
          </div>

          <div className="services-list">

            <div className="service-item left">

              <h3>Desarrollo Web</h3>
              <p>
                Sitios modernos y optimizados.
              </p>
            </div>

            <div className="service-item right">

              <h3>E-Commerce</h3>
              <p>
                Tiendas online enfocadas en ventas.
              </p>
            </div>

            <div className="service-item left">

              <h3>SEO & Optimización</h3>
              <p>
                Velocidad y posicionamiento.
              </p>
            </div>

            <div className="service-item right">

              <h3> Desarrollo de Apps Mobile</h3>
              <p>
                Aplicaciones móviles personalizadas para Android y iOS.
              </p>
            </div>

          </div>

        </section>
        {/* ================= CTA FINAL ================= */}

        <section className="cta-final">

          <div className="container">

            <h2>
              ¡Llevemos tu proyecto al siguiente nivel!
            </h2>

            <p>
              Contanos tu idea y creamos una solución digital pensada para hacer crecer tu negocio.
            </p>

            <Link
                href="/contacto"
                className="btn-primary btn-contactar"
            >
              Contactar ahora
            </Link>

          </div>

        </section>

        {/* ================= FORM =================

    <ContactForm
        postUrl={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/contacto`}
    />*/
        }
      </main>

  );}