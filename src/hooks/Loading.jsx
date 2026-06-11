export default function Loading({ fullscreen = true, message = 'Cargando datos...' }) {
  return (
    <div className={fullscreen 
      ? "fixed inset-0 z-50 flex items-center justify-center"
      : "absolute inset-0 z-50 flex items-center justify-center"
    }
    style={{ 
      background: 'rgba(10, 18, 38, 0.90)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)'
    }}>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.5;
          }
          50% { 
            transform: scale(1.1);
            opacity: 1;
          }
        }
        
        @keyframes shimmer {
          0%, 100% { 
            boxShadow: 0 0 20px rgba(235, 195, 43, 0.3), 0 0 40px rgba(235, 195, 43, 0.1);
          }
          50% { 
            boxShadow: 0 0 30px rgba(235, 195, 43, 0.5), 0 0 60px rgba(235, 195, 43, 0.2);
          }
        }
        
        @keyframes orbitParticle {
          0% {
            transform: rotate(0deg) translateX(65px) rotate(0deg);
            opacity: 0.8;
          }
          100% {
            transform: rotate(360deg) translateX(65px) rotate(-360deg);
            opacity: 0.8;
          }
        }
        
        @keyframes expandPulse {
          0% {
            transform: scale(0.85);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% { 
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.7;
          }
        }
        
        @keyframes radialPulse {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        
        @keyframes scanLine {
          0% {
            transform: translateY(-100%) scaleX(0.8);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
            transform: translateY(0%) scaleX(1);
          }
          100% {
            transform: translateY(100%) scaleX(0.8);
            opacity: 0;
          }
        }
      `}</style>
      
      {/* Glow de fondo dorado */}
      <div className="absolute w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(235, 195, 43, 0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'pulse 3.5s ease-in-out infinite',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }} 
      />

      {/* Contenedor principal */}
      <div className="relative flex flex-col items-center gap-7 z-10 px-8">
        
        {/* Sistema de anillos + elementos flotantes */}
        <div className="relative w-40 h-40">
          
          {/* Anillo exterior - delgado con glow sutil */}
          <div className="absolute inset-0 rounded-full border-2 opacity-60"
            style={{
              borderColor: 'rgba(235, 195, 43, 0.4)',
              boxShadow: '0 0 15px rgba(235, 195, 43, 0.2)',
              animation: 'spin 3.5s linear infinite'
            }} 
          />

          {/* Anillo medio - dorado principal */}
          <div className="absolute rounded-full border-2 opacity-85"
            style={{
              inset: '14px',
              borderColor: '#ebc32b',
              boxShadow: '0 0 25px rgba(235, 195, 43, 0.3), inset 0 0 15px rgba(235, 195, 43, 0.05)',
              animation: 'spinReverse 2.2s linear infinite'
            }} 
          />

          {/* Línea de escaneo vertical */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0.5 rounded-full pointer-events-none overflow-hidden"
            style={{
              height: '140px',
              top: '-20px',
              background: 'linear-gradient(180deg, transparent 0%, rgba(235, 195, 43, 0.6) 50%, transparent 100%)',
              animation: 'scanLine 3s ease-in-out infinite'
            }}
          />

          {/* Centro con gradiente suave */}
          <div className="absolute rounded-full"
            style={{
              inset: '48px',
              background: 'linear-gradient(135deg, rgba(235, 195, 43, 0.25) 0%, rgba(235, 195, 43, 0.08) 100%)',
              boxShadow: '0 0 40px rgba(235, 195, 43, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)',
              animation: 'shimmer 2.5s ease-in-out infinite'
            }} 
          />

          {/* Partículas orbitales */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'radial-gradient(circle, rgba(235, 195, 43, 1) 0%, rgba(235, 195, 43, 0.6) 100%)',
              boxShadow: '0 0 12px rgba(235, 195, 43, 0.9)',
              transformOrigin: '0 0',
              animation: 'orbitParticle 3.5s linear infinite'
            }} 
          />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              background: 'radial-gradient(circle, rgba(235, 195, 43, 1) 0%, rgba(235, 195, 43, 0.6) 100%)',
              boxShadow: '0 0 12px rgba(235, 195, 43, 0.9)',
              transformOrigin: '0 0',
              animation: 'orbitParticle 3.5s linear infinite 1.75s'
            }} 
          />

          {/* Hexágonos flotantes alrededor */}
          <div className="absolute" 
            style={{ 
              top: '-30px', 
              left: '50%', 
              transform: 'translateX(-50%)',
              animation: 'float 4s ease-in-out infinite'
            }}>
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M6 0L11.1962 3.5V10.5L6 14L0.803848 10.5V3.5L6 0Z" 
                fill="rgba(235, 195, 43, 0.15)" 
                stroke="#ebc32b" 
                strokeWidth="1"/>
            </svg>
          </div>
          
          <div className="absolute" 
            style={{ 
              bottom: '-30px', 
              right: '10%',
              animation: 'float 4.5s ease-in-out infinite 0.5s'
            }}>
            <svg width="10" height="12" viewBox="0 0 12 14" fill="none">
              <path d="M6 0L11.1962 3.5V10.5L6 14L0.803848 10.5V3.5L6 0Z" 
                fill="rgba(235, 195, 43, 0.12)" 
                stroke="#ebc32b" 
                strokeWidth="0.8"/>
            </svg>
          </div>
          
          <div className="absolute" 
            style={{ 
              top: '50%', 
              right: '-40px',
              animation: 'float 3.5s ease-in-out infinite 1s'
            }}>
            <svg width="8" height="10" viewBox="0 0 12 14" fill="none">
              <path d="M6 0L11.1962 3.5V10.5L6 14L0.803848 10.5V3.5L6 0Z" 
                fill="rgba(235, 195, 43, 0.1)" 
                stroke="#ebc32b" 
                strokeWidth="0.6"/>
            </svg>
          </div>

          {/* Pulsos radiales desde el centro */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 pointer-events-none">
            <div className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid rgba(235, 195, 43, 0.6)',
                animation: 'radialPulse 2s ease-out infinite'
              }}
            />
            <div className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid rgba(235, 195, 43, 0.6)',
                animation: 'radialPulse 2s ease-out infinite 0.6s'
              }}
            />
            <div className="absolute inset-0 rounded-full"
              style={{
                border: '1px solid rgba(235, 195, 43, 0.6)',
                animation: 'radialPulse 2s ease-out infinite 1.2s'
              }}
            />
          </div>

          {/* Onda expansiva única */}
          <div className="absolute pointer-events-none" style={{ inset: '-30px' }}>
            <div className="absolute inset-0 rounded-full border opacity-40"
              style={{ 
                borderWidth: '1.5px',
                borderColor: 'rgba(235, 195, 43, 0.5)',
                animation: 'expandPulse 2.5s ease-out infinite'
              }} 
            />
          </div>
        </div>

        {/* Texto de carga */}
        <div className="text-center relative">
          <p className="font-semibold text-sm tracking-wider uppercase" 
            style={{ 
              color: '#ebc32b',
              textShadow: '0 0 15px rgba(235, 195, 43, 0.4)',
              letterSpacing: '0.18em',
              fontWeight: 600
            }}>
            {message}
          </p>
          
          {/* Puntos animados equilibrados */}
          <div className="flex gap-2 justify-center mt-3.5">
            <div className="w-1.5 h-1.5 rounded-full"
              style={{ 
                background: 'linear-gradient(135deg, #ebc32b 0%, rgba(235, 195, 43, 0.7) 100%)',
                boxShadow: '0 0 10px rgba(235, 195, 43, 0.5)',
                animation: 'pulse 1.3s ease-in-out 0s infinite'
              }} 
            />
            <div className="w-1.5 h-1.5 rounded-full"
              style={{ 
                background: 'linear-gradient(135deg, #ebc32b 0%, rgba(235, 195, 43, 0.7) 100%)',
                boxShadow: '0 0 10px rgba(235, 195, 43, 0.5)',
                animation: 'pulse 1.3s ease-in-out 0.22s infinite'
              }} 
            />
            <div className="w-1.5 h-1.5 rounded-full"
              style={{ 
                background: 'linear-gradient(135deg, #ebc32b 0%, rgba(235, 195, 43, 0.7) 100%)',
                boxShadow: '0 0 10px rgba(235, 195, 43, 0.5)',
                animation: 'pulse 1.3s ease-in-out 0.44s infinite'
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}