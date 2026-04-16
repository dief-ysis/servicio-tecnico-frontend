import { useNavigate } from 'react-router-dom'

export default function Privacidad() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', padding: '40px 20px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <button onClick={() => navigate(-1)} style={{
            background: 'none', border: 'none', color: 'var(--link)',
            fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 700
          }}>← Volver</button>
        </div>

        <div style={{
          background: 'var(--white)', border: '1px solid var(--border-color)',
          borderRadius: 8, padding: '36px 40px'
        }}>
          <div style={{
            background: 'var(--primary)', color: 'var(--black)', fontSize: 10,
            fontWeight: 900, padding: '4px 10px', borderRadius: 3,
            display: 'inline-block', letterSpacing: '0.1em', marginBottom: 20
          }}>LIGHT SOLUTION</div>

          <h1 style={{ fontSize: 18, fontWeight: 900, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Política de privacidad
          </h1>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 28 }}>
            Vigente desde enero 2025 · Ley 19.628 sobre Protección de la Vida Privada · Ley 21.719 (en período de implementación)
          </p>

          <Section titulo="1. Responsable del tratamiento">
            <p>
              Light Solution, con domicilio en Luis Beltrán 2125, Ñuñoa, Región Metropolitana, Chile.
              Para consultas sobre privacidad, contáctenos directamente en nuestro local o mediante los
              canales de atención disponibles en el sistema.
            </p>
          </Section>

          <Section titulo="2. Datos que recopilamos">
            <p>Este sistema de gestión de servicio técnico almacena los siguientes datos personales de clientes:</p>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Nombre completo</li>
              <li>Número de teléfono</li>
              <li>Correo electrónico (opcional)</li>
            </ul>
            <p style={{ marginTop: 8 }}>
              Adicionalmente se registran datos técnicos del equipo ingresado a reparación (tipo, marca,
              modelo, falla reportada, diagnóstico) y un registro de auditoría de cambios internos.
            </p>
          </Section>

          <Section titulo="3. Finalidad del tratamiento">
            <p>
              Los datos son recopilados exclusivamente para gestionar el servicio técnico de reparación
              de equipos de iluminación y escenografía, y para comunicar al cliente el estado de su
              equipo. No serán utilizados para fines comerciales ni compartidos con terceros sin
              consentimiento expreso, salvo obligación legal.
            </p>
          </Section>

          <Section titulo="4. Base legal">
            <p>
              El tratamiento se basa en la relación contractual de servicio técnico entre el cliente y
              Light Solution, conforme al artículo 4° de la Ley 19.628 sobre Protección de la Vida
              Privada. Durante el período de implementación de la Ley 21.719 (Nueva Ley de Protección
              de Datos Personales, publicada en diciembre 2024), nos comprometemos a adecuar nuestras
              prácticas progresivamente a sus exigencias.
            </p>
          </Section>

          <Section titulo="5. Derechos del titular">
            <p>Conforme a la Ley 19.628 y la futura vigencia plena de la Ley 21.719, usted tiene derecho a:</p>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Acceder a sus datos personales almacenados</li>
              <li>Solicitar la rectificación de datos incorrectos</li>
              <li>Solicitar la eliminación o anonimización de sus datos</li>
              <li>Oponerse al tratamiento de sus datos</li>
              <li>Portabilidad de sus datos (conforme Ley 21.719)</li>
            </ul>
            <p style={{ marginTop: 8 }}>
              Para ejercer estos derechos, visítenos en Luis Beltrán 2125, Ñuñoa, o comuníquese a
              través de nuestros canales de contacto, indicando su nombre completo y RUT.
            </p>
          </Section>

          <Section titulo="6. Seguridad">
            <p>
              Los datos son almacenados en servidores con cifrado en tránsito (HTTPS/TLS 1.2+). El
              acceso al sistema requiere autenticación con credenciales personales e intransferibles.
              Se mantiene un registro automático de accesos e intentos fallidos. El acceso a datos
              está restringido según rol (recepcionista / técnico).
            </p>
          </Section>

          <Section titulo="7. Retención de datos">
            <p>
              Los datos se conservan mientras exista una relación de servicio activa. Los registros
              de servicios prestados se conservan por el período mínimo exigido por la legislación
              tributaria chilena (6 años, conforme Código Tributario art. 200). Transcurrido dicho
              plazo sin actividad, los datos personales pueden ser eliminados a solicitud del titular.
            </p>
          </Section>

          <Section titulo="8. Garantía legal de reparaciones">
            <p>
              Conforme a la Ley 19.496 sobre Protección de los Derechos de los Consumidores, toda
              reparación realizada cuenta con garantía legal. Ante cualquier consulta sobre garantías,
              contáctenos directamente.
            </p>
          </Section>

          <Section titulo="9. Modificaciones">
            <p>
              Esta política puede ser actualizada para reflejar cambios legales o en nuestras prácticas.
              La versión vigente siempre estará disponible en este sistema con su fecha de actualización.
            </p>
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
        letterSpacing: '0.08em', marginBottom: 8, color: 'var(--text-1)'
      }}>{titulo}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        {children}
      </div>
    </div>
  )
}