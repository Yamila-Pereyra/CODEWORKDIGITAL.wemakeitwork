"use client";

import { useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";

const INITIAL_FORM = Object.freeze({
  nombre: "",
  email: "",
  whatsapp: "",
  empresaProyecto: "",
  mensaje: "",
});

const FIELD_IDS = Object.freeze({
  nombre: "contact-name",
  email: "contact-email",
  whatsapp: "contact-whatsapp",
  empresaProyecto: "contact-company-project",
  mensaje: "contact-message",
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_ALLOWED_PATTERN = /^[+\d\s\-()]+$/;

function trimForValidation(value) {
  return value.trim();
}

function validateField(fieldName, value, errorsCopy) {
  const nextErrors = errorsCopy || {};
  const normalizedValue = trimForValidation(value);

  switch (fieldName) {
    case "nombre":
      if (!normalizedValue) {
        nextErrors.nombre = "requiredName";
      }
      break;
    case "email":
      if (!normalizedValue) {
        nextErrors.email = "requiredEmail";
      } else if (!EMAIL_PATTERN.test(normalizedValue)) {
        nextErrors.email = "invalidEmail";
      }
      break;
    case "whatsapp": {
      if (!normalizedValue) {
        break;
      }

      const isAllowed = WHATSAPP_ALLOWED_PATTERN.test(normalizedValue);
      const digitsOnly = normalizedValue.replace(/\D/g, "");
      const hasValidLength = digitsOnly.length >= 7 && digitsOnly.length <= 15;

      if (!isAllowed || !hasValidLength) {
        nextErrors.whatsapp = "invalidWhatsApp";
      }
      break;
    }
    case "mensaje":
      if (!normalizedValue) {
        nextErrors.mensaje = "requiredMessage";
      }
      break;
    default:
      break;
  }

  return nextErrors;
}

function buildValidationErrors(formData) {
  let nextErrors = {};

  nextErrors = validateField("nombre", formData.nombre, nextErrors);
  nextErrors = validateField("email", formData.email, nextErrors);
  nextErrors = validateField("whatsapp", formData.whatsapp, nextErrors);
  nextErrors = validateField("mensaje", formData.mensaje, nextErrors);

  return nextErrors;
}

export default function ContactForm({ postUr }) {
  const { language } = useLanguage();
  const t = translations[language] || translations.es;
  const formCopy = t.contactPage.form;
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const fieldRefs = useRef({});

  const focusField = (fieldName) => {
    fieldRefs.current[fieldName]?.focus();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[name];

      const revalidatedErrors = validateField(name, value, nextErrors);
      return revalidatedErrors;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMsg("");
    setIsError(false);

    const validationErrors = buildValidationErrors(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const [firstInvalidField] = Object.keys(validationErrors);
      focusField(firstInvalidField);
      return;
    }

    setErrors({});
    setSending(true);

    const trimmedNombre = trimForValidation(formData.nombre);
    const trimmedEmail = trimForValidation(formData.email);
    const trimmedWhatsApp = trimForValidation(formData.whatsapp);
    const trimmedMessage = trimForValidation(formData.mensaje);

    // `empresaProyecto` remains intentionally out of the payload until the
    // backend contract is expanded in a dedicated future increment.
    const payload = {
      nombre: trimmedNombre,
      email: trimmedEmail,
      telefono: trimmedWhatsApp,
      mensaje: trimmedMessage,
    };

    try {
      const rawResponse = await fetch(postUr, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!rawResponse.ok) {
        throw new Error(`HTTP error! status: ${rawResponse.status}`);
      }

      const response = await rawResponse.json();

      setMsg(response.message || formCopy.success);
      setIsError(Boolean(response.error));

      if (response.error === false) {
        setFormData(INITIAL_FORM);
      }
    } catch (error) {
      console.error("Error enviando formulario:", error);
      setMsg(formCopy.error);
      setIsError(true);
    } finally {
      setSending(false);
    }
  };

  const getErrorId = (fieldName) => `${FIELD_IDS[fieldName]}-error`;
  const renderFieldError = (fieldName) =>
    errors[fieldName] ? (
      <p className="contacto-form-field-error" id={getErrorId(fieldName)}>
        {formCopy.errors[errors[fieldName]]}
      </p>
    ) : null;

  return (
    <div className="contacto-form-wrapper">
      <h3 className="contacto-form-title">{formCopy.title}</h3>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="contacto-form"
        aria-busy={sending}
      >
        <div className="contacto-form-grid">
          <div className={`contacto-form-field${errors.nombre ? " is-error" : ""}`}>
            <label className="contacto-form-label" htmlFor={FIELD_IDS.nombre}>
              {formCopy.name}
            </label>
            <input
              ref={(node) => {
                fieldRefs.current.nombre = node;
              }}
              className="contacto-form-control"
              id={FIELD_IDS.nombre}
              name="nombre"
              type="text"
              autoComplete="name"
              required
              value={formData.nombre}
              onChange={handleChange}
              aria-invalid={errors.nombre ? "true" : undefined}
              aria-describedby={errors.nombre ? getErrorId("nombre") : undefined}
            />
            {renderFieldError("nombre")}
          </div>

          <div className={`contacto-form-field${errors.email ? " is-error" : ""}`}>
            <label className="contacto-form-label" htmlFor={FIELD_IDS.email}>
              {formCopy.email}
            </label>
            <input
              ref={(node) => {
                fieldRefs.current.email = node;
              }}
              className="contacto-form-control"
              id={FIELD_IDS.email}
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              aria-invalid={errors.email ? "true" : undefined}
              aria-describedby={errors.email ? getErrorId("email") : undefined}
            />
            {renderFieldError("email")}
          </div>

          <div className={`contacto-form-field${errors.whatsapp ? " is-error" : ""}`}>
            <label className="contacto-form-label" htmlFor={FIELD_IDS.whatsapp}>
              {formCopy.whatsapp}
              <span className="contacto-form-optional"> {formCopy.optional}</span>
            </label>
            <input
              ref={(node) => {
                fieldRefs.current.whatsapp = node;
              }}
              className="contacto-form-control"
              id={FIELD_IDS.whatsapp}
              name="whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={formData.whatsapp}
              onChange={handleChange}
              aria-invalid={errors.whatsapp ? "true" : undefined}
              aria-describedby={
                errors.whatsapp ? getErrorId("whatsapp") : undefined
              }
            />
            {renderFieldError("whatsapp")}
          </div>

          <div className="contacto-form-field">
            <label
              className="contacto-form-label"
              htmlFor={FIELD_IDS.empresaProyecto}
            >
              {formCopy.companyProject}
              <span className="contacto-form-optional"> {formCopy.optional}</span>
            </label>
            <input
              ref={(node) => {
                fieldRefs.current.empresaProyecto = node;
              }}
              className="contacto-form-control"
              id={FIELD_IDS.empresaProyecto}
              name="empresaProyecto"
              type="text"
              autoComplete="organization"
              value={formData.empresaProyecto}
              onChange={handleChange}
            />
          </div>

          <div
            className={`contacto-form-field contacto-form-field-full${
              errors.mensaje ? " is-error" : ""
            }`}
          >
            <label className="contacto-form-label" htmlFor={FIELD_IDS.mensaje}>
              {formCopy.message}
            </label>
            <textarea
              ref={(node) => {
                fieldRefs.current.mensaje = node;
              }}
              className="contacto-form-control contacto-form-textarea"
              id={FIELD_IDS.mensaje}
              name="mensaje"
              rows="5"
              required
              value={formData.mensaje}
              onChange={handleChange}
              aria-invalid={errors.mensaje ? "true" : undefined}
              aria-describedby={errors.mensaje ? getErrorId("mensaje") : undefined}
            />
            {renderFieldError("mensaje")}
          </div>

          <div className="contacto-form-submit-row">
            <button
              type="submit"
              className="btn-primary form-btn contacto-form-submit"
              disabled={sending}
            >
              {sending ? formCopy.sending : formCopy.submit}
            </button>
          </div>
        </div>
      </form>

      <div
        className="contacto-form-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {msg ? (
          <p className={`form-msg${isError ? " error" : ""}`}>{msg}</p>
        ) : null}
      </div>
    </div>
  );
}
