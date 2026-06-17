"use client";

import Head from "next/head";import "@/app/home1.css";import "@/styles/contacto.css";

import Link from "next/link";import ContactForm from "@/components/ContactForm";

import {useEffect,useState,useRef} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
    const { language } = useLanguage();
    const t = translations[language];
    const frases = t.homePage.frases;
    const slides = t.homePage.carousel;
    const beneficios = t.homePage.beneficios;
    const beneficiosHeader = t.homePage.beneficiosHeader;
    const servicios = t.homePage.servicios;
    const cta = t.homePage.cta;

  const [index, setIndex] = useState(0);const [fade, setFade] = useState(true);

  const beneficiosRef = useRef(null);

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
    /* ========================= HERO GLITCH SCROLL ========================== */
    useEffect(() => {

        const section = document.querySelector(".glitch-scroll-section");
        const left = document.querySelector(".glitch-from-left");
        const right = document.querySelector(".glitch-from-right");

        if (!section || !left || !right) return;

        const handleScroll = () => {

            const rect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            const isMobile = window.innerWidth <= 768;

            const distance = isMobile ? 45 : 130;

            const start = windowHeight * 0.95;
            const end = -rect.height * 0.4;

            const progress =
                (start - rect.top) / (start - end);

            const p =
                Math.max(0, Math.min(1, progress));

            let move;

            if (p < 0.5) {
                move = distance - p * distance * 2;
            } else {
                move = (p - 0.5) * distance * 2;
            }

            left.style.transform = `translateX(${-move}vw)`;
            right.style.transform = `translateX(${move}vw)`;

            const visible = isMobile
                ? p > 0.02 && p < 0.98
                : p > 0.12 && p < 0.88;

            left.style.opacity = visible ? "1" : "0";
            right.style.opacity = visible ? "1" : "0";
        };

        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleScroll);

        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };

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

    const section =
        sectionRef.current;

    if (!section) return;

    const ctx = gsap.context(() => {

      const cardsScroll =
          section.querySelector(".services-cards-scroll");

      const list =
          section.querySelector(".services-list");

      const items =
          gsap.utils.toArray(".service-item", section);

      if (!cardsScroll || !list || !items.length) return;

      gsap.set(cardsScroll, {
        autoAlpha: 0,
      });

      gsap.set(items, {
        autoAlpha: 0,
        y: 80,
      });

      gsap.set(list, {
        xPercent: -50,
        y: () => window.innerHeight * 0.78,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * 3.2}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to({}, {
        duration: 0.18,
      })
          .to(cardsScroll, {
            autoAlpha: 1,
            duration: 0.12,
          })
          .to(items, {
            autoAlpha: 1,
            y: 0,
            duration: 0.28,
            stagger: 0.06,
          }, "<")
          .to(list, {
            y: () => -Math.max(
                list.scrollHeight - window.innerHeight * 0.36,
                window.innerHeight * 0.9
            ),
            ease: "none",
            duration: 1,
          });

    }, section);

    return () => ctx.revert();

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


          {/* ================= HERO SECTION ================= */}
          <section className="hero-section glitch-scroll-section">

              <div className="hero-grid">

                  <div className="hero-left glitch-from-left">

                      <h2>
                          Creamos sitios web profesionales
                          que impulsan tu negocio
                      </h2>

                  </div>

                  <div className="hero-right glitch-from-right">

                      <p>
                          En <strong>CodeWork Digital </strong>
                           desarrollamos páginas web modernas,
                          seguras y optimizadas para que tu
                          marca tenga una presencia profesional
                          y atraiga más clientes.
                      </p>

                  </div>

              </div>

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
                      {beneficios.map((item, index) => (
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
                      <span>{beneficiosHeader.subtitulo}</span>

                      <h2>
                          {beneficiosHeader.titulo}
                      </h2>
                  </div>

              </div>
          </section>
          {/* ================= SERVICIOS ================= */}
          <section className="services-clean" ref={sectionRef}>

              <div className="services-bg-title">
                  <h1>{servicios.titulo}</h1>
              </div>

              <div className="services-cards-scroll">

              <div className="services-list">

                  {servicios.items.map((item, index) => (
                      <div
                          key={index}
                          className={`service-item ${
                              index % 2 === 0 ? "left" : "right"
                          }`}
                      >
                          <span>{item.numero}</span>

                          <h3>{item.titulo}</h3>

                          <p>{item.texto}</p>
                      </div>
                  ))}

              </div>

              </div>

          </section>
        {/* ================= CTA FINAL ================= */}
          <section className="cta-final">

              <div className="cta-glow" />

              <div className="cta-content">

                  <span>{cta.badge}</span>

                  <h2>{cta.titulo}</h2>

                  <p>{cta.texto}</p>

                  <Link
                      href="/contacto"
                      className="btn-contactar"
                  >
                      {cta.boton}
                  </Link>

              </div>

          </section>
      </main>

  );}
