import React, { useState, useEffect } from 'react';
import ManualBetGate from '../ManualBetGate';
import CreateBetForm from './CreateBetForm';
import BetsHistory from './BetsHistory';
import BetsSummary from './BetsSummary';

/**
 * UserApuestasSection - Sección de apuestas del usuario
 * Integra apuestas normales Y apuestas manuales con control de habilitación
 */

export default function UserApuestasSection() {
  const [activeView, setActiveView] = useState('resumen'); // 'resumen', 'crear', 'historial'

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-lg p-6" style={{
        background: 'linear-gradient(135deg, #071A3A 0%, #0f2d52 100%)',
        border: '1px solid rgba(235,195,43,0.2)',
      }}>
        <h2 className="text-2xl font-bold text-white mb-2">
          🎯 Mis Apuestas
        </h2>
        <p className="text-gray-300">
          Gestiona tus apuestas regulares y participa en apuestas manuales cuando estén disponibles
        </p>
      </div>

      {/* TABS DE VISTAS */}
      <div className="flex gap-2 rounded-lg p-2" style={{
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(235,195,43,0.1)',
      }}>
        {[
          { key: 'resumen', label: '📊 Resumen' },
          { key: 'crear', label: '➕ Crear Apuesta' },
          { key: 'historial', label: '📜 Historial' },
        ].map(view => (
          <button
            key={view.key}
            onClick={() => setActiveView(view.key)}
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: activeView === view.key ? '#EBC32B' : 'transparent',
              color: activeView === view.key ? '#071A3A' : '#9CA3AF',
              border: activeView === view.key ? '1px solid #EBC32B' : '1px solid transparent',
            }}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="space-y-6">
        
        {/* VISTA: RESUMEN */}
        {activeView === 'resumen' && (
          <div className="space-y-4">
            <BetsSummary />
            
            {/* APUESTAS MANUALES CON GATE */}
            <ManualBetGate
              fallback={
                <div className="rounded-lg p-6" style={{
                  background: 'rgba(255,193,7,0.1)',
                  border: '2px dashed rgba(255,193,7,0.4)',
                }}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⏳</span>
                    <div>
                      <p className="font-bold text-yellow-700">
                        Apuestas Manuales Próximamente
                      </p>
                      <p className="text-sm text-yellow-600">
                        Esta función se habilitará en una fecha especial. ¡Estate atento!
                      </p>
                    </div>
                  </div>
                </div>
              }
            >
              <div className="rounded-lg p-6" style={{
                background: 'rgba(52,211,153,0.1)',
                border: '2px solid rgba(52,211,153,0.3)',
              }}>
                <p className="text-green-700 font-bold mb-3">
                  ✅ Apuestas Manuales Habilitadas
                </p>
                <p className="text-sm text-green-600 mb-4">
                  Puedes crear apuestas personalizadas en este momento
                </p>
                <button
                  onClick={() => setActiveView('crear')}
                  className="px-4 py-2 rounded-lg font-semibold text-white transition-all"
                  style={{
                    background: '#EBC32B',
                    color: '#071A3A',
                  }}
                >
                  Crear Apuesta Manual
                </button>
              </div>
            </ManualBetGate>
          </div>
        )}

        {/* VISTA: CREAR APUESTA */}
        {activeView === 'crear' && (
          <div className="space-y-4">
            {/* APUESTAS MANUALES CON GATE - VERSIÓN CREAR */}
            <ManualBetGate
              fallback={
                <div className="rounded-lg p-8 text-center" style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '2px solid rgba(239,68,68,0.3)',
                }}>
                  <span className="text-5xl mb-3 inline-block">🔒</span>
                  <p className="font-bold text-red-700 mb-2">
                    Apuestas Manuales No Disponibles
                  </p>
                  <p className="text-sm text-red-600 mb-4">
                    Las apuestas manuales están deshabilitadas en este momento
                  </p>
                  <button
                    onClick={() => setActiveView('resumen')}
                    className="px-4 py-2 rounded-lg font-semibold text-white transition-all"
                    style={{
                      background: 'rgba(239,68,68,0.5)',
                      color: 'white',
                    }}
                  >
                    Volver al Resumen
                  </button>
                </div>
              }
            >
              <CreateBetForm onSuccess={() => setActiveView('resumen')} />
            </ManualBetGate>
          </div>
        )}

        {/* VISTA: HISTORIAL */}
        {activeView === 'historial' && (
          <div>
            <BetsHistory />
          </div>
        )}

      </div>
    </div>
  );
}