import styles from "./TechnologyStrip.module.css";

const TECHNOLOGY_LOGO_SCALE = 1.15;

const TECHNOLOGIES = Object.freeze([
  {
    name: "React",
    assetPath: "/technology-logos/react.svg",
    widthRem: 5.55,
  },
  {
    name: "Next.js",
    assetPath: "/technology-logos/nextjs.svg",
    widthRem: 5.15,
  },
  {
    name: "TypeScript",
    assetPath: "/technology-logos/typescript.svg",
    widthRem: 4.65,
  },
  {
    name: "Tailwind CSS",
    assetPath: "/technology-logos/tailwindcss.svg",
    widthRem: 5.95,
  },
  {
    name: "GSAP",
    assetPath: "/technology-logos/gsap.svg",
    widthRem: 5.7,
  },
  {
    name: "Motion",
    assetPath: "/technology-logos/motion.svg",
    widthRem: 5.35,
  },
  {
    name: "Node.js",
    assetPath: "/technology-logos/nodejs.svg",
    widthRem: 5.25,
  },
  {
    name: "Java",
    assetPath: "/technology-logos/java.svg",
    widthRem: 4.45,
  },
  {
    name: "Spring Boot",
    assetPath: "/technology-logos/springboot.svg",
    widthRem: 5.45,
  },
  {
    name: "Payload",
    assetPath: "/technology-logos/payload.svg",
    widthRem: 5.1,
  },
  {
    name: "Prisma",
    assetPath: "/technology-logos/prisma.svg",
    widthRem: 4.85,
  },
  {
    name: "PostgreSQL",
    assetPath: "/technology-logos/postgresql.svg",
    widthRem: 6.1,
  },
  {
    name: "AWS",
    assetPath: "/technology-logos/aws.svg",
    widthRem: 5.4,
  },
]);

function TechnologyGroup({ decorative = false }) {
  return (
    <ul
      aria-hidden={decorative ? "true" : undefined}
      className={`${styles.group} ${decorative ? styles.groupClone : ""}`}
    >
      {TECHNOLOGIES.map(({ name, assetPath, widthRem }) => (
        <li
          className={styles.item}
          key={`${decorative ? "clone" : "primary"}-${name}`}
          style={{
            "--technology-logo-mask": `url("${assetPath}")`,
            "--technology-logo-width-base": `${widthRem}rem`,
          }}
        >
          <span aria-hidden="true" className={styles.logoFrame}>
            <span className={styles.logoMark} />
          </span>
          <span aria-hidden="true" className={styles.itemLabel}>
            {name}
          </span>
          {!decorative ? <span className={styles.srOnly}>{name}</span> : null}
        </li>
      ))}
    </ul>
  );
}

export default function TechnologyStrip({ copy }) {
  const headingId = "home-technology-strip-title";

  return (
    <section
      aria-labelledby={headingId}
      className={styles.section}
      style={{ "--technology-logo-scale": TECHNOLOGY_LOGO_SCALE }}
    >
      <div className={styles.editorial}>
        <span className={styles.eyebrow}>{copy.eyebrow}</span>
        <h2 className={styles.title} id={headingId}>
          {copy.title}
        </h2>
      </div>

      <div className={styles.viewport}>
        <div className={styles.track}>
          <TechnologyGroup />
          <TechnologyGroup decorative />
        </div>
      </div>

      <div className={styles.descriptionWrap}>
        <p className={styles.description}>{copy.description}</p>
      </div>
    </section>
  );
}
