'use client'

import { useState } from "react";
import { AiOutlineSend } from 'react-icons/ai';


export default function ContactForm({ postUr }) {
  const initialForm = { nombre: '', email: '', telefono: '', mensaje: '' };
  const [formData, setFormData] = useState(initialForm);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setSending(true);

    try {
      const rawResponse = await fetch(postUr, {
        method: "POST",
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!rawResponse.ok) throw new Error(`HTTP error! status: ${rawResponse.status}`);
      const response = await rawResponse.json();

      setMsg(response.message || "Mensaje enviado correctamente");
      setSending(false);

      if (response.error === false) setFormData(initialForm);

    } catch (error) {
      console.error("Error enviando formulario:", error);
      setMsg("Error enviando mensaje. Intenta nuevamente.");
      setSending(false);
    }
  }

  return (
    <section className="contacto-section">
      <div className="contacto-form-wrapper">
        <h3>Formulario de contacto</h3>
        <form onSubmit={handleSubmit} className="contacto-form">
          <p>
            <label>Nombre</label>
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
          </p>

          <p>
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </p>

          <p>
            <label>Teléfono</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} />
          </p>

          <p>
            <label>Mensaje</label>
            <textarea name="mensaje" rows="4" value={formData.mensaje} onChange={handleChange} required />
          </p>

          <button type="submit" className="btn-primary form-btn" disabled={sending}>
            {sending ? "Enviando..." : <>Enviar mensaje <AiOutlineSend /></>}
          </button>
        </form>

        {msg && (
          <p className={`form-msg ${msg.includes("Error") ? "error" : ""}`}>{msg}</p>
        )}
      </div>
    </section>
  )
}

