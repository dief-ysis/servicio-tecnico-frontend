import { useNavigate } from 'react-router-dom'

export default function Privacidad() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3', padding: '40px 20px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', color: '#334862',
            fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 700
          }}>← Volver</button>
        </div>

        <div style={{
          background: '#fff', border: '1px solid #e8e8e8',
          borderRadius: 8, padding: '36px 40px'
        }}>
          <div style={{
            background: '#ffcd0d', color: '#000', fontSize: 10,
            fontWeight: 900, padding: '4px 10px', borderRadius: 3,
            display: 'inline-block', letterSpacing: '0.1em', marginBottom: 20
          }}>LIGHT SOLUTION</div>

          <h1 style={{ fontSize: 18, fontWeight: 900, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Política de privacidad
          </h1>
          <p style={{ fontSize: 11, color: '#999', marginBottom: 28 }}>
            Vigente desde enero 2025 · Ley 19.628 sobre Protección de la Vida Privada
          </p>

          <Section titulo="1. Responsable del tratamiento">
            <p>Light Solution Group Ltda., RUT [completar], con domicilio en Luis Beltrán 2125, Ñuñoa, Región Metropolitana, Chile. Contacto: [email].</p>
          </Section>

          <Section titulo="2. Datos que recopilamos">
            <p>Este sistema de gestión de servicio técnico almacena los siguientes datos personales de clientes:</p>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Nombre completo</li>
              <li>Número de teléfono</li>
              <li>Correo electrónico (opcional)</li>
            </ul>
            <p style={{ marginTop: 8 }}>Adicionalmente se registran datos técnicos del equipo ingresado a reparación.</p>
          </Section>

          <Section titulo="3. Finalidad del tratamiento">
            <p>Los datos son recopilados exclusivamente para gestionar el servicio técnico de reparación de equipos de escenografía y comunicar al cliente el estado de su equipo. No serán utilizados para fines comerciales ni compartidos con terceros sin consentimiento expreso.</p>
          </Section>

          <Section titulo="4. Base legal">
            <p>El tratamiento se basa en la relación contractual de servicio técnico entre el cliente y Light Solution, conforme al artículo 4° de la Ley 19.628.</p>
          </Section>

          <Section titulo="5. Derechos del titular">
            <p>Conforme a la Ley 19.628 y la Ley 21.663, usted tiene derecho a:</p>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Acceder a sus datos personales almacenados</li>
              <li>Solicitar la rectificación de datos incorrectos</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Oponerse al tratamiento de sus datos</li>
            </ul>
            <p style={{ marginTop: 8 }}>Para ejercer estos derechos, contáctenos en [email] indicando su nombre y RUT.</p>
          </Section>

          <Section titulo="6. Seguridad">
            <p>Los datos son almacenados en servidores con cifrado en tránsito (HTTPS/TLS). El acceso al sistema requiere autenticación con credenciales personales. Se mantiene un registro de accesos al sistema.</p>
          </Section>

          <Section titulo="7. Retención de datos">
            <p>Los datos se conservan mientras exista una relación de servicio activa o por el período mínimo exigido por la legislación tributaria chilena (6 años para registros de servicios).</p>
          </Section>

          <Section titulo="8. Modificaciones">
            <p>Esta política puede ser actualizada. La versión vigente siempre estará disponible en este sistema.</p>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ titulo, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 11, fontWeight: 900, textTransform: 'uppercase',
        letterSpacing: '0.08em', marginBottom: 8, color: '#111'
      }}>{titulo}</div>
      <div style={{ fontSize: 13, color: '#444', lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  )
}