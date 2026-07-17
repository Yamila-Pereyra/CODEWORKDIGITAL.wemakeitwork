'use client'

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/translations";


export default function ContactForm({ postUr }) {
  const { language } = useLanguage();
  const t = translations[language] || translations.es;
  const formCopy = t.contactPage.form;
  const initialForm = { nombre: '', email: '', telefono: '', mensaje: '' };
  const fieldIds = {
    nombre: "contact-name",
    email: "contact-email",
    telefono: "contact-phone",
    mensaje: "contact-message",
  };
  const [formData, setFormData] = useState(initialForm);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setIsError(false);
    setSending(true);

    try {
      const rawResponse = await fetch(postUr, {
        method: "POST",
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!rawResponse.ok) throw new Error(`HTTP error! status: ${rawResponse.status}`);
      const response = await rawResponse.json();

      setMsg(response.message || formCopy.success);
      setIsError(Boolean(response.error));
      setSending(false);

      if (response.error === false) setFormData(initialForm);

    } catch (error) {
      console.error("Error enviando formulario:", error);
      setMsg(formCopy.error);
      setIsError(true);
      setSending(false);
    }
  }

  return (
    <section className="contacto-section">
      <div className="contacto-form-wrapper">
        <h3>{formCopy.title}</h3>
        <form onSubmit={handleSubmit} className="contacto-form" aria-busy={sending}>
          <p>
            <label htmlFor={fieldIds.nombre}>{formCopy.name}</label>
            <input id={fieldIds.nombre} type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </p>

          <p>
            <label htmlFor={fieldIds.email}>{formCopy.email}</label>
            <input id={fieldIds.email} type="email" name="email" value={formData.email} onChange={handleChange} required />
          </p>

          <p>
            <label htmlFor={fieldIds.telefono}>{formCopy.phone}</label>
            <input id={fieldIds.telefono} type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
          </p>

          <p>
            <label htmlFor={fieldIds.mensaje}>{formCopy.message}</label>
            <textarea id={fieldIds.mensaje} name="mensaje" rows="4" value={formData.mensaje} onChange={handleChange} required />
          </p>

          <button type="submit" className="btn-primary form-btn" disabled={sending}>
            {sending ? formCopy.sending : formCopy.submit}
          </button>
        </form>

        <div role="status" aria-live="polite" aria-atomic="true">
          {msg && (
            <p className={`form-msg ${isError ? "error" : ""}`}>{msg}</p>
          )}
        </div>
      </div>
    </section>
  )
}

