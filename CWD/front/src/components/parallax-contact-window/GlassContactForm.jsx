"use client";

import styles from "./GlassContactForm.module.css";

const PARALLAX_CONTACT_FIELDS = [
  {
    id: "name",
    name: "name",
    labelKey: "name",
    type: "text",
    autoComplete: "name",
  },
  {
    id: "email",
    name: "email",
    labelKey: "email",
    type: "email",
    autoComplete: "email",
  },
  {
    id: "whatsapp",
    name: "whatsapp",
    labelKey: "whatsapp",
    type: "tel",
    autoComplete: "tel",
  },
  {
    id: "organization",
    name: "organization",
    labelKey: "companyBrand",
    type: "text",
    autoComplete: "organization",
  },
];

export default function GlassContactForm({ copy, idPrefix = "parallax-contact" }) {
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
              {copy[field.labelKey]}
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
            {copy.message}
          </label>
          <textarea
            className={`${styles.control} ${styles.textarea}`}
            id={`${idPrefix}-message`}
            name="message"
          />
        </div>

        <div className={styles.submitRow}>
          <button className={styles.submitButton} type="submit">
            {copy.submit}
          </button>
        </div>
      </div>
    </form>
  );
}
