'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import AppShell from '@/components/AppShell';
import { useAppStore } from '@/store/useAppStore';
import { removeBackground } from '@/lib/api';
import { type Brand, type DeviceModel, type RepairGuide, type Category, type Difficulty } from '@/lib/types';
import { brandService } from '@/services/brands';
import { modelService } from '@/services/models';
import { guideService } from '@/services/guides';
import { categoryService } from '@/services/categories';
import { useRouter, useParams } from 'next/navigation';

import GuidesHeader from '@/components/guides/GuidesHeader';
import GuidesPcbPanel from '@/components/guides/GuidesPcbPanel';
import GuideList from '@/components/guides/GuideList';
import GuideForm from '@/components/guides/GuideForm';
import QuickViewModal from '@/components/guides/QuickViewModal';

export default function GuidesScreen({ brandId: propBrandId, modelId: propModelId }: { brandId?: string; modelId?: string }) {
  const router = useRouter();
  const params = useParams();
  
  const brandId = propBrandId || params.brandId as string;
  const modelId = propModelId || params.modelId as string;
  
  const { userMode } = useAppStore();
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [model, setModel] = useState<DeviceModel | null>(null);
  const [guides, setGuides] = useState<RepairGuide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [showPcbImages, setShowPcbImages] = useState(false);
  const [uploading, setUploading] = useState<'front' | 'back' | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<RepairGuide | null>(null);
  const [quickViewGuide, setQuickViewGuide] = useState<RepairGuide | null>(null);

  const [title, setTitle] = useState(''); 
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medio'); 
  const [description, setDescription] = useState('');
  const [classicSymptoms, setClassicSymptoms] = useState('');
  const [circuitAnalysis, setCircuitAnalysis] = useState('');
  const [identifiedCause, setIdentifiedCause] = useState('');
  const [appliedSolution, setAppliedSolution] = useState('');
  const [observations, setObservations] = useState('');

  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const filteredGuides = useMemo(() => {
    if (!selectedCategoryId) return guides;
    return guides.filter(g => g.categoryId === selectedCategoryId);
  }, [guides, selectedCategoryId]);

  const reloadData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, mods, g, c] = await Promise.all([
        brandService.getById(brandId).catch(() => null),
        modelService.getAll(brandId).catch(() => []),
        guideService.getAll(modelId).catch(() => []),
        categoryService.getAll().catch(() => [])
      ]);
      setBrand(b);
      setModel(mods.find(m => m.id === modelId) || null);
      setGuides(g);
      setCategories(c);
    } catch (err) { console.error('Failed to load Guides', err); }
    finally { setLoading(false); }
  }, [brandId, modelId]);

  useEffect(() => { 
    reloadData(); 
  }, [reloadData]);

  const handlePcbUpload = async (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !model) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setUploading(side);

      try {
        const result = await removeBackground({ 
          image: dataUrl, 
          sharpen: true,
          upscale: true,
          target_width: 2560
        });
        
        const updates: Partial<DeviceModel> = {};
        if (side === 'front') {
          updates.pcbImageFront = dataUrl;
          updates.pcbImageFrontClean = result.cleanImage;
        } else {
          updates.pcbImageBack = dataUrl;
          updates.pcbImageBackClean = result.cleanImage;
        }
        await modelService.update(modelId, updates);
        await reloadData();
      } catch (err) {
        console.error('PCB upload error:', err);
        const fallback: Partial<DeviceModel> = {};
        if (side === 'front') fallback.pcbImageFront = dataUrl;
        else fallback.pcbImageBack = dataUrl;
        await modelService.update(modelId, fallback);
        await reloadData();
      }
      setUploading(null);
    };
    reader.readAsDataURL(file);
  };



  const handlePcbRemove = async (side: 'front' | 'back') => {
    if (!confirm(`Excluir imagem do ${side === 'front' ? 'Frente' : 'Verso'}?`)) return;
    setLoading(true);
    try {
      await modelService.update(modelId, side === 'front' 
        ? { pcbImageFront: null as unknown as string, pcbImageFrontClean: null as unknown as string } 
        : { pcbImageBack: null as unknown as string, pcbImageBackClean: null as unknown as string }
      );
      await reloadData();
    } catch (err) { console.error(err); setLoading(false); }
  };

  /* Guides Form Functions */
  const openCreate = () => { 
    setEditItem(null); 
    setTitle(''); 
    setCategoryId(categories[0]?.id || ''); 
    setDifficulty('medio'); 
    setDescription(''); 
    setClassicSymptoms('');
    setCircuitAnalysis('');
    setIdentifiedCause('');
    setAppliedSolution('');
    setObservations('');
    setShowForm(true); 
  };
  
  const openEdit = (g: RepairGuide) => { 
    setEditItem(g); 
    setTitle(g.problemTitle); 
    setCategoryId(g.categoryId); 
    setDifficulty(g.difficulty); 
    setDescription(g.description || ''); 
    setClassicSymptoms(g.classicSymptoms || '');
    setCircuitAnalysis(g.circuitAnalysis || '');
    setIdentifiedCause(g.identifiedCause || '');
    setAppliedSolution(g.appliedSolution || '');
    setObservations(g.observations || '');
    setShowForm(true); 
  };

  const handleQuickView = (g: RepairGuide) => {
    setQuickViewGuide(g);
  };

  const goToDetails = (guideId: string) => {
    router.push(`/brands/${brandId}/models/${modelId}/guides/${guideId}/map`);
  };

  const handleSaveGuide = async () => { 
    if (!title.trim()) return; 
    setLoading(true);
    try {
      const payload = { 
        modelId, 
        problemTitle: title.trim(), 
        categoryId, 
        difficulty, 
        description: description.trim(), 
        classicSymptoms: classicSymptoms.trim(),
        circuitAnalysis: circuitAnalysis.trim(),
        identifiedCause: identifiedCause.trim(),
        appliedSolution: appliedSolution.trim(),
        observations: observations.trim(),
        steps: editItem?.steps || [] 
      };
      if (editItem?.id) await guideService.update(editItem.id, payload);
      else await guideService.create(payload);
      setShowForm(false); 
      reloadData();
    } catch (err) { console.error(err); setLoading(false); }
  };

  const handleDeleteGuide = async (g: RepairGuide) => { 
    if (!confirm(`Excluir permanentemente o guia "${g.problemTitle}"?`)) return; 
    setLoading(true);
    try {
       await guideService.delete(g.id); 
       reloadData(); 
    } catch (err) { console.error(err); setLoading(false); }
  };

  const hasPcbImages = !!(model?.pcbImageFront || model?.pcbImageBack);

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
        
        {loading && <div className="fixed top-8 right-8 px-4 py-2 bg-[#3b82f6] text-white text-[12px] font-bold rounded-lg shadow-xl z-50 animate-pulse flex items-center gap-2"><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Atualizando Nuvem...</div>}

        <GuidesHeader 
          brand={brand} 
          model={model} 
          userMode={userMode}
          brandId={brandId}
          modelId={modelId}
          onOpenCreate={openCreate} 
        />

        <GuidesPcbPanel 
          model={model} 
          userMode={userMode}
          showPcbImages={showPcbImages}
          setShowPcbImages={setShowPcbImages}
          uploading={uploading}
          onUpload={handlePcbUpload}
          onRemove={handlePcbRemove}
        />

        <div className="flex flex-col md:flex-row gap-8 mt-12 mb-20">
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-[#161921] border border-[#1e2030] rounded-2xl p-5 sticky top-8">
              <h3 className="text-[14px] font-bold text-[#e1e2e8] mb-5 px-1 uppercase tracking-wider text-[#5c5f77]">Soluções por Setor</h3>
              <div className="flex flex-col gap-1.5">
                <button 
                  onClick={() => setSelectedCategoryId(null)}
                  className={`flex items-center justify-between px-4 py-2.5 text-[12px] rounded-xl transition-all ${selectedCategoryId === null ? 'bg-[#3b82f6]/10 text-[#3b82f6] font-bold border border-[#3b82f6]/20' : 'text-[#8b8fa3] hover:bg-[#1e2030] hover:text-[#e1e2e8] border border-transparent'}`}
                >
                  <span>Todos os Setores</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] ${selectedCategoryId === null ? 'bg-[#3b82f6] text-white' : 'bg-[#1e2030] text-[#5c5f77]'}`}>{guides.length}</span>
                </button>
                {categories.map(cat => {
                  const count = guides.filter(g => g.categoryId === cat.id).length;
                  return (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`flex items-center justify-between px-4 py-2.5 text-[12px] rounded-xl transition-all ${selectedCategoryId === cat.id ? 'bg-[#3b82f6]/10 text-[#3b82f6] font-bold border border-[#3b82f6]/20' : 'text-[#8b8fa3] hover:bg-[#1e2030] hover:text-[#e1e2e8] border border-transparent'}`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] ${selectedCategoryId === cat.id ? 'bg-[#3b82f6] text-white' : 'bg-[#1e2030] text-[#5c5f77]'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <GuideList 
              guides={filteredGuides}
              categories={categories}
              brandId={brandId}
              modelId={modelId}
              userMode={userMode}
              hasPcbImages={hasPcbImages}
              onEdit={openEdit}
              onDelete={handleDeleteGuide}
              onQuickView={handleQuickView}
            />
          </div>
        </div>

        {showForm && (
          <GuideForm 
            editItem={editItem}
            title={title} setTitle={setTitle}
            categoryId={categoryId} setCategoryId={setCategoryId}
            difficulty={difficulty} setDifficulty={setDifficulty}
            description={description} setDescription={setDescription}
            classicSymptoms={classicSymptoms} setClassicSymptoms={setClassicSymptoms}
            circuitAnalysis={circuitAnalysis} setCircuitAnalysis={setCircuitAnalysis}
            identifiedCause={identifiedCause} setIdentifiedCause={setIdentifiedCause}
            appliedSolution={appliedSolution} setAppliedSolution={setAppliedSolution}
            observations={observations} setObservations={setObservations}
            categories={categories}
            onClose={() => setShowForm(false)}
            onSave={handleSaveGuide}
          />
        )}

        {quickViewGuide && (
          <QuickViewModal 
            guide={quickViewGuide}
            category={categories.find(c => c.id === quickViewGuide.categoryId)}
            onClose={() => setQuickViewGuide(null)}
            onFullView={() => goToDetails(quickViewGuide.id)}
          />
        )}
        
      </div>
    </AppShell>
  );
}
