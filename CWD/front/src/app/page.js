"use client";

import Head from "next/head";import "@/app/home1.css";import "@/styles/contacto.css";

import Link from "next/link";import ContactForm from "@/components/ContactForm";

import {useEffect,useState,useRef} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

gsap.registerPlugin(ScrollTrigger);

const beneficiosExtended = [
  {
    title: "Websites que convierten",
    text: "Diseñamos y desarrollamos sitios web rápidos, claros y preparados para crecer. Cuidamos la experiencia visual, la estructura técnica y el rendimiento para que tu presencia digital no sea solo atractiva, sino también funcional, medible y efectiva.",
  },
  {
    title: "Apps mobile a medida",
    text: "Creamos aplicaciones móviles pensadas para resolver problemas reales. Desde la idea inicial hasta una versión funcional, priorizamos interfaces simples, flujos claros y una base técnica sólida para que la app pueda evolucionar sin perder estabilidad.",
  },
  {
    title: "Backend robusto",
    text: "Construimos APIs, servicios y lógica de negocio con foco en seguridad, escalabilidad y mantenibilidad. Nos importa que el sistema funcione bien por dentro: contratos claros, datos consistentes, integraciones confiables y código preparado para crecer.",
  },
  {
    title: "Integraciones inteligentes",
    text: "Conectamos sistemas, plataformas, bases de datos y servicios externos para que trabajen como una unidad. Reducimos procesos manuales, mejoramos la trazabilidad y ayudamos a que la tecnología acompañe el flujo real de tu negocio.",
  },
  {
    title: "Performance y estabilidad",
    text: "Optimizamos aplicaciones para que respondan mejor, fallen menos y sean más fáciles de monitorear. Analizamos cuellos de botella, tiempos de carga, errores recurrentes y puntos críticos para mejorar la experiencia del usuario final.",
  },
  {
    title: "Evolución continua",
    text: "No pensamos el software como algo estático. Acompañamos mejoras, nuevas funcionalidades, mantenimiento y ajustes técnicos para que tu producto digital pueda adaptarse al mercado, a tus usuarios y a nuevas oportunidades de negocio.",
  },
];

export default function Home() {
    const { language } = useLanguage();
    const t = translations[language];
    const frases = t.homePage.frases;
    const slides = t.homePage.carousel;
    const beneficios = t.homePage.beneficios;
    const servicios = t.homePage.servicios;
    const cta = t.homePage.cta;

  const [index, setIndex] = useState(0);const [fade, setFade] = useState(true);

  const beneficiosRef = useRef(null);
  const beneficiosHeaderRef = useRef(null);

  const [slideIndex, setSlideIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(1);

  /* =========================NOSOTROS========================= */

  const nosotrosRef = useRef(null);

  const [x, setX] = useState(-120);const [opacity, setOpacity] = useState(0);

  /* =========================SERVICIOS========================= */

  const sectionRef = useRef(null);
  const carouselTrackRef = useRef(null);
  const carouselResetRef = useRef(false);

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

      setCarouselIndex((prev) =>
          prev + 1
      );

    }, 3500);

    return () => clearInterval(interval);

  }, []);

  useEffect(() => {

    const track =
        carouselTrackRef.current;

    if (!track) return;

    const carouselSlides =
        gsap.utils.toArray(".hero-slide", track);

    gsap.killTweensOf([track, ...carouselSlides]);

    if (carouselResetRef.current) {
      carouselResetRef.current = false;

      gsap.set(track, {
        xPercent: -100,
      });

      carouselSlides.forEach((slide, index) => {
        gsap.set(slide, {
          scale: index === 1 ? 1 : 0.985,
          opacity: index === 1 ? 1 : 0.92,
        });
      });

      return undefined;
    }

    gsap.to(track, {
      xPercent: -(carouselIndex * 100),
      duration: 0.55,
      ease: "power2.inOut",
      onComplete: () => {
        if (carouselIndex === slides.length + 1) {
          carouselResetRef.current = true;

          gsap.set(track, {
            xPercent: -100,
          });

          setCarouselIndex(1);
        }
      },
    });

    carouselSlides.forEach((slide, index) => {
      gsap.to(slide, {
        scale: index === carouselIndex ? 1 : 0.985,
        opacity: index === carouselIndex ? 1 : 0.92,
        duration: 0.55,
        ease: "power2.inOut",
      });
    });

    return () =>
        gsap.killTweensOf([track, ...carouselSlides]);

  }, [carouselIndex, slides.length]);

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

  /* =========================BENEFICIOS PIN========================= */

  useEffect(() => {

    const beneficiosSection =
        beneficiosRef.current;

    const beneficiosHeader =
        beneficiosHeaderRef.current;

    if (!beneficiosSection || !beneficiosHeader) return;

    const mm = gsap.matchMedia();

    const ctx = gsap.context(() => {

      mm.add("(min-width: 1101px)", () => {

        const WHY_PIN_TOP = 120;
        const WHY_GEOMETRIC_FADE_DISTANCE = 120;
        const WHY_LINE_SHIFT = -10;
        const WHY_EYEBROW_FADE_DELAY = 0.85;

        const cardsContainer =
            beneficiosSection.querySelector(
                ".beneficios-grid"
            );

        if (!cardsContainer) return;

        const cards =
            gsap.utils.toArray(
                ".beneficio-card",
                cardsContainer
            );

        const lastCard =
            cards[cards.length - 1];

        if (!lastCard) return;

        const titleLines =
            gsap.utils.toArray(
                ".why-title-line",
                beneficiosHeader
            );

        const eyebrow =
            beneficiosHeader.querySelector(
                ".beneficios-eyebrow"
            );

        if (!titleLines.length || !eyebrow) return;

        const getTitleFirstLineBottom = () => {
          const headerRect =
              beneficiosHeader.getBoundingClientRect();

          const firstLineRect =
              titleLines[0].getBoundingClientRect();

          return WHY_PIN_TOP + firstLineRect.bottom - headerRect.top;
        };

        gsap.set(titleLines, {
          autoAlpha: 1,
          y: 0,
        });

        gsap.set(eyebrow, {
          autoAlpha: 1,
          y: 0,
        });

        ScrollTrigger.create({
          trigger: beneficiosSection,
          pin: beneficiosHeader,
          start: `top ${WHY_PIN_TOP}px`,
          endTrigger: lastCard,
          end: () =>
              `bottom ${getTitleFirstLineBottom()}`,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        const clampProgress =
            gsap.utils.clamp(0, 1);

        const lineSetters =
            titleLines.map((line) => ({
              opacity: gsap.quickSetter(line, "opacity"),
              y: gsap.quickSetter(line, "y", "px"),
            }));

        const eyebrowSetters = {
          opacity: gsap.quickSetter(eyebrow, "opacity"),
          y: gsap.quickSetter(eyebrow, "y", "px"),
        };

        const getLastRowCards = () => {
          const lastRowTop =
              Math.max(
                  ...cards.map((card) => card.offsetTop)
              );

          return cards.filter((card) =>
              Math.abs(card.offsetTop - lastRowTop) < 4
          );
        };

        const getLastRowBottom = () =>
            Math.max(
                ...getLastRowCards().map((card) =>
                    card.getBoundingClientRect().bottom
                )
            );

        const updateGeometricFade = () => {
          const targetY =
              getLastRowBottom();

          const opacities =
              titleLines.map((line, index) => {
                const lineBottom =
                    line.getBoundingClientRect().bottom;

                const progress =
                    clampProgress(
                        (lineBottom + WHY_GEOMETRIC_FADE_DISTANCE - targetY) /
                        WHY_GEOMETRIC_FADE_DISTANCE
                    );

                const opacity =
                    1 - progress;

                lineSetters[index].opacity(opacity);
                lineSetters[index].y(WHY_LINE_SHIFT * progress);

                return opacity;
              });

          const firstLineOpacity =
              opacities[0] ?? 1;

          const eyebrowProgress =
              clampProgress(
                  (WHY_EYEBROW_FADE_DELAY - firstLineOpacity) /
                  WHY_EYEBROW_FADE_DELAY
              );

          eyebrowSetters.opacity(1 - eyebrowProgress);
          eyebrowSetters.y(-4 * eyebrowProgress);
        };

        ScrollTrigger.create({
          trigger: beneficiosSection,
          start: `top ${WHY_PIN_TOP}px`,
          endTrigger: lastCard,
          end: () =>
              `bottom ${getTitleFirstLineBottom()}`,
          invalidateOnRefresh: true,
          onRefresh: updateGeometricFade,
          onUpdate: updateGeometricFade,
          onEnter: updateGeometricFade,
          onLeave: updateGeometricFade,
          onEnterBack: updateGeometricFade,
          onLeaveBack: updateGeometricFade,
        });

      });

    }, beneficiosSection);

    return () => {
      mm.revert();
      ctx.revert();
    };

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
        autoAlpha: 1,
      });

      gsap.set(items, {
        autoAlpha: 0,
        y: 32,
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

      tl.to(items, {
            autoAlpha: 1,
            y: 0,
            duration: 0.16,
            stagger: 0.03,
          }, 0)
          .to(list, {
            y: () => -Math.max(
                list.scrollHeight - window.innerHeight * 0.36,
                window.innerHeight * 0.9
            ),
            ease: "none",
            duration: 1,
          }, 0);

    }, section);

    return () => ctx.revert();

  }, []);

  const heroCarouselSlides =
      slides.length
          ? [
              {
                slide: slides[slides.length - 1],
                realIndex: slides.length - 1,
                key: "clone-last",
              },
              ...slides.map((slide, index) => ({
                slide,
                realIndex: index,
                key: `slide-${index}`,
              })),
              {
                slide: slides[0],
                realIndex: 0,
                key: "clone-first",
              },
            ]
          : [];

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

          <section className="premium-carousel hero-carousel">

              <div
                  className="hero-track"
                  ref={carouselTrackRef}
                  style={{ transform: "translateX(-100%)" }}
              >

              {heroCarouselSlides.map(({ slide, realIndex, key }, i) => (

                  <div
                      key={key}
                      className={`premium-slide hero-slide ${
                          i === carouselIndex ? "active" : ""
                      }`}
                  >

                      <img
                          src={slide.image}
                          alt={slide.title}
                      />

                      <div className={`slide-content slide-${realIndex}`}>
                          <h2>{slide.title}</h2>
                          <p>{slide.text}</p>
                      </div>

                  </div>

              ))}

              </div>

          </section>

          <div className="premium-dots outside-dots">

              {slides.map((_, i) => (

                  <button
                      key={i}
                      onClick={() => {
                          setSlideIndex(i);
                          setCarouselIndex(i + 1);
                      }}
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
                      {beneficios.map((item, index) => {
                          const expanded =
                              beneficiosExtended[index] || {
                                  title: item.title,
                                  text: item.text,
                              };

                          return (
                          <article className="beneficio-card" key={index} tabIndex={0}>
                              <div className="beneficio-card-front">
                                  <div className="beneficio-card-img">
                                      <img src={item.image} alt={item.title} />
                                  </div>

                                  <div className="beneficio-card-text">
                                      <span>{String(index + 1).padStart(2, "0")}</span>
                                      <h3>{item.title}</h3>
                                      <p>{item.text}</p>
                                  </div>
                              </div>

                              <div className="beneficio-card-back">
                                  <span>{String(index + 1).padStart(2, "0")}</span>
                                  <h3>{expanded.title}</h3>
                                  <p>{expanded.text}</p>
                              </div>
                          </article>
                          );
                      })}
                  </div>

                  <div className="beneficios-header" ref={beneficiosHeaderRef}>
                      <span className="beneficios-eyebrow">
                          POR QUÉ ELEGIRNOS
                      </span>

                      <h2 aria-label="Tecnología pensada para crear, crecer y evolucionar.">
                          <span className="why-title-line" aria-hidden="true">
                              Tecnología
                          </span>
                          <span className="why-title-line" aria-hidden="true">
                              pensada
                          </span>
                          <span className="why-title-line" aria-hidden="true">
                              para crear,
                          </span>
                          <span className="why-title-line" aria-hidden="true">
                              crecer y
                          </span>
                          <span className="why-title-line" aria-hidden="true">
                              evolucionar.
                          </span>
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
