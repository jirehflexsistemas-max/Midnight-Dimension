import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Flame, Shield, Globe, Award, Maximize2, Layers, Cpu, Eye } from 'lucide-react';
import { CODEX_ENTRIES } from '../data/loreAndLevels';

interface CodexModalProps {
  onClose: () => void;
  initialEntryId?: string;
}

export const CodexModal: React.FC<CodexModalProps> = ({ onClose, initialEntryId }) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'UE5' | 'GUARDIANS' | 'LORE'>('ALL');
  const [selectedEntry, setSelectedEntry] = useState(() => {
    if (initialEntryId) {
      const found = CODEX_ENTRIES.find((e) => e.id === initialEntryId);
      if (found) return found;
    }
    return CODEX_ENTRIES[0];
  });
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; subtitle?: string } | null>(null);

  const filteredEntries = CODEX_ENTRIES.filter((entry) => {
    if (selectedCategory === 'UE5') {
      return entry.id.startsWith('ue5_') || entry.category.includes('UE5') || entry.category.includes('AAA');
    }
    if (selectedCategory === 'GUARDIANS') {
      return entry.id.includes('guardian') || entry.id.includes('lore') || entry.category.includes('Guardián') || entry.category.includes('Alianza');
    }
    if (selectedCategory === 'LORE') {
      return !entry.id.startsWith('ue5_') && !entry.category.includes('Guardián');
    }
    return true;
  });

  const isWideImage = selectedEntry.id.startsWith('ue5_') || selectedEntry.category.includes('UE5') || selectedEntry.category.includes('AAA');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8 select-none">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border-2 border-purple-900/60 rounded-3xl shadow-2xl shadow-purple-950/50 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/50">
              <BookOpen className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="font-cinzel text-base sm:text-lg font-bold text-white tracking-wider">
                CÓDICE DEL MULTIVERSO · MIDNIGHT DIMENSIONS
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Archivos del Continuo, Entornos Unreal Engine 5 y Biografías Cósmicas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-slate-950/90 border-b border-slate-800/80 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-purple-900/80 text-white font-bold border border-purple-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Todos ({CODEX_ENTRIES.length})
          </button>
          <button
            onClick={() => setSelectedCategory('UE5')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'UE5'
                ? 'bg-sky-900/80 text-sky-200 font-bold border border-sky-500/50'
                : 'text-sky-400 hover:text-sky-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Arte & Cinemáticas UE5 (4)</span>
          </button>
          <button
            onClick={() => setSelectedCategory('GUARDIANS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'GUARDIANS'
                ? 'bg-amber-900/80 text-amber-200 font-bold border border-amber-500/50'
                : 'text-amber-400 hover:text-amber-200 hover:bg-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Guardianes Cósmicos (7)</span>
          </button>
          <button
            onClick={() => setSelectedCategory('LORE')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'LORE'
                ? 'bg-indigo-900/80 text-indigo-200 font-bold border border-indigo-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            Historia, Pandorum & Reliquias
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden min-h-0">
          {/* Left Column: Entry List */}
          <div className="md:col-span-4 border-r border-slate-800 p-3 space-y-2 overflow-y-auto bg-slate-950/40">
            {filteredEntries.map((entry) => {
              const isSelected = selectedEntry.id === entry.id;
              const isUE5 = entry.id.startsWith('ue5_');

              return (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className={`w-full p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? isUE5
                        ? 'bg-sky-950/80 border-2 border-sky-500 text-white shadow-lg shadow-sky-950/50'
                        : 'bg-purple-950/80 border-2 border-purple-500 text-white shadow-lg shadow-purple-950/50'
                      : 'bg-slate-900/70 border border-slate-800/80 text-slate-300 hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-cinzel text-xs font-bold truncate block">
                      {entry.title}
                    </span>
                    {isUE5 && (
                      <span className="shrink-0 text-[9px] font-mono uppercase bg-sky-900/80 text-sky-300 px-1.5 py-0.5 rounded border border-sky-700">
                        UE5
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 block mt-1 truncate">
                    {entry.category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Reader */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-5 bg-slate-900/90">
            {/* Header info */}
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-700 inline-block mb-1.5">
                {selectedEntry.category}
              </span>
              <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
                {selectedEntry.title}
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-1">
                {selectedEntry.subtitle}
              </p>
            </div>

            {/* Visual Media Showcase */}
            {selectedEntry.image && (
              <div className="relative group rounded-2xl overflow-hidden border-2 border-purple-500/40 bg-slate-950 shadow-2xl">
                <img
                  src={selectedEntry.image}
                  alt={selectedEntry.title}
                  className={`w-full ${
                    isWideImage ? 'aspect-[16/9]' : 'aspect-square max-w-sm mx-auto'
                  } object-cover transition-transform duration-500 group-hover:scale-[1.01]`}
                />

                {/* Lightbox Trigger Overlay */}
                <button
                  onClick={() =>
                    setLightboxImage({
                      src: selectedEntry.image!,
                      title: selectedEntry.title,
                      subtitle: selectedEntry.subtitle,
                    })
                  }
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/75 hover:bg-black text-white text-xs font-mono border border-slate-700 backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg"
                  title="Expandir imagen en alta resolución"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ampliar 8K</span>
                </button>
              </div>
            )}

            {/* Formatted Content */}
            <div className="space-y-3 text-sm text-slate-300 font-light leading-relaxed whitespace-pre-line border-t border-slate-800 pt-4">
              {selectedEntry.content}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Midnight Dimensions · Códice Multiversal y Arte Conceptual</span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Archivo
          </button>
        </div>
      </div>

      {/* Lightbox Modal (Fullscreen 8K View) */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-6xl w-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between text-slate-200 px-2">
              <div>
                <h4 className="font-cinzel text-base font-bold text-white">{lightboxImage.title}</h4>
                {lightboxImage.subtitle && (
                  <p className="text-xs font-mono text-slate-400">{lightboxImage.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full rounded-2xl overflow-hidden border-2 border-sky-500/50 shadow-2xl bg-slate-950">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.title}
                className="w-full max-h-[80vh] object-contain mx-auto"
              />
            </div>

            <p className="text-xs font-mono text-slate-500">
              Presiona en cualquier lugar fuera de la imagen o en Cerrar para salir
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
