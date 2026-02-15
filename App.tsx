import React, { useState, useMemo } from 'react';
import { FuelType, FuelConfig } from './types';
import { 
  DIESEL_TABLE, 
  GASOLINA_TABLE, 
  GASOLINA_ADITIVADO_TABLE,
  ETANOL_COMUM_TABLE, 
  ETANOL_ADITIVADO_TABLE 
} from './constants';
import { 
  Droplet, 
  Ruler, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle2, 
  Code2, 
  FileText, 
  Calculator, 
  Copy, 
  Share2, 
  RefreshCcw,
  Truck,
  ArrowRight
} from 'lucide-react';

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

// Configuration mapping
const fuels: FuelConfig[] = [
  { id: 'GASOLINA', name: 'Gasolina Comum', color: 'bg-red-500', table: GASOLINA_TABLE }, 
  { id: 'GASOLINA_ADITIVADA', name: 'Gasolina V-Power', color: 'bg-[#DD1D21]', table: GASOLINA_ADITIVADO_TABLE }, 
  { id: 'DIESEL', name: 'Diesel Evolux', color: 'bg-amber-600', table: DIESEL_TABLE },
  { id: 'ETANOL_ADITIVADO', name: 'Etanol V-Power', color: 'bg-purple-600', table: ETANOL_ADITIVADO_TABLE },
  { id: 'ETANOL_COMUM', name: 'Etanol Comum', color: 'bg-green-600', table: ETANOL_COMUM_TABLE },
];

// Tank Definitions for Report Mode
interface TankDef {
  code: string;
  fuelId: FuelType;
  shortName: string;
  labelColor: string;
}

const TANKS: TankDef[] = [
  { code: 'T1GC20', fuelId: 'GASOLINA', shortName: 'Gasolina Comum', labelColor: 'text-red-500' },
  { code: 'T2GA15', fuelId: 'GASOLINA_ADITIVADA', shortName: 'Gasolina V-Power', labelColor: 'text-[#DD1D21]' },
  { code: 'T3EC30', fuelId: 'ETANOL_COMUM', shortName: 'Etanol Comum', labelColor: 'text-green-600' },
  { code: 'T4EA15', fuelId: 'ETANOL_ADITIVADO', shortName: 'Etanol V-Power', labelColor: 'text-purple-600' },
  { code: 'T5DS1010', fuelId: 'DIESEL', shortName: 'Diesel S10', labelColor: 'text-amber-600' },
];

const App: React.FC = () => {
  // View Mode State
  const [viewMode, setViewMode] = useState<'calculator' | 'report' | 'reception'>('calculator');

  // Calculator State
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [heightInput, setHeightInput] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Report State
  const [reportInputs, setReportInputs] = useState<Record<string, string>>({});
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  // Reception State
  const [receptionTankCode, setReceptionTankCode] = useState<string | null>(null);
  const [receptionInitial, setReceptionInitial] = useState<string>('');
  const [receptionFinal, setReceptionFinal] = useState<string>('');
  const [receptionResult, setReceptionResult] = useState<{initialVol: number, finalVol: number, receivedVol: number, tank: TankDef} | null>(null);
  const [receptionError, setReceptionError] = useState<string | null>(null);

  const currentFuelConfig = useMemo(() => 
    fuels.find(f => f.id === selectedFuel), 
  [selectedFuel]);

  // Helper to calculate volume
  const getVolume = (fuelId: FuelType, h: number): number | null => {
    const config = fuels.find(f => f.id === fuelId);
    if (!config) return null;
    if (h < 0 || h > 260) return null;

    const baseTens = Math.floor(h / 10) * 10;
    const digit = h % 10;
    const row = config.table[baseTens];
    if (!row) return null;
    
    const val = row[digit];
    return val !== undefined ? val : null;
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);
    setIsAnimating(false);

    if (heightInput.trim() === '') {
      setError("Por favor, digite a altura da régua.");
      return;
    }
    const heightVal = parseInt(heightInput, 10);
    if (isNaN(heightVal) || heightInput.includes('.') || heightInput.includes(',')) {
      setError("Digite apenas números inteiros (cm).");
      return;
    }
    if (heightVal < 0) {
      setError("O valor não pode ser negativo.");
      return;
    }
    if (heightVal > 260) {
      setError("Altura excede o limite do tanque (260cm).");
      return;
    }
    if (!currentFuelConfig) {
      setError("Selecione qual combustível medir.");
      return;
    }

    setIsAnimating(true);
    
    setTimeout(() => {
      const vol = getVolume(currentFuelConfig.id, heightVal);
      if (vol !== null) {
        setResult(vol);
      } else {
        setError("Valor não encontrado na tabela.");
      }
      setIsAnimating(false);
    }, 400);
  };

  // --- REPORT LOGIC ---
  const handleReportInputChange = (code: string, value: string) => {
    setReportInputs(prev => ({ ...prev, [code]: value }));
  };

  const handleGenerateReport = () => {
    const date = new Date();
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let reportText = `⛽ *CONFERÊNCIA REALIZADA ÀS ${formattedTime} DO DIA ${formattedDate}*\n`;
    reportText += `------------------------------\n`;
    reportText += `TANQUE   | RÉGUA | LITROS\n`;
    
    // Removed total calculation variable

    TANKS.forEach(tank => {
      const hStr = reportInputs[tank.code] || '';
      const h = parseInt(hStr, 10);
      let volStr = '---';

      if (!isNaN(h) && hStr.trim() !== '') {
        const vol = getVolume(tank.fuelId, h);
        if (vol !== null) {
          volStr = vol.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }); // Intentionally 0 decimals for compact report per user image
          // Removed accumulation
        } else {
            volStr = "Erro";
        }
      } else if (hStr.trim() === '') {
        volStr = "0"; // Empty input treated as 0
      }

      // Pad strings for alignment (whatsapp font is variable, but this helps)
      const codePad = tank.code.padEnd(8, ' ');
      const hPad = hStr.padEnd(5, ' ');
      
      reportText += `${tank.code} | ${hPad} | ${volStr}\n`;
    });

    reportText += `------------------------------\n`;
    // Removed Total Estimated line

    setGeneratedReport(reportText);
  };

  // --- RECEPTION LOGIC ---
  const handleCalculateReception = () => {
    setReceptionError(null);
    setReceptionResult(null);

    if (!receptionTankCode) {
      setReceptionError("Selecione um tanque.");
      return;
    }
    const tank = TANKS.find(t => t.code === receptionTankCode);
    if (!tank) return;

    const h1 = parseInt(receptionInitial, 10);
    const h2 = parseInt(receptionFinal, 10);

    if (isNaN(h1) || isNaN(h2)) {
      setReceptionError("Preencha as réguas inicial e final.");
      return;
    }
    if (h1 < 0 || h2 < 0) {
      setReceptionError("Valores não podem ser negativos.");
      return;
    }
    if (h1 > 260 || h2 > 260) {
      setReceptionError("Régua excede limite (260cm).");
      return;
    }

    const v1 = getVolume(tank.fuelId, h1);
    const v2 = getVolume(tank.fuelId, h2);

    if (v1 === null || v2 === null) {
      setReceptionError("Erro ao calcular volume na tabela.");
      return;
    }

    setReceptionResult({
      initialVol: v1,
      finalVol: v2,
      receivedVol: v2 - v1,
      tank
    });
  };

  const getReceptionReceipt = () => {
    if (!receptionResult) return '';
    const date = new Date();
    const formattedDate = date.toLocaleDateString('pt-BR');
    const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    return `🚛 *RECEBIMENTO DE COMBUSTÍVEL*\n` +
           `📅 ${formattedDate} - ${formattedTime}\n` +
           `Produto: ${receptionResult.tank.shortName} (${receptionResult.tank.code})\n` +
           `------------------------------\n` +
           `Régua Inicial: ${receptionInitial} cm (${receptionResult.initialVol.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} L)\n` +
           `Régua Final:   ${receptionFinal} cm (${receptionResult.finalVol.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} L)\n` +
           `------------------------------\n` +
           `*ENTRADA: ${receptionResult.receivedVol.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} LITROS*`;
  };

  const shareReception = () => {
    const text = getReceptionReceipt();
    if (text) {
      const encoded = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  const copyReception = () => {
    const text = getReceptionReceipt();
    if (text) {
      navigator.clipboard.writeText(text);
      alert("Comprovante copiado!");
    }
  };


  const copyToClipboard = () => {
    if (generatedReport) {
      navigator.clipboard.writeText(generatedReport);
      alert("Relatório copiado!");
    }
  };

  const shareOnWhatsapp = () => {
    if (generatedReport) {
      const encoded = encodeURIComponent(generatedReport);
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Image: BMW M3 */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] hover:scale-105"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1580273916550-e323be2ebcc6?q=80&w=2574&auto=format&fit=crop')"
        }}
      />
      <div className="absolute inset-0 z-0 bg-black/60 backdrop-blur-[2px]" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-red-200/50 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-red-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600"></div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
             <ShellLogo />
             <div className="text-left">
                <h1 className="text-xl font-black text-[#DD1D21] tracking-tight uppercase italic leading-none">
                  Tanque Certo
                </h1>
                <p className="text-slate-400 text-[9px] font-bold tracking-widest uppercase">Sistema de Volumetria</p>
             </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button 
              onClick={() => setViewMode('calculator')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${viewMode === 'calculator' ? 'bg-white text-[#DD1D21] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Calculator className="w-4 h-4" />
              Calc
            </button>
            <button 
              onClick={() => setViewMode('report')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${viewMode === 'report' ? 'bg-white text-[#DD1D21] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <FileText className="w-4 h-4" />
              Relatório
            </button>
            <button 
              onClick={() => setViewMode('reception')}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${viewMode === 'reception' ? 'bg-white text-[#DD1D21] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Truck className="w-4 h-4" />
              Recebimento
            </button>
          </div>
        </div>

        {/* --- VIEW: CALCULATOR --- */}
        {viewMode === 'calculator' && (
          <div className="p-6 space-y-6 flex-grow overflow-y-auto">
            {/* Fuel Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Droplet className="w-3 h-3 text-[#DD1D21]" />
                Selecione o Produto
              </label>
              <div className="grid grid-cols-2 gap-2">
                {fuels.map((fuel) => (
                  <button
                    key={fuel.id}
                    onClick={() => {
                      setSelectedFuel(fuel.id);
                      setResult(null);
                      setError(null);
                    }}
                    className={`
                      py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 border-2
                      flex flex-col items-center justify-center gap-1 h-16 relative overflow-hidden
                      ${selectedFuel === fuel.id 
                        ? `${fuel.color} border-transparent text-white shadow-lg ring-2 ring-offset-1 ring-red-200` 
                        : 'bg-white border-slate-100 text-slate-600 hover:border-red-200 hover:bg-red-50'}
                      ${fuel.id === 'ETANOL_COMUM' ? 'col-span-2' : ''}
                    `}
                  >
                    <div className={`w-2 h-2 rounded-full shadow-sm z-10 ${selectedFuel === fuel.id ? 'bg-white' : fuel.color}`}></div>
                    <span className="text-center leading-tight z-10">{fuel.name}</span>
                    {selectedFuel === fuel.id && (
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Height Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Ruler className="w-3 h-3 text-[#DD1D21]" />
                Altura da Régua
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
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-3xl font-black py-3 px-4 rounded-xl focus:outline-none focus:border-[#DD1D21] focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-slate-300 text-center tracking-tight"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">cm</span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCalculate}
              disabled={isAnimating || !selectedFuel || !heightInput}
              className={`
                w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-red-900/10 transition-all duration-200
                ${!selectedFuel || !heightInput 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-[#DD1D21] text-white hover:bg-[#b0161a] active:scale-[0.98]'}
              `}
            >
              {isAnimating ? (
                <span className="animate-pulse">Consultando...</span>
              ) : (
                <>Calcular Volume <ChevronRight className="w-5 h-5" /></>
              )}
            </button>

            {/* Result */}
            <div className="min-h-[120px] flex items-center justify-center pb-2">
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
                    <span className="text-xs font-bold uppercase tracking-widest">Volume</span>
                  </div>
                  <div className="bg-neutral-900 text-white rounded-2xl py-6 px-4 relative overflow-hidden group shadow-2xl border border-red-900">
                    <div className={`absolute inset-0 opacity-10 bg-gradient-to-tr from-[#DD1D21] via-[#FBCE07] to-[#DD1D21] group-hover:opacity-20 transition-opacity`} />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-black tracking-tighter text-white drop-shadow-md">
                          {result.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                        </span>
                        <span className="text-xl text-[#FBCE07] font-bold">L</span>
                      </div>
                      <div className="mt-2 text-slate-400 text-xs font-mono bg-white/10 px-3 py-1 rounded-full border border-white/5">
                        H = {heightInput} cm
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: REPORT --- */}
        {viewMode === 'report' && (
          <div className="flex flex-col h-full overflow-hidden">
            {!generatedReport ? (
              <div className="p-6 flex-grow overflow-y-auto space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                   <div className="bg-blue-100 p-1.5 rounded-full mt-0.5">
                     <FileText className="w-4 h-4 text-blue-600" />
                   </div>
                   <p className="text-xs text-blue-800 leading-relaxed">
                     Preencha as réguas de cada tanque abaixo. O sistema identificará automaticamente os produtos pelos códigos (GC, GA, EC, etc).
                   </p>
                </div>

                <div className="space-y-3">
                  {TANKS.map((tank) => (
                    <div key={tank.code} className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="w-16 h-12 flex items-center justify-center bg-white rounded-lg border border-slate-200 shadow-sm font-black text-slate-700 text-sm tracking-tighter">
                        {tank.code}
                      </div>
                      <div className="flex-grow">
                        <p className={`text-[10px] font-bold uppercase ${tank.labelColor}`}>{tank.shortName}</p>
                        <p className="text-[10px] text-slate-400">Tanque {tank.code.substring(1,2)}</p>
                      </div>
                      <div className="relative w-24">
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="0"
                          value={reportInputs[tank.code] || ''}
                          onChange={(e) => handleReportInputChange(tank.code, e.target.value)}
                          className="w-full bg-white border-2 border-slate-200 text-slate-800 font-bold py-2 px-3 rounded-lg focus:outline-none focus:border-[#DD1D21] text-right text-lg"
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold pointer-events-none mr-1">cm</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleGenerateReport}
                  className="w-full py-4 mt-4 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98]"
                >
                  <FileText className="w-5 h-5" />
                  Gerar Texto do Relatório
                </button>
              </div>
            ) : (
              <div className="p-6 flex-grow flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Relatório Gerado
                  </h3>
                  <button 
                    onClick={() => setGeneratedReport(null)}
                    className="text-xs text-[#DD1D21] font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCcw className="w-3 h-3" />
                    Novo Cálculo
                  </button>
                </div>

                <div className="flex-grow bg-slate-50 border-2 border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-700 overflow-y-auto whitespace-pre shadow-inner mb-4">
                  {generatedReport}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="py-3 rounded-xl font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <Copy className="w-4 h-4" />
                    Copiar
                  </button>
                  <button
                    onClick={shareOnWhatsapp}
                    className="py-3 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-[0.98]"
                  >
                    <Share2 className="w-4 h-4" />
                    WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: RECEPTION --- */}
        {viewMode === 'reception' && (
          <div className="p-6 space-y-6 flex-grow overflow-y-auto">
            {/* Reception Tank Selection */}
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#DD1D21]" />
                Selecione o Tanque Recebido
               </label>
               <div className="grid grid-cols-2 gap-2">
                 {TANKS.map((tank) => (
                   <button
                     key={tank.code}
                     onClick={() => {
                        setReceptionTankCode(tank.code);
                        setReceptionResult(null);
                        setReceptionError(null);
                     }}
                     className={`
                       py-2 px-2 rounded-xl text-xs font-bold transition-all duration-200 border-2
                       flex flex-col items-center justify-center gap-0.5 h-14 relative overflow-hidden
                       ${receptionTankCode === tank.code 
                         ? `border-[#DD1D21] bg-red-50 text-[#DD1D21] shadow-md` 
                         : 'bg-white border-slate-100 text-slate-600 hover:border-red-100 hover:bg-slate-50'}
                       ${tank.code === 'T5DS1010' ? 'col-span-2' : ''}
                     `}
                   >
                     <span className="text-[10px] opacity-70">{tank.code}</span>
                     <span className={`text-center leading-tight z-10 ${receptionTankCode === tank.code ? 'text-[#DD1D21]' : 'text-slate-800'}`}>{tank.shortName}</span>
                   </button>
                 ))}
               </div>
            </div>

            {/* Inputs Initial/Final */}
            <div className="grid grid-cols-2 gap-4 relative">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Régua Inicial</label>
                   <div className="relative">
                      <input 
                        type="number" 
                        inputMode="numeric"
                        placeholder="0"
                        value={receptionInitial}
                        onChange={(e) => setReceptionInitial(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-xl font-black py-3 px-3 rounded-xl focus:outline-none focus:border-[#DD1D21] text-center"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">cm</span>
                   </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-3 text-slate-300">
                    <ArrowRight className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Régua Final</label>
                   <div className="relative">
                      <input 
                        type="number" 
                        inputMode="numeric"
                        placeholder="0"
                        value={receptionFinal}
                        onChange={(e) => setReceptionFinal(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-xl font-black py-3 px-3 rounded-xl focus:outline-none focus:border-[#DD1D21] text-center"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">cm</span>
                   </div>
                </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={handleCalculateReception}
              disabled={!receptionTankCode || !receptionInitial || !receptionFinal}
              className={`
                w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-xl shadow-red-900/10 transition-all duration-200
                ${!receptionTankCode || !receptionInitial || !receptionFinal
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-[#DD1D21] text-white hover:bg-[#b0161a] active:scale-[0.98]'}
              `}
            >
              Calcular Recebimento
            </button>
            
            {/* Results Area */}
            {receptionError && (
              <div className="flex items-center gap-3 text-[#DD1D21] bg-red-50 px-5 py-4 rounded-xl border border-red-100 animate-[shake_0.5s_ease-in-out]">
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <span className="font-semibold text-sm leading-tight">{receptionError}</span>
              </div>
            )}

            {receptionResult && (
               <div className="animate-[fadeIn_0.5s_ease-out] space-y-4">
                  <div className="bg-neutral-900 text-white rounded-2xl py-6 px-4 relative overflow-hidden group shadow-2xl border border-red-900">
                    <div className={`absolute inset-0 opacity-10 bg-gradient-to-tr from-[#DD1D21] via-[#FBCE07] to-[#DD1D21]`} />
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Combustível Recebido</span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-5xl font-black tracking-tighter text-white drop-shadow-md">
                          {receptionResult.receivedVol.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-xl text-[#FBCE07] font-bold">L</span>
                      </div>
                      <div className="flex items-center gap-4 mt-4 text-[10px] font-mono opacity-80">
                         <div className="flex flex-col items-center">
                            <span className="text-slate-500">INICIAL</span>
                            <span className="font-bold">{receptionResult.initialVol.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} L</span>
                         </div>
                         <div className="w-px h-6 bg-white/20"></div>
                         <div className="flex flex-col items-center">
                            <span className="text-slate-500">FINAL</span>
                            <span className="font-bold">{receptionResult.finalVol.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} L</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={copyReception}
                      className="py-3 rounded-xl font-bold text-slate-700 bg-white border-2 border-slate-200 hover:border-slate-300 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-xs"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar
                    </button>
                    <button
                      onClick={shareReception}
                      className="py-3 rounded-xl font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-[0.98] text-xs"
                    >
                      <Share2 className="w-4 h-4" />
                      WhatsApp
                    </button>
                  </div>
               </div>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100 flex flex-col justify-center items-center gap-2">
          <div className="flex flex-col items-center justify-center text-slate-600 gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-medium">
               <Code2 className="w-3 h-3 text-[#DD1D21]" />
               <span>Desenvolvido por <span className="text-[#DD1D21] font-black">João Layon</span></span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default App;