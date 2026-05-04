interface KpiCardProps {
  titulo: string;
  valor: number | string;
  colorBorde?: string;
}

export function KpiCard({ titulo, valor, colorBorde = '#bdc3c7' }: KpiCardProps) {
  return (
    <div style={{ 
      borderLeft: `5px solid ${colorBorde}`, 
      padding: '1.5rem', 
      background: '#fff', 
      borderRadius: '6px', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)', 
      flex: 1, 
      margin: '0 0.5rem' 
    }}>
      <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#7f8c8d', textTransform: 'uppercase' }}>{titulo}</h3>
      <p style={{ margin: '0.5rem 0 0 0', fontSize: '2rem', fontWeight: 'bold', color: '#2c3e50' }}>{valor}</p>
    </div>
  );
}