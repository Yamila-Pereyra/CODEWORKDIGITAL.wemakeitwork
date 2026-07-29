"use client";

import styles from "./GlassContactForm.module.css";

const PARALLAX_CONTACT_FIELDS = [
  {
    id: "name",
    name: "name",
    label: "Nombre",
    type: "text",
    autoComplete: "name",
  },
  {
    id: "email",
    name: "email",
    label: "Email",
    type: "email",
    autoComplete: "email",
  },
  {
    id: "whatsapp",
    name: "whatsapp",
    label: "WhatsApp",
    type: "tel",
    autoComplete: "tel",
  },
  {
    id: "organization",
    name: "organization",
    label: "Empresa / Marca",
    type: "text",
    autoComplete: "organization",
  },
];

export default function GlassContactForm({
  submitLabel,
  idPrefix = "parallax-contact",
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Wire this form to the canonical contact submission flow
    // in a dedicated functional-integration increment.
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldsGrid}>
        {PARALLAX_CONTACT_FIELDS.map((field) => (
          <div className={styles.field} key={field.id}>
            <label className={styles.label} htmlFor={`${idPrefix}-${field.id}`}>
              {field.label}
            </label>
            <input
              className={styles.control}
              id={`${idPrefix}-${field.id}`}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
            />
          </div>
        ))}

        <div className={`${styles.field} ${styles.messageField}`}>
          <label className={styles.label} htmlFor={`${idPrefix}-message`}>
            Mensaje
          </label>
          <textarea
            className={`${styles.control} ${styles.textarea}`}
            id={`${idPrefix}-message`}
            name="message"
          />
        </div>

        <div className={styles.submitRow}>
          <button className={styles.submitButton} type="submit">
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
