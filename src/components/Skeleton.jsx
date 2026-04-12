const pulse = `
  @keyframes pulse {
    0%, 100% { opacity: 1 }
    50% { opacity: 0.4 }
  }
`

function SkeletonBox({ width = '100%', height = 14, style = {} }) {
  return (
    <>
      <style>{pulse}</style>
      <div style={{
        width, height,
        background: '#f0f0f0',
        borderRadius: 3,
        animation: 'pulse 1.5s ease-in-out infinite',
        ...style
      }} />
    </>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <>
      <style>{pulse}</style>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} style={{ padding: '13px 16px', borderBottom: '1px solid #f5f5f5' }}>
              <SkeletonBox width={j === 0 ? 90 : j === cols - 1 ? 50 : '80%'} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function SkeletonCard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{
          background: '#fff', border: '1px solid #e8e8e8',
          borderRadius: 6, padding: '16px 18px',
          borderLeft: '4px solid #f0f0f0'
        }}>
          <SkeletonBox width={40} height={26} style={{ marginBottom: 8 }} />
          <SkeletonBox width={80} height={10} />
        </div>
      ))}
    </div>
  )
}

export default SkeletonBox