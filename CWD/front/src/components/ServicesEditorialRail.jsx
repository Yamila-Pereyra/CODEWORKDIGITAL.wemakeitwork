"use client";

import { useId, useState } from "react";

const VISUALS = {
  "01": WebVisual,
  "02": CommerceVisual,
  "03": AppsVisual,
  "04": OptimizationVisual,
  "05": AnalyticsVisual,
};

function RailSvg({ children }) {
  return (
    <svg
      viewBox="0 0 320 220"
      className="services-rail-svg"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function WebVisual() {
  return (
    <RailSvg>
      <rect x="44" y="42" width="232" height="136" rx="18" />
      <path d="M44 78H276" />
      <path d="M78 112H146M78 140H124M168 112H226M148 140H242" />
      <circle cx="74" cy="60" r="5" />
      <circle cx="94" cy="60" r="5" />
      <circle cx="114" cy="60" r="5" />
      <path d="M88 178L132 138L184 158L232 104" className="accent" />
      <circle cx="132" cy="138" r="7" className="node" />
      <circle cx="184" cy="158" r="7" className="node" />
      <circle cx="232" cy="104" r="7" className="node" />
    </RailSvg>
  );
}

function CommerceVisual() {
  return (
    <RailSvg>
      <rect x="54" y="48" width="58" height="48" rx="12" />
      <rect x="132" y="48" width="58" height="48" rx="12" />
      <rect x="210" y="48" width="58" height="48" rx="12" />
      <rect x="54" y="120" width="58" height="48" rx="12" />
      <rect x="132" y="120" width="58" height="48" rx="12" />
      <path d="M88 184C122 198 188 198 232 168" className="accent" />
      <path d="M216 166L234 166L228 183" className="accent" />
      <circle cx="238" cy="142" r="14" className="node" />
      <path d="M229 142H247M238 133V151" />
    </RailSvg>
  );
}

function AppsVisual() {
  return (
    <RailSvg>
      <rect x="54" y="44" width="92" height="132" rx="18" />
      <rect x="186" y="32" width="76" height="156" rx="20" />
      <path d="M78 78H122M78 104H116M78 132H128" />
      <path d="M208 76H240M208 108H236M208 140H242" />
      <path d="M146 108C164 84 174 84 186 108" className="accent" />
      <path d="M146 138C164 164 174 164 186 138" className="accent" />
      <circle cx="166" cy="96" r="7" className="node" />
      <circle cx="166" cy="150" r="7" className="node" />
    </RailSvg>
  );
}

function OptimizationVisual() {
  return (
    <RailSvg>
      <path d="M52 164H268" />
      <path d="M70 148C102 144 116 120 142 118C176 115 180 84 212 82C234 80 248 62 266 48" className="accent" />
      <path d="M248 49L267 47L262 66" className="accent" />
      <circle cx="142" cy="118" r="8" className="node" />
      <circle cx="212" cy="82" r="8" className="node" />
      <path d="M74 132V164M116 108V164M158 92V164M200 72V164M242 56V164" opacity=".45" />
    </RailSvg>
  );
}

function AnalyticsVisual() {
  return (
    <RailSvg>
      <path d="M62 170H262" />
      <rect x="76" y="118" width="28" height="52" rx="6" />
      <rect x="124" y="88" width="28" height="82" rx="6" />
      <rect x="172" y="106" width="28" height="64" rx="6" />
      <rect x="220" y="62" width="28" height="108" rx="6" className="node" />
      <path d="M90 96L138 70L186 82L234 46" className="accent" />
      <circle cx="138" cy="70" r="7" className="node" />
      <circle cx="234" cy="46" r="9" className="node" />
    </RailSvg>
  );
}

export default function ServicesEditorialRail({ items, watermark }) {
  const railId = useId();
  const normalizedRailId = railId.replace(/:/g, "");
  const [activeIndex, setActiveIndex] = useState(0);

  const getTriggerId = (numero) =>
    `services-${normalizedRailId}-${numero}-trigger`;
  const getPanelId = (numero) =>
    `services-${normalizedRailId}-${numero}-panel`;

  return (
    <div className="services-editorial-rail">
      <div className="services-rail-watermark" aria-hidden="true">
        {watermark}
      </div>

      <div className="services-rail-list">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const triggerId = getTriggerId(item.numero);
          const panelId = getPanelId(item.numero);
          const Visual = VISUALS[item.numero] || AnalyticsVisual;

          return (
            <article
              className={`services-rail-item ${isActive ? "is-active" : ""}`}
              key={item.numero}
            >
              <h3 className="services-rail-heading">
                <button
                  type="button"
                  id={triggerId}
                  aria-expanded={isActive}
                  aria-controls={panelId}
                  aria-disabled={isActive ? "true" : undefined}
                  className="services-rail-trigger"
                  onClick={() => {
                    if (isActive) return;
                    setActiveIndex(index);
                  }}
                >
                  <span className="services-rail-number">{item.numero}</span>
                  <span className="services-rail-title">{item.titulo}</span>
                  <span className="services-rail-indicator" aria-hidden="true" />
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="services-rail-panel"
                hidden={!isActive}
              >
                <p className="services-rail-copy">{item.texto}</p>

                <div className="services-rail-visual">
                  <Visual />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
