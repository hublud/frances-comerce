'use client';

import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Product, ProductVariationType } from '../types';
import { X, Plus, Trash2, Check, Sparkles, Sliders, RefreshCw, Layers, Palette, Lock, Unlock, Eye, EyeOff, AlertCircle, Star, Camera, Loader2, Image as LucideImage } from 'lucide-react';
import { checkAdminPassword, isAdminAuthenticated, setAdminAuthenticated } from '../lib/auth';
import { processImageFile, processMultipleImageFiles } from '../lib/image-utils';
import {
  GIRLY_COLOR_PALETTE,
  extractColorHex,
  extractColorName,
  formatColorOption,
  isColorVariationName,
  splitCommaOptions,
  normalizeVariationOptions,
} from '../lib/colors';

export default function AdminModal() {
  const {
    products,
    isAdminOpen,
    setIsAdminOpen,
    updateProduct,
    updateProductVariations,
    addProduct,
    deleteProduct,
    resetCatalog,
    showToast,
  } = useShop();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'variations' | 'details'>('variations');

  // Local state for variations being edited
  const currentProduct = products.find(p => p.id === selectedProductId) || products[0];
  const [variations, setVariations] = useState<ProductVariationType[]>(
    currentProduct?.variations || []
  );

  // New variation type input state
  const [newTypeName, setNewTypeName] = useState('');
  const [newOptionInputs, setNewOptionInputs] = useState<Record<number, string>>({});
  
  // Color studio inputs per variation index
  const [colorNameInputs, setColorNameInputs] = useState<Record<number, string>>({});
  const [colorHexInputs, setColorHexInputs] = useState<Record<number, string>>({});
  const [colorPickerHexs, setColorPickerHexs] = useState<Record<number, string>>({});
  const [colorModeOverrides, setColorModeOverrides] = useState<Record<number, boolean>>({});

  // Product details form state
  const [prodForm, setProdForm] = useState<Partial<Product>>({});
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  // Authentication state for modal
  const [modalPassword, setModalPassword] = useState('');
  const [showModalPass, setShowModalPass] = useState(false);
  const [modalAuthError, setModalAuthError] = useState<string | null>(null);
  const [isModalAuthed, setIsModalAuthed] = useState(false);

  // Sync auth state and selected product when modal is opened
  React.useEffect(() => {
    if (isAdminOpen) {
      setIsModalAuthed(isAdminAuthenticated());
      setModalPassword('');
      setModalAuthError(null);
      if (currentProduct) {
        setVariations(currentProduct.variations || []);
        const gallery = Array.isArray(currentProduct.images) && currentProduct.images.length > 0
          ? [...currentProduct.images]
          : ([currentProduct.image, currentProduct.hoverImage].filter(Boolean) as string[]);
        setProdForm({
          ...currentProduct,
          image: currentProduct.image || gallery[0] || '',
          hoverImage: currentProduct.hoverImage || gallery[1] || '',
          images: gallery,
        });
      }
    }
  }, [isAdminOpen, selectedProductId]);

  const handleModalUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkAdminPassword(modalPassword)) {
      setAdminAuthenticated(true);
      setIsModalAuthed(true);
      setModalAuthError(null);
      setModalPassword('');
      showToast('Unlocked variation studio! 🌸', 'sparkle');
    } else {
      setModalAuthError('Incorrect password. Access denied.');
      showToast('Incorrect administrator password', 'warning');
    }
  };

  // When switching selected product, update local editing states
  const handleSelectProduct = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setVariations(prod.variations || []);
      const gallery = Array.isArray(prod.images) && prod.images.length > 0
        ? [...prod.images]
        : ([prod.image, prod.hoverImage].filter(Boolean) as string[]);
      setProdForm({
        ...prod,
        image: prod.image || gallery[0] || '',
        hoverImage: prod.hoverImage || gallery[1] || '',
        images: gallery,
      });
    }
  };

  // Primary cover image upload from device
  const handlePrimaryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsProcessingImages(true);
      const dataUrl = await processImageFile(files[0]);
      setProdForm(prev => {
        const existingImages = Array.isArray(prev.images) ? [...prev.images] : [];
        const filtered = existingImages.filter(img => img !== dataUrl);
        return {
          ...prev,
          image: dataUrl,
          images: [dataUrl, ...filtered],
        };
      });
      showToast('Main product cover updated! 📸', 'sparkle');
    } catch (err) {
      console.error(err);
      showToast('Could not process cover image', 'warning');
    } finally {
      setIsProcessingImages(false);
      e.target.value = '';
    }
  };

  // Multiple gallery photos upload from device
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsProcessingImages(true);
      const newImages = await processMultipleImageFiles(files);
      if (newImages.length > 0) {
        setProdForm(prev => {
          const currentGallery = Array.isArray(prev.images) ? [...prev.images] : [];
          const combined = [...currentGallery];
          newImages.forEach(img => {
            if (!combined.includes(img)) combined.push(img);
          });
          const primaryImg = prev.image || combined[0] || '';
          return {
            ...prev,
            image: primaryImg,
            hoverImage: prev.hoverImage || combined[1] || combined[0] || '',
            images: combined,
          };
        });
        showToast(`Added ${newImages.length} photo(s) to gallery! 🌸`, 'sparkle');
      }
    } catch (err) {
      console.error(err);
      showToast('Could not process gallery images', 'warning');
    } finally {
      setIsProcessingImages(false);
      e.target.value = '';
    }
  };

  // Add photo to gallery by URL
  const handleAddGalleryUrl = () => {
    if (!galleryUrlInput.trim()) return;
    const url = galleryUrlInput.trim();
    setProdForm(prev => {
      const currentGallery = Array.isArray(prev.images) ? [...prev.images] : [];
      if (!currentGallery.includes(url)) {
        currentGallery.push(url);
      }
      return {
        ...prev,
        image: prev.image || currentGallery[0],
        hoverImage: prev.hoverImage || currentGallery[1] || currentGallery[0],
        images: currentGallery,
      };
    });
    setGalleryUrlInput('');
    showToast('Added photo URL to gallery! ✨', 'sparkle');
  };

  // Set any gallery image as the primary cover
  const handleSetAsCover = (imgUrl: string) => {
    setProdForm(prev => {
      const currentGallery = Array.isArray(prev.images) ? [...prev.images] : [];
      const rest = currentGallery.filter(i => i !== imgUrl);
      const newGallery = [imgUrl, ...rest];
      return {
        ...prev,
        image: imgUrl,
        hoverImage: newGallery[1] || imgUrl,
        images: newGallery,
      };
    });
    showToast('Set as main cover image! ⭐', 'sparkle');
  };

  // Remove photo from gallery
  const handleRemoveGalleryImage = (indexToRemove: number) => {
    setProdForm(prev => {
      const currentGallery = Array.isArray(prev.images) ? [...prev.images] : [];
      const removed = currentGallery[indexToRemove];
      const filtered = currentGallery.filter((_, i) => i !== indexToRemove);
      let newMain = prev.image;
      if (newMain === removed) {
        newMain = filtered[0] || '';
      }
      return {
        ...prev,
        image: newMain,
        hoverImage: filtered[1] || filtered[0] || '',
        images: filtered,
      };
    });
    showToast('Photo removed from gallery', 'info');
  };

  if (!isAdminOpen) return null;

  // Add a new variation type (e.g. "Color Type", "Size Type", "Fabric Type")
  const handleAddVariationType = () => {
    if (!newTypeName.trim()) {
      showToast('Please type a variation name like "Color" or "Size"', 'warning');
      return;
    }
    const cleanName = newTypeName.trim();
    if (variations.some(v => v.name.toLowerCase() === cleanName.toLowerCase())) {
      showToast(`Variation "${cleanName}" already exists!`, 'warning');
      return;
    }
    const updated = [...variations, { name: cleanName, options: [] }];
    setVariations(updated);
    setNewTypeName('');
    showToast(`Added variation type: ${cleanName}`, 'sparkle');
  };

  // Add an option to a variation type (supports comma-separated values like "XL, XX, SM")
  const handleAddOption = (typeIndex: number) => {
    const optValue = (newOptionInputs[typeIndex] || '').trim();
    if (!optValue) return;

    const items = splitCommaOptions(optValue);
    if (items.length === 0) return;

    const copy = [...variations];
    const existing = normalizeVariationOptions(copy[typeIndex].options || []);
    let addedCount = 0;

    items.forEach(val => {
      if (!existing.includes(val)) {
        existing.push(val);
        addedCount++;
      }
    });

    copy[typeIndex].options = existing;
    setVariations(copy);
    setNewOptionInputs(prev => ({ ...prev, [typeIndex]: '' }));

    if (addedCount > 1) {
      showToast(`Added ${addedCount} options: ${items.join(', ')} 🌸`, 'sparkle');
    } else if (addedCount === 1) {
      showToast(`Added "${items[0]}"!`, 'sparkle');
    } else {
      showToast('Option(s) already added!', 'warning');
    }
  };

  // Remove an option
  const handleRemoveOption = (typeIndex: number, optIndex: number) => {
    const copy = [...variations];
    const currentOpts = normalizeVariationOptions(copy[typeIndex].options || []);
    currentOpts.splice(optIndex, 1);
    copy[typeIndex].options = currentOpts;
    setVariations(copy);
  };

  // Delete a variation type
  const handleDeleteVariationType = (typeIndex: number) => {
    const copy = [...variations];
    copy.splice(typeIndex, 1);
    setVariations(copy);
  };

  // Select a preset color from palette
  const handleSelectPaletteColor = (typeIdx: number, name: string, code: string) => {
    const formatted = formatColorOption(name, code);
    const copy = [...variations];
    const existing = normalizeVariationOptions(copy[typeIdx].options || []);
    if (!existing.includes(formatted)) {
      existing.push(formatted);
      copy[typeIdx].options = existing;
      setVariations(copy);
      showToast(`Added ${name} (${code})! 🌸`, 'sparkle');
    } else {
      showToast(`"${name}" is already in options!`, 'warning');
    }
    setColorNameInputs(prev => ({ ...prev, [typeIdx]: name }));
    setColorHexInputs(prev => ({ ...prev, [typeIdx]: code }));
    setColorPickerHexs(prev => ({ ...prev, [typeIdx]: code }));
  };

  // Add custom color by Name, Hex Code or Picker (supports comma-separated names)
  const handleAddCustomColor = (typeIdx: number) => {
    const rawName = (colorNameInputs[typeIdx] || '').trim();
    const hex = (colorHexInputs[typeIdx] || colorPickerHexs[typeIdx] || '').trim();
    const fallback = (newOptionInputs[typeIdx] || '').trim();

    if (!rawName && !hex && !fallback) {
      showToast('Please type a color name or color hex code!', 'warning');
      return;
    }

    const inputString = rawName || fallback || hex;
    const items = splitCommaOptions(inputString);
    if (items.length === 0) return;

    const copy = [...variations];
    const existing = normalizeVariationOptions(copy[typeIdx].options || []);
    let addedCount = 0;

    items.forEach(item => {
      const colorHex = (items.length === 1 && hex) ? hex : (extractColorHex(item) || hex);
      const formatted = formatColorOption(item, colorHex);
      if (formatted && !existing.includes(formatted)) {
        existing.push(formatted);
        addedCount++;
      }
    });

    copy[typeIdx].options = existing;
    setVariations(copy);
    setColorNameInputs(prev => ({ ...prev, [typeIdx]: '' }));
    setColorHexInputs(prev => ({ ...prev, [typeIdx]: '' }));
    setNewOptionInputs(prev => ({ ...prev, [typeIdx]: '' }));

    if (addedCount > 1) {
      showToast(`Added ${addedCount} colors! 💗`, 'sparkle');
    } else if (addedCount === 1) {
      showToast(`Added color "${items[0]}"! 💗`, 'sparkle');
    } else {
      showToast('Color(s) already in the list!', 'warning');
    }
  };

  // Color picker change handler
  const handleColorPickerChange = (typeIdx: number, val: string) => {
    setColorPickerHexs(prev => ({ ...prev, [typeIdx]: val }));
    setColorHexInputs(prev => ({ ...prev, [typeIdx]: val }));
  };

  // Hex input change handler
  const handleColorHexChange = (typeIdx: number, val: string) => {
    const clean = val.trim();
    setColorHexInputs(prev => ({ ...prev, [typeIdx]: clean }));
    if (/^#?[0-9a-fA-F]{6}$/.test(clean)) {
      const formatted = clean.startsWith('#') ? clean : '#' + clean;
      setColorPickerHexs(prev => ({ ...prev, [typeIdx]: formatted }));
    }
  };

  // Quick Presets
  const applyPreset = (type: 'phone_models' | 'colors' | 'charms' | 'sizes') => {
    const copy = [...variations];
    if (type === 'phone_models') {
      const idx = copy.findIndex(v => v.name.toLowerCase().includes('model') || v.name.toLowerCase().includes('phone'));
      const opts = ['iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 15 Pro Max', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 13 Pro Max', 'Samsung S24 Ultra'];
      if (idx > -1) {
        copy[idx].options = Array.from(new Set([...copy[idx].options, ...opts]));
      } else {
        copy.push({ name: 'Phone Model', options: opts });
      }
    } else if (type === 'colors') {
      const idx = copy.findIndex(v => v.name.toLowerCase().includes('color') || v.name.toLowerCase().includes('shade'));
      const opts = ['Blush Pink', 'Baby Pink', 'Rose Quartz', 'Creamy Vanilla', 'Dusty Mauve', 'Pearl White'];
      if (idx > -1) {
        copy[idx].options = Array.from(new Set([...copy[idx].options, ...opts]));
      } else {
        copy.push({ name: 'Color', options: opts });
      }
    } else if (type === 'charms') {
      const idx = copy.findIndex(v => v.name.toLowerCase().includes('charm') || v.name.toLowerCase().includes('style'));
      const opts = ['Crystal Bow', 'Pearl Cluster', 'Fluffy Heart Plush', 'Butterfly Bell', 'Rose Gold Monogram'];
      if (idx > -1) {
        copy[idx].options = Array.from(new Set([...copy[idx].options, ...opts]));
      } else {
        copy.push({ name: 'Charm Style', options: opts });
      }
    } else if (type === 'sizes') {
      const idx = copy.findIndex(v => v.name.toLowerCase().includes('size'));
      const opts = ['Standard', 'Mini', 'Plus / Large'];
      if (idx > -1) {
        copy[idx].options = Array.from(new Set([...copy[idx].options, ...opts]));
      } else {
        copy.push({ name: 'Size', options: opts });
      }
    }
    setVariations(copy);
    showToast('Applied preset options!', 'sparkle');
  };

  // Save changes
  const handleSaveAll = () => {
    if (!currentProduct) return;

    const isOut = prodForm.isOutOfStock ?? currentProduct.isOutOfStock ?? false;
    const finalStock = isOut ? 0 : Math.max(0, Number(prodForm.stock ?? currentProduct.stock ?? 10));

    const galleryImages = (Array.isArray(prodForm.images) && prodForm.images.length > 0)
      ? prodForm.images
      : (prodForm.image ? [prodForm.image] : (currentProduct.images || [currentProduct.image]));

    const primaryImg = prodForm.image || galleryImages[0] || currentProduct.image;
    const hoverImg = prodForm.hoverImage || galleryImages[1] || primaryImg;

    if (activeTab === 'variations') {
      updateProductVariations(currentProduct.id, variations);
    } else {
      updateProduct({
        ...currentProduct,
        ...prodForm,
        image: primaryImg,
        hoverImage: hoverImg,
        images: galleryImages,
        stock: finalStock,
        isOutOfStock: isOut,
        variations,
      });
    }
    showToast(`Saved variations & product details live! 💗`, 'sparkle');
  };

  // Create brand new product
  const handleCreateNewProduct = () => {
    const newId = 'custom-' + Date.now();
    const newProd: Product = {
      id: newId,
      name: 'New Girly Item',
      category: 'cases',
      categoryLabel: 'Phone Cases',
      price: 25000,
      originalPrice: 35000,
      rating: 5.0,
      reviews: 1,
      stock: 10,
      badges: ['new'],
      image: '/assets/images/p-acc-1.jpg',
      hoverImage: '/assets/images/p-acc-2.jpg',
      images: ['/assets/images/p-acc-1.jpg', '/assets/images/p-acc-2.jpg'],
      description: 'Hand-picked luxury piece with signature aesthetic.',
      tags: ['new', 'girly'],
      variations: [
        { name: 'Color', options: ['Blush Pink', 'Cream Vanilla'] },
        { name: 'Size', options: ['S', 'M', 'L'] },
      ],
    };
    addProduct(newProd);
    handleSelectProduct(newId);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-5 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={() => setIsAdminOpen(false)}
        className="fixed inset-0 bg-foreground/70 backdrop-blur-sm transition-opacity"
      />

      {/* Admin Dialog */}
      <div className="relative bg-card rounded-3xl border border-primary/20 max-w-3xl w-full p-4 sm:p-7 shadow-2xl z-10 animate-fade-in overflow-hidden my-4 max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                <span>Product Variations &amp; Store Admin</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-primary uppercase">
                  Frances Mode
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage color types, size types, and custom product options across Nigeria
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAdminOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors"
            aria-label="Close Admin"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If not authenticated, prompt for password */}
        {!isModalAuthed ? (
          <div className="py-12 px-4 max-w-sm mx-auto text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-black text-foreground">
                Administrator Password Required
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Enter your admin password to customize product variations and store details.
              </p>
            </div>

            <form onSubmit={handleModalUnlock} className="space-y-3 text-left">
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-muted-foreground pointer-events-none">
                  <Lock className="w-4 h-4 text-primary" />
                </span>
                <input
                  type={showModalPass ? 'text' : 'password'}
                  value={modalPassword}
                  onChange={(e) => {
                    setModalPassword(e.target.value);
                    if (modalAuthError) setModalAuthError(null);
                  }}
                  placeholder="Enter admin password..."
                  autoFocus
                  required
                  className="w-full bg-secondary/30 border border-border focus:border-primary rounded-2xl pl-10 pr-11 py-2.5 text-xs sm:text-sm text-foreground outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowModalPass(!showModalPass)}
                  className="absolute right-3.5 p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  {showModalPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {modalAuthError && (
                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalAuthError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 tap-feedback"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock Variation Studio</span>
              </button>
            </form>

            <div className="pt-2">
              <a
                href="/admin"
                className="text-xs font-bold text-primary underline underline-offset-2 hover:opacity-80"
              >
                Go to Full Admin Dashboard →
              </a>
            </div>
          </div>
        ) : (
          <>
            {/* Body Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
          
          {/* Full Admin Dashboard Banner */}
          <div className="bg-gradient-to-r from-primary/15 via-secondary to-accent/15 border border-primary/25 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌟</span>
              <div>
                <p className="text-xs font-bold text-foreground">
                  Want the Full Store Admin &amp; Supabase Database?
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Manage inventory, contact WhatsApp numbers, delivery rates, and cloud storage.
                </p>
              </div>
            </div>
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 shadow-sm transition whitespace-nowrap"
            >
              Open Full Dashboard →
            </a>
          </div>

          {/* 1. Product Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-foreground mb-1.5 block">
              1. Select Product to Manage Variations:
            </label>
            <div className="flex gap-2">
              <select
                value={selectedProductId}
                onChange={(e) => handleSelectProduct(e.target.value)}
                className="flex-1 bg-secondary/50 border border-border text-foreground text-xs sm:text-sm font-semibold rounded-2xl px-3.5 py-2.5 outline-none focus:border-primary cursor-pointer shadow-inner"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — ₦{p.price.toLocaleString()} ({p.categoryLabel})
                  </option>
                ))}
              </select>

              <button
                onClick={handleCreateNewProduct}
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-secondary text-primary font-bold text-xs hover:bg-primary hover:text-primary-foreground transition-all border border-primary/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Item</span>
              </button>
            </div>
          </div>

          {/* 2. Tabs: Variations Builder vs Product Pricing/Details */}
          <div className="flex gap-2 border-b border-border pb-2">
            <button
              onClick={() => setActiveTab('variations')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'variations'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-foreground hover:bg-secondary/70'
              }`}
            >
              ✨ Manage Variations (Color, Size, etc.)
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'details'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary text-foreground hover:bg-secondary/70'
              }`}
            >
              🏷️ Price &amp; Details (₦ Naira)
            </button>
          </div>

          {/* Tab 1: Variations Builder */}
          {activeTab === 'variations' && (
            <div className="space-y-4">
              
              {/* Quick Presets Bar */}
              <div className="p-3 rounded-2xl bg-secondary/30 border border-primary/10">
                <p className="text-[11px] font-bold text-foreground mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>One-Click Variation Presets:</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset('phone_models')}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-card border border-border hover:border-primary text-foreground hover:text-primary transition-all"
                  >
                    + Phone Models (iPhone 16/15/14, Samsung)
                  </button>
                  <button
                    onClick={() => applyPreset('colors')}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-card border border-border hover:border-primary text-foreground hover:text-primary transition-all"
                  >
                    + Girly Pink Shades (Blush, Rose, Vanilla)
                  </button>
                  <button
                    onClick={() => applyPreset('charms')}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-card border border-border hover:border-primary text-foreground hover:text-primary transition-all"
                  >
                    + Keyring &amp; Charms (Bow, Pearl, Plush Heart)
                  </button>
                  <button
                    onClick={() => applyPreset('sizes')}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-card border border-border hover:border-primary text-foreground hover:text-primary transition-all"
                  >
                    + Sizes (Standard, Mini, Plus)
                  </button>
                </div>
              </div>

              {/* Add New Variation Type Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Color Type, Size Type, Fabric Type, Material..."
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddVariationType()}
                  className="flex-1 bg-background border border-border rounded-2xl px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
                <button
                  onClick={handleAddVariationType}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Variation Type</span>
                </button>
              </div>

              {/* Active Variation Types List */}
              <div className="space-y-3">
                {variations.length === 0 ? (
                  <div className="text-center py-8 bg-secondary/20 rounded-2xl border border-dashed border-border">
                    <p className="text-xs text-muted-foreground">
                      No variations added yet for this product. Click a preset above or type a variation name.
                    </p>
                  </div>
                ) : (
                  variations.map((v, typeIdx) => {
                    const isColorVar = colorModeOverrides[typeIdx] !== undefined
                      ? colorModeOverrides[typeIdx]
                      : isColorVariationName(v.name);

                    const activeHex = colorHexInputs[typeIdx] || colorPickerHexs[typeIdx] || '#FFB5DB';

                    return (
                      <div
                        key={`${v.name}-${typeIdx}`}
                        className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                              {isColorVar && <Palette className="w-3.5 h-3.5 text-primary" />}
                              <span>{v.name}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                ({normalizeVariationOptions(v.options || []).length} options)
                              </span>
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                setColorModeOverrides(prev => ({
                                  ...prev,
                                  [typeIdx]: !isColorVar,
                                }))
                              }
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                                isColorVar
                                  ? 'bg-primary/10 text-primary border-primary/20'
                                  : 'bg-secondary/60 text-muted-foreground border-border hover:text-foreground'
                              }`}
                              title="Toggle color palette mode"
                            >
                              {isColorVar ? '🎨 Color Mode' : 'Text Mode'}
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteVariationType(typeIdx)}
                            className="text-muted-foreground hover:text-destructive text-xs p-1"
                            title="Delete this entire variation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Options Pills with Color Swatches */}
                        <div className="flex flex-wrap gap-1.5">
                          {normalizeVariationOptions(v.options || []).length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">
                              No options added yet. Pick from the palette or type below (comma-separated supported).
                            </span>
                          ) : (
                            normalizeVariationOptions(v.options || []).map((opt, optIdx) => {
                              const swatch = extractColorHex(opt);
                              const label = extractColorName(opt);
                              return (
                                <span
                                  key={optIdx}
                                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary text-foreground font-semibold border border-primary/15 shadow-2xs"
                                >
                                  {swatch && (
                                    <span
                                      className="w-3 h-3 rounded-full border border-black/15 shadow-2xs shrink-0"
                                      style={{ backgroundColor: swatch }}
                                      title={swatch}
                                    />
                                  )}
                                  <span>{label}</span>
                                  {swatch && (
                                    <span className="text-[9px] font-mono text-primary font-bold opacity-80">
                                      {swatch}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleRemoveOption(typeIdx, optIdx)}
                                    className="text-muted-foreground hover:text-destructive ml-0.5"
                                    title="Remove option"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>

                        {/* COLOR STUDIO: Choose Palette, Hex Code, or Color Name */}
                        {isColorVar ? (
                          <div className="bg-secondary/25 p-3 rounded-xl border border-primary/20 space-y-2.5">
                            {/* Palette Swatches */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                                <span>🌸 Quick Pick Color:</span>
                                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-foreground bg-card px-2 py-0.5 rounded-full border border-primary/20">
                                  <span
                                    className="w-3 h-3 rounded-full border border-black/20 inline-block"
                                    style={{ backgroundColor: activeHex }}
                                  />
                                  <span>{activeHex}</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                                {GIRLY_COLOR_PALETTE.map((pal) => (
                                  <button
                                    key={pal.name}
                                    type="button"
                                    onClick={() => handleSelectPaletteColor(typeIdx, pal.name, pal.code)}
                                    className="flex flex-col items-center p-1 rounded-lg border border-border/80 hover:border-primary bg-card hover:bg-primary/5 transition-all text-center tap-feedback"
                                    title={`Add ${pal.name} (${pal.code})`}
                                  >
                                    <span
                                      className="w-4 h-4 rounded-full border border-black/15 shadow-2xs mb-0.5"
                                      style={{ backgroundColor: pal.code }}
                                    />
                                    <span className="text-[8px] font-bold text-foreground truncate w-full">
                                      {pal.name.split(' ')[0]}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Inputs: Picker + Hex + Name */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 pt-1.5 border-t border-border/60 items-end">
                              <div className="sm:col-span-2">
                                <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                                  Wheel
                                </label>
                                <div className="flex items-center gap-1 h-8 bg-card border border-border rounded-lg px-1.5">
                                  <input
                                    type="color"
                                    value={colorPickerHexs[typeIdx] || '#FFB5DB'}
                                    onChange={(e) => handleColorPickerChange(typeIdx, e.target.value)}
                                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                                    title="Pick color"
                                  />
                                </div>
                              </div>

                              <div className="sm:col-span-3">
                                <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                                  Hex Code
                                </label>
                                <input
                                  type="text"
                                  placeholder="#FFB5DB"
                                  value={colorHexInputs[typeIdx] || ''}
                                  onChange={(e) => handleColorHexChange(typeIdx, e.target.value)}
                                  className="w-full h-8 bg-card border border-border rounded-lg px-2 text-[11px] font-mono font-bold text-foreground outline-none focus:border-primary"
                                />
                              </div>

                              <div className="sm:col-span-4">
                                <label className="text-[9px] font-bold text-muted-foreground block mb-0.5">
                                  Color Name
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Blush Pink"
                                  value={colorNameInputs[typeIdx] || ''}
                                  onChange={(e) =>
                                    setColorNameInputs(prev => ({ ...prev, [typeIdx]: e.target.value }))
                                  }
                                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomColor(typeIdx)}
                                  className="w-full h-8 bg-card border border-border rounded-lg px-2 text-[11px] text-foreground outline-none focus:border-primary"
                                />
                              </div>

                              <div className="sm:col-span-3">
                                <button
                                  type="button"
                                  onClick={() => handleAddCustomColor(typeIdx)}
                                  className="w-full h-8 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Add</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Add Option Input */
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder={`Add option for ${v.name} (e.g. S, Pink, Silk)...`}
                              value={newOptionInputs[typeIdx] || ''}
                              onChange={(e) =>
                                setNewOptionInputs(prev => ({ ...prev, [typeIdx]: e.target.value }))
                              }
                              onKeyDown={(e) => e.key === 'Enter' && handleAddOption(typeIdx)}
                              className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                            />
                            <button
                              onClick={() => handleAddOption(typeIdx)}
                              className="px-3 py-1.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-all shrink-0"
                            >
                              + Add Option
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Pricing & Details */}
          {activeTab === 'details' && currentProduct && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/20 p-3.5 rounded-2xl border border-border">
              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Product Name</label>
                <input
                  type="text"
                  value={prodForm.name || currentProduct.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Price (₦ Naira)</label>
                <input
                  type="number"
                  value={prodForm.price ?? currentProduct.price}
                  onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Original Price (₦ Line-through)</label>
                <input
                  type="number"
                  value={prodForm.originalPrice ?? currentProduct.originalPrice ?? ''}
                  onChange={(e) => setProdForm({ ...prodForm, originalPrice: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={prodForm.stock ?? currentProduct.stock ?? 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setProdForm({ ...prodForm, stock: val, isOutOfStock: val <= 0 });
                  }}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>

              {/* Stock Status Selector */}
              <div className="sm:col-span-2 bg-card p-3 rounded-2xl border border-border">
                <label className="text-[11px] font-bold text-foreground block mb-1.5">
                  Inventory & Stock Availability
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setProdForm({
                        ...prodForm,
                        isOutOfStock: false,
                        stock: (prodForm.stock && prodForm.stock > 0) ? prodForm.stock : 10,
                      })
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      !prodForm.isOutOfStock && (prodForm.stock ?? currentProduct.stock ?? 1) > 0
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-secondary/40 border-border text-muted-foreground'
                    }`}
                  >
                    ● In Stock (Active)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setProdForm({
                        ...prodForm,
                        isOutOfStock: true,
                        stock: 0,
                      })
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                      prodForm.isOutOfStock || prodForm.stock === 0
                        ? 'bg-destructive/15 border-destructive/40 text-destructive'
                        : 'bg-secondary/40 border-border text-muted-foreground'
                    }`}
                  >
                    ✕ Out of Stock (WhatsApp Inquiry)
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  When marked <strong>Out of Stock</strong>, shoppers cannot checkout online and will be routed to WhatsApp with an inquiry message for restock or preorder.
                </p>
              </div>

              {/* Product Media & Gallery Studio */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-secondary/30 border border-primary/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border">
                  <div>
                    <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                      <LucideImage className="w-3.5 h-3.5 text-primary" />
                      <span>Product Photos &amp; Gallery</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {(prodForm.images?.length || (prodForm.image ? 1 : 0))} Photo{(prodForm.images?.length || (prodForm.image ? 1 : 0)) === 1 ? '' : 's'}
                      </span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground">
                      Upload main cover photo and additional gallery photos from device.
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all cursor-pointer tap-feedback shrink-0 self-start sm:self-auto">
                    {isProcessingImages ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="w-3 h-3" />
                        <span>+ Upload Photos</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      disabled={isProcessingImages}
                      onChange={handleGalleryUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                  {/* Cover Preview */}
                  <div className="sm:col-span-4 flex flex-col items-center sm:items-start gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>Cover Photo</span>
                    </span>

                    <div className="relative w-full aspect-square max-w-[130px] rounded-xl overflow-hidden border-2 border-primary/40 bg-card group shadow-xs">
                      {prodForm.image ? (
                        <>
                          <img
                            src={prodForm.image}
                            alt="Primary Cover"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="p-1.5 rounded-full bg-card text-foreground cursor-pointer shadow-xs" title="Change Cover Photo">
                              <Camera className="w-3.5 h-3.5 text-primary" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handlePrimaryImageUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-secondary/40">
                          <LucideImage className="w-6 h-6 text-muted-foreground mb-1" />
                          <span className="text-[10px] font-bold text-primary">+ Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePrimaryImageUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Gallery List */}
                  <div className="sm:col-span-8 space-y-2">
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        placeholder="Or paste image URL..."
                        value={galleryUrlInput}
                        onChange={(e) => setGalleryUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddGalleryUrl();
                          }
                        }}
                        className="flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={handleAddGalleryUrl}
                        className="px-2.5 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-bold border border-border"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Thumbnails */}
                    {prodForm.images && prodForm.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-border/60 rounded-xl bg-card/40">
                        {prodForm.images.map((imgUrl, idx) => {
                          const isCover = imgUrl === prodForm.image;
                          return (
                            <div
                              key={idx}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 bg-card group ${
                                isCover ? 'border-primary ring-1 ring-primary/30' : 'border-border'
                              }`}
                            >
                              <img
                                src={imgUrl}
                                alt={`Gallery ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {isCover && (
                                <div className="absolute top-0.5 left-0.5 bg-primary text-primary-foreground text-[7px] font-black uppercase px-1 rounded shadow-xs">
                                  Cover
                                </div>
                              )}
                              <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                {!isCover && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetAsCover(imgUrl)}
                                    className="p-1 rounded bg-card text-amber-500 shadow-xs"
                                    title="Make Cover"
                                  >
                                    <Star className="w-3 h-3 fill-amber-500" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGalleryImage(idx)}
                                  className="p-1 rounded bg-destructive text-destructive-foreground shadow-xs"
                                  title="Delete Photo"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-bold text-foreground block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={prodForm.description ?? currentProduct.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={resetCatalog}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Factory Defaults</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setIsAdminOpen(false)}
              className="px-4 py-2 rounded-full border border-border text-foreground text-xs font-bold hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAll}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md hover:shadow-primary/30 transition-all tap-feedback"
            >
              <Check className="w-4 h-4" />
              <span>Save &amp; Apply Live</span>
            </button>
          </div>
        </div>
        </>
      )}

      </div>
    </div>
  );
}

