"use client";

import { useEffect, useMemo, useState } from "react";

const STREAM_BLOCKS = [
    {
        language: "Java",
        title: "OrderService.java",
        separatorsAfter: 2,
        lines: [
            "public class OrderService {",
            "  public Invoice create(Order order) {",
            "    var total = pricing.calculate(order.items());",
            "    repository.save(order.confirm(total));",
            "    return invoices.issue(order.id(), total);",
            "  }",
            "}",
        ],
    },
    {
        language: "React",
        title: "ProjectBoard.jsx",
        separatorsAfter: 2,
        lines: [
            "export function ProjectBoard({ projects }) {",
            "  const active = useMemo(",
            "    () => projects.filter(p => p.status === 'live'),",
            "    [projects]",
            "  );",
            "  return <Dashboard items={active} />;",
            "}",
        ],
    },
    {
        language: "SQL",
        title: "growth_report.sql",
        separatorsAfter: 3,
        lines: [
            "SELECT c.name, COUNT(o.id) AS orders,",
            "       SUM(o.total) AS revenue,",
            "       AVG(o.delivery_days) AS avg_delivery",
            "FROM clients c",
            "JOIN orders o ON o.client_id = c.id",
            "JOIN projects p ON p.client_id = c.id",
            "WHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'",
            "  AND p.status IN ('live', 'scaling')",
            "GROUP BY c.name",
            "HAVING SUM(o.total) > 25000",
            "ORDER BY revenue DESC;",
        ],
    },
    {
        language: "Python",
        title: "insights_pipeline.py",
        separatorsAfter: 2,
        lines: [
            "from analytics.sources import load_events",
            "",
            "def build_insights(window_days=30):",
            "    events = load_events(days=window_days)",
            "    cohorts = group_by_account(events)",
            "    return [",
            "        score(account, activity)",
            "        for account, activity in cohorts.items()",
            "        if activity.is_ready()",
            "    ]",
        ],
    },
    {
        language: "C++",
        title: "SignalRouter.cpp",
        separatorsAfter: 2,
        lines: [
            "#include <vector>",
            "",
            "class SignalRouter {",
            "public:",
            "  void route(const Event& event) {",
            "    auto channel = registry.match(event.type());",
            "    queue.push(Task{channel, event.payload()});",
            "  }",
            "};",
        ],
    },
    {
        language: "Next.js",
        title: "app/projects/page.jsx",
        separatorsAfter: 2,
        lines: [
            "import { getProjects } from '@/lib/projects';",
            "",
            "export default async function ProjectsPage() {",
            "  const projects = await getProjects();",
            "  return <ProjectGrid items={projects} />;",
            "}",
        ],
    },
];

const KEYWORDS = new Set([
    "AND", "AS", "AVG", "COUNT", "CURRENT_DATE", "FROM", "GROUP", "HAVING", "IN",
    "INTERVAL", "JOIN", "ORDER", "SELECT", "SUM", "WHERE", "async", "await",
    "class", "const", "def", "default", "export", "filter", "for", "from",
    "function", "if", "import", "in", "include", "new", "public", "return",
    "using", "var", "void",
]);

const CODE_CASCADE_CONFIG = {
    viewportHeight: "clamp(989px, 75.5vw, 1178px)",
    tabletViewportHeight: "clamp(521px, 75.5vw, 681px)",
    mobileViewportHeight: "clamp(378px, 99vw, 498px)",
    initialVisibleLines: 44,
    fadeoutLines: 14,
    lineHeightPx: 18.7,
    opacityFadeStartLine: 16,
    opacityFadeStep: 0.034,
    maxRenderedLines: 84,
};

const TYPE_STEP = 2;
const TYPE_DELAY = 24;
const LINE_PAUSE = 145;
const EMPTY_LINE_PAUSE = 185;
const BLOCK_PAUSE = 260;

function tokenize(line) {
    const parts = line.match(/('[^']*'|"[^"]*"|\b[A-Za-z_][A-Za-z0-9_]*\b|\d+|[^\w\s]+|\s+)/g) || [];

    return parts.map((part, index) => {
        let className = "code-token";

        if (/^['"]/.test(part)) className += " is-string";
        else if (/^\d+$/.test(part)) className += " is-number";
        else if (KEYWORDS.has(part)) className += " is-keyword";
        else if (/^[().,;{}[\]=>+-]+$/.test(part)) className += " is-symbol";

        return (
            <span className={className} key={`${part}-${index}`}>
                {part}
            </span>
        );
    });
}

function useReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReduced(query.matches);

        update();
        query.addEventListener("change", update);

        return () => query.removeEventListener("change", update);
    }, []);

    return reduced;
}

function countLines(sections) {
    return sections.reduce((total, section) => total + section.lines.length, 0);
}

function buildCodeSection({ id, block, lineCount, isInitial = true }) {
    const visibleLines = block.lines.slice(0, lineCount);

    if (!visibleLines.length) {
        return null;
    }

    return {
        id,
        language: block.language,
        title: block.title,
        lines: visibleLines.map((content, index) => ({
            content,
            id: `${id}-line-${index}`,
            lineNumber: index + 1,
            isEmpty: content.length === 0,
            isInitial,
        })),
    };
}

function buildSeparatorSection({ id, lineCount, isInitial = true }) {
    if (lineCount <= 0) {
        return null;
    }

    return {
        id,
        language: "spacing",
        title: "",
        isSeparator: true,
        lines: Array.from({ length: lineCount }, (_, index) => ({
            content: "",
            id: `${id}-line-${index}`,
            lineNumber: null,
            isEmpty: true,
            isInitial,
        })),
    };
}

function pruneSections(sections) {
    let remaining = CODE_CASCADE_CONFIG.maxRenderedLines;

    return sections
        .map((section) => {
            if (remaining <= 0) return null;
            const lines = section.lines.slice(0, remaining);
            remaining -= lines.length;
            return { ...section, lines };
        })
        .filter(Boolean);
}

function buildInitialSections(lineCount, options = {}) {
    const { includeLeadingBoundary = true, prefix = "initial" } = options;

    if (lineCount <= 0) return [];

    const sections = [];
    let remaining = lineCount;
    let blockIndex = 1;
    let sectionIndex = 0;

    const pushSection = (section) => {
        if (!section) {
            return;
        }

        sections.push(section);
        remaining -= section.lines.length;
        sectionIndex += 1;
    };

    if (includeLeadingBoundary && remaining > 0) {
        pushSection(
            buildSeparatorSection({
                id: `${prefix}-separator-${sectionIndex}`,
                lineCount: Math.min(STREAM_BLOCKS[0].separatorsAfter, remaining),
            })
        );
    }

    while (remaining > 0) {
        const block = STREAM_BLOCKS[blockIndex % STREAM_BLOCKS.length];
        const codeLineCount = Math.min(block.lines.length, remaining);

        pushSection(
            buildCodeSection({
                id: `${prefix}-${sectionIndex}-${block.language.toLowerCase()}`,
                block,
                lineCount: codeLineCount,
            })
        );

        if (remaining <= 0) {
            break;
        }

        if (codeLineCount === block.lines.length) {
            pushSection(
                buildSeparatorSection({
                    id: `${prefix}-separator-${sectionIndex}`,
                    lineCount: Math.min(block.separatorsAfter, remaining),
                })
            );
        }

        blockIndex += 1;
    }

    return sections;
}

function buildStableSections() {
    const sections = [];
    const stableJava = buildCodeSection({
        id: "stable-java",
        block: STREAM_BLOCKS[0],
        lineCount: Math.min(7, CODE_CASCADE_CONFIG.initialVisibleLines),
    });

    if (stableJava) {
        sections.push(stableJava);
    }

    const remainingAfterJava = Math.max(
        CODE_CASCADE_CONFIG.initialVisibleLines - countLines(sections),
        0
    );
    const leadingSeparator = buildSeparatorSection({
        id: "stable-separator-0",
        lineCount: Math.min(
            STREAM_BLOCKS[0].separatorsAfter,
            remainingAfterJava
        ),
    });

    if (leadingSeparator) {
        sections.push(leadingSeparator);
    }

    const remaining = Math.max(
        CODE_CASCADE_CONFIG.initialVisibleLines - countLines(sections),
        0
    );

    if (remaining > 0) {
        sections.push(
            ...buildInitialSections(remaining, {
                includeLeadingBoundary: false,
                prefix: "stable-tail",
            })
        );
    }

    return sections;
}

export default function CodeCascade() {
    const reducedMotion = useReducedMotion();
    const initialSections = useMemo(
        () => buildInitialSections(CODE_CASCADE_CONFIG.initialVisibleLines),
        []
    );
    const stableSections = useMemo(buildStableSections, []);
    const [sections, setSections] = useState(initialSections);
    const [activeMeta, setActiveMeta] = useState({
        language: STREAM_BLOCKS[0].language,
        title: STREAM_BLOCKS[0].title,
    });
    const codeCascadeStyle = {
        "--code-cascade-height": CODE_CASCADE_CONFIG.viewportHeight,
        "--code-cascade-tablet-height": CODE_CASCADE_CONFIG.tabletViewportHeight,
        "--code-cascade-mobile-height": CODE_CASCADE_CONFIG.mobileViewportHeight,
        "--code-cascade-line-height": `${CODE_CASCADE_CONFIG.lineHeightPx}px`,
        "--code-cascade-opacity-fade-start": CODE_CASCADE_CONFIG.opacityFadeStartLine,
        "--code-cascade-opacity-fade-step": CODE_CASCADE_CONFIG.opacityFadeStep,
        "--code-cascade-fade-lines": CODE_CASCADE_CONFIG.fadeoutLines,
        "--code-cascade-fade-height": `${CODE_CASCADE_CONFIG.fadeoutLines * CODE_CASCADE_CONFIG.lineHeightPx}px`,
        "--code-cascade-fade-midpoint": `${CODE_CASCADE_CONFIG.fadeoutLines * CODE_CASCADE_CONFIG.lineHeightPx * 0.38}px`,
    };

    useEffect(() => {
        if (reducedMotion) {
            setSections(stableSections);
            setActiveMeta({
                language: "Java / React / SQL / Python",
                title: "continuous_delivery.stream",
            });
            return undefined;
        }

        let timeoutId;
        let blockIndex = 0;
        let lineIndex = 0;
        let charIndex = 0;
        let separatorIndex = 0;
        let mode = "typing";
        let sequence = 0;
        let currentSectionId = "section-0";
        let currentLineId = "line-0";

        const startSection = (block) => {
            sequence += 1;
            currentSectionId = `section-${sequence}`;
            setActiveMeta({
                language: block.language,
                title: block.title,
            });
            setSections((current) =>
                pruneSections([
                    {
                        id: currentSectionId,
                        language: block.language,
                        title: block.title,
                        lines: [],
                    },
                    ...current,
                ])
            );
        };

        setSections(initialSections);
        startSection(STREAM_BLOCKS[0]);

        const schedule = (delay) => {
            timeoutId = setTimeout(tick, delay);
        };

        const prependSeparatorLine = (line) => {
            setSections((current) => {
                const [top] = current;

                if (top?.isSeparator) {
                    return pruneSections([
                        {
                            ...top,
                            lines: [...top.lines, line],
                        },
                        ...current.slice(1),
                    ]);
                }

                return pruneSections([
                    {
                        id: `separator-${sequence}`,
                        language: "spacing",
                        title: "",
                        isSeparator: true,
                        lines: [line],
                    },
                    ...current,
                ]);
            });
        };

        const updateCurrentLine = (content, block, index) => {
            setSections((current) => {
                const [top, ...rest] = current;
                const existingIndex = top.lines.findIndex((line) => line.id === currentLineId);
                const lines = [...top.lines];
                const nextLine = {
                    content,
                    id: currentLineId,
                    lineNumber: index + 1,
                };

                if (existingIndex >= 0) lines[existingIndex] = nextLine;
                else lines.push(nextLine);

                return pruneSections([{ ...top, lines }, ...rest]);
            });
        };

        const startNextBlock = () => {
            blockIndex = (blockIndex + 1) % STREAM_BLOCKS.length;
            lineIndex = 0;
            charIndex = 0;
            separatorIndex = 0;
            mode = "typing";
            startSection(STREAM_BLOCKS[blockIndex]);
            schedule(BLOCK_PAUSE);
        };

        const tick = () => {
            const block = STREAM_BLOCKS[blockIndex];

            if (mode === "separator") {
                if (separatorIndex < block.separatorsAfter) {
                    sequence += 1;
                    prependSeparatorLine({
                        content: "",
                        id: `empty-${sequence}`,
                        lineNumber: null,
                        isEmpty: true,
                    });
                    separatorIndex += 1;
                    schedule(EMPTY_LINE_PAUSE);
                    return;
                }

                startNextBlock();
                return;
            }

            const target = block.lines[lineIndex];

            if (charIndex === 0) {
                sequence += 1;
                currentLineId = `line-${sequence}`;
            }

            const nextIndex = Math.min(target.length, charIndex + TYPE_STEP);
            updateCurrentLine(target.slice(0, nextIndex), block, lineIndex);
            charIndex = nextIndex;

            if (charIndex < target.length) {
                schedule(TYPE_DELAY);
                return;
            }

            lineIndex += 1;
            charIndex = 0;

            if (lineIndex < block.lines.length) {
                schedule(LINE_PAUSE);
                return;
            }

            mode = "separator";
            schedule(BLOCK_PAUSE);
        };

        schedule(260);

        return () => clearTimeout(timeoutId);
    }, [initialSections, reducedMotion, stableSections]);

    let renderedIndex = 0;

    return (
        <aside className="code-cascade" aria-hidden="true" style={codeCascadeStyle}>
            <article className="code-cascade-card code-cascade-stream">
                <header className="code-cascade-header">
                    <span>{activeMeta.language}</span>
                    <small>{activeMeta.title}</small>
                </header>
                <div className="code-cascade-viewport">
                    <pre className="code-cascade-code">
                        <code>
                            {sections.flatMap((section) =>
                                section.lines.map((line) => {
                                    const lineIndex = renderedIndex;
                                    renderedIndex += 1;

                                    return (
                                        <span
                                            className={`code-cascade-line ${line.isEmpty ? "is-empty" : ""}`}
                                            key={line.id}
                                            style={{ "--line-index": lineIndex }}
                                        >
                                            <span className="code-line-number">
                                                {line.lineNumber ? String(line.lineNumber).padStart(2, "0") : ""}
                                            </span>
                                            <span className="code-line-content">
                                                {tokenize(line.content)}
                                                {lineIndex === 0 && !line.isEmpty && !line.isInitial && <span className="code-cursor" />}
                                            </span>
                                        </span>
                                    );
                                })
                            )}
                        </code>
                    </pre>
                </div>
            </article>
        </aside>
    );
}
