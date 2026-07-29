"use client";

import styles from "./GlassContactForm.module.css";

const LAB_CONTACT_FIELDS = [
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

export default function GlassContactForm({ submitLabel }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Submission wiring is deferred to the production-transfer increment.
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.fieldsGrid}>
        {LAB_CONTACT_FIELDS.map((field) => (
          <div className={styles.field} key={field.id}>
            <label className={styles.label} htmlFor={field.id}>
              {field.label}
            </label>
            <input
              className={styles.control}
              id={field.id}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
            />
          </div>
        ))}

        <div className={`${styles.field} ${styles.messageField}`}>
          <label className={styles.label} htmlFor="message">
            Mensaje
          </label>
          <textarea
            className={`${styles.control} ${styles.textarea}`}
            id="message"
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
