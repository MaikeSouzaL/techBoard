import { Pencil, Trash2, Wrench, getCategoryIcon } from '@/lib/icons';
import { RepairGuide, Category, DIFFICULTY_CONFIG } from '@/lib/types';

interface GuideListProps {
  guides: RepairGuide[];
  categories: Category[];
  brandId: string;
  modelId: string;
  userMode: string;
  hasPcbImages: boolean;
  onEdit: (g: RepairGuide) => void;
  onDelete: (g: RepairGuide) => void;
  onQuickView: (g: RepairGuide) => void;
}

export default function GuideList({ 
  guides, categories, brandId, modelId, userMode, hasPcbImages, onEdit, onDelete, onQuickView 
}: GuideListProps) {
  
  const getCat = (id: string) => categories.find(c => c.id === id);

  if (guides.length === 0) {
    return (
      <div className="text-center py-20 bg-[#161921] border border-[#1e2030] rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-[#1e2030] flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-8 h-8 text-[#5c5f77]" />
        </div>
        <p className="text-[16px] font-bold text-[#e1e2e8] mb-1">Nenhum Guia de Reparo</p>
        <p className="text-[13px] text-[#5c5f77] max-w-sm mx-auto">
          Crie soluções técnicas para as falhas comuns deste dispositivo e enriqueça a base de conhecimento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {guides.map(g => { 
        const cat = getCat(g.categoryId); 
        const Icon = cat ? getCategoryIcon(cat.icon) : Wrench; 
        const di = DIFFICULTY_CONFIG[g.difficulty]; 
        
        return (
          <div 
            key={g.id} 
            className="group flex flex-col bg-[#161921] border border-[#1e2030] rounded-2xl hover:border-[#3b82f6]/50 transition-all shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] overflow-hidden"
          >
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4 gap-2">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border" 
                  style={{ 
                    backgroundColor: (cat?.color || '#78909c') + '15',
                    borderColor: (cat?.color || '#78909c') + '30'
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: cat?.color || '#78909c' }} />
                </div>

                {userMode === 'admin' && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button 
                      onClick={e => { e.preventDefault(); e.stopPropagation(); onEdit(g); }} 
                      className="w-8 h-8 rounded-lg bg-[#1e2030] text-[#8b8fa3] flex items-center justify-center hover:bg-[#3b82f6] hover:text-white transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(g); }} 
                      className="w-8 h-8 rounded-lg bg-[#1e2030] text-[#8b8fa3] flex items-center justify-center hover:bg-[#ef4444] hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <h3 className="text-[16px] font-bold text-[#e1e2e8] group-hover:text-[#3b82f6] transition-colors line-clamp-2 mb-3">
                {g.problemTitle}
              </h3>

              <div className="space-y-3 mb-6 flex-1">
                {g.description && (
                  <p className="text-[12px] text-[#8b8fa3] line-clamp-2 leading-relaxed">
                    {g.description}
                  </p>
                )}
                {g.classicSymptoms && (
                  <div className="bg-[#12141d] rounded-lg p-2.5 border border-[#1e2030]">
                    <p className="text-[10px] font-bold text-[#5c5f77] uppercase tracking-wider mb-1">Sintomas</p>
                    <p className="text-[11px] text-[#8b8fa3] line-clamp-2 italic">{g.classicSymptoms}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#1e2030]/50">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-[10px] uppercase px-2.5 py-1 rounded-lg border font-bold" 
                    style={{ borderColor: di.color + '40', color: di.color, backgroundColor: di.color + '10' }}
                  >
                    {di.label}
                  </span>
                  {hasPcbImages && (
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickView(g); }}
                      className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 text-[#8b5cf6] cursor-pointer hover:bg-[#8b5cf6]/20 transition-colors"
                    >
                      BoardView
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={() => onQuickView(g)}
              className="w-full px-4 py-4 bg-[#3b82f6] text-white text-[13px] font-bold text-center flex items-center justify-center gap-2 group-hover:bg-[#2563eb] transition-colors cursor-pointer"
            >
               Ver Detalhes
            </button>
          </div>
        ); 
      })}
    </div>
  );
}
