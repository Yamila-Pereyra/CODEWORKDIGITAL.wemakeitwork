export const translations = {
    es: {
        nav: {
            home: "Inicio",
            nosotros: "Quiénes somos",
            servicios: "Servicios",
            contacto: "Contacto",
        },

        accessibility: {
            navigation: {
                openMenu: "Abrir menú de navegación",
                closeMenu: "Cerrar menú de navegación",
            },
            languageSelector: {
                groupLabel: "Cambiar idioma",
                optionLabels: {
                    es: "ES — Cambiar idioma a español",
                    en: "EN — Cambiar idioma a inglés",
                    it: "IT — Cambiar idioma a italiano",
                },
            },
        },

        homePage: {
            narrative: {
                triad: ["Diseñamos.", "Construimos.", "Medimos."],
                valueProposition: "Somos creadores de experiencias digitales respaldadas por ingeniería, privacidad y métricas reales.",
                partnership: "Juntos escalamos y crecemos.",
            },

            frases: [
                "Desarrollo Web Profesional",
                "Tiendas Online y E-commerce",
                "Optimización y SEO",
                "Aplicaciones Web y Móviles",
                "Diseño que convierte",
            ],

            carousel: [
                {
                    image: "/imagenes/carousel-1.webp",
                    title: "Creamos experiencias visuales",
                    text: "Que transmiten confianza, modernidad y credibilidad para tu marca.",
                },
                {
                    image: "/imagenes/carousel-2.webp",
                    title: "Apps móviles que conectan con tus usuarios",
                    text: "Desarrollamos aplicaciones para Android e iOS con experiencias intuitivas, rápidas y escalables.",
                },
                {
                    image: "/imagenes/carousel-3.webp",
                    title: "Más visibilidad. Más clientes. Más resultados.",
                    text: "Optimizamos tu presencia digital para atraer más tráfico, mejorar tu posicionamiento y convertir visitas en oportunidades.",
                },
            ],

            carouselA11y: {
                progressLabel: "Progreso del carrusel principal",
                slideButtonLabel: (current, total) => `Ir a la diapositiva ${current} de ${total}`,
            },

            beneficios: [
                {
                    image: "/imagenes/cards1.jpeg",
                    title: "Websites que convierten",
                    text: "Diseñamos y desarrollamos sitios web rápidos, claros y preparados para crecer.",
                },
                {
                    image: "/imagenes/cards2.jpeg",
                    title: "Apps mobile a medida",
                    text: "Creamos aplicaciones móviles pensadas para resolver problemas reales.",
                },
                {
                    image: "/imagenes/cards3.jpeg",
                    title: "Backend robusto",
                    text: "Construimos APIs, servicios y lógica de negocio.",
                },
                {
                    image: "/imagenes/cards4.jpeg",
                    title: "Integraciones inteligentes",
                    text: "Conectamos sistemas, plataformas y servicios externos.",
                },
                {
                    image: "/imagenes/cards5.jpeg",
                    title: "Performance y estabilidad",
                    text: "Optimizamos aplicaciones para que respondan mejor.",
                },
                {
                    image: "/imagenes/cards6.jpeg",
                    title: "Evolución continua",
                    text: "Acompañamos mejoras y nuevas funcionalidades.",
                },
            ],
            beneficiosExtended: [
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
            ],
            beneficiosHeader: {
                subtitulo: "Por qué elegirnos",
                titulo: "Tecnología pensada para crear, crecer y evolucionar.",
                lineas: ["Tecnología", "pensada", "para crear,", "crecer y", "evolucionar."],
            },
            technologyStrip: {
                eyebrow: "TECNOLOGÍA CON CRITERIO",
                title: "Elegimos tecnologías por su capacidad para resolver, escalar y evolucionar.",
                description: "Cada proyecto requiere decisiones técnicas distintas. Trabajamos con herramientas modernas y maduras, priorizando rendimiento, mantenibilidad y una experiencia de calidad.",
            },
            servicios: {
                titulo: "SERVICIOS",

                items: [
                    {
                        numero: "01",
                        titulo: "Desarrollo Web",
                        texto: "Sitios modernos y optimizados.",
                    },
                    {
                        numero: "02",
                        titulo: "E-Commerce",
                        texto: "Tiendas online enfocadas en ventas.",
                    },
                    {
                        numero: "03",
                        titulo: "SEO & Optimización",
                        texto: "Velocidad y posicionamiento.",
                    },
                    {
                        numero: "04",
                        titulo: "Desarrollo de Apps Mobile",
                        texto: "Aplicaciones móviles personalizadas para Android y iOS.",
                    },
                    {
                        numero: "05",
                        titulo: "Analítica y Decisiones",
                        texto: "Decisiones respaldadas por datos reales",
                    },
                ],
            },
            cta: {
                badge: "HABLEMOS DE TU PROYECTO",
                titulo: "Transformemos tu idea en una experiencia digital que genere resultados.",
                texto: "Desarrollo web, aplicaciones móviles, optimización y soluciones tecnológicas pensadas para crecer junto a tu negocio.",
                boton: "Iniciar proyecto"
            },
        },
        footer: {
            title: "CodeWork Digital",
            email: "contact@codeworkdigital.com",
            phone: "+39 333 735 2719",
            copy: "© 2025 Code Work Digital — Todos los derechos reservados."
        },
        contactPage: {
            hero: {
                label: "Contacto",
                title: "Hablemos sobre tu próximo proyecto digital.",
                text: "Contanos qué necesitás crear, mejorar o impulsar. Te respondemos a la brevedad para ayudarte a transformar tu idea en una solución digital profesional, moderna y preparada para crecer.",
            },
            info: {
                title: "¿Cómo podemos ayudarte?",
                text: "Podemos acompañarte en el desarrollo de sitios web, aplicaciones web, aplicaciones móviles, tiendas online y soluciones digitales pensadas para potenciar tu marca, optimizar procesos y generar nuevas oportunidades de negocio.",
                items: [
                    "Diseño y desarrollo web profesional",
                    "Aplicaciones web a medida",
                    "Aplicaciones móviles (Android e iOS)",
                    "Tiendas online y e-commerce",
                    "Landing pages para campañas",
                    "Optimización y posicionamiento digital",
                ],
            },
            form: {
                title: "Formulario de contacto",
                name: "Nombre",
                email: "Email",
                phone: "WhatsApp",
                whatsapp: "WhatsApp",
                companyProject: "Empresa / Proyecto",
                message: "Mensaje",
                submit: "Solicitar propuesta",
                sending: "enviando_mensaje...",
                error: "Error enviando mensaje. Intenta nuevamente.",
                success: "Mensaje enviado correctamente",
                optional: "Opcional",
                errors: {
                    requiredName: "Ingresá tu nombre.",
                    requiredEmail: "Ingresá tu email.",
                    invalidEmail: "Ingresá un email válido.",
                    invalidWhatsApp: "Ingresá un número de WhatsApp válido.",
                    requiredMessage: "Escribí un mensaje.",
                },
            },
        },
        serviciosPage: {
            hero: {
                label: "Soluciones digitales",
                title: "Sitios web, aplicaciones y herramientas digitales diseñadas para impulsar tu negocio.",
                text: "En Code Work Digital combinamos diseño, tecnología y estrategia para crear experiencias digitales modernas, optimizadas y orientadas a resultados. Desarrollamos soluciones que ayudan a empresas, profesionales y emprendedores a crecer, conectar con sus clientes y generar nuevas oportunidades.",
                cta: "Solicitar presupuesto",
            },
            list: {
                label: "Qué hacemos",
                title: "Soluciones digitales adaptadas a las necesidades de cada proyecto.",
                watermark: "SERVICIOS",
                items: [
                    {
                        numero: "01",
                        titulo: "Análisis Sectorial e Identidad Diferencial",
                        texto: "Estudiamos el sector, sus códigos visuales, competidores y oportunidades para identificar diferenciales reales. A partir de ese análisis, construimos una propuesta de diseño e identidad que permita a la marca destacarse con claridad y coherencia.",
                    },
                    {
                        numero: "02",
                        titulo: "Desarrollo Web Profesional",
                        texto: "Creamos sitios institucionales, landing pages, portfolios y plataformas corporativas con diseño moderno, excelente rendimiento y una experiencia clara, profesional y orientada a los objetivos de cada proyecto.",
                    },
                    {
                        numero: "03",
                        titulo: "Tiendas Online y E-commerce",
                        texto: "Desarrollamos tiendas digitales preparadas para vender, integrando catálogo, medios de pago y gestión de pedidos. Diseñamos experiencias simples y confiables para facilitar la compra y acompañar el crecimiento del negocio.",
                    },
                    {
                        numero: "04",
                        titulo: "Aplicaciones Web y Móviles",
                        texto: "Diseñamos y desarrollamos aplicaciones personalizadas para empresas, emprendimientos y productos digitales. Creamos soluciones escalables, seguras y adaptadas a los procesos y necesidades específicas de cada proyecto.",
                    },
                    {
                        numero: "05",
                        titulo: "Optimización, SEO y GEO",
                        texto: "Mejoramos rendimiento, velocidad y experiencia de usuario, junto con la visibilidad en buscadores mediante SEO. También preparamos contenidos y estructura para entornos generativos y sistemas de búsqueda asistidos por IA mediante estrategias GEO.",
                    },
                    {
                        numero: "06",
                        titulo: "Evolución y Mantenimiento",
                        texto: "Acompañamos la evolución del sitio mediante mantenimiento técnico, actualizaciones periódicas y renovaciones visuales. Adaptamos diseño, contenido y funcionalidades para que la presencia digital permanezca vigente, segura y alineada con la marca.",
                    },
                    {
                        numero: "07",
                        titulo: "Analítica y Métricas",
                        texto: "Implementamos métricas útiles y respetuosas de la privacidad para comprender cómo las personas utilizan el sitio. Medimos comportamiento, conversiones y resultados para detectar oportunidades y validar decisiones con evidencia.",
                    },
                    {
                        numero: "08",
                        titulo: "Acción sobre Resultados",
                        texto: "Transformamos los resultados del análisis en mejoras concretas. Priorizamos acciones sobre contenido, experiencia, rendimiento y conversión, evaluamos su impacto y acompañamos una evolución continua basada en evidencia.",
                    },
                ],
            },
            cta: {
                title: "Miles de clientes están buscando exactamente lo que vos ofrecés.",
                text: "Transformemos tu idea en una solución digital profesional, moderna y preparada para crecer junto a tu negocio.",
                button: "Empezar mi proyecto",
            },
        },
        quienesSomosPage: {
            label: "Quiénes somos",

            titulo: `Somos creadores de sitios web,
aplicaciones y experiencias
digitales que generan resultados.`,

            descripcion:
                "Nuestros productos, sitios web, aplicaciones y soluciones digitales combinan diseño, tecnología y estrategia que impulsan marcas, mejoran experiencias y generan resultados reales.",

            botonProyecto: "Hablemos de tu proyecto",
            botonServicios: "Ver servicios",

            manifiestoTexto:
                "Cada proyecto comienza escuchando tus necesidades y entendiendo tus objetivos. Combinamos diseño, desarrollo y estrategia para crear soluciones claras, efectivas y pensadas para crecer junto a tu negocio.",

            manifiestoLabel: "Nuestra forma de trabajar",

            manifiestoTitulo:
                "Tecnología, diseño y estrategia trabajando juntos.",

            valores: [
                {
                    numero: "01",
                    titulo: "Diseño con propósito",
                    texto:
                        "Creamos interfaces modernas que reflejan la identidad de tu marca y generan confianza desde el primer vistazo.",
                },
                {
                    numero: "02",
                    titulo: "Tecnología sólida",
                    texto:
                        "Desarrollamos sitios rápidos, seguros y optimizados para ofrecer una experiencia fluida en cualquier dispositivo.",
                },
                {
                    numero: "03",
                    titulo: "Acompañamiento real",
                    texto:
                        "Te acompañamos durante todo el proceso, desde la planificación inicial hasta la publicación y evolución del proyecto.",
                },
            ],
        },
    },

    en: {
        nav: {
            home: "Home",
            nosotros: "About us",
            servicios: "Services",
            contacto: "Contact",
        },

        accessibility: {
            navigation: {
                openMenu: "Open navigation menu",
                closeMenu: "Close navigation menu",
            },
            languageSelector: {
                groupLabel: "Change language",
                optionLabels: {
                    es: "ES — Change language to Spanish",
                    en: "EN — Change language to English",
                    it: "IT — Change language to Italian",
                },
            },
        },

        homePage: {
            narrative: {
                triad: ["We design.", "We build.", "We measure."],
                valueProposition: "We are creators of digital experiences backed by engineering, privacy, and real metrics.",
                partnership: "Together we scale and grow.",
            },

            frases: [
                "Professional Web Development",
                "Online Stores and E-commerce",
                "SEO Optimization",
                "Web and Mobile Applications",
                "Design that converts",
            ],

            carousel: [
                {
                    image: "/imagenes/carousel-1.webp",
                    title: "We create visual experiences",
                    text: "That build trust, modernity, and credibility for your brand.",
                },
                {
                    image: "/imagenes/carousel-2.webp",
                    title: "Mobile apps that connect with your users",
                    text: "We develop Android and iOS applications with intuitive, fast, and scalable experiences.",
                },
                {
                    image: "/imagenes/carousel-3.webp",
                    title: "More visibility. More clients. More results.",
                    text: "We optimize your digital presence to attract more traffic, improve your ranking, and turn visits into opportunities.",
                },
            ],

            carouselA11y: {
                progressLabel: "Main carousel progress",
                slideButtonLabel: (current, total) => `Go to slide ${current} of ${total}`,
            },

            beneficios: [
                {
                    image: "/imagenes/cards1.jpeg",
                    title: "Websites that convert",
                    text: "We design and build fast, clear websites ready to grow.",
                },
                {
                    image: "/imagenes/cards2.jpeg",
                    title: "Custom mobile apps",
                    text: "We create mobile applications designed to solve real problems.",
                },
                {
                    image: "/imagenes/cards3.jpeg",
                    title: "Robust backend",
                    text: "We build APIs, services, and business logic.",
                },
                {
                    image: "/imagenes/cards4.jpeg",
                    title: "Smart integrations",
                    text: "We connect systems, platforms, and external services.",
                },
                {
                    image: "/imagenes/cards5.jpeg",
                    title: "Performance and stability",
                    text: "We optimize applications so they respond better.",
                },
                {
                    image: "/imagenes/cards6.jpeg",
                    title: "Continuous evolution",
                    text: "We support improvements and new features.",
                },
            ],
            beneficiosExtended: [
                {
                    title: "Websites that convert",
                    text: "We design and build fast, clear websites prepared to grow. We take care of the visual experience, technical structure and performance so your digital presence is not only attractive, but also functional, measurable and effective.",
                },
                {
                    title: "Custom mobile apps",
                    text: "We create mobile applications designed to solve real problems. From the initial idea to a functional version, we prioritize simple interfaces, clear flows and a solid technical base so the app can evolve without losing stability.",
                },
                {
                    title: "Robust backend",
                    text: "We build APIs, services and business logic with a focus on security, scalability and maintainability. We care that the system works well inside: clear contracts, consistent data, reliable integrations and code prepared to grow.",
                },
                {
                    title: "Smart integrations",
                    text: "We connect systems, platforms, databases and external services so they work as one. We reduce manual processes, improve traceability and help technology support the real workflow of your business.",
                },
                {
                    title: "Performance and stability",
                    text: "We optimize applications so they respond better, fail less and are easier to monitor. We analyze bottlenecks, load times, recurring errors and critical points to improve the end-user experience.",
                },
                {
                    title: "Continuous evolution",
                    text: "We do not think of software as something static. We support improvements, new features, maintenance and technical adjustments so your digital product can adapt to the market, your users and new business opportunities.",
                },
            ],

            beneficiosHeader: {
                subtitulo: "Why choose us",
                titulo: "Technology designed to create, grow and evolve.",
                lineas: ["Technology", "designed", "to create,", "grow and", "evolve."],
            },
            technologyStrip: {
                eyebrow: "TECHNOLOGY WITH INTENT",
                title: "We choose technologies for their ability to solve, scale and evolve.",
                description: "Every project calls for different technical decisions. We work with modern, mature tools, prioritizing performance, maintainability and a high-quality experience.",
            },
            servicios: {
                titulo: "SERVICES",

                items: [
                    {
                        numero: "01",
                        titulo: "Web Development",
                        texto: "Modern and optimized websites.",
                    },
                    {
                        numero: "02",
                        titulo: "E-Commerce",
                        texto: "Online stores focused on sales.",
                    },
                    {
                        numero: "03",
                        titulo: "SEO & Optimization",
                        texto: "Speed and positioning.",
                    },
                    {
                        numero: "04",
                        titulo: "Mobile App Development",
                        texto: "Custom mobile applications for Android and iOS.",
                    },
                    {
                        numero: "05",
                        titulo: "Analytics & Insights",
                        texto: "Decisions backed by real data.",
                    },
                ],
            },
            cta: {
                badge: "LET'S TALK ABOUT YOUR PROJECT",
                titulo: "Let's transform your idea into a digital experience that delivers results.",
                texto: "Web development, mobile applications, optimization and technological solutions designed to grow with your business.",
                boton: "Start project"
            },
        },
        footer: {
            title: "CodeWork Digital",
            email: "contact@codeworkdigital.com",
            phone: "+39 333 735 2719",
            copy: "© 2025 Code Work Digital — All rights reserved."
        },
        contactPage: {
            hero: {
                label: "Contact",
                title: "Let's talk about your next digital project.",
                text: "Tell us what you need to create, improve or grow. We will get back to you shortly to help you turn your idea into a professional, modern digital solution ready to scale.",
            },
            info: {
                title: "How can we help?",
                text: "We can support you with websites, web applications, mobile applications, online stores and digital solutions designed to strengthen your brand, optimize processes and create new business opportunities.",
                items: [
                    "Professional web design and development",
                    "Custom web applications",
                    "Mobile applications (Android and iOS)",
                    "Online stores and e-commerce",
                    "Landing pages for campaigns",
                    "Digital optimization and positioning",
                ],
            },
            form: {
                title: "Contact form",
                name: "Name",
                email: "Email",
                phone: "WhatsApp",
                whatsapp: "WhatsApp",
                companyProject: "Company / Project",
                message: "Message",
                submit: "Request proposal",
                sending: "sending_message...",
                error: "Error sending message. Please try again.",
                success: "Message sent successfully",
                optional: "Optional",
                errors: {
                    requiredName: "Enter your name.",
                    requiredEmail: "Enter your email.",
                    invalidEmail: "Enter a valid email address.",
                    invalidWhatsApp: "Enter a valid WhatsApp number.",
                    requiredMessage: "Write a message.",
                },
            },
        },
        serviciosPage: {
            hero: {
                label: "Digital solutions",
                title: "Websites, applications and digital tools designed to grow your business.",
                text: "At Code Work Digital we combine design, technology and strategy to create modern, optimized digital experiences focused on results. We build solutions that help companies, professionals and entrepreneurs grow, connect with their customers and create new opportunities.",
                cta: "Request estimate",
            },
            list: {
                label: "What we do",
                title: "Digital solutions adapted to the needs of each project.",
                watermark: "SERVICES",
                items: [
                    {
                        numero: "01",
                        titulo: "Sector Analysis and Distinctive Identity",
                        texto: "We study the sector, its visual codes, competitors and opportunities to identify meaningful differentiators. From that analysis, we build a design and identity proposal that helps the brand stand out with clarity and consistency.",
                    },
                    {
                        numero: "02",
                        titulo: "Professional Web Development",
                        texto: "We create corporate websites, landing pages, portfolios and digital platforms with modern design, strong performance and a clear, professional experience aligned with each project's objectives.",
                    },
                    {
                        numero: "03",
                        titulo: "Online Stores and E-commerce",
                        texto: "We build digital stores ready to sell, integrating product catalogs, payment methods and order management. We design simple, reliable experiences that make purchasing easier and support business growth.",
                    },
                    {
                        numero: "04",
                        titulo: "Web and Mobile Applications",
                        texto: "We design and develop custom applications for companies, ventures and digital products. We create scalable, secure solutions adapted to the processes and specific needs of each project.",
                    },
                    {
                        numero: "05",
                        titulo: "Optimization, SEO and GEO",
                        texto: "We improve performance, speed and user experience, while strengthening visibility in search engines through SEO. We also prepare content and structure for generative environments and AI-assisted search systems through GEO strategies.",
                    },
                    {
                        numero: "06",
                        titulo: "Evolution and Maintenance",
                        texto: "We support the site's evolution through technical maintenance, periodic updates and visual renewals. We adapt design, content and functionality so the digital presence remains current, secure and aligned with the brand.",
                    },
                    {
                        numero: "07",
                        titulo: "Analytics and Metrics",
                        texto: "We implement useful, privacy-conscious metrics to understand how people use the site. We measure behavior, conversions and outcomes to identify opportunities and validate decisions with evidence.",
                    },
                    {
                        numero: "08",
                        titulo: "Action Based on Results",
                        texto: "We turn analysis findings into concrete improvements. We prioritize actions across content, experience, performance and conversion, measure their impact and support continuous, evidence-based evolution.",
                    },
                ],
            },
            cta: {
                title: "Thousands of clients are looking for exactly what you offer.",
                text: "Let's turn your idea into a professional, modern digital solution prepared to grow with your business.",
                button: "Start my project",
            },
        },
        quienesSomosPage: {
            label: "About us",

            titulo: `We are creators of websites,
applications and digital
experiences that deliver results.`,

            descripcion:
                "Our products, websites, applications and digital solutions combine design, technology and strategy to boost brands, improve experiences and generate real results.",

            botonProyecto: "Let's talk about your project",
            botonServicios: "View services",

            manifiestoTexto:
                "Every project begins by listening to your needs and understanding your goals. We combine design, development and strategy to create clear, effective solutions designed to grow with your business.",

            manifiestoLabel: "How we work",

            manifiestoTitulo:
                "Technology, design and strategy working together.",

            valores: [
                {
                    numero: "01",
                    titulo: "Purpose-driven design",
                    texto:
                        "We create modern interfaces that reflect your brand identity and build trust from the very first glance.",
                },
                {
                    numero: "02",
                    titulo: "Solid technology",
                    texto:
                        "We develop fast, secure and optimized websites to offer a smooth experience on any device.",
                },
                {
                    numero: "03",
                    titulo: "Real support",
                    texto:
                        "We support you throughout the entire process, from initial planning to launch and project evolution.",
                },
            ],
        },
    },
    it: {
        nav: {
            home: "Home",
            nosotros: "Chi siamo",
            servicios: "Servizi",
            contacto: "Contatto",
        },

        accessibility: {
            navigation: {
                openMenu: "Apri il menu di navigazione",
                closeMenu: "Chiudi il menu di navigazione",
            },
            languageSelector: {
                groupLabel: "Cambia lingua",
                optionLabels: {
                    es: "ES — Cambia lingua in spagnolo",
                    en: "EN — Cambia lingua in inglese",
                    it: "IT — Cambia lingua in italiano",
                },
            },
        },

        homePage: {
            narrative: {
                triad: ["Progettiamo.", "Costruiamo.", "Misuriamo."],
                valueProposition: "Siamo creatori di esperienze digitali supportate da ingegneria, privacy e metriche reali.",
                partnership: "Cresciamo e scaliamo insieme.",
            },

            frases: [
                "Sviluppo Web Professionale",
                "Negozi Online ed E-commerce",
                "Ottimizzazione SEO",
                "Applicazioni Web e Mobile",
                "Design che converte",
            ],

            carousel: [
                {
                    image: "/imagenes/carousel-1.webp",
                    title: "Creiamo esperienze visive",
                    text: "Che trasmettono fiducia, modernità e credibilità al tuo brand.",
                },
                {
                    image: "/imagenes/carousel-2.webp",
                    title: "App mobile che connettono con i tuoi utenti",
                    text: "Sviluppiamo applicazioni Android e iOS con esperienze intuitive, rapide e scalabili.",
                },
                {
                    image: "/imagenes/carousel-3.webp",
                    title: "Più visibilità. Più clienti. Più risultati.",
                    text: "Ottimizziamo la tua presenza digitale per attirare più traffico, migliorare il posizionamento e trasformare le visite in opportunità.",
                },
            ],

            carouselA11y: {
                progressLabel: "Avanzamento del carosello principale",
                slideButtonLabel: (current, total) => `Vai alla diapositiva ${current} di ${total}`,
            },

            beneficios: [
                {
                    image: "/imagenes/cards1.jpeg",
                    title: "Siti web che convertono",
                    text: "Progettiamo e sviluppiamo siti web veloci, chiari e pronti a crescere.",
                },
                {
                    image: "/imagenes/cards2.jpeg",
                    title: "App mobile su misura",
                    text: "Creiamo applicazioni mobile pensate per risolvere problemi reali.",
                },
                {
                    image: "/imagenes/cards3.jpeg",
                    title: "Backend robusto",
                    text: "Costruiamo API, servizi e logiche di business.",
                },
                {
                    image: "/imagenes/cards4.jpeg",
                    title: "Integrazioni intelligenti",
                    text: "Colleghiamo sistemi, piattaforme e servizi esterni.",
                },
                {
                    image: "/imagenes/cards5.jpeg",
                    title: "Performance e stabilità",
                    text: "Ottimizziamo le applicazioni affinché rispondano meglio.",
                },
                {
                    image: "/imagenes/cards6.jpeg",
                    title: "Evoluzione continua",
                    text: "Accompagniamo miglioramenti e nuove funzionalità.",
                },
            ],
            beneficiosExtended: [
                {
                    title: "Siti web che convertono",
                    text: "Progettiamo e sviluppiamo siti web veloci, chiari e pronti a crescere. Curiamo l'esperienza visiva, la struttura tecnica e le prestazioni affinché la tua presenza digitale non sia solo attraente, ma anche funzionale, misurabile ed efficace.",
                },
                {
                    title: "App mobile su misura",
                    text: "Creiamo applicazioni mobile pensate per risolvere problemi reali. Dall'idea iniziale a una versione funzionale, diamo priorità a interfacce semplici, flussi chiari e una base tecnica solida affinché l'app possa evolvere senza perdere stabilità.",
                },
                {
                    title: "Backend robusto",
                    text: "Costruiamo API, servizi e logiche di business con attenzione a sicurezza, scalabilità e manutenibilità. Ci importa che il sistema funzioni bene al suo interno: contratti chiari, dati coerenti, integrazioni affidabili e codice pronto a crescere.",
                },
                {
                    title: "Integrazioni intelligenti",
                    text: "Colleghiamo sistemi, piattaforme, database e servizi esterni affinché lavorino come un'unica unità. Riduciamo i processi manuali, miglioriamo la tracciabilità e aiutiamo la tecnologia a sostenere il flusso reale del tuo business.",
                },
                {
                    title: "Performance e stabilità",
                    text: "Ottimizziamo le applicazioni affinché rispondano meglio, falliscano meno e siano più facili da monitorare. Analizziamo colli di bottiglia, tempi di caricamento, errori ricorrenti e punti critici per migliorare l'esperienza dell'utente finale.",
                },
                {
                    title: "Evoluzione continua",
                    text: "Non pensiamo al software come a qualcosa di statico. Accompagniamo miglioramenti, nuove funzionalità, manutenzione e adeguamenti tecnici affinché il tuo prodotto digitale possa adattarsi al mercato, agli utenti e a nuove opportunità di business.",
                },
            ],
                beneficiosHeader: {
                subtitulo: "Perché scegliere noi",
                    titulo: "Tecnologia pensata per creare, crescere ed evolvere.",
                    lineas: ["Tecnologia", "pensata", "per creare,", "crescere ed", "evolvere."],
            },
            technologyStrip: {
                eyebrow: "TECNOLOGIA CON CRITERIO",
                title: "Scegliamo le tecnologie per la loro capacità di risolvere, scalare ed evolvere.",
                description: "Ogni progetto richiede decisioni tecniche diverse. Lavoriamo con strumenti moderni e maturi, privilegiando prestazioni, manutenibilità e un’esperienza di qualità.",
            },
            servicios: {
                titulo: "SERVIZI",

                items: [
                    {
                        numero: "01",
                        titulo: "Sviluppo Web",
                        texto: "Siti moderni e ottimizzati.",
                    },
                    {
                        numero: "02",
                        titulo: "E-Commerce",
                        texto: "Negozi online orientati alle vendite.",
                    },
                    {
                        numero: "03",
                        titulo: "SEO e Ottimizzazione",
                        texto: "Velocità e posizionamento.",
                    },
                    {
                        numero: "04",
                        titulo: "Sviluppo App Mobile",
                        texto: "Applicazioni mobili personalizzate per Android e iOS.",
                    },
                    {
                        numero: "05",
                        titulo: "Analitica e Decisioni",
                        texto: "Decisioni supportate da dati reali.",
                    },
                ],
            },
            cta: {
                badge: "PARLIAMO DEL TUO PROGETTO",
                titulo: "Trasformiamo la tua idea in un'esperienza digitale che generi risultati.",
                texto: "Sviluppo web, applicazioni mobile, ottimizzazione e soluzioni tecnologiche pensate per crescere insieme al tuo business.",
                boton: "Inizia il progetto"
            },
        },
        footer: {
            title: "CodeWork Digital",
            email: "contact@codeworkdigital.com",
            phone: "+39 333 735 2719",
            copy: "© 2025 Code Work Digital — Tutti i diritti riservati."
        },
        contactPage: {
            hero: {
                label: "Contatto",
                title: "Parliamo del tuo prossimo progetto digitale.",
                text: "Raccontaci cosa devi creare, migliorare o far crescere. Ti risponderemo al più presto per aiutarti a trasformare la tua idea in una soluzione digitale professionale, moderna e pronta a crescere.",
            },
            info: {
                title: "Come possiamo aiutarti?",
                text: "Possiamo accompagnarti nello sviluppo di siti web, applicazioni web, applicazioni mobile, negozi online e soluzioni digitali pensate per potenziare il tuo brand, ottimizzare i processi e generare nuove opportunità di business.",
                items: [
                    "Design e sviluppo web professionale",
                    "Applicazioni web su misura",
                    "Applicazioni mobile (Android e iOS)",
                    "Negozi online ed e-commerce",
                    "Landing page per campagne",
                    "Ottimizzazione e posizionamento digitale",
                ],
            },
            form: {
                title: "Modulo di contatto",
                name: "Nome",
                email: "Email",
                phone: "WhatsApp",
                whatsapp: "WhatsApp",
                companyProject: "Azienda / Progetto",
                message: "Messaggio",
                submit: "Richiedi proposta",
                sending: "invio_messaggio...",
                error: "Errore durante l'invio del messaggio. Riprova.",
                success: "Messaggio inviato correttamente",
                optional: "Facoltativo",
                errors: {
                    requiredName: "Inserisci il tuo nome.",
                    requiredEmail: "Inserisci la tua email.",
                    invalidEmail: "Inserisci un indirizzo email valido.",
                    invalidWhatsApp: "Inserisci un numero WhatsApp valido.",
                    requiredMessage: "Scrivi un messaggio.",
                },
            },
        },
        serviciosPage: {
            hero: {
                label: "Soluzioni digitali",
                title: "Siti web, applicazioni e strumenti digitali progettati per far crescere il tuo business.",
                text: "In Code Work Digital combiniamo design, tecnologia e strategia per creare esperienze digitali moderne, ottimizzate e orientate ai risultati. Sviluppiamo soluzioni che aiutano aziende, professionisti e imprenditori a crescere, connettersi con i clienti e generare nuove opportunità.",
                cta: "Richiedi preventivo",
            },
            list: {
                label: "Cosa facciamo",
                title: "Soluzioni digitali adattate alle esigenze di ogni progetto.",
                watermark: "SERVIZI",
                items: [
                    {
                        numero: "01",
                        titulo: "Analisi di Settore e Identità Distintiva",
                        texto: "Studiamo il settore, i suoi codici visivi, i concorrenti e le opportunità per individuare differenziali reali. Da questa analisi costruiamo una proposta di design e identità che permetta al brand di distinguersi con chiarezza e coerenza.",
                    },
                    {
                        numero: "02",
                        titulo: "Sviluppo Web Professionale",
                        texto: "Creiamo siti istituzionali, landing page, portfolio e piattaforme digitali con design moderno, prestazioni elevate e un'esperienza chiara e professionale, orientata agli obiettivi di ogni progetto.",
                    },
                    {
                        numero: "03",
                        titulo: "Negozi Online ed E-commerce",
                        texto: "Sviluppiamo negozi digitali pronti a vendere, integrando catalogo, metodi di pagamento e gestione degli ordini. Progettiamo esperienze semplici e affidabili per facilitare l'acquisto e accompagnare la crescita del business.",
                    },
                    {
                        numero: "04",
                        titulo: "Applicazioni Web e Mobile",
                        texto: "Progettiamo e sviluppiamo applicazioni personalizzate per aziende, iniziative e prodotti digitali. Creiamo soluzioni scalabili, sicure e adattate ai processi e alle esigenze specifiche di ogni progetto.",
                    },
                    {
                        numero: "05",
                        titulo: "Ottimizzazione, SEO e GEO",
                        texto: "Miglioriamo prestazioni, velocità ed esperienza utente, insieme alla visibilità sui motori di ricerca tramite SEO. Prepariamo inoltre contenuti e struttura per ambienti generativi e sistemi di ricerca assistiti dall'IA attraverso strategie GEO.",
                    },
                    {
                        numero: "06",
                        titulo: "Evoluzione e Manutenzione",
                        texto: "Accompagniamo l'evoluzione del sito con manutenzione tecnica, aggiornamenti periodici e rinnovi visivi. Adattiamo design, contenuti e funzionalità affinché la presenza digitale rimanga attuale, sicura e coerente con il brand.",
                    },
                    {
                        numero: "07",
                        titulo: "Analitica e Metriche",
                        texto: "Implementiamo metriche utili e rispettose della privacy per comprendere come le persone utilizzano il sito. Misuriamo comportamenti, conversioni e risultati per individuare opportunità e validare le decisioni con dati concreti.",
                    },
                    {
                        numero: "08",
                        titulo: "Azioni Basate sui Risultati",
                        texto: "Trasformiamo i risultati dell'analisi in miglioramenti concreti. Diamo priorità ad azioni su contenuti, esperienza, prestazioni e conversione, ne valutiamo l'impatto e accompagniamo un'evoluzione continua basata sui dati.",
                    },
                ],
            },
            cta: {
                title: "Migliaia di clienti stanno cercando esattamente ciò che offri.",
                text: "Trasformiamo la tua idea in una soluzione digitale professionale, moderna e pronta a crescere insieme al tuo business.",
                button: "Inizia il mio progetto",
            },
        },
        quienesSomosPage: {
            label: "Chi siamo",

            titulo: `Siamo creatori di siti web,
applicazioni ed esperienze
digitali che generano risultati.`,

            descripcion:
                "I nostri prodotti, siti web, applicazioni e soluzioni digitali combinano design, tecnologia e strategia che fanno crescere i brand, migliorano le esperienze e generano risultati reali.",

            botonProyecto: "Parliamo del tuo progetto",
            botonServicios: "Vedi i servizi",

            manifiestoTexto:
                "Ogni progetto inizia ascoltando le tue esigenze e comprendendo i tuoi obiettivi. Combiniamo design, sviluppo e strategia per creare soluzioni chiare, efficaci e pensate per crescere insieme al tuo business.",

            manifiestoLabel: "Il nostro modo di lavorare",

            manifiestoTitulo:
                "Tecnologia, design e strategia che lavorano insieme.",

            valores: [
                {
                    numero: "01",
                    titulo: "Design con uno scopo",
                    texto:
                        "Creiamo interfacce moderne che riflettono l'identità del tuo brand e generano fiducia fin dal primo sguardo.",
                },
                {
                    numero: "02",
                    titulo: "Tecnologia solida",
                    texto:
                        "Sviluppiamo siti veloci, sicuri e ottimizzati per offrire un'esperienza fluida su qualsiasi dispositivo.",
                },
                {
                    numero: "03",
                    titulo: "Supporto reale",
                    texto:
                        "Ti accompagniamo durante tutto il processo, dalla pianificazione iniziale alla pubblicazione e all'evoluzione del progetto.",
                },
            ],
        },
    },
};
