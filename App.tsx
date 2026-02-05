import React, { useState, useMemo } from 'react';
import { FuelType, FuelConfig } from './types';
import { 
  DIESEL_TABLE, 
  GASOLINA_TABLE, 
  GASOLINA_ADITIVADO_TABLE,
  ETANOL_COMUM_TABLE, 
  ETANOL_ADITIVADO_TABLE 
} from './constants';
import { Droplet, Ruler, AlertCircle, ChevronRight, CheckCircle2, Code2 } from 'lucide-react';

// Shell Logo Component (SVG)
const ShellLogo = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
    <path d="M15 45C15 25 30 10 50 10C70 10 85 25 85 45C85 55 80 85 50 85C20 85 15 55 15 45Z" fill="#FBCE07" stroke="#DD1D21" strokeWidth="6" />
    <path d="M50 10V45" stroke="#DD1D21" strokeWidth="6" strokeLinecap="round" />
    <path d="M30 16L42 45" stroke="#DD1D21" strokeWidth="5" strokeLinecap="round" />
    <path d="M70 16L58 45" stroke="#DD1D21" strokeWidth="5" strokeLinecap="round" />
    <path d="M18 35L34 50" stroke="#DD1D21" strokeWidth="5" strokeLinecap="round" />
    <path d="M82 35L66 50" stroke="#DD1D21" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const App: React.FC = () => {
  // State
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [heightInput, setHeightInput] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Configuration mapping
  const fuels: FuelConfig[] = [
    { id: 'GASOLINA', name: 'Gasolina Comum', color: 'bg-red-500', table: GASOLINA_TABLE }, 
    { id: 'GASOLINA_ADITIVADA', name: 'Gasolina V-Power', color: 'bg-[#DD1D21]', table: GASOLINA_ADITIVADO_TABLE }, 
    { id: 'DIESEL', name: 'Diesel Evolux', color: 'bg-amber-600', table: DIESEL_TABLE },
    { id: 'ETANOL_ADITIVADO', name: 'Etanol V-Power', color: 'bg-purple-600', table: ETANOL_ADITIVADO_TABLE },
    { id: 'ETANOL_COMUM', name: 'Etanol Comum', color: 'bg-green-600', table: ETANOL_COMUM_TABLE },
  ];

  const currentFuelConfig = useMemo(() => 
    fuels.find(f => f.id === selectedFuel), 
  [selectedFuel]);

  const handleCalculate = () => {
    setError(null);
    setResult(null);
    setIsAnimating(false);

    // 1. Validation: Empty
    if (heightInput.trim() === '') {
      setError("Por favor, digite a altura da régua.");
      return;
    }

    const heightVal = parseInt(heightInput, 10);

    // 2. Validation: Integer check
    if (isNaN(heightVal) || heightInput.includes('.') || heightInput.includes(',')) {
      setError("Digite apenas números inteiros (cm).");
      return;
    }

    // 3. Validation: Range
    if (heightVal < 0) {
      setError("O valor não pode ser negativo.");
      return;
    }
    // Update limit to 260cm to accommodate new tables (which go up to 259cm)
    if (heightVal > 260) {
      setError("Altura excede o limite do tanque (260cm).");
      return;
    }

    if (!currentFuelConfig) {
      setError("Selecione qual combustível medir.");
      return;
    }

    // 4. ANIMATION & CALCULATION
    setIsAnimating(true);
    
    setTimeout(() => {
      try {
        // --- LÓGICA DE BUSCA NA TABELA ---
        const baseTens = Math.floor(heightVal / 10) * 10; 
        const digit = heightVal % 10;
        
        const table = currentFuelConfig.table;
        const row = table[baseTens];
        
        if (!row) {
          throw new Error("Erro na leitura da tabela.");
        }

        const calculatedVolume = row[digit];
        
        // If calculatedVolume is undefined (e.g. table ends at 259 but user typed 260), handle gracefully
        if (calculatedVolume === undefined) {
           throw new Error("Altura fora do intervalo da tabela.");
        }

        setResult(calculatedVolume);
      } catch (err) {
        setError("Valor não encontrado na tabela para esta altura.");
      } finally {
        setIsAnimating(false);
      }
    }, 400);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-red-800 via-orange-600 to-red-900 animate-gradient text-slate-800">
      
      {/* Main Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-red-200/50 flex flex-col">
        
        {/* Header */}
        <div className="bg-white p-6 border-b border-red-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600"></div>
          <div className="flex flex-col items-center justify-center gap-2">
            <ShellLogo />
            <div className="flex flex-col">
              <h1 className="text-2xl font-black text-[#DD1D21] tracking-tight uppercase italic">
                Tanque Certo
              </h1>
              <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">Sistema de Volumetria</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8 flex-grow">
          
          {/* 1. Fuel Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Droplet className="w-3 h-3 text-[#DD1D21]" />
              Selecione o Produto
            </label>
            <div className="grid grid-cols-2 gap-3">
              {fuels.map((fuel) => (
                <button
                  key={fuel.id}
                  onClick={() => {
                    setSelectedFuel(fuel.id);
                    setResult(null);
                    setError(null);
                  }}
                  className={`
                    py-3 px-2 rounded-xl text-xs font-bold transition-all duration-200 border-2
                    flex flex-col items-center justify-center gap-1.5 h-20 relative overflow-hidden
                    ${selectedFuel === fuel.id 
                      ? `${fuel.color} border-transparent text-white shadow-lg scale-105 ring-2 ring-offset-2 ring-red-200` 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-red-200 hover:bg-red-50'}
                    /* Full span for the last item if odd number, but we have 5 items now so let's check grid flow */
                    ${fuel.id === 'ETANOL_COMUM' ? 'col-span-2' : ''}
                  `}
                >
                  <div className={`w-3 h-3 rounded-full shadow-sm z-10 ${selectedFuel === fuel.id ? 'bg-white' : fuel.color}`}></div>
                  <span className="text-center leading-tight z-10">{fuel.name}</span>
                  
                  {/* Subtle background pattern for active state */}
                  {selectedFuel === fuel.id && (
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Height Input */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Ruler className="w-3 h-3 text-[#DD1D21]" />
              Altura da Régua (cm)
            </label>
            <div className="relative group">
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={heightInput}
                onChange={(e) => {
                  setHeightInput(e.target.value);
                  setError(null);
                  if (result !== null) setResult(null);
                }}
                onKeyDown={handleKeyDown}
                className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-4xl font-black py-4 px-4 rounded-xl focus:outline-none focus:border-[#DD1D21] focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-slate-300 text-center tracking-tight"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">
                cm
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleCalculate}
            disabled={isAnimating || !selectedFuel || !heightInput}
            className={`
              w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-red-900/10 transition-all duration-200
              ${!selectedFuel || !heightInput 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-[#DD1D21] text-white hover:bg-[#b0161a] hover:scale-[1.02] active:scale-[0.98]'}
            `}
          >
            {isAnimating ? (
              <span className="animate-pulse">Consultando Tabela...</span>
            ) : (
              <>
                Calcular Volume <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* 3. Result Display */}
          <div className="min-h-[140px] flex items-center justify-center">
            {error && (
              <div className="flex items-center gap-3 text-[#DD1D21] bg-red-50 px-5 py-4 rounded-xl border border-red-100 animate-[shake_0.5s_ease-in-out]">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <span className="font-semibold text-sm leading-tight">{error}</span>
              </div>
            )}

            {!error && result !== null && (
              <div className="text-center w-full animate-[fadeIn_0.5s_ease-out]">
                <div className="flex items-center justify-center gap-2 text-[#DD1D21] mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Volume Encontrado</span>
                </div>
                
                <div className="bg-neutral-900 text-white rounded-2xl py-8 px-4 relative overflow-hidden group shadow-2xl border border-red-900">
                  {/* Decorative shimmer */}
                  <div className={`absolute inset-0 opacity-10 bg-gradient-to-tr from-[#DD1D21] via-[#FBCE07] to-[#DD1D21] group-hover:opacity-20 transition-opacity`} />
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-6xl font-black tracking-tighter text-white drop-shadow-md">
                        {result.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                      </span>
                      <span className="text-xl text-[#FBCE07] font-bold">L</span>
                    </div>
                    <div className="mt-2 text-slate-400 text-sm font-mono bg-white/10 px-3 py-1 rounded-full border border-white/5">
                      H = {heightInput} cm
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!error && result === null && !isAnimating && (
              <div className="text-center text-slate-400 text-sm max-w-[200px]">
                Preencha os dados da medição para consultar a tabela.
              </div>
            )}
          </div>

        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 p-5 text-center border-t border-slate-100 flex flex-col justify-center items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-[#FBCE07]"></div>
            Baseado na tabela volumétrica oficial (V1/V2)
          </div>
          
          <div className="w-full h-px bg-slate-100"></div>

          <div className="flex flex-col items-center justify-center text-slate-600 gap-1">
            <div className="flex items-center gap-1.5 text-xs font-medium">
               <Code2 className="w-3 h-3 text-[#DD1D21]" />
               <span>Desenvolvido por <span className="text-[#DD1D21] font-black">João Layon</span></span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
              Desenvolvedor Full-Stack
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;