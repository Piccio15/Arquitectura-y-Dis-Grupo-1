import { useState, useEffect } from 'react';
import type { Zona, ZonaFormData, Coordenada } from '../../types/zona-interface';
import { MapAdapter } from './Mapadapter'; // Importamos el adaptador

interface ZonaFormProps {
  zonaInicial?: Zona | null;
  onGuardar: (data: ZonaFormData) => void;
  onCancelar: () => void;
}

export function ZonaForm({ zonaInicial, onGuardar, onCancelar }: ZonaFormProps) {
  const [formData, setFormData] = useState<ZonaFormData>({
    nombre: '',
    coordenadas: [], // Inicializado vacío
    capacidadTotal: 0,
    espaciosOcupados: 0,
    precio_hora: 0,
  });

  // (useEffect de hidratación inicial similar al anterior)

  const manejarCambioCoordenadas = (nuevasCoordenadas: Coordenada[]) => {
    setFormData(prev => ({
      ...prev,
      coordenadas: nuevasCoordenadas
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.coordenadas.length < 3) {
      alert("Debe definir al menos 3 puntos (un polígono) para delimitar la zona.");
      return;
    }
    onGuardar(formData);
  };

  return (
    <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e0e0e0' }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50' }}>{zonaInicial ? 'Editar Zona de Estacionamiento' : 'Registrar Nueva Zona'}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Inyección del componente de Mapa */}
        <div style={{ flex: '1 1 100%' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 'bold', color: '#34495e' }}>
            Delimitación Geográfica (Polígono)
          </label>
          <MapAdapter 
            coordenadasIniciales={formData.coordenadas} 
            soloLectura={false} 
            onCoordenadasChange={manejarCambioCoordenadas} 
          />
          <small style={{ color: '#7f8c8d' }}>Puntos actuales registrados: {formData.coordenadas.length}</small>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-start' }}>
          <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Guardar Geometría</button>
          <button type="button" onClick={onCancelar} style={{ padding: '0.6rem 1.2rem', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}