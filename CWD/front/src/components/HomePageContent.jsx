"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";
import OpticalDivider from "@/components/OpticalDivider";
import CodeCascade from "@/components/CodeCascade";

gsap.registerPlugin(ScrollTrigger);

const HERO_CAROUSEL_MOTION_PRESETS = {
  balanced: {
    gapPx: 22,
    durationMs: 960,
    easing: "cubic-bezier(0.11, 0.95, 0.18, 1)",
  },
  noticeableBrake: {
    gapPx: 28,
    durationMs: 1550,
    easing:
      "linear(0, 0.2 7%, 0.46 16%, 0.68 30%, 0.82 46%, 0.92 64%, 0.98 86%, 1)",
  },
  cinematicBrake: {
    gapPx: 32,
    durationMs: 1480,
    easing: "cubic-bezier(0.06, 0.76, 0.1, 1)",
  },
};

const HERO_CAROUSEL_MOTION =
  HERO_CAROUSEL_MOTION_PRESETS.noticeableBrake;

const HERO_CAROUSEL_GAP = HERO_CAROUSEL_MOTION.gapPx;
const HERO_CAROUSEL_RESET_MS = HERO_CAROUSEL_MOTION.durationMs + 80;

const NARRATIVE_TIMING = {
  triadInitialDelayMs: 220,
  triadWordDurationMs: 850,
  triadWordGapMs: 650,
  phraseCharStepMs: 18,
  phraseCharRevealDurationMs: 180,
  phraseVisualLeadMs: 350,
  phraseHoldAfterTypingMs: 320,
  phraseFadeOutDurationMs: 220,
  phraseRevealDelayMs: 80,
  phraseRevealDurationMs: 420,
};

const HERO_MEDIMOS_START_MS =
  NARRATIVE_TIMING.triadInitialDelayMs +
  NARRATIVE_TIMING.triadWordGapMs * 2;

const HERO_PHRASE_START_AFTER_TRIAD_MS =
  NARRATIVE_TIMING.triadWordGapMs;

const HERO_VALUE_START_DELAY_MS = Math.max(
  0,
  HERO_MEDIMOS_START_MS +
    HERO_PHRASE_START_AFTER_TRIAD_MS -
    NARRATIVE_TIMING.phraseVisualLeadMs
);

export default function HomePageContent() {
  const { language } = useLanguage();
  const t = translations[language];

  const slides = t.homePage.carousel;
  const carouselA11y = t.homePage.carouselA11y;
  const beneficios = t.homePage.beneficios;
  const beneficiosExtended = t.homePage.beneficiosExtended || [];
  const beneficiosHeader = t.homePage.beneficiosHeader;
  const servicios = t.homePage.servicios;
  const cta = t.homePage.cta;
  const narrative = t.homePage.narrative;

  const beneficiosTitleLines = useMemo(
    () => beneficiosHeader.lineas || [beneficiosHeader.titulo],
    [beneficiosHeader]
  );

  const heroValueProposition = narrative.valueProposition;
  const partnershipWords = narrative.partnership.split(" ");

  const partnershipAccentIndex =
    language === "it" ? partnershipWords.length - 1 : 0;

  const heroValueCharCount = Array.from(heroValueProposition).filter(
    (character) => character !== " "
  ).length;

  const heroValueTypingMs =
    heroValueCharCount * NARRATIVE_TIMING.phraseCharStepMs + 320;

  const beneficiosRef = useRef(null);
  const beneficiosHeaderRef = useRef(null);
  const sectionRef = useRef(null);
  const carouselTrackRef = useRef(null);
  const carouselResetTimeoutRef = useRef(null);

  const [slideIndex, setSlideIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(1);
  const [isCarouselResetting, setIsCarouselResetting] = useState(false);
  const [valuePropositionPhase, setValuePropositionPhase] =
    useState("idle");

  const valuePropositionWords = useMemo(() => {
    let characterIndex = 0;

    return heroValueProposition.split(" ").map((word, wordIndex) => ({
      id: `${word}-${wordIndex}`,
      chars: Array.from(word).map((character) => {
        const nextCharacter = {
          character,
          index: characterIndex,
        };

        characterIndex += 1;
        return nextCharacter;
      }),
    }));
  }, [heroValueProposition]);

  useEffect(() => {
    const reduceMotionQuery =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const prefersReducedMotion = reduceMotionQuery?.matches;
    const timers = [];

    const schedule = (callback, delay) => {
      const timer = setTimeout(callback, delay);
      timers.push(timer);
      return timer;
    };

    if (prefersReducedMotion) {
      setValuePropositionPhase("complete");
      return () => timers.forEach(clearTimeout);
    }

    setValuePropositionPhase("idle");

    schedule(() => {
      setValuePropositionPhase("typing");

      schedule(() => {
        setValuePropositionPhase("exiting");

        schedule(() => {
          setValuePropositionPhase("impact");

          schedule(() => {
            setValuePropositionPhase("complete");
          }, NARRATIVE_TIMING.phraseRevealDurationMs);
        }, NARRATIVE_TIMING.phraseFadeOutDurationMs + NARRATIVE_TIMING.phraseRevealDelayMs);
      }, heroValueTypingMs + NARRATIVE_TIMING.phraseHoldAfterTypingMs);
    }, HERO_VALUE_START_DELAY_MS);

    return () => timers.forEach(clearTimeout);
  }, [heroValueTypingMs, heroValueProposition]);

  useEffect(() => {
    if (!slides.length) {
      return undefined;
    }

    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length);

      setCarouselIndex((prev) => {
        if (prev >= slides.length + 1) {
          return prev;
        }

        return prev + 1;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    setIsCarouselResetting(true);
    setCarouselIndex(1);
    setSlideIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (!isCarouselResetting) {
      return undefined;
    }

    const frame = requestAnimationFrame(() => {
      setIsCarouselResetting(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [isCarouselResetting]);

  useEffect(() => {
    if (carouselIndex <= slides.length + 1) {
      return undefined;
    }

    setIsCarouselResetting(true);
    setCarouselIndex(1);
    setSlideIndex(0);

    return undefined;
  }, [carouselIndex, slides.length]);

  useEffect(() => {
    if (carouselIndex !== slides.length + 1) {
      return undefined;
    }

    carouselResetTimeoutRef.current = setTimeout(() => {
      setIsCarouselResetting(true);
      setCarouselIndex(1);
      setSlideIndex(0);
    }, HERO_CAROUSEL_RESET_MS);

    return () => {
      if (carouselResetTimeoutRef.current) {
        clearTimeout(carouselResetTimeoutRef.current);
      }
    };
  }, [carouselIndex, slides.length]);

  const handleHeroCarouselTransitionEnd = (event) => {
    if (event.target !== carouselTrackRef.current) {
      return;
    }

    if (carouselIndex !== slides.length + 1) {
      return;
    }

    if (carouselResetTimeoutRef.current) {
      clearTimeout(carouselResetTimeoutRef.current);
    }

    setIsCarouselResetting(true);
    setCarouselIndex(1);
    setSlideIndex(0);
  };

  useEffect(() => {
    if (!beneficiosRef.current) {
      return;
    }

    const items = beneficiosRef.current.querySelectorAll(".beneficio-card");

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const index = [...items].indexOf(el);

            el.style.transitionDelay = `${index * 120}ms`;
            el.classList.add("show");

            obs.unobserve(el);
          }
        });
      },
      {
        threshold: 0.25,
      }
    );

    items.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const beneficiosSection = beneficiosRef.current;
    const beneficiosHeader = beneficiosHeaderRef.current;

    if (!beneficiosSection || !beneficiosHeader) {
      return;
    }

    const mm = gsap.matchMedia();
    let refreshFrame;

    const ctx = gsap.context(() => {
      mm.add("(min-width: 1101px)", () => {
        const WHY_PIN_TOP = 120;
        const WHY_GEOMETRIC_FADE_DISTANCE = 120;
        const WHY_LINE_SHIFT = -10;
        const WHY_EYEBROW_FADE_DELAY = 0.85;

        const cardsContainer = beneficiosSection.querySelector(".beneficios-grid");

        if (!cardsContainer) {
          return;
        }

        const cards = gsap.utils.toArray(".beneficio-card", cardsContainer);
        const lastCard = cards[cards.length - 1];

        if (!lastCard) {
          return;
        }

        const titleLines = gsap.utils.toArray(".why-title-line", beneficiosHeader);
        const eyebrow = beneficiosHeader.querySelector(".beneficios-eyebrow");

        if (!titleLines.length || !eyebrow) {
          return;
        }

        const getTitleFirstLineBottom = () => {
          const headerRect = beneficiosHeader.getBoundingClientRect();
          const firstLineRect = titleLines[0].getBoundingClientRect();

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

        const pinTrigger = ScrollTrigger.create({
          trigger: beneficiosSection,
          pin: beneficiosHeader,
          start: `top ${WHY_PIN_TOP}px`,
          endTrigger: lastCard,
          end: () => `bottom ${getTitleFirstLineBottom()}`,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });

        const clampProgress = gsap.utils.clamp(0, 1);

        const lineSetters = titleLines.map((line) => ({
          opacity: gsap.quickSetter(line, "opacity"),
          y: gsap.quickSetter(line, "y", "px"),
        }));

        const eyebrowSetters = {
          opacity: gsap.quickSetter(eyebrow, "opacity"),
          y: gsap.quickSetter(eyebrow, "y", "px"),
        };

        const getLastRowCards = () => {
          const lastRowTop = Math.max(...cards.map((card) => card.offsetTop));

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
          const targetY = getLastRowBottom();

          const opacities = titleLines.map((line, index) => {
            const lineBottom = line.getBoundingClientRect().bottom;

            const progress = clampProgress(
              (lineBottom + WHY_GEOMETRIC_FADE_DISTANCE - targetY) /
                WHY_GEOMETRIC_FADE_DISTANCE
            );

            const opacity = 1 - progress;

            lineSetters[index].opacity(opacity);
            lineSetters[index].y(WHY_LINE_SHIFT * progress);

            return opacity;
          });

          const firstLineOpacity = opacities[0] ?? 1;

          const eyebrowProgress = clampProgress(
            (WHY_EYEBROW_FADE_DELAY - firstLineOpacity) /
              WHY_EYEBROW_FADE_DELAY
          );

          eyebrowSetters.opacity(1 - eyebrowProgress);
          eyebrowSetters.y(-4 * eyebrowProgress);
        };

        const fadeTrigger = ScrollTrigger.create({
          trigger: beneficiosSection,
          start: `top ${WHY_PIN_TOP}px`,
          endTrigger: lastCard,
          end: () => `bottom ${getTitleFirstLineBottom()}`,
          invalidateOnRefresh: true,
          onRefresh: updateGeometricFade,
          onUpdate: updateGeometricFade,
          onEnter: updateGeometricFade,
          onLeave: updateGeometricFade,
          onEnterBack: updateGeometricFade,
          onLeaveBack: updateGeometricFade,
        });

        refreshFrame = requestAnimationFrame(() => {
          pinTrigger.refresh();
          fadeTrigger.refresh();
          updateGeometricFade();
        });
      });
    }, beneficiosSection);

    return () => {
      if (refreshFrame) {
        cancelAnimationFrame(refreshFrame);
      }

      ctx.revert();
      mm.revert();
    };
  }, [language, beneficiosTitleLines]);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const ctx = gsap.context(() => {
      const cardsScroll = section.querySelector(".services-cards-scroll");
      const list = section.querySelector(".services-list");
      const items = gsap.utils.toArray(".service-item", section);

      if (!cardsScroll || !list || !items.length) {
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(min-width: 769px)", () => {
        gsap.set(cardsScroll, {
          autoAlpha: 1,
        });

        gsap.set(items, {
          autoAlpha: 0,
          y: 32,
        });

        gsap.set(list, {
          xPercent: -50,
        });

        const getEntryGap = () => Math.max(48, window.innerHeight * 0.08);
        const getInitialY = () => window.innerHeight + getEntryGap();
        const getFinalY = () =>
          -Math.max(
            list.scrollHeight - window.innerHeight * 0.4,
            window.innerHeight * 1.1
          );
        const getTravelDistance = () => getInitialY() - getFinalY();
        const getScrollDistance = () =>
          Math.max(
            getTravelDistance() * 1.05,
            window.innerHeight * 2.4
          );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${getScrollDistance()}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.to(
          items,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.18,
            stagger: 0.04,
          },
          0
        ).fromTo(
          list,
          {
            y: getInitialY,
          },
          {
            y: getFinalY,
            ease: "none",
            duration: 1,
          },
          0
        );

        return () => {
          ScrollTrigger.getAll().forEach((trigger) => {
            if (trigger.trigger === section) {
              trigger.kill();
            }
          });
        };
      });
    }, section);

    return () => ctx.revert();
  }, []);

  const heroCarouselSlides = slides.length
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
      <div className="hero-showcase-composition">
        <div className="hero-code-layer" aria-hidden="true">
          <CodeCascade />
        </div>

        <section className="hero">
          <div className="hero-layout">
            <div className="hero-brand-lockup">
              <h1 className="hero-title">
                <span className="line1 glitch-line" data-text="CodeWork">
                  CodeWork
                </span>

                <span className="line2 glitch-line" data-text="Digital">
                  Digital
                </span>
              </h1>

              <p className="carousel-text hero-slogan">
                <span className="hero-slogan-mark">_</span>we make it work
              </p>

              <section
                className="cwd-narrative-core"
                aria-labelledby="cwd-narrative-title"
                style={{
                  "--triad-initial-delay": `${NARRATIVE_TIMING.triadInitialDelayMs}ms`,
                  "--triad-word-duration": `${NARRATIVE_TIMING.triadWordDurationMs}ms`,
                  "--triad-word-gap": `${NARRATIVE_TIMING.triadWordGapMs}ms`,
                  "--phrase-char-step": `${NARRATIVE_TIMING.phraseCharStepMs}ms`,
                  "--phrase-char-duration": `${NARRATIVE_TIMING.phraseCharRevealDurationMs}ms`,
                  "--phrase-fade-out-duration": `${NARRATIVE_TIMING.phraseFadeOutDurationMs}ms`,
                  "--phrase-reveal-duration": `${NARRATIVE_TIMING.phraseRevealDurationMs}ms`,
                }}
              >
                <h2 className="brutal-triad" id="cwd-narrative-title">
                  {narrative.triad.map((word, index) => (
                    <span
                      className={`triad-word ${
                        index === narrative.triad.length - 1
                          ? "accent-glow"
                          : ""
                      }`}
                      key={word}
                    >
                      {word}
                    </span>
                  ))}
                </h2>

                <div className="hero-value-stack">
                  <p
                    className={`value-proposition is-${valuePropositionPhase}`}
                  >
                    <span className="home-visually-hidden">
                      {heroValueProposition}
                    </span>
                    <span
                      className="value-proposition-visual"
                      aria-hidden="true"
                    >
                      {valuePropositionWords.map((word, wordIndex) => (
                        <span className="value-word" key={word.id}>
                          {word.chars.map(({ character, index }) => (
                            <span
                              className="value-char"
                              key={`${character}-${index}`}
                              style={{ "--char-index": index }}
                            >
                              {character}
                            </span>
                          ))}

                          {wordIndex < valuePropositionWords.length - 1
                            ? "\u00A0"
                            : ""}
                        </span>
                      ))}
                    </span>
                  </p>

                  <p
                    className={`hero-partnership-line ${
                      valuePropositionPhase === "impact" ||
                      valuePropositionPhase === "complete"
                        ? "is-visible"
                        : ""
                    }`}
                  >
                    {partnershipWords.map((word, index) => (
                      <span
                        className={
                          index === partnershipAccentIndex
                            ? "hero-partnership-accent"
                            : undefined
                        }
                        key={`${word}-${index}`}
                      >
                        {word}
                        {index < partnershipWords.length - 1 ? " " : ""}
                      </span>
                    ))}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>

        <section
          className="premium-carousel hero-carousel"
          style={{
            "--hero-carousel-gap": `${HERO_CAROUSEL_MOTION.gapPx}px`,
            "--hero-carousel-duration": `${HERO_CAROUSEL_MOTION.durationMs}ms`,
            "--hero-carousel-easing": HERO_CAROUSEL_MOTION.easing,
          }}
        >
          <div
            className={`hero-track ${
              isCarouselResetting ? "is-resetting" : ""
            }`}
            ref={carouselTrackRef}
            style={{
              transform: `translate3d(calc(-${
                carouselIndex * 100
              }% - ${carouselIndex * HERO_CAROUSEL_GAP}px), 0, 0)`,
            }}
            onTransitionEnd={handleHeroCarouselTransitionEnd}
          >
            {heroCarouselSlides.map(({ slide, realIndex, key }, i) => (
              <div
                key={key}
                className={`premium-slide hero-slide ${
                  i === carouselIndex ? "active" : ""
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 1024px) calc(100vw - 32px), (max-width: 1413px) 92vw, 1300px"
                  priority={i === 1}
                />

                <div className={`slide-content slide-${realIndex}`}>
                  <h2>{slide.title}</h2>
                  <p>{slide.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div
          className="hero-carousel-progress outside-dots"
          role="group"
          aria-label={carouselA11y.progressLabel}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSlideIndex(i);
                setCarouselIndex(i + 1);
              }}
              className={`hero-carousel-progress__segment ${
                i < slideIndex
                  ? "is-filled"
                  : i === slideIndex
                    ? "is-active"
                    : "is-pending"
              }`}
              aria-label={carouselA11y.slideButtonLabel(i + 1, slides.length)}
              aria-current={i === slideIndex ? "true" : undefined}
            >
              <span className="hero-carousel-progress__fill" />
            </button>
          ))}
        </div>
      </div>

      <section className="beneficios" ref={beneficiosRef}>
        <div className="beneficios-layout">
          <div className="beneficios-grid">
            {beneficios.map((item, index) => {
              const expanded = beneficiosExtended[index] || {
                title: item.title,
                text: item.text,
              };

              return (
                <article className="beneficio-card" key={index} tabIndex={0}>
                  <div className="beneficio-card-front">
                    <div className="beneficio-card-img">
                      <img src={item.image} alt={item.title} loading="lazy" />
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
              {beneficiosHeader.subtitulo}
            </span>

            <h2 aria-label={beneficiosHeader.titulo}>
              {beneficiosTitleLines.map((line) => (
                <span
                  className="why-title-line"
                  aria-hidden="true"
                  key={line}
                >
                  {line}
                </span>
              ))}
            </h2>
          </div>
        </div>
      </section>

      <section className="services-clean" ref={sectionRef}>
        <div className="services-bg-title">
          <h2>{servicios.titulo}</h2>
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

      <section className="cta-final">
        <div className="cta-glow" />

        <div className="cta-content">
          <span>{cta.badge}</span>

          <h2>{cta.titulo}</h2>

          <p>{cta.texto}</p>

          <Link href="/contacto" className="btn-contactar cta-final-comet-button">
            {cta.boton}
          </Link>
        </div>

        <OpticalDivider />
      </section>
    </main>
  );
}
