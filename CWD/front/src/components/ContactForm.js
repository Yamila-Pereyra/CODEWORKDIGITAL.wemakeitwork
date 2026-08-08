"use client";

import ContactFeedbackPanel from "@/components/contact/ContactFeedbackPanel";
import TurnstileWidget from "@/components/contact/TurnstileWidget";
import {
  useContactSubmissionForm,
} from "@/components/contact/useContactSubmissionForm";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CONTACT_FIELD_LIMITS,
  CONTACT_FORM_FIELD_MAPS,
  CONTACT_SUBMISSION_SOURCE,
  CONTACT_TURNSTILE_ACTION,
} from "@/lib/contact/contactSubmissionContract";
import { translations } from "@/translations";

const INITIAL_FORM = Object.freeze({
  nombre: "",
  email: "",
  whatsapp: "",
  empresaProyecto: "",
  mensaje: "",
});

const FIELD_IDS = Object.freeze({
  nombre: "contacto-nombre",
  email: "contacto-email",
  whatsapp: "contacto-whatsapp",
  empresaProyecto: "contacto-empresa-proyecto",
  mensaje: "contacto-mensaje",
});

const FIELD_NAMES = Object.keys(FIELD_IDS);

export default function ContactForm() {
  const { language } = useLanguage();
  const formCopy =
    (translations[language] || translations.es).contactPage.form;
  const {
    feedbackContent,
    formData,
    handleChange,
    handleFieldBlur,
    handleSubmit,
    handleTurnstileError,
    handleTurnstileExpire,
    handleTurnstileReadyChange,
    handleTurnstileToken,
    hasFeedbackPanel,
    hasTerminalState,
    isSuccessTerminal,
    registerFieldRef,
    sending,
    siteKey,
    submitDisabled,
    turnstileResetSignal,
    visibleErrors,
  } = useContactSubmissionForm({
    formCopy,
    locale: language,
    source: CONTACT_SUBMISSION_SOURCE.CONTACT_PAGE,
    initialFormData: INITIAL_FORM,
    fieldOrder: FIELD_NAMES,
    fieldMap: CONTACT_FORM_FIELD_MAPS.CONTACT_PAGE,
  });

  return (
    <div className="contacto-form-wrapper">
      <h3 className="contacto-form-title">{formCopy.title}</h3>

      <form className="contacto-form" onSubmit={handleSubmit} noValidate aria-busy={sending}>
        <div
          className={`contacto-form-grid${
            isSuccessTerminal ? " is-success-terminal" : ""
          }`}
        >
          <div
            className={`contacto-form-field${visibleErrors.nombre ? " is-error" : ""}`}
          >
            <label className="contacto-form-label" htmlFor={FIELD_IDS.nombre}>
              {formCopy.name}
            </label>
            <input
              ref={registerFieldRef("nombre")}
              className="contacto-form-control"
              id={FIELD_IDS.nombre}
              name="nombre"
              type="text"
              autoComplete="name"
              maxLength={CONTACT_FIELD_LIMITS.name}
              required
              disabled={hasTerminalState}
              value={formData.nombre}
              onBlur={() => handleFieldBlur("nombre")}
              onChange={handleChange}
              aria-invalid={visibleErrors.nombre ? "true" : "false"}
              aria-describedby={
                visibleErrors.nombre ? `${FIELD_IDS.nombre}-error` : undefined
              }
            />
            {visibleErrors.nombre ? (
              <p className="contacto-form-field-error" id={`${FIELD_IDS.nombre}-error`}>
                {visibleErrors.nombre}
              </p>
            ) : null}
          </div>

          <div
            className={`contacto-form-field${visibleErrors.email ? " is-error" : ""}`}
          >
            <label className="contacto-form-label" htmlFor={FIELD_IDS.email}>
              {formCopy.email}
            </label>
            <input
              ref={registerFieldRef("email")}
              className="contacto-form-control"
              id={FIELD_IDS.email}
              name="email"
              type="email"
              autoComplete="email"
              maxLength={CONTACT_FIELD_LIMITS.email}
              required
              disabled={hasTerminalState}
              value={formData.email}
              onBlur={() => handleFieldBlur("email")}
              onChange={handleChange}
              aria-invalid={visibleErrors.email ? "true" : "false"}
              aria-describedby={
                visibleErrors.email ? `${FIELD_IDS.email}-error` : undefined
              }
            />
            {visibleErrors.email ? (
              <p className="contacto-form-field-error" id={`${FIELD_IDS.email}-error`}>
                {visibleErrors.email}
              </p>
            ) : null}
          </div>

          <div
            className={`contacto-form-field${visibleErrors.whatsapp ? " is-error" : ""}`}
          >
            <label className="contacto-form-label" htmlFor={FIELD_IDS.whatsapp}>
              {formCopy.whatsapp}{" "}
              <span className="contacto-form-optional">({formCopy.optional})</span>
            </label>
            <input
              ref={registerFieldRef("whatsapp")}
              className="contacto-form-control"
              id={FIELD_IDS.whatsapp}
              name="whatsapp"
              type="tel"
              autoComplete="tel"
              maxLength={CONTACT_FIELD_LIMITS.phone}
              disabled={hasTerminalState}
              value={formData.whatsapp}
              onBlur={() => handleFieldBlur("whatsapp")}
              onChange={handleChange}
              aria-invalid={visibleErrors.whatsapp ? "true" : "false"}
              aria-describedby={
                visibleErrors.whatsapp ? `${FIELD_IDS.whatsapp}-error` : undefined
              }
            />
            {visibleErrors.whatsapp ? (
              <p
                className="contacto-form-field-error"
                id={`${FIELD_IDS.whatsapp}-error`}
              >
                {visibleErrors.whatsapp}
              </p>
            ) : null}
          </div>

          <div
            className={`contacto-form-field${
              visibleErrors.empresaProyecto ? " is-error" : ""
            }`}
          >
            <label
              className="contacto-form-label"
              htmlFor={FIELD_IDS.empresaProyecto}
            >
              {formCopy.companyProject}{" "}
              <span className="contacto-form-optional">({formCopy.optional})</span>
            </label>
            <input
              ref={registerFieldRef("empresaProyecto")}
              className="contacto-form-control"
              id={FIELD_IDS.empresaProyecto}
              name="empresaProyecto"
              type="text"
              autoComplete="organization"
              maxLength={CONTACT_FIELD_LIMITS.companyOrProject}
              disabled={hasTerminalState}
              value={formData.empresaProyecto}
              onBlur={() => handleFieldBlur("empresaProyecto")}
              onChange={handleChange}
              aria-invalid={visibleErrors.empresaProyecto ? "true" : "false"}
              aria-describedby={
                visibleErrors.empresaProyecto
                  ? `${FIELD_IDS.empresaProyecto}-error`
                  : undefined
              }
            />
            {visibleErrors.empresaProyecto ? (
              <p
                className="contacto-form-field-error"
                id={`${FIELD_IDS.empresaProyecto}-error`}
              >
                {visibleErrors.empresaProyecto}
              </p>
            ) : null}
          </div>

          <div
            className={`contacto-form-field contacto-form-field-full${
              visibleErrors.mensaje ? " is-error" : ""
            }`}
          >
            <label className="contacto-form-label" htmlFor={FIELD_IDS.mensaje}>
              {formCopy.message}
            </label>
            <textarea
              ref={registerFieldRef("mensaje")}
              className="contacto-form-control contacto-form-textarea"
              id={FIELD_IDS.mensaje}
              name="mensaje"
              maxLength={CONTACT_FIELD_LIMITS.message}
              required
              disabled={hasTerminalState}
              value={formData.mensaje}
              onBlur={() => handleFieldBlur("mensaje")}
              onChange={handleChange}
              aria-invalid={visibleErrors.mensaje ? "true" : "false"}
              aria-describedby={
                visibleErrors.mensaje ? `${FIELD_IDS.mensaje}-error` : undefined
              }
            />
            {visibleErrors.mensaje ? (
              <p className="contacto-form-field-error" id={`${FIELD_IDS.mensaje}-error`}>
                {visibleErrors.mensaje}
              </p>
            ) : null}
          </div>

          <div
            className={`contacto-form-action-region${
              hasFeedbackPanel ? " has-feedback" : ""
            }`}
          >
            <div
              className="contacto-form-status"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {feedbackContent?.liveMessage || ""}
            </div>

            <div
              className={`contacto-form-submit-row${
                hasFeedbackPanel ? " is-hidden" : ""
              }`}
            >
              <button className="btn-primary form-btn" type="submit" disabled={submitDisabled}>
                {sending ? formCopy.sending : formCopy.submit}
              </button>
            </div>

            <div
              className={`contacto-form-feedback-row${
                hasFeedbackPanel ? " is-visible" : ""
              }`}
            >
              {feedbackContent ? (
                <ContactFeedbackPanel
                  tone={feedbackContent.tone}
                  title={feedbackContent.title}
                  detail={feedbackContent.detail}
                  animationKey={`${feedbackContent.tone}:${language}:${feedbackContent.title}`}
                />
              ) : null}
            </div>
          </div>

          {!hasTerminalState ? (
            <div className="contacto-form-turnstile-row">
              <TurnstileWidget
                siteKey={siteKey}
                action={CONTACT_TURNSTILE_ACTION.CONTACT_PAGE}
                resetSignal={turnstileResetSignal}
                disabled={sending}
                className={`contacto-form-turnstile-shell${
                  sending ? " is-disabled" : ""
                }`}
                onReadyChange={handleTurnstileReadyChange}
                onToken={handleTurnstileToken}
                onExpire={handleTurnstileExpire}
                onError={handleTurnstileError}
              />
            </div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
