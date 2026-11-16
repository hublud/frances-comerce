'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useShop } from '../../context/ShopContext';
import { Product, ProductVariationType, CategoryType, StoreSettings, Order } from '../../types';
import { PRODUCTS } from '../../data/products';
import { SUPABASE_SQL_SCHEMA, getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../../lib/supabase';
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  Check,
  Sparkles,
  Phone,
  Truck,
  Database,
  ArrowLeft,
  Download,
  Upload,
  Search,
  Sliders,
  DollarSign,
  Smartphone,
  Key,
  Gift,
  Copy,
  ExternalLink,
  RefreshCw,
  X,
  Menu,
  ChevronRight,
  ChevronDown,
  Store,
  Layers,
  Settings,
  Tag,
  Palette,
  ShoppingBag,
  MapPin,
  User,
  Mail,
  MessageCircle,
  Lock,
  Unlock,
  LogOut,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  FileText,
  Printer,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  checkAdminPassword,
  isAdminAuthenticated,
  setAdminAuthenticated,
  clearAdminAuthentication,
} from '../../lib/auth';
import {
  GIRLY_COLOR_PALETTE,
  extractColorHex,
  extractColorName,
  formatColorOption,
  isColorVariationName,
  splitCommaOptions,
  normalizeVariationOptions,
} from '../../lib/colors';

interface MasterVariationGroup {
  id: string;
  name: string;
  icon: string;
  isColor?: boolean;
  options: string[];
}

const DEFAULT_MASTER_VARIATION_GROUPS: MasterVariationGroup[] = [
  {
    id: 'size',
    name: 'Size',
    icon: '📏',
    options: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Standard', 'One Size', 'Mini'],
  },
  {
    id: 'phone-model',
    name: 'Phone Model',
    icon: '📱',
    options: [
      'iPhone 16 Pro Max',
      'iPhone 16 Pro',
      'iPhone 16',
      'iPhone 15 Pro Max',
      'iPhone 15 Pro',
      'iPhone 15',
      'iPhone 14 Pro Max',
      'iPhone 14',
      'iPhone 13 / 13 Pro',
      'iPhone 12 / 12 Pro',
      'Samsung S24 Ultra',
      'Samsung S23 Ultra',
    ],
  },
  {
    id: 'color',
    name: 'Color / Shade',
    icon: '🎨',
    isColor: true,
    options: [
      'Blush Pink (#FFB5DB)',
      'Rose Gold (#B76E79)',
      'Pearl Silver (#E8E8E8)',
      'Opal White (#FFFFFF)',
      'Hot Pink (#FF1493)',
      'Lavender Lilac (#E6E6FA)',
      'Vanilla Cream (#FFFDD0)',
      'Cherry Red (#DE3163)',
      'Baby Blue (#89CFF0)',
      'Mint Green (#98FF98)',
      'Pink Hologram (#F0A6CA)',
      'Frosted Silver Heart (#E0E0E0)',
    ],
  },
  {
    id: 'charm-style',
    name: 'Charm / Style',
    icon: '🎀',
    options: [
      'Crystal Bow',
      'Pearl Cluster',
      'Heart Plush',
      'Ribbon Bow',
      'Aurora Butterfly',
      'Golden Ribbon',
      'Flower Charm',
      'Silver Chain',
    ],
  },
  {
    id: 'material-finish',
    name: 'Material / Finish',
    icon: '🧵',
    options: [
      'Matte Silicone',
      'Glossy Acrylic',
      'Holographic Mirror',
      'Frosted Anti-Scratch',
      'Genuine Pearl',
      'Silk Ribbon',
    ],
  },
];

export default function AdminDashboardPage() {
  const {
    products,
    settings,
    orders,
    deleteOrder,
    updateOrderStatus,
    updateSettings,
    updateProduct,
    updateProductVariations,
    addProduct,
    deleteProduct,
    resetCatalog,
    syncAllToSupabase,
    fetchFromSupabase,
    showToast,
  } = useShop();

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'editor' | 'variations' | 'settings' | 'supabase'>('products');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Product search & filter
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Product currently being edited
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state for Add / Edit Product
  const [prodForm, setProdForm] = useState<Partial<Product>>({
    name: '',
    category: 'cases',
    categoryLabel: 'Phone Cases',
    price: 15000,
    originalPrice: 22000,
    rating: 5.0,
    reviews: 1,
    stock: 12,
    badges: ['new'],
    image: '/assets/images/p-acc-1.jpg',
    hoverImage: '/assets/images/p-acc-2.jpg',
    description: 'Classy girly piece from A Little World of Lovely Things.',
    tags: ['lovely', 'girly', 'classy'],
    variations: [],
  });

  // Master Variation Groups Hub state
  const [masterGroups, setMasterGroups] = useState<MasterVariationGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('fancielle_master_variation_groups');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error('Failed to parse saved master variation groups', e);
        }
      }
    }

    const initial: MasterVariationGroup[] = JSON.parse(JSON.stringify(DEFAULT_MASTER_VARIATION_GROUPS));
    PRODUCTS.forEach((p) => {
      if (Array.isArray(p.variations)) {
        p.variations.forEach((pv) => {
          const pName = pv.name.trim();
          const lower = pName.toLowerCase();
          const existingGroup = initial.find(
            (g) =>
              g.name.toLowerCase() === lower ||
              (lower.includes('size') && g.id === 'size') ||
              ((lower.includes('phone') || lower.includes('model')) && g.id === 'phone-model') ||
              ((lower.includes('color') || lower.includes('shade') || lower.includes('finish') || lower.includes('bow color')) && g.id === 'color') ||
              ((lower.includes('charm') || lower.includes('style') || lower.includes('wing') || lower.includes('glitter')) && g.id === 'charm-style')
          );
          if (existingGroup) {
            pv.options.forEach((opt) => {
              const trimmedOpt = opt.trim();
              if (trimmedOpt && !existingGroup.options.some((o) => o.toLowerCase() === trimmedOpt.toLowerCase())) {
                existingGroup.options.push(trimmedOpt);
              }
            });
          } else {
            const newId = pName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            initial.push({
              id: newId,
              name: pName,
              icon: '✨',
              isColor: isColorVariationName(pName),
              options: pv.options.map((o) => o.trim()).filter(Boolean),
            });
          }
        });
      }
    });
    return initial;
  });

  const [activeMasterGroupId, setActiveMasterGroupId] = useState<string>('size');
  const [newMasterOptionInput, setNewMasterOptionInput] = useState<string>('');
  const [masterColorName, setMasterColorName] = useState<string>('');
  const [masterColorHex, setMasterColorHex] = useState<string>('');
  const [masterColorPicker, setMasterColorPicker] = useState<string>('#FFB5DB');

  // Create new group form states
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [newGroupIcon, setNewGroupIcon] = useState<string>('✨');
  const [newGroupIsColor, setNewGroupIsColor] = useState<boolean>(false);
  const [newGroupInitialOptions, setNewGroupInitialOptions] = useState<string>('');

  // Variations Studio state (Product Editor working state)
  const [selectedVarProdId, setSelectedVarProdId] = useState<string>(products[0]?.id || '');
  const varProduct = products.find(p => p.id === selectedVarProdId) || products[0];
  const [localVariations, setLocalVariations] = useState<ProductVariationType[]>([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [newOptionInputs, setNewOptionInputs] = useState<Record<number, string>>({});
  
  // Color studio inputs per variation index
  const [colorNameInputs, setColorNameInputs] = useState<Record<number, string>>({});
  const [colorHexInputs, setColorHexInputs] = useState<Record<number, string>>({});
  const [colorPickerHexs, setColorPickerHexs] = useState<Record<number, string>>({});
  const [colorModeOverrides, setColorModeOverrides] = useState<Record<number, boolean>>({});

  // Mobile-friendly variation addition states
  const [isAddingVariation, setIsAddingVariation] = useState(false);
  const [isCustomVariationInputOpen, setIsCustomVariationInputOpen] = useState(false);
  const [customVariationName, setCustomVariationName] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...settings });

  // Dispatch Note Modal states
  const [dispatchNoteOrder, setDispatchNoteOrder] = useState<Order | null>(null);
  const [isDownloadingDispatchImage, setIsDownloadingDispatchImage] = useState(false);
  const [copiedRiderText, setCopiedRiderText] = useState(false);

  // Compact & Collapsible Order Details states
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  const toggleOrderExpand = (id: string) => {
    setExpandedOrderIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAllOrders = () => {
    const allExp: Record<string, boolean> = {};
    orders.forEach((o) => {
      allExp[o.id] = true;
    });
    setExpandedOrderIds(allExp);
  };

  const collapseAllOrders = () => {
    setExpandedOrderIds({});
  };

  const handlePrintDispatchNote = () => {
    window.print();
  };

  const handleDownloadDispatchImage = async () => {
    if (!dispatchNoteOrder) return;
    const element = document.getElementById('printable-dispatch-note');
    if (!element) return;

    try {
      setIsDownloadingDispatchImage(true);
      showToast('Generating high-resolution dispatch note... 📦', 'sparkle');

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Francielle-Dispatch-Note-${dispatchNoteOrder.id}.png`;
      link.href = imageUri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Dispatch note image saved! 💖', 'bag');
    } catch (err) {
      console.error('Dispatch note download error:', err);
      showToast('Could not save image. Try the "Print Slip" option.', 'warning');
    } finally {
      setIsDownloadingDispatchImage(false);
    }
  };

  const handleCopyRiderText = () => {
    if (!dispatchNoteOrder) return;
    const lines = [
      `📦 *FRANCIELLE BY FRANCES · DISPATCH NOTE* 📦`,
      `Order Ref: #${dispatchNoteOrder.id}`,
      `Date: ${new Date(dispatchNoteOrder.createdAt).toLocaleDateString('en-GB')}`,
      ``,
      `👤 *RECIPIENT:* ${dispatchNoteOrder.customer.fullName}`,
      `📞 *PHONE:* ${dispatchNoteOrder.customer.phone}${dispatchNoteOrder.customer.phoneAlt ? ` (Alt: ${dispatchNoteOrder.customer.phoneAlt})` : ''}`,
      `📍 *DESTINATION:* ${dispatchNoteOrder.customer.city}, ${dispatchNoteOrder.customer.state}`,
      `🏠 *ADDRESS:* ${dispatchNoteOrder.customer.address}`,
      `🚏 *CLOSEST BUS STOP / LANDMARK:* ${dispatchNoteOrder.customer.landmark}`,
      ...(dispatchNoteOrder.customer.notes ? [`📝 *NOTE:* ${dispatchNoteOrder.customer.notes}`] : []),
      ``,
      `📦 *ITEMS TO DELIVER (${dispatchNoteOrder.items.reduce((s, i) => s + i.qty, 0)} pcs):*`,
      ...dispatchNoteOrder.items.map((it, i) => `${i + 1}. ${it.name}${it.variant ? ` [${it.variant}]` : ''} - Qty: ${it.qty}`),
      ``,
      `*Confidential dispatch slip (no product prices included).*`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedRiderText(true);
    showToast('Rider dispatch information copied! 📋', 'sparkle');
    setTimeout(() => setCopiedRiderText(false), 3000);
  };

  // Supabase config state
  const [supabaseConfig, setSupabaseConfigState] = useState(getSupabaseConfig());
  const [copiedSql, setCopiedSql] = useState(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<{ ok: boolean; message: string; tablesExist: boolean } | null>(null);
  const [isSyncingProducts, setIsSyncingProducts] = useState(false);
  const [isFetchingProducts, setIsFetchingProducts] = useState(false);

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check auth state on mount
  React.useEffect(() => {
    const authed = isAdminAuthenticated();
    setIsAuthenticated(authed);
    setIsCheckingAuth(false);
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (checkAdminPassword(passwordInput)) {
      setAdminAuthenticated(rememberMe);
      setIsAuthenticated(true);
      setAuthError(null);
      setPasswordInput('');
      showToast('Welcome back, Admin! 🌸 Dashboard unlocked.', 'sparkle');
    } else {
      setAuthError('Incorrect administrator password. Please check and try again.');
      showToast('Access denied: incorrect password', 'warning');
    }
  };

  const handleLogout = () => {
    clearAdminAuthentication();
    setIsAuthenticated(false);
    setPasswordInput('');
    setAuthError(null);
    showToast('Admin session locked. 🔒', 'info');
  };

  // Sync variations when switching product in Variations tab
  const handleSelectVarProduct = (id: string) => {
    setSelectedVarProdId(id);
    const p = products.find(prod => prod.id === id);
    if (p) {
      setLocalVariations(p.variations || []);
    }
  };

  // Open product editor for an existing product
  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    const existingVars = Array.isArray(p.variations)
      ? JSON.parse(JSON.stringify(p.variations))
      : [];
    setProdForm({
      ...p,
      isOutOfStock: p.stock <= 0 || Boolean(p.isOutOfStock),
      variations: existingVars,
    });
    setLocalVariations(existingVars);
    setIsAddingVariation(false);
    setIsCustomVariationInputOpen(false);
    setCustomVariationName('');
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick 1-click toggle for product out-of-stock status
  const handleToggleOutOfStock = (p: Product) => {
    const isNowOut = !(p.stock <= 0 || p.isOutOfStock);
    const updated: Product = {
      ...p,
      isOutOfStock: isNowOut,
      stock: isNowOut ? 0 : (p.stock > 0 ? p.stock : 10),
    };
    updateProduct(updated);
    showToast(
      isNowOut
        ? `"${p.name}" marked Out of Stock (WhatsApp inquiry enabled) 💬`
        : `"${p.name}" marked In Stock! 🌸`,
      isNowOut ? 'info' : 'sparkle'
    );
  };

  // Open product editor for adding a new product
  const startNewProduct = () => {
    setEditingProduct(null);
    setProdForm({
      id: 'prod-' + Date.now(),
      name: '',
      category: 'cases',
      categoryLabel: 'Phone Cases',
      price: 15000,
      originalPrice: 22000,
      rating: 5.0,
      reviews: 1,
      stock: 15,
      isOutOfStock: false,
      badges: ['new'],
      image: '/assets/images/p-acc-1.jpg',
      hoverImage: '/assets/images/p-acc-2.jpg',
      description: 'Chic girly item curated to make a girl look classy.',
      tags: ['girly', 'lovely', 'classy'],
      variations: [],
    });
    setLocalVariations([]);
    setIsAddingVariation(false);
    setIsCustomVariationInputOpen(false);
    setCustomVariationName('');
    setActiveTab('editor');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save product from editor
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name?.trim()) {
      showToast('Please enter a product name!', 'warning');
      return;
    }

    const catLabels: Record<string, string> = {
      cases: 'Phone Cases',
      beauty: 'Beauty & Glam',
      accessories: 'Girly Accessories',
      lifestyle: 'Classy Lifestyle',
      basics: 'Daily Basics',
      bed: 'Bed & Lounging',
      travel: 'Travel & Gifting',
    };

    const isOut = Boolean(prodForm.isOutOfStock) || Number(prodForm.stock) <= 0;

    const cleanedVariations = localVariations
      .map(v => ({
        name: v.name.trim(),
        options: normalizeVariationOptions(v.options || []).filter(Boolean),
      }))
      .filter(v => v.name && v.options.length > 0);

    const readyProduct: Product = {
      id: editingProduct ? editingProduct.id : (prodForm.id || 'prod-' + Date.now()),
      name: prodForm.name.trim(),
      category: (prodForm.category || 'cases') as CategoryType,
      categoryLabel: catLabels[prodForm.category || 'cases'] || 'Lovely Item',
      price: Number(prodForm.price) || 10000,
      originalPrice: prodForm.originalPrice ? Number(prodForm.originalPrice) : undefined,
      rating: Number(prodForm.rating) || 5.0,
      reviews: Number(prodForm.reviews) || 1,
      stock: isOut ? 0 : Math.max(0, Number(prodForm.stock ?? 10)),
      isOutOfStock: isOut,
      badges: prodForm.badges || ['new'],
      image: prodForm.image || '/assets/images/p-acc-1.jpg',
      hoverImage: prodForm.hoverImage || '/assets/images/p-acc-2.jpg',
      description: prodForm.description || '',
      features: prodForm.features || ['Premium quality finish', 'Guaranteed authentic'],
      colorVariants: prodForm.colorVariants || ['Blush Pink', 'Pearl Cream'],
      tags: prodForm.tags || ['girly', 'lovely'],
      variations: cleanedVariations,
    };

    if (editingProduct) {
      updateProduct(readyProduct);
      showToast(`Updated "${readyProduct.name}"! 💗`, 'sparkle');
    } else {
      addProduct(readyProduct);
      showToast(`Added new product "${readyProduct.name}"! 🌸`, 'sparkle');
    }

    setActiveTab('products');
  };

  // Mobile-Friendly Variation Presets
  const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Standard', 'One Size', 'Mini'];

  const PHONE_MODEL_PRESETS = [
    'iPhone 16 Pro Max',
    'iPhone 16 Pro',
    'iPhone 16',
    'iPhone 15 Pro Max',
    'iPhone 15 Pro',
    'iPhone 15',
    'iPhone 14 Pro Max',
    'iPhone 14',
    'iPhone 13 / 13 Pro',
    'iPhone 12 / 12 Pro',
    'Samsung S24 Ultra',
    'Samsung S23 Ultra',
  ];

  const CHARM_STYLE_PRESETS = [
    'Crystal Bow',
    'Pearl Cluster',
    'Heart Plush',
    'Ribbon Bow',
    'Aurora Butterfly',
    'Golden Ribbon',
    'Flower Charm',
    'Silver Chain',
  ];

  const handleSelectPresetVariation = (presetName: string) => {
    const cleanName = presetName.trim();
    const existingIdx = localVariations.findIndex(
      v => v.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existingIdx !== -1) {
      showToast(`Variation "${cleanName}" is already added!`, 'info');
      setIsAddingVariation(false);
      return;
    }
    const updated = [...localVariations, { name: cleanName, options: [] }];
    setLocalVariations(updated);
    setIsAddingVariation(false);
    setIsCustomVariationInputOpen(false);
    setCustomVariationName('');
    showToast(`Added "${cleanName}" variation! Tap options below to select. 🌸`, 'sparkle');
  };

  const handleCreateCustomVariation = () => {
    const cleanName = customVariationName.trim();
    if (!cleanName) {
      showToast('Please type a variation name like "Wrist Size" or "Scent"', 'warning');
      return;
    }
    const existingIdx = localVariations.findIndex(
      v => v.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (existingIdx !== -1) {
      showToast(`Variation "${cleanName}" already exists!`, 'warning');
      return;
    }
    const updated = [...localVariations, { name: cleanName, options: [] }];
    setLocalVariations(updated);
    setIsAddingVariation(false);
    setIsCustomVariationInputOpen(false);
    setCustomVariationName('');
    showToast(`Created custom variation: "${cleanName}"! 🌸`, 'sparkle');
  };

  const handleToggleOptionInVar = (typeIdx: number, optionVal: string) => {
    const copy = [...localVariations];
    if (!copy[typeIdx]) return;
    const current = normalizeVariationOptions(copy[typeIdx].options || []);
    const isColor = isColorVariationName(copy[typeIdx].name) || Boolean(colorModeOverrides[typeIdx]);

    let foundIdx = -1;
    if (isColor) {
      const targetName = extractColorName(optionVal).toLowerCase();
      foundIdx = current.findIndex(o => extractColorName(o).toLowerCase() === targetName);
    } else {
      foundIdx = current.findIndex(o => o.toLowerCase() === optionVal.trim().toLowerCase());
    }

    if (foundIdx > -1) {
      current.splice(foundIdx, 1);
    } else {
      current.push(optionVal.trim());
    }

    copy[typeIdx].options = current;
    setLocalVariations(copy);
  };

  const isOptionActiveInVar = (typeIdx: number, optionVal: string): boolean => {
    const v = localVariations[typeIdx];
    if (!v) return false;
    const current = normalizeVariationOptions(v.options || []);
    const isColor = isColorVariationName(v.name) || Boolean(colorModeOverrides[typeIdx]);
    if (isColor) {
      const targetName = extractColorName(optionVal).toLowerCase();
      return current.some(o => extractColorName(o).toLowerCase() === targetName);
    }
    return current.some(o => o.toLowerCase() === optionVal.trim().toLowerCase());
  };

  // Variations Tab Helpers
  const handleAddVariationType = () => {
    if (!newTypeName.trim()) {
      showToast('Please type a variation name like "Color" or "Phone Model"', 'warning');
      return;
    }
    const cleanName = newTypeName.trim();
    if (localVariations.some(v => v.name.toLowerCase() === cleanName.toLowerCase())) {
      showToast(`Variation "${cleanName}" already exists!`, 'warning');
      return;
    }
    const updated = [...localVariations, { name: cleanName, options: [] }];
    setLocalVariations(updated);
    setNewTypeName('');
    showToast(`Created variation type: ${cleanName}`, 'sparkle');
  };

  const handleAddOptionToVar = (typeIdx: number) => {
    const val = (newOptionInputs[typeIdx] || '').trim();
    if (!val) return;

    const items = splitCommaOptions(val);
    if (items.length === 0) return;

    const copy = [...localVariations];
    const existing = normalizeVariationOptions(copy[typeIdx].options || []);
    let addedCount = 0;

    items.forEach(item => {
      if (!existing.includes(item)) {
        existing.push(item);
        addedCount++;
      }
    });

    copy[typeIdx].options = existing;
    setLocalVariations(copy);
    setNewOptionInputs(prev => ({ ...prev, [typeIdx]: '' }));

    if (addedCount > 1) {
      showToast(`Added ${addedCount} options: ${items.join(', ')} 🌸`, 'sparkle');
    } else if (addedCount === 1) {
      showToast(`Added "${items[0]}"! 🌸`, 'sparkle');
    } else {
      showToast('Option(s) already in the list!', 'warning');
    }
  };

  const handleRemoveOptionFromVar = (typeIdx: number, optIdx: number) => {
    const copy = [...localVariations];
    const currentOpts = normalizeVariationOptions(copy[typeIdx].options || []);
    currentOpts.splice(optIdx, 1);
    copy[typeIdx].options = currentOpts;
    setLocalVariations(copy);
  };

  const handleDeleteVarType = (typeIdx: number) => {
    const copy = [...localVariations];
    copy.splice(typeIdx, 1);
    setLocalVariations(copy);
  };

  // Select a preset color from palette
  const handleSelectPaletteColor = (typeIdx: number, name: string, code: string) => {
    const formatted = formatColorOption(name, code);
    const copy = [...localVariations];
    const existing = normalizeVariationOptions(copy[typeIdx].options || []);
    if (!existing.includes(formatted)) {
      existing.push(formatted);
      copy[typeIdx].options = existing;
      setLocalVariations(copy);
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

    const copy = [...localVariations];
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
    setLocalVariations(copy);
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

  const applyPresetToVar = (preset: 'phone_models' | 'pink_shades' | 'keyholders' | 'sizes') => {
    const copy = [...localVariations];
    if (preset === 'phone_models') {
      const idx = copy.findIndex(v => v.name.toLowerCase().includes('model') || v.name.toLowerCase().includes('phone'));
      const opts = ['iPhone 12 / 12 Pro', 'iPhone 13 / 13 Pro', 'iPhone 14 / 14 Pro', 'iPhone 15 / 15 Pro Max', 'iPhone 16 / 16 Pro Max', 'Samsung S24 Ultra'];
      if (idx > -1) {
        copy[idx].options = Array.from(new Set([...copy[idx].options, ...opts]));
      } else {
        copy.push({ name: 'Phone Model', options: opts });
      }
    } else if (preset === 'pink_shades') {
      const idx = copy.findIndex(v => v.name.toLowerCase().includes('color') || v.name.toLowerCase().includes('shade'));
      const opts = ['Blush Pink', 'Baby Pink', 'Rose Quartz', 'Creamy Vanilla', 'Pearl White', 'Dusty Mauve'];
      if (idx > -1) {
        copy[idx].options = Array.from(new Set([...copy[idx].options, ...opts]));
      } else {
        copy.push({ name: 'Color / Shade', options: opts });
      }
    } else if (preset === 'keyholders') {
      const idx = copy.findIndex(v => v.name.toLowerCase().includes('charm') || v.name.toLowerCase().includes('style'));
      const opts = ['Crystal Bow Charm', 'Pearl Cluster', 'Fluffy Heart Plush', 'Aurora Butterfly', 'Golden Ribbon'];
      if (idx > -1) {
        copy[idx].options = Array.from(new Set([...copy[idx].options, ...opts]));
      } else {
        copy.push({ name: 'Charm / Style', options: opts });
      }
    } else if (preset === 'sizes') {
      const idx = copy.findIndex(v => v.name.toLowerCase().includes('size'));
      const opts = ['XS', 'S', 'M', 'L', 'XL', '2XL'];
      if (idx > -1) {
        copy[idx].options = Array.from(new Set([...copy[idx].options, ...opts]));
      } else {
        copy.push({ name: 'Size', options: opts });
      }
    }
    setLocalVariations(copy);
    showToast('Applied preset options! Click Save to apply.', 'sparkle');
  };

  // Master Variation Groups Hub Handlers
  const activeMasterGroup = masterGroups.find((g) => g.id === activeMasterGroupId) || masterGroups[0];

  const saveMasterGroupsToStorage = (groups: MasterVariationGroup[]) => {
    setMasterGroups(groups);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fancielle_master_variation_groups', JSON.stringify(groups));
    }
  };

  const handleSaveMasterGroups = () => {
    saveMasterGroupsToStorage(masterGroups);
    showToast('All variation groups saved live! 💖', 'sparkle');
  };

  const handleAddOptionToActiveGroup = (customVal?: string) => {
    if (!activeMasterGroup) return;
    const input = (customVal !== undefined ? customVal : newMasterOptionInput).trim();
    if (!input) {
      showToast('Please type an option name (e.g. 3XL or Blue)', 'warning');
      return;
    }

    const items = splitCommaOptions(input);
    if (items.length === 0) return;

    const copy = [...masterGroups];
    const groupIdx = copy.findIndex((g) => g.id === activeMasterGroup.id);
    if (groupIdx === -1) return;

    const existing = [...copy[groupIdx].options];
    let addedCount = 0;

    items.forEach((item) => {
      const clean = item.trim();
      if (clean && !existing.some((e) => e.toLowerCase() === clean.toLowerCase())) {
        existing.push(clean);
        addedCount++;
      }
    });

    copy[groupIdx].options = existing;
    saveMasterGroupsToStorage(copy);
    setNewMasterOptionInput('');

    if (addedCount > 1) {
      showToast(`Added ${addedCount} options to "${activeMasterGroup.name}"! 🌸`, 'sparkle');
    } else if (addedCount === 1) {
      showToast(`Added "${items[0]}" to "${activeMasterGroup.name}"! 🌸`, 'sparkle');
    } else {
      showToast('Option(s) already exist in this group!', 'warning');
    }
  };

  const handleRemoveOptionFromActiveGroup = (optIdx: number) => {
    if (!activeMasterGroup) return;
    const copy = [...masterGroups];
    const groupIdx = copy.findIndex((g) => g.id === activeMasterGroup.id);
    if (groupIdx === -1) return;

    const existing = [...copy[groupIdx].options];
    const removed = existing.splice(optIdx, 1);
    copy[groupIdx].options = existing;
    saveMasterGroupsToStorage(copy);
    if (removed[0]) {
      showToast(`Removed "${extractColorName(removed[0])}" from ${activeMasterGroup.name}`, 'info');
    }
  };

  const handleAddColorToActiveGroup = () => {
    if (!activeMasterGroup) return;
    const rawName = masterColorName.trim();
    const hex = (masterColorHex || masterColorPicker || '').trim();

    if (!rawName && !hex) {
      showToast('Please type a color name or color hex code!', 'warning');
      return;
    }

    const items = splitCommaOptions(rawName || hex);
    if (items.length === 0) return;

    const copy = [...masterGroups];
    const groupIdx = copy.findIndex((g) => g.id === activeMasterGroup.id);
    if (groupIdx === -1) return;

    const existing = [...copy[groupIdx].options];
    let addedCount = 0;

    items.forEach((item) => {
      const colorHex = (items.length === 1 && hex) ? hex : (extractColorHex(item) || hex || '#FFB5DB');
      const formatted = formatColorOption(item, colorHex);
      if (formatted && !existing.some((e) => extractColorName(e).toLowerCase() === extractColorName(formatted).toLowerCase())) {
        existing.push(formatted);
        addedCount++;
      }
    });

    copy[groupIdx].options = existing;
    saveMasterGroupsToStorage(copy);
    setMasterColorName('');
    setMasterColorHex('');

    if (addedCount > 1) {
      showToast(`Added ${addedCount} colors to "${activeMasterGroup.name}"! 💗`, 'sparkle');
    } else if (addedCount === 1) {
      showToast(`Added color to "${activeMasterGroup.name}"! 💗`, 'sparkle');
    } else {
      showToast('Color already exists in this group!', 'warning');
    }
  };

  const handleSelectPresetColorForActiveGroup = (name: string, code: string) => {
    if (!activeMasterGroup) return;
    const formatted = formatColorOption(name, code);
    const copy = [...masterGroups];
    const groupIdx = copy.findIndex((g) => g.id === activeMasterGroup.id);
    if (groupIdx === -1) return;

    const existing = [...copy[groupIdx].options];
    if (!existing.some((e) => extractColorName(e).toLowerCase() === name.toLowerCase())) {
      existing.push(formatted);
      copy[groupIdx].options = existing;
      saveMasterGroupsToStorage(copy);
      showToast(`Added "${name}" (${code}) to ${activeMasterGroup.name}! 🌸`, 'sparkle');
    } else {
      showToast(`"${name}" is already in ${activeMasterGroup.name}!`, 'info');
    }
  };

  const handleToggleColorModeForActiveGroup = () => {
    if (!activeMasterGroup) return;
    const copy = [...masterGroups];
    const groupIdx = copy.findIndex((g) => g.id === activeMasterGroup.id);
    if (groupIdx === -1) return;
    copy[groupIdx].isColor = !copy[groupIdx].isColor;
    saveMasterGroupsToStorage(copy);
    showToast(`Switched "${activeMasterGroup.name}" to ${copy[groupIdx].isColor ? 'Color' : 'Text'} mode!`, 'info');
  };

  const handleCreateNewMasterGroup = () => {
    const cleanName = newGroupName.trim();
    if (!cleanName) {
      showToast('Please type a group name like "Fragrance Notes" or "Strap Length"', 'warning');
      return;
    }

    if (masterGroups.some((g) => g.name.toLowerCase() === cleanName.toLowerCase())) {
      showToast(`Variation group "${cleanName}" already exists!`, 'warning');
      return;
    }

    const newId = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const initialOpts = splitCommaOptions(newGroupInitialOptions);

    const newGroup: MasterVariationGroup = {
      id: newId,
      name: cleanName,
      icon: newGroupIcon || '✨',
      isColor: newGroupIsColor,
      options: initialOpts,
    };

    const updated = [...masterGroups, newGroup];
    saveMasterGroupsToStorage(updated);
    setActiveMasterGroupId(newId);
    setNewGroupName('');
    setNewGroupInitialOptions('');
    setIsCreatingNewGroup(false);
    showToast(`Created new variation group: "${cleanName}"! 🌸`, 'sparkle');
  };

  const handleDeleteMasterGroup = (groupId: string) => {
    const group = masterGroups.find((g) => g.id === groupId);
    if (!group) return;
    if (confirm(`Are you sure you want to delete the "${group.name}" variation group?`)) {
      const remaining = masterGroups.filter((g) => g.id !== groupId);
      if (remaining.length === 0) {
        showToast('You must keep at least one variation group!', 'warning');
        return;
      }
      saveMasterGroupsToStorage(remaining);
      setActiveMasterGroupId(remaining[0].id);
      showToast(`Deleted variation group "${group.name}".`, 'info');
    }
  };

  const handleSaveVariations = () => {
    if (!varProduct) return;
    updateProductVariations(varProduct.id, localVariations);
    showToast(`Saved variations for "${varProduct.name}"! 💖`, 'sparkle');
  };

  // Settings Save
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
  };

  // Export Catalog JSON
  const handleExportJSON = () => {
    const data = {
      store: settings,
      products: products,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `francielle_catalog_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Catalog exported to JSON backup file! 📥', 'sparkle');
  };

  // Import Catalog JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && Array.isArray(parsed.products)) {
          localStorage.setItem('fancielle_custom_catalog', JSON.stringify(parsed.products));
          if (parsed.store) {
            localStorage.setItem('fancielle_settings', JSON.stringify(parsed.store));
          }
          window.location.reload();
        } else {
          showToast('Invalid backup file format.', 'warning');
        }
      } catch (err) {
        showToast('Error reading JSON file.', 'warning');
      }
    };
    reader.readAsText(file);
  };

  // Copy Supabase SQL
  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    showToast('Copied Supabase SQL schema to clipboard! 📋', 'sparkle');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Save Supabase Config
  const handleSaveSupabase = () => {
    saveSupabaseConfig(supabaseConfig);
    showToast('Saved Supabase configuration! Ready for sync.', 'sparkle');
  };

  // Test Supabase Connection
  const handleTestConnection = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestStatus(null);
    try {
      const res = await testSupabaseConnection();
      setSupabaseTestStatus(res);
      if (res.ok && res.tablesExist) {
        showToast('Connected! Supabase database tables are active 🟢', 'sparkle');
      } else if (res.ok && !res.tablesExist) {
        showToast('Connected to Supabase! Run the SQL schema to create tables 📋', 'info');
      } else {
        showToast(`Supabase check: ${res.message}`, 'warning');
      }
    } catch (e: any) {
      setSupabaseTestStatus({ ok: false, message: e.message || 'Connection test failed', tablesExist: false });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Push local catalog to Supabase
  const handlePushCatalogToSupabase = async () => {
    setIsSyncingProducts(true);
    try {
      const res = await syncAllToSupabase();
      if (res.error) {
        showToast(`Sync error: ${res.error}`, 'warning');
      } else {
        showToast(`Pushed ${res.count} products to Supabase cloud! 🚀✨`, 'sparkle');
      }
    } catch (e: any) {
      showToast(`Push failed: ${e.message}`, 'warning');
    } finally {
      setIsSyncingProducts(false);
    }
  };

  // Pull catalog from Supabase
  const handlePullCatalogFromSupabase = async () => {
    setIsFetchingProducts(true);
    try {
      const res = await fetchFromSupabase();
      if (res.error) {
        showToast(`Fetch error: ${res.error}`, 'warning');
      } else if (res.count > 0) {
        showToast(`Loaded ${res.count} products from Supabase! 🌸`, 'sparkle');
      } else {
        showToast('No products found in Supabase yet. Push your local catalog first!', 'info');
      }
    } catch (e: any) {
      showToast(`Fetch failed: ${e.message}`, 'warning');
    } finally {
      setIsFetchingProducts(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchFilter.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Calculate Metrics
  const totalCatalogValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalVariationsCount = products.reduce((acc, p) => acc + (p.variations ? p.variations.length : 0), 0);

  // Navigation Items Config
  const navItems = [
    {
      id: 'products' as const,
      label: 'Manage Products',
      shortLabel: 'Products',
      icon: Package,
      badge: `${products.length}`,
      desc: 'Catalog, stock & search',
    },
    {
      id: 'orders' as const,
      label: 'Customer Orders',
      shortLabel: 'Orders',
      icon: ShoppingBag,
      badge: `${orders.length}`,
      desc: 'Landmarks, addresses & WhatsApp',
    },
    {
      id: 'editor' as const,
      label: editingProduct ? 'Edit Product' : 'Add New Product',
      shortLabel: 'Add Item',
      icon: Plus,
      badge: editingProduct ? 'Editing' : 'New',
      desc: 'Price in ₦, photos, details',
      action: () => {
        if (activeTab !== 'editor' || editingProduct) {
          startNewProduct();
        } else {
          setActiveTab('editor');
        }
      },
    },
    {
      id: 'variations' as const,
      label: 'Variation Studio',
      shortLabel: 'Variations',
      icon: Sliders,
      badge: `${totalVariationsCount}`,
      desc: 'Colors, phone models, sizes',
    },
    {
      id: 'settings' as const,
      label: 'Contact & Delivery',
      shortLabel: 'Delivery',
      icon: Truck,
      badge: '₦ Rates',
      desc: 'WhatsApp line & dispatch times',
    },
    {
      id: 'supabase' as const,
      label: 'Supabase Cloud',
      shortLabel: 'Database',
      icon: Database,
      badge: 'SQL Bridge',
      desc: 'Storage & cloud database',
    },
  ];

  const handleNavClick = (tabId: typeof activeTab, customAction?: () => void) => {
    if (customAction) {
      customAction();
    } else {
      setActiveTab(tabId);
    }
    setIsMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="relative w-14 h-14 rounded-full overflow-hidden ring-4 ring-primary/30 animate-pulse bg-card shadow-md">
          <Image src="/assets/images/logo.jpeg" alt="Francielle" fill className="object-cover" />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">
          <Lock className="w-3.5 h-3.5 text-primary" />
          <span>Verifying Administrator Access...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary/40 via-background to-secondary/30 flex items-center justify-center px-4 py-12 relative overflow-hidden">
        {/* Soft decorative background glows */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-card/95 backdrop-blur-md rounded-3xl border border-primary/20 p-6 sm:p-8 shadow-2xl shadow-primary/10 relative z-10 space-y-6">
          {/* Logo & Brand Header */}
          <div className="text-center space-y-2">
            <div className="relative w-16 h-16 rounded-full overflow-hidden ring-4 ring-primary/30 bg-white shadow-md mx-auto flex items-center justify-center">
              <Image src="/assets/images/logo.jpeg" alt="Francielle Logo" fill className="object-cover" />
            </div>
            
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-wider mb-2">
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Security Gate</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-foreground leading-tight">
                FRANCI<span className="text-primary">ELLE</span>
                <span className="align-super text-[10px] text-muted-foreground ml-0.5">®</span>
              </h1>
              <p className="text-xs text-muted-foreground font-semibold mt-0.5">
                A Little World of Lovely Things · Administrator Portal
              </p>
            </div>
          </div>

          {/* Subtext */}
          <p className="text-center text-xs text-muted-foreground leading-relaxed px-2">
            Please enter your secret administrator password to manage products, view customer orders &amp; closest landmarks, edit variations, and configure delivery fees.
          </p>

          {/* Password Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5">
                Administrator Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-muted-foreground pointer-events-none">
                  <Lock className="w-4 h-4 text-primary" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Enter administrator password..."
                  autoFocus
                  required
                  className="w-full bg-secondary/30 border border-border focus:border-primary rounded-2xl pl-10 pr-11 py-3 text-sm text-foreground outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary accent-primary w-4 h-4"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Error Alert */}
            {authError && (
              <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs sm:text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 tap-feedback"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Admin Dashboard</span>
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="pt-3 border-t border-border text-center space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Francielle Storefront</span>
            </Link>

            <p className="text-[10px] text-muted-foreground/70">
              Protected Administrator Area · Francielle by Frances
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden">
      
      {/* ==================================================== */}
      {/* 1. TOP HEADER (Responsive with Hamburger on Mobile)  */}
      {/* ==================================================== */}
      <header className="sticky top-0 z-40 bg-card/95 border-b border-border shadow-xs backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Button for Mobile / Tablet Sidebar Drawer */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-secondary/80 text-foreground hover:bg-secondary transition-colors"
              aria-label="Open Admin Menu"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-primary" />
            </button>

            {/* Logo & Brand title */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-primary/40 bg-white shadow-sm flex items-center justify-center shrink-0">
                <Image src="/assets/images/logo.jpeg" alt="Francielle Logo" fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm sm:text-base uppercase tracking-wider text-foreground leading-none">
                  FRANCI<span className="text-primary">ELLE</span>
                  <span className="align-super text-[9px] text-muted-foreground ml-0.5">®</span>
                </span>
                <span className="text-[9px] font-extrabold tracking-[0.25em] text-primary uppercase mt-0.5 leading-none">
                  ADMIN DASHBOARD
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-block w-px h-6 bg-border mx-1" />

            <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-foreground">A Little World of Lovely Things</span>
            </div>
          </div>

          {/* Current Section Badge & Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Active view indicator on mobile */}
            <span className="sm:hidden text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 capitalize">
              {activeTab}
            </span>

            {/* Quick Export / Import on md+ */}
            <button
              onClick={handleExportJSON}
              className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary text-xs font-semibold text-foreground transition-all"
              title="Backup store catalog to JSON"
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              <span>Export</span>
            </button>

            <label className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary text-xs font-semibold text-foreground transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-primary" />
              <span>Import</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            {/* View Live Storefront Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-secondary hover:bg-secondary/70 text-foreground text-xs font-bold transition-all border border-primary/20 shrink-0"
              title="Open customer storefront"
            >
              <Store className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">View Store Front</span>
              <span className="sm:hidden">Store</span>
            </Link>

            {/* Lock Admin Session Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-secondary hover:bg-destructive/15 text-foreground hover:text-destructive text-xs font-bold transition-all border border-border hover:border-destructive/30 shrink-0 tap-feedback"
              title="Lock admin session"
            >
              <LogOut className="w-3.5 h-3.5 text-destructive" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================== */}
      {/* 2. MAIN LAYOUT: DESKTOP SIDEBAR + CONTENT AREA       */}
      {/* ==================================================== */}
      <div className="flex max-w-7xl mx-auto w-full flex-1">
        
        {/* DESKTOP SIDEBAR (Permanent Left Navigation on lg+) */}
        <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 border-r border-border bg-card/40 min-h-[calc(100vh-65px)] p-4 space-y-6 sticky top-[65px] self-start">
          
          {/* Tagline / Store status pill */}
          <div className="p-3 rounded-2xl bg-secondary/50 border border-primary/15 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Lovely Things Admin</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Manage products, variations &amp; Nigeria delivery.
            </p>
          </div>

          {/* Navigation Items List */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-3 mb-1">
              Store Navigation
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.action)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                      : 'text-foreground hover:bg-secondary/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-primary group-hover:scale-110 transition-transform'}`} />
                    <div className="text-left truncate">
                      <div className="truncate">{item.label}</div>
                      <div className={`text-[10px] font-normal truncate ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1.5 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-secondary text-primary border border-primary/10'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Store Operations */}
          <div className="space-y-2 pt-3 border-t border-border">
            <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-3">
              Store Operations
            </p>
            <div className="space-y-1">
              <Link
                href="/"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Store className="w-3.5 h-3.5 text-primary" />
                  <span>Customer Storefront</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </Link>

              <button
                onClick={handleExportJSON}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5 text-primary" />
                  <span>Backup Catalog JSON</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Download</span>
              </button>

              <label className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary/70 transition-colors cursor-pointer">
                <div className="flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>Import Catalog JSON</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Restore</span>
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>

              <button
                onClick={resetCatalog}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Store Defaults</span>
                </div>
              </button>
            </div>
          </div>

          {/* Live Dispatch Widget in Sidebar */}
          <div className="mt-auto p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-foreground">
              <span>WhatsApp Dispatch</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs font-mono font-bold text-primary truncate">
              {settings.phoneWhatsapp}
            </p>
            <p className="text-[10px] text-muted-foreground">
              🇳🇬 Delivery: Distance &amp; Dispatcher Rate
            </p>
          </div>

          {/* Lock Admin Session in Sidebar */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-secondary/70 hover:bg-destructive/15 text-xs font-bold text-foreground hover:text-destructive transition-colors border border-border shrink-0 tap-feedback"
            title="Lock administrator session"
          >
            <LogOut className="w-3.5 h-3.5 text-destructive" />
            <span>Lock Admin Session</span>
          </button>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 space-y-6 pb-28 lg:pb-12">

        {/* 1. Metrics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
              <Package className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-foreground">{products.length}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Across 4 Girly Categories</p>
          </div>

          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Inventory Value</span>
              <DollarSign className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-primary">
              ₦{(totalCatalogValue / 1000).toFixed(0)}k
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">₦{totalCatalogValue.toLocaleString()} in stock</p>
          </div>

          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">Active Variations</span>
              <Sliders className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-foreground">{totalVariationsCount}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Phone Models, Colors, Sizes</p>
          </div>

          <div className="p-4 rounded-3xl bg-card border border-border shadow-xs">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">WhatsApp Dispatch</span>
              <Phone className="w-4 h-4 text-primary" />
            </div>
            <p className="text-lg sm:text-xl font-black text-foreground truncate">{settings.phoneWhatsapp}</p>
            <p className="text-[11px] text-primary font-bold mt-0.5">🇳🇬 Instant Order Active</p>
          </div>
        </div>

        {/* 2. Main Navigation Tabs */}
        <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                : 'bg-secondary/60 text-foreground hover:bg-secondary'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Manage Products ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                : 'bg-secondary/60 text-foreground hover:bg-secondary'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => startNewProduct()}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'editor' && !editingProduct
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                : 'bg-secondary/60 text-foreground hover:bg-secondary'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>

          <button
            onClick={() => setActiveTab('variations')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'variations'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                : 'bg-secondary/60 text-foreground hover:bg-secondary'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Variation Studio (Color, Phone Model, etc.)</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                : 'bg-secondary/60 text-foreground hover:bg-secondary'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Contact &amp; Delivery Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'supabase'
                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                : 'bg-secondary/60 text-foreground hover:bg-secondary'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Supabase Storage Bridge</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: MANAGE PRODUCTS CATALOG                           */}
        {/* ======================================================== */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            
            {/* Search and Category Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products by title, tag, or variation..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-secondary/40 border border-border rounded-full pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'cases', label: 'Phone Cases' },
                  { id: 'beauty', label: 'Beauty & Glam' },
                  { id: 'accessories', label: 'Girly Accessories' },
                  { id: 'lifestyle', label: 'Classy Lifestyle' },
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      categoryFilter === cat.id
                        ? 'bg-primary text-primary-foreground shadow-xs font-bold'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products List Table / Cards */}
            <div className="grid grid-cols-1 gap-3">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-3xl border border-border">
                  <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold text-foreground">No lovely products match your filter</p>
                  <button
                    onClick={() => { setSearchFilter(''); setCategoryFilter('all'); }}
                    className="mt-2 text-xs text-primary font-bold underline"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const hasVariations = p.variations && p.variations.length > 0;
                  return (
                    <div
                      key={p.id}
                      className="p-3.5 sm:p-4 rounded-3xl bg-card border border-border shadow-xs hover:border-primary/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 w-full max-w-full overflow-hidden"
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-center gap-3 w-full sm:flex-1 min-w-0 overflow-hidden">
                        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-border bg-secondary shrink-0">
                          <Image src={p.image} alt={p.name} fill className="object-cover" />
                        </div>

                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-secondary">
                              {p.categoryLabel}
                            </span>
                            {(p.stock <= 0 || p.isOutOfStock) ? (
                              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-destructive/15 text-destructive border border-destructive/20">
                                Out of Stock
                              </span>
                            ) : null}
                            {p.badges?.map(b => (
                              <span key={b} className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-foreground/10 text-foreground">
                                {b}
                              </span>
                            ))}
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate block max-w-full" title={p.name}>
                            {p.name}
                          </h4>
                          <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 max-w-full">
                            {p.description}
                          </p>
                          
                          {/* Variations Chips preview */}
                          {hasVariations && (
                            <div className="flex flex-wrap gap-1 mt-1 max-w-full">
                              {p.variations!.map(v => (
                                <span key={v.name} className="text-[9px] sm:text-[10px] font-semibold text-primary/90 bg-secondary/80 px-2 py-0.5 rounded-md border border-primary/10 max-w-full truncate">
                                  {v.name}: {v.options.length} options
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Pricing, Stock & Action Buttons */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-border">
                        <div className="text-left sm:text-right shrink-0">
                          <div className="text-sm sm:text-base font-black text-primary">₦{p.price.toLocaleString()}</div>
                          {p.originalPrice && (
                            <div className="text-[10px] sm:text-[11px] text-muted-foreground line-through">
                              ₦{p.originalPrice.toLocaleString()}
                            </div>
                          )}
                          <div className={`text-[10px] font-bold ${p.stock <= 0 || p.isOutOfStock ? 'text-destructive font-black' : p.stock < 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                            {p.stock <= 0 || p.isOutOfStock ? '● Out of stock' : `${p.stock} in stock`}
                          </div>
                        </div>

                        {/* 1-Click Out-of-Stock Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleOutOfStock(p)}
                          className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl border transition-all shrink-0 ${
                            p.stock <= 0 || p.isOutOfStock
                              ? 'bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/25'
                              : 'bg-secondary text-foreground hover:bg-secondary/70 border-border'
                          }`}
                          title={p.stock <= 0 || p.isOutOfStock ? 'Click to mark In Stock' : 'Click to mark Out of Stock (WhatsApp Inquiry)'}
                        >
                          {p.stock <= 0 || p.isOutOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}
                        </button>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => startEditProduct(p)}
                            className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground transition-all"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => startEditProduct(p)}
                            className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground transition-all"
                            title="Edit Product Variations"
                          >
                            <Sliders className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-secondary hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-all"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: CUSTOMER ORDERS (LANDMARKS, BUS STOPS & ADDRESSES) */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-card p-4 sm:p-6 rounded-3xl border border-border shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border">
                <div>
                  <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    <span>Customer Orders ({orders.length})</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Real-time orders received from checkout with customer addresses, closest bus stops, and variations.
                  </p>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-14 h-14 rounded-full bg-secondary/80 text-primary flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-foreground">No Customer Orders Yet</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                    When customers check out on your store, their contact info, detailed address, and closest popular bus stop will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  {/* Quick Order Search & Expand/Collapse All Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by order ID, name, or phone..."
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 rounded-full bg-secondary/50 border border-border text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
                      />
                      {orderSearchQuery && (
                        <button
                          onClick={() => setOrderSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={expandAllOrders}
                        className="px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-colors tap-feedback"
                      >
                        Expand All
                      </button>
                      <button
                        type="button"
                        onClick={collapseAllOrders}
                        className="px-3 py-1 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground text-xs font-bold transition-colors tap-feedback"
                      >
                        Collapse All
                      </button>
                    </div>
                  </div>

                  {/* Compact, Space-Saving Order Rows */}
                  {orders
                    .filter((ord) => {
                      if (!orderSearchQuery.trim()) return true;
                      const q = orderSearchQuery.toLowerCase();
                      return (
                        ord.id.toLowerCase().includes(q) ||
                        ord.customer.fullName.toLowerCase().includes(q) ||
                        ord.customer.phone.toLowerCase().includes(q) ||
                        (ord.customer.city && ord.customer.city.toLowerCase().includes(q))
                      );
                    })
                    .map((ord) => {
                      const isExpanded = Boolean(expandedOrderIds[ord.id]);
                      const totalPcs = ord.items.reduce((s, i) => s + i.qty, 0);

                      return (
                        <div
                          key={ord.id}
                          className={`rounded-2xl border transition-all overflow-hidden ${
                            isExpanded
                              ? 'bg-card border-primary/40 shadow-md ring-1 ring-primary/20'
                              : 'bg-card/80 border-border hover:border-primary/40 hover:bg-card shadow-xs'
                          }`}
                        >
                          {/* 1. COMPACT CLICKABLE SUMMARY ROW */}
                          <div
                            onClick={() => toggleOrderExpand(ord.id)}
                            className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-secondary/25 transition-colors select-none"
                          >
                            {/* Left: Order ID, Timestamp & Customer Details */}
                            <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                              {/* Order ID & Date Stack */}
                              <div className="flex flex-col items-start gap-1 shrink-0">
                                <span className="text-xs sm:text-sm font-black text-primary font-mono bg-primary/10 px-3 py-0.5 rounded-full border border-primary/25 shadow-2xs">
                                  #{ord.id}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 tracking-tight">
                                  <span>🕒</span>
                                  <span>
                                    {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                                      day: 'numeric',
                                      month: 'short',
                                    })}
                                    , {new Date(ord.createdAt).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </span>
                                </span>
                              </div>

                              {/* Customer Name, Phone & Destination */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-extrabold text-foreground text-sm sm:text-base leading-snug">
                                    {ord.customer.fullName}
                                  </h4>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                                  <span className="font-semibold text-foreground/80 flex items-center gap-1">
                                    📞 {ord.customer.phone}
                                  </span>
                                  <span>·</span>
                                  <span>📍 {ord.customer.city || ord.customer.state} State</span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Items/Total, Sleek Status Pill, Dispatch Note & Chevron */}
                            <div
                              className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {/* Item Count & Total Paid */}
                              <div className="text-left sm:text-right">
                                <p className="text-xs sm:text-sm font-black text-foreground">
                                  ₦{ord.total.toLocaleString()}
                                </p>
                                <p className="text-[10px] font-bold text-muted-foreground">
                                  {totalPcs} {totalPcs === 1 ? 'item' : 'items'}
                                </p>
                              </div>

                              {/* Sleek Read-only Status Pill (Takes minimal space, freed up room!) */}
                              <span
                                className={`text-[10px] sm:text-xs font-bold rounded-full px-2.5 py-1 border whitespace-nowrap ${
                                  ord.status === 'delivered'
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                    : ord.status === 'processing'
                                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                }`}
                              >
                                {ord.status === 'delivered'
                                  ? '✅ Delivered'
                                  : ord.status === 'processing'
                                  ? '🚚 In Transit'
                                  : '⏳ Pending'}
                              </span>

                              {/* DISPATCH NOTE BUTTON */}
                              <button
                                type="button"
                                onClick={() => setDispatchNoteOrder(ord)}
                                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/25 text-xs font-bold transition-all shadow-2xs tap-feedback"
                                title="Open, Print or Download Dispatch Note (No Prices)"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span className="hidden md:inline">Dispatch Note</span>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => {
                                  if (confirm(`Delete order #${ord.id}?`)) {
                                    deleteOrder(ord.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                title="Delete order"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {/* Expand / Collapse Chevron */}
                              <button
                                type="button"
                                onClick={() => toggleOrderExpand(ord.id)}
                                className="p-1 rounded-full hover:bg-secondary text-primary transition-all ml-1"
                                title={isExpanded ? 'Collapse order details' : 'Click to show full order details'}
                                aria-label="Toggle details"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform duration-300 ${
                                    isExpanded ? 'rotate-180 text-primary' : 'text-muted-foreground'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>

                          {/* 2. FULL DETAILED BREAKDOWN (Revealed when clicked) */}
                          {isExpanded && (
                            <div className="border-t border-border/80 p-4 sm:p-5 bg-secondary/15 space-y-4 animate-fade-in">
                              {/* Order Status Control inside Full Details (Saves automatically!) */}
                              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-primary/20 shadow-xs">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                                    <span>⚙️</span> Order Status:
                                  </span>
                                  <select
                                    value={ord.status}
                                    onChange={(e) => {
                                      const newStatus = e.target.value as any;
                                      updateOrderStatus(ord.id, newStatus);
                                      showToast(`Order #${ord.id} status updated to ${newStatus}! ✨`, 'sparkle');
                                    }}
                                    className={`text-xs font-black rounded-full px-3 py-1.5 border outline-none cursor-pointer transition-all ${
                                      ord.status === 'delivered'
                                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                                        : ord.status === 'processing'
                                        ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                                        : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                                    }`}
                                  >
                                    <option value="pending">⏳ Pending Confirmation</option>
                                    <option value="processing">🚚 Out for Delivery / In Transit</option>
                                    <option value="delivered">✅ Delivered &amp; Completed</option>
                                  </select>
                                </div>

                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                  <Check className="w-3.5 h-3.5" /> Saves automatically to database
                                </span>
                              </div>
                              {/* 2-Column Info Grid: Customer & Delivery Destination */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Customer Contact Information */}
                                <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-2">
                                  <p className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    <span>Customer Information</span>
                                  </p>
                                  <div className="text-xs space-y-1">
                                    <p className="font-bold text-foreground text-sm">{ord.customer.fullName}</p>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                                      <span className="font-bold text-foreground">{ord.customer.phone}</span>
                                      {ord.customer.phoneAlt && (
                                        <span className="text-[11px]">Alt: {ord.customer.phoneAlt}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                      <Mail className="w-3.5 h-3.5 text-primary shrink-0" />
                                      <span>{ord.customer.email}</span>
                                    </div>
                                  </div>

                                  {/* Quick WhatsApp Chat & Dispatch Slip */}
                                  <div className="pt-1 flex flex-wrap items-center gap-2">
                                    <a
                                      href={`https://wa.me/${ord.customer.phone.replace(/\D/g, '').startsWith('0') ? '234' + ord.customer.phone.replace(/\D/g, '').slice(1) : ord.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${ord.customer.fullName}! Thank you for your order (${ord.id}) from Francielle By Frances. We are preparing your lovely items for dispatch!`)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500 hover:text-white text-emerald-600 font-bold text-xs transition-colors"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      <span>Chat Customer on WhatsApp</span>
                                    </a>

                                    <button
                                      type="button"
                                      onClick={() => setDispatchNoteOrder(ord)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground border border-border text-foreground font-bold text-xs transition-colors"
                                      title="Download or Print Dispatch Note (No Prices)"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-primary group-hover:text-current" />
                                      <span>Dispatch Note</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Delivery Destination & Closest Bus Stop */}
                                <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-2">
                                  <p className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Delivery Destination &amp; Bus Stop</span>
                                  </p>
                                  <div className="text-xs space-y-1.5">
                                    <div>
                                      <span className="font-bold text-foreground">{ord.customer.city}, {ord.customer.state} State</span>
                                      <p className="text-muted-foreground">{ord.customer.address}</p>
                                    </div>

                                    {/* Prominent Landmark / Bus stop pill */}
                                    <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/25">
                                      <span className="text-[10px] uppercase font-bold text-primary block">
                                        🚏 Closest Landmark / Bus Stop:
                                      </span>
                                      <p className="text-xs font-black text-foreground mt-0.5">
                                        {ord.customer.landmark}
                                      </p>
                                    </div>

                                    {ord.customer.notes && (
                                      <p className="text-[11px] text-muted-foreground italic">
                                        Note: {ord.customer.notes}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Items Ordered Breakdown */}
                              <div className="p-3.5 rounded-xl bg-card border border-border/80">
                                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
                                  Ordered Items ({ord.items.length})
                                </p>
                                <div className="space-y-2 divide-y divide-border/60">
                                  {ord.items.map((it, idx) => (
                                    <div key={idx} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
                                          <Image src={it.image} alt={it.name} fill className="object-cover" />
                                        </div>
                                        <div className="truncate">
                                          <p className="font-bold text-foreground truncate">{it.name}</p>
                                          {it.variant && (
                                            <p className="text-[10px] text-primary font-semibold truncate">{it.variant}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="font-black text-foreground">₦{(it.price * it.qty).toLocaleString()}</p>
                                        <p className="text-[10px] text-muted-foreground">{it.qty} × ₦{it.price.toLocaleString()}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Financial Totals */}
                                <div className="pt-3 mt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-3 text-muted-foreground">
                                    <span>Subtotal: ₦{ord.subtotal.toLocaleString()}</span>
                                    <span>Delivery: {ord.shipping ? `₦${ord.shipping.toLocaleString()}` : 'Billed by Dispatcher'}</span>
                                    {ord.discount > 0 && <span className="text-primary font-bold">Discount: -₦{ord.discount.toLocaleString()}</span>}
                                  </div>
                                  <div className="text-sm font-black text-primary">
                                    Total: ₦{ord.total.toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {/* Close details button at bottom */}
                              <div className="text-center pt-1">
                                <button
                                  type="button"
                                  onClick={() => toggleOrderExpand(ord.id)}
                                  className="text-xs font-bold text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors"
                                >
                                  <span>▲ Collapse Order #{ord.id}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ADD / EDIT PRODUCT STUDIO                         */}
        {/* ======================================================== */}
        {activeTab === 'editor' && (
          <form onSubmit={handleSaveProduct} className="bg-card rounded-3xl border border-border p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-black text-foreground">
                  {editingProduct ? `Edit "${editingProduct.name}"` : 'Add New Lovely Product'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Fill in product details, pricing in Naira (₦), and assign variation options.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="text-xs font-bold px-3 py-1.5 rounded-full border border-border hover:bg-secondary text-foreground transition-all"
              >
                Back to List
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-foreground block mb-1">Product Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wave Pearl Bracelet Phone Case, Crystal Bow Key Holder..."
                  value={prodForm.name || ''}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Category *</label>
                <select
                  value={prodForm.category || 'cases'}
                  onChange={(e) => setProdForm({ ...prodForm, category: e.target.value as CategoryType })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary cursor-pointer"
                >
                  <option value="cases">📱 Phone Cases &amp; Tech Glam</option>
                  <option value="beauty">💄 Beauty &amp; Glam Essentials</option>
                  <option value="accessories">🎀 Girly Accessories</option>
                  <option value="lifestyle">✨ Classy Lifestyle &amp; Gifting</option>
                </select>
              </div>

              {/* Stock Status Selector */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-secondary/40 border border-primary/20 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <label className="text-xs font-bold text-foreground block">
                      Inventory &amp; Stock Availability
                    </label>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Mark as Out of Stock to automatically replace the checkout button with an &quot;Inquire on WhatsApp&quot; button.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, isOutOfStock: false, stock: (prodForm.stock && prodForm.stock > 0) ? prodForm.stock : 10 })}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        !prodForm.isOutOfStock && (prodForm.stock ?? 1) > 0
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-card text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ✓ In Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setProdForm({ ...prodForm, isOutOfStock: true, stock: 0 })}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        prodForm.isOutOfStock || (prodForm.stock ?? 1) <= 0
                          ? 'bg-destructive text-destructive-foreground shadow-xs'
                          : 'bg-card text-muted-foreground hover:text-destructive'
                      }`}
                    >
                      ✕ Out of Stock (WhatsApp Inquiry)
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Stock Units (Available Quantity)</label>
                <input
                  type="number"
                  min="0"
                  value={prodForm.stock ?? 10}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setProdForm({
                      ...prodForm,
                      stock: num,
                      isOutOfStock: num <= 0,
                    });
                  }}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Selling Price (₦ Naira) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={prodForm.price ?? 15000}
                  onChange={(e) => setProdForm({ ...prodForm, price: Number(e.target.value) })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary font-bold text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Original Price (₦ Line-through discount)</label>
                <input
                  type="number"
                  min="0"
                  value={prodForm.originalPrice ?? ''}
                  onChange={(e) => setProdForm({ ...prodForm, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Primary Image URL</label>
                <input
                  type="text"
                  value={prodForm.image || ''}
                  onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Hover Image URL (Optional)</label>
                <input
                  type="text"
                  value={prodForm.hoverImage || ''}
                  onChange={(e) => setProdForm({ ...prodForm, hoverImage: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-foreground block mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={prodForm.description || ''}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl p-4 text-xs sm:text-sm text-foreground outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            {/* ======================================================== */}
            {/* PRODUCT VARIATIONS & SELECTION (MOBILE-FRIENDLY)        */}
            {/* ======================================================== */}
            <div className="pt-5 border-t border-border space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-foreground flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    <span>Product Variations &amp; Options</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                      {localVariations.length} {localVariations.length === 1 ? 'Variation' : 'Variations'}
                    </span>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add optional variations like Size, Phone Model, Color, or custom styles for this product.
                  </p>
                </div>

                {localVariations.length > 0 && !isAddingVariation && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingVariation(true);
                      setIsCustomVariationInputOpen(false);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all self-start sm:self-auto tap-feedback"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Another Variation</span>
                  </button>
                )}
              </div>

              {/* ZERO VARIATIONS STATE: Clean, mobile friendly, no clutter */}
              {localVariations.length === 0 && !isAddingVariation && (
                <div className="p-6 sm:p-8 rounded-3xl bg-secondary/15 border-2 border-dashed border-primary/20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-foreground">No variations added yet</h5>
                    <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                      Does this product have different sizes, phone models, colors, or styles? Tap below to add options.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingVariation(true);
                      setIsCustomVariationInputOpen(false);
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 shadow-md hover:shadow-primary/30 transition-all tap-feedback"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Variation</span>
                  </button>
                </div>
              )}

              {/* VARIATION PICKER SHEET / PANEL: Choose which variation to add */}
              {isAddingVariation && (
                <div className="p-4 sm:p-5 rounded-3xl bg-primary/5 border-2 border-primary/30 shadow-xs space-y-3.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Choose Which Variation to Add:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingVariation(false);
                        setIsCustomVariationInputOpen(false);
                      }}
                      className="text-muted-foreground hover:text-foreground text-xs p-1.5 rounded-full hover:bg-secondary transition-colors"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Master Variation Choices */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {masterGroups.map((group) => {
                      const isAlreadyAdded = localVariations.some(
                        v => v.name.toLowerCase() === group.name.toLowerCase()
                      );
                      return (
                        <button
                          key={group.id}
                          type="button"
                          disabled={isAlreadyAdded}
                          onClick={() => handleSelectPresetVariation(group.name)}
                          className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-1.5 transition-all shadow-2xs tap-feedback group ${
                            isAlreadyAdded
                              ? 'bg-secondary/40 border-border opacity-50 cursor-not-allowed'
                              : 'bg-card border-border hover:border-primary hover:bg-primary/5'
                          }`}
                        >
                          <span className="text-2xl">{group.icon}</span>
                          <span className="text-xs font-black text-foreground group-hover:text-primary">
                            {group.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-full">
                            {isAlreadyAdded ? 'Already added' : `${group.options.length} options`}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Variation Type */}
                  {!isCustomVariationInputOpen ? (
                    <button
                      type="button"
                      onClick={() => setIsCustomVariationInputOpen(true)}
                      className="w-full py-2.5 px-4 rounded-2xl border border-dashed border-primary/40 bg-card hover:bg-primary/10 text-primary text-xs font-bold transition-all flex items-center justify-center gap-1.5 tap-feedback"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New Variation (Custom type not listed above)</span>
                    </button>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-card border border-primary/30 space-y-2">
                      <label className="text-[11px] font-bold text-foreground block">
                        Enter Custom Variation Name:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Wrist Size, Chain Length, Fragrance, Material..."
                          value={customVariationName}
                          onChange={(e) => setCustomVariationName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCreateCustomVariation();
                            }
                          }}
                          autoFocus
                          className="flex-1 bg-secondary/30 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={handleCreateCustomVariation}
                          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shrink-0 tap-feedback"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomVariationInputOpen(false);
                            setCustomVariationName('');
                          }}
                          className="px-3 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shrink-0"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ACTIVE VARIATIONS CARDS (Configured for this product) */}
              <div className="space-y-4">
                {localVariations.map((v, typeIdx) => {
                  const isColorVar = colorModeOverrides[typeIdx] !== undefined
                    ? colorModeOverrides[typeIdx]
                    : isColorVariationName(v.name);

                  const normalizedOpts = normalizeVariationOptions(v.options || []);
                  const lowerName = v.name.toLowerCase();
                  const isSize = lowerName.includes('size');
                  const isPhone = lowerName.includes('model') || lowerName.includes('phone');
                  const isCharm = lowerName.includes('charm') || lowerName.includes('style');

                  return (
                    <div
                      key={`${v.name}-${typeIdx}`}
                      className="p-4 sm:p-5 rounded-3xl bg-secondary/20 border border-border shadow-xs space-y-3.5 transition-all"
                    >
                      {/* Variation Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                            {isSize && <span>📏</span>}
                            {isPhone && <span>📱</span>}
                            {isColorVar && <Palette className="w-3.5 h-3.5 text-primary" />}
                            {isCharm && <span>🎀</span>}
                            <span>{v.name}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">
                              ({normalizedOpts.length} {normalizedOpts.length === 1 ? 'selected' : 'selected'})
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
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                              isColorVar
                                ? 'bg-primary/10 text-primary border-primary/20'
                                : 'bg-card text-muted-foreground border-border hover:text-foreground'
                            }`}
                            title="Toggle color palette mode"
                          >
                            {isColorVar ? '🎨 Color Mode Active' : 'Switch to Color Mode'}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteVarType(typeIdx)}
                          className="text-muted-foreground hover:text-destructive text-xs p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                          title="Remove this variation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* QUICK-TAP PILLS (Dynamically loaded from Master Variation Groups) */}
                      {(() => {
                        const matchingMasterGroup = masterGroups.find(
                          (g) =>
                            g.name.toLowerCase() === v.name.toLowerCase() ||
                            (v.name.toLowerCase().includes('size') && g.id === 'size') ||
                            ((v.name.toLowerCase().includes('model') || v.name.toLowerCase().includes('phone')) && g.id === 'phone-model') ||
                            ((v.name.toLowerCase().includes('charm') || v.name.toLowerCase().includes('style') || v.name.toLowerCase().includes('wing')) && g.id === 'charm-style') ||
                            ((v.name.toLowerCase().includes('color') || v.name.toLowerCase().includes('shade') || v.name.toLowerCase().includes('finish')) && g.id === 'color')
                        );

                        if (!matchingMasterGroup || matchingMasterGroup.options.length === 0 || isColorVar) return null;

                        return (
                          <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-muted-foreground block">
                                👆 Tap options from {matchingMasterGroup.name} to select:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const allOpts = matchingMasterGroup.options;
                                  const current = normalizeVariationOptions(v.options || []);
                                  const allSelected = allOpts.every((o) =>
                                    current.some((c) => extractColorName(c).toLowerCase() === extractColorName(o).toLowerCase())
                                  );
                                  const copy = [...localVariations];
                                  if (allSelected) {
                                    copy[typeIdx].options = [];
                                  } else {
                                    copy[typeIdx].options = Array.from(new Set([...current, ...allOpts]));
                                  }
                                  setLocalVariations(copy);
                                }}
                                className="text-[10px] font-bold text-primary hover:underline"
                              >
                                Select All / Clear
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {matchingMasterGroup.options.map((opt) => {
                                const active = isOptionActiveInVar(typeIdx, opt);
                                const swatch = extractColorHex(opt);
                                const label = extractColorName(opt);
                                return (
                                  <button
                                    key={opt}
                                    type="button"
                                    onClick={() => handleToggleOptionInVar(typeIdx, opt)}
                                    className={`text-xs px-2.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 tap-feedback ${
                                      active
                                        ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs scale-[1.02]'
                                        : 'bg-secondary/40 text-foreground border-border hover:border-primary/50'
                                    }`}
                                  >
                                    {swatch && (
                                      <span
                                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                        style={{ backgroundColor: swatch }}
                                      />
                                    )}
                                    <span>{label}</span>
                                    {active ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-muted-foreground" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* COLOR MODE: Tap swatches & custom picker */}
                      {isColorVar && (
                        <div className="p-3 sm:p-4 rounded-2xl bg-card border border-primary/20 space-y-3">
                          <span className="text-[11px] font-bold text-muted-foreground block">
                            👆 Tap to select / unselect colors:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {GIRLY_COLOR_PALETTE.map((pal) => {
                              const active = isOptionActiveInVar(typeIdx, pal.name);
                              return (
                                <button
                                  key={pal.name}
                                  type="button"
                                  onClick={() => {
                                    if (active) {
                                      handleToggleOptionInVar(typeIdx, pal.name);
                                    } else {
                                      handleSelectPaletteColor(typeIdx, pal.name, pal.code);
                                    }
                                  }}
                                  className={`text-xs px-2.5 py-1.5 rounded-full border transition-all flex items-center gap-1.5 tap-feedback ${
                                    active
                                      ? 'bg-primary text-primary-foreground border-primary font-bold shadow-2xs scale-[1.02]'
                                      : 'bg-secondary/40 text-foreground border-border hover:border-primary/50'
                                  }`}
                                >
                                  <span
                                    className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                                    style={{ backgroundColor: pal.code }}
                                  />
                                  <span>{pal.name}</span>
                                  {active ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3 text-muted-foreground" />}
                                </button>
                              );
                            })}
                          </div>

                          {/* Custom Color Input via Wheel / Hex */}
                          <div className="pt-2 border-t border-border/60 flex items-center gap-2">
                            <input
                              type="color"
                              value={colorPickerHexs[typeIdx] || '#FFB5DB'}
                              onChange={(e) => handleColorPickerChange(typeIdx, e.target.value)}
                              className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent p-0 shrink-0"
                              title="Pick custom color"
                            />
                            <input
                              type="text"
                              placeholder="Custom color name or comma list (e.g. Lilac, Peach)"
                              value={colorNameInputs[typeIdx] || ''}
                              onChange={(e) => setColorNameInputs(prev => ({ ...prev, [typeIdx]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCustomColor(typeIdx);
                                }
                              }}
                              className="flex-1 min-w-0 bg-secondary/30 border border-border rounded-xl px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddCustomColor(typeIdx)}
                              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shrink-0 tap-feedback"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Custom Option Input for Non-Color Variations */}
                      {!isColorVar && (
                        <div className="pt-1">
                          <span className="text-[11px] font-bold text-muted-foreground block mb-1">
                            Add custom option (or type comma-separated list, e.g. 38, 39, 40):
                          </span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Type option for ${v.name} (comma-separated ok)...`}
                              value={newOptionInputs[typeIdx] || ''}
                              onChange={(e) =>
                                setNewOptionInputs(prev => ({ ...prev, [typeIdx]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddOptionToVar(typeIdx);
                                }
                              }}
                              className="flex-1 min-w-0 bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddOptionToVar(typeIdx)}
                              className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-all shrink-0 tap-feedback"
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Selected Options Summary Chips */}
                      <div className="pt-2 border-t border-border/60">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1.5">
                          Selected options for {v.name}:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {normalizedOpts.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">
                              No options selected yet. Tap any pill above or type to add.
                            </span>
                          ) : (
                            normalizedOpts.map((opt, optIdx) => {
                              const swatch = extractColorHex(opt);
                              const label = extractColorName(opt);
                              return (
                                <span
                                  key={optIdx}
                                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-card text-foreground font-semibold border border-primary/20 shadow-2xs hover:border-primary/40 transition-colors"
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
                                    type="button"
                                    onClick={() => handleRemoveOptionFromVar(typeIdx, optIdx)}
                                    className="text-muted-foreground hover:text-destructive ml-0.5 p-0.5 rounded-full hover:bg-destructive/15 transition-colors"
                                    title="Remove option"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom "+ Add Another Variation" when variations already exist */}
              {localVariations.length > 0 && !isAddingVariation && (
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingVariation(true);
                      setIsCustomVariationInputOpen(false);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/40 text-foreground text-xs font-bold transition-all tap-feedback shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-primary" />
                    <span>+ Add Another Variation</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className="px-5 py-2.5 rounded-full border border-border hover:bg-secondary text-foreground text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold shadow-md hover:shadow-primary/30 transition-all tap-feedback"
              >
                <Check className="w-4 h-4" />
                <span>Save Product &amp; Variations</span>
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 3: MASTER VARIATION GROUPS STUDIO                    */}
        {/* ======================================================== */}
        {activeTab === 'variations' && (
          <div className="bg-card rounded-3xl border border-border p-3.5 sm:p-7 shadow-xs space-y-5 sm:space-y-6 pb-24 md:pb-8 overflow-hidden">
            {/* Header & Save Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary shrink-0" />
                  <span>Master Variation Groups Studio</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Configure global variation groups (Size, Color, Phone Model, etc.) and options. Once configured here, they are instantly available when editing any product.
                </p>
              </div>

              <button
                onClick={handleSaveMasterGroups}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md hover:shadow-primary/30 transition-all shrink-0 tap-feedback"
              >
                <Check className="w-4 h-4" />
                <span>Save All Groups Live</span>
              </button>
            </div>

            {/* Variation Groups Selector Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <span>📁 Select Variation Group to Edit:</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCreatingNewGroup(!isCreatingNewGroup)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 p-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isCreatingNewGroup ? 'Close Form' : '+ New Group'}</span>
                </button>
              </div>

              {/* Horizontal Tabs / Pills */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
                {masterGroups.map((g) => {
                  const isActive = g.id === (activeMasterGroup?.id || activeMasterGroupId);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => {
                        setActiveMasterGroupId(g.id);
                        setIsCreatingNewGroup(false);
                      }}
                      className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 sm:gap-2 shadow-2xs tap-feedback ${
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25 scale-[1.02]'
                          : 'bg-card text-foreground border-border hover:border-primary/50 hover:bg-secondary/40'
                      }`}
                    >
                      <span className="text-sm">{g.icon}</span>
                      <span>{g.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {g.options.length}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsCreatingNewGroup(true)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs font-bold border border-dashed transition-all flex items-center gap-1.5 tap-feedback ${
                    isCreatingNewGroup
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground bg-secondary/15'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>Add Group</span>
                </button>
              </div>
            </div>

            {/* Form: Create New Variation Group (Collapsible) */}
            {isCreatingNewGroup && (
              <div className="p-3.5 sm:p-5 rounded-3xl bg-secondary/25 border border-primary/25 space-y-3.5 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border/70">
                  <span className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Plus className="w-4 h-4" />
                    <span>Create New Variation Group</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCreatingNewGroup(false)}
                    className="text-xs text-muted-foreground hover:text-foreground p-1"
                  >
                    ✕ Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Group Name (e.g. Fragrance Notes, Strap Length, Ring Size):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Scent, Capacity, Length..."
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                      Group Icon:
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['📏', '📱', '🎨', '🎀', '🧵', '✨', '💎', '🌸', '📦', '🏷️', '💫', '🧴'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewGroupIcon(emoji)}
                          className={`w-8 h-8 rounded-xl text-base flex items-center justify-center border transition-all ${
                            newGroupIcon === emoji
                              ? 'bg-primary/20 border-primary scale-110'
                              : 'bg-card border-border hover:bg-secondary'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground block mb-1">
                    Initial Options (comma-separated, e.g. 50ml, 100ml, 200ml):
                  </label>
                  <input
                    type="text"
                    placeholder="Type options separated by commas..."
                    value={newGroupInitialOptions}
                    onChange={(e) => setNewGroupInitialOptions(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary shadow-2xs"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="checkbox"
                      checked={newGroupIsColor}
                      onChange={(e) => setNewGroupIsColor(e.target.checked)}
                      className="rounded accent-primary w-4 h-4 cursor-pointer shrink-0"
                    />
                    <span>Color / Swatch group (enables palette &amp; hex picker)</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleCreateNewMasterGroup}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-xs flex items-center justify-center gap-1.5 tap-feedback"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Group</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active Group Details & Options */}
            {activeMasterGroup && (
              <div className="p-3.5 sm:p-6 rounded-3xl bg-secondary/15 border border-border shadow-xs space-y-4 overflow-hidden">
                {/* Active Group Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl p-2 rounded-2xl bg-card border border-border shadow-2xs shrink-0">
                      {activeMasterGroup.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-black text-foreground truncate">
                          {activeMasterGroup.name}
                        </h4>
                        <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
                          {activeMasterGroup.options.length} {activeMasterGroup.options.length === 1 ? 'option' : 'options'}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                        Manage all options for this group. Click ✕ to remove any option.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-end">
                    {/* Color mode toggle */}
                    <button
                      type="button"
                      onClick={handleToggleColorModeForActiveGroup}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                        activeMasterGroup.isColor
                          ? 'bg-primary/10 text-primary border-primary/25'
                          : 'bg-card text-muted-foreground border-border hover:text-foreground'
                      }`}
                      title="Toggle color palette mode"
                    >
                      {activeMasterGroup.isColor ? '🎨 Color Mode' : 'Text Mode'}
                    </button>

                    {/* Delete group button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMasterGroup(activeMasterGroup.id)}
                      className="text-[11px] text-muted-foreground hover:text-destructive font-bold flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-destructive/10 transition-colors"
                      title="Delete this entire variation group"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                {/* Existing Options List */}
                <div className="space-y-2">
                  <span className="text-[11px] uppercase font-bold text-muted-foreground block">
                    Configured Options ({activeMasterGroup.options.length}):
                  </span>

                  {activeMasterGroup.options.length === 0 ? (
                    <div className="text-center py-8 bg-card/60 rounded-2xl border border-dashed border-border p-4">
                      <p className="text-xs font-bold text-muted-foreground">
                        No options added to this group yet. Add your first option below!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                      {activeMasterGroup.options.map((opt, optIdx) => {
                        const swatch = extractColorHex(opt);
                        const label = extractColorName(opt);
                        return (
                          <span
                            key={optIdx}
                            className="inline-flex items-center gap-1.5 text-xs px-3 sm:px-3.5 py-1.5 rounded-full bg-card text-foreground font-semibold border border-primary/20 shadow-2xs hover:border-primary/40 transition-colors max-w-full truncate"
                          >
                            {swatch && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs shrink-0"
                                style={{ backgroundColor: swatch }}
                                title={swatch}
                              />
                            )}
                            <span className="truncate">{label}</span>
                            {swatch && (
                              <span className="text-[10px] font-mono text-primary font-bold opacity-80 shrink-0">
                                {swatch}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionFromActiveGroup(optIdx)}
                              className="text-muted-foreground hover:text-destructive ml-1 p-0.5 rounded-full hover:bg-destructive/15 transition-colors shrink-0"
                              title="Remove option"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Add Options to Group */}
                {activeMasterGroup.isColor ? (
                  /* Color Group Studio */
                  <div className="bg-card p-3 sm:p-4 rounded-2xl border border-primary/20 space-y-3 mt-3">
                    <span className="text-[11px] uppercase font-bold text-muted-foreground block">
                      🌸 1-Click Girly Color Presets (Tap to add):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {GIRLY_COLOR_PALETTE.map((pal) => (
                        <button
                          key={pal.name}
                          type="button"
                          onClick={() => handleSelectPresetColorForActiveGroup(pal.name, pal.code)}
                          className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-secondary/40 hover:bg-primary/10 border border-border text-xs font-bold text-foreground transition-all shadow-2xs tap-feedback"
                          title={`Add ${pal.name} (${pal.code})`}
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                            style={{ backgroundColor: pal.code }}
                          />
                          <span>{pal.name}</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom Color Input */}
                    <div className="space-y-2 pt-2.5 border-t border-border/70">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={masterColorPicker}
                          onChange={(e) => {
                            setMasterColorPicker(e.target.value);
                            setMasterColorHex(e.target.value);
                          }}
                          className="w-10 h-10 rounded-xl cursor-pointer border border-border bg-card p-1 shrink-0"
                          title="Pick color"
                        />
                        <input
                          type="text"
                          placeholder="#FFB5DB"
                          value={masterColorHex}
                          onChange={(e) => {
                            const clean = e.target.value.trim();
                            setMasterColorHex(clean);
                            if (/^#?[0-9a-fA-F]{6}$/.test(clean)) {
                              setMasterColorPicker(clean.startsWith('#') ? clean : '#' + clean);
                            }
                          }}
                          className="w-24 h-10 bg-card border border-border rounded-xl px-2.5 text-xs font-mono font-bold text-foreground outline-none focus:border-primary shadow-2xs shrink-0"
                        />
                        <input
                          type="text"
                          placeholder="Color name (e.g. Baby Pink)..."
                          value={masterColorName}
                          onChange={(e) => setMasterColorName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddColorToActiveGroup();
                            }
                          }}
                          className="flex-1 min-w-0 h-10 bg-card border border-border rounded-xl px-3 text-xs text-foreground outline-none focus:border-primary shadow-2xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddColorToActiveGroup}
                        className="w-full sm:w-auto h-10 px-5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 shadow-xs tap-feedback"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Color to Group</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Text Option Input (Mobile-Optimized Responsive Stack) */
                  <div className="bg-card p-3 sm:p-4 rounded-2xl border border-border space-y-2 mt-3">
                    <span className="text-[11px] font-bold text-muted-foreground block leading-snug">
                      Add new option to &quot;{activeMasterGroup.name}&quot; (or comma-separated list, e.g. 3XL, 4XL, 5XL):
                    </span>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Type option(s) for ${activeMasterGroup.name} (e.g. 3XL, 4XL)...`}
                        value={newMasterOptionInput}
                        onChange={(e) => setNewMasterOptionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddOptionToActiveGroup();
                          }
                        }}
                        className="w-full flex-1 min-w-0 bg-secondary/30 border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddOptionToActiveGroup()}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shrink-0 shadow-xs flex items-center justify-center gap-1.5 tap-feedback"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Save Bar inside active group card */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-muted-foreground">
                  <span className="text-[11px] leading-relaxed">
                    All edits are automatically saved to your browser storage.
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveMasterGroups}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto tap-feedback py-0.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Save Bar */}
            <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground text-center sm:text-left">
                Master variation groups are instantly available when creating or editing any product in the Product Studio.
              </span>
              <button
                onClick={handleSaveMasterGroups}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold shadow-md hover:shadow-primary/30 transition-all tap-feedback"
              >
                <Check className="w-4 h-4" />
                <span>Save All Groups Live</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: STORE SETTINGS, CONTACT & DELIVERY NUMBERS        */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-card rounded-3xl border border-border p-5 sm:p-7 shadow-xs space-y-6">
            <div className="pb-4 border-b border-border">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                <span>Store Settings &amp; Delivery Dispatch</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Set WhatsApp order phone numbers, delivery rates across Nigeria, free delivery thresholds, and tagline.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Store Name</label>
                <input
                  type="text"
                  value={settingsForm.storeName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Business Tagline *</label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary font-bold text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">WhatsApp Order Number *</label>
                <input
                  type="text"
                  value={settingsForm.phoneWhatsapp}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phoneWhatsapp: e.target.value })}
                  placeholder="09114336301"
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary font-bold"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Orders sent directly to this WhatsApp contact.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Secondary Support Phone</label>
                <input
                  type="text"
                  value={settingsForm.phoneSecondary}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phoneSecondary: e.target.value })}
                  placeholder="+234 911 433 6301"
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 space-y-1">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>Delivery Pricing Policy Notice</span>
                </span>
                <p className="text-xs text-foreground leading-relaxed">
                  Fixed delivery prices have been removed. Delivery price depends on distance and the fee charged by the dispatcher upon dispatch. This note is automatically communicated to customers in their bag, during checkout, and on WhatsApp receipts.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Within Kaduna Delivery Estimated Time</label>
                <input
                  type="text"
                  value={settingsForm.deliveryLagosTime}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deliveryLagosTime: e.target.value })}
                  placeholder="24-48 hours within Kaduna"
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">Outside Kaduna (Nationwide) Estimated Time</label>
                <input
                  type="text"
                  value={settingsForm.deliveryNationwideTime}
                  onChange={(e) => setSettingsForm({ ...settingsForm, deliveryNationwideTime: e.target.value })}
                  placeholder="3-4 days outside Kaduna"
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-foreground block mb-1">Announcement Bar Headline</label>
                <input
                  type="text"
                  value={settingsForm.announcementText}
                  onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <button
                type="button"
                onClick={resetCatalog}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Store Defaults</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold shadow-md hover:shadow-primary/30 transition-all tap-feedback"
              >
                <Check className="w-4 h-4" />
                <span>Save Store Settings</span>
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SUPABASE STORAGE & DATABASE CONNECTOR             */}
        {/* ======================================================== */}
        {activeTab === 'supabase' && (
          <div className="bg-card rounded-3xl border border-border p-5 sm:p-7 shadow-xs space-y-6">
            
            {/* Header & Status Card */}
            <div className="pb-5 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-2xl bg-secondary text-primary">
                    <Database className="w-5 h-5 text-primary" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-foreground">
                      Supabase Cloud Database &amp; Storage
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Project Ref: <span className="font-mono font-bold text-foreground">npfftaxeqhtuqdaaosti</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Test Connection & Open Dashboard */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingSupabase}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/70 text-foreground text-xs font-bold transition-all border border-primary/20 shadow-xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-primary ${isTestingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isTestingSupabase ? 'Testing...' : 'Test Connection'}</span>
                </button>

                <a
                  href="https://supabase.com/dashboard/project/npfftaxeqhtuqdaaosti/sql"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/90 transition-all"
                >
                  <span>Open Supabase SQL</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Live Connection Status Banner */}
            {supabaseTestStatus && (
              <div
                className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                  supabaseTestStatus.ok && supabaseTestStatus.tablesExist
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                    : supabaseTestStatus.ok && !supabaseTestStatus.tablesExist
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                    : 'bg-destructive/10 border-destructive/30 text-destructive'
                }`}
              >
                <div className="mt-0.5">
                  {supabaseTestStatus.ok && supabaseTestStatus.tablesExist ? (
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  ) : supabaseTestStatus.ok ? (
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block animate-pulse" />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-destructive inline-block" />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold">{supabaseTestStatus.message}</p>
                  {supabaseTestStatus.ok && !supabaseTestStatus.tablesExist && (
                    <p className="mt-1 text-[11px] opacity-90">
                      Step: Copy the SQL script below, click &quot;Open Supabase SQL&quot;, paste it and click Run!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Cloud Sync Tools */}
            <div className="rounded-2xl bg-secondary/30 border border-border p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cloud Catalog Synchronization</span>
              </h4>
              <p className="text-xs text-muted-foreground">
                Sync all your products, price variations, color shades, and orders with the Supabase PostgreSQL database.
              </p>

              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={handlePushCatalogToSupabase}
                  disabled={isSyncingProducts}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md hover:shadow-primary/30 transition-all disabled:opacity-50"
                >
                  <Upload className={`w-3.5 h-3.5 ${isSyncingProducts ? 'animate-bounce' : ''}`} />
                  <span>{isSyncingProducts ? 'Pushing Catalog...' : 'Push All Local Products to Supabase'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePullCatalogFromSupabase}
                  disabled={isFetchingProducts}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card hover:bg-secondary text-foreground text-xs font-bold border border-border hover:border-primary/40 transition-all disabled:opacity-50"
                >
                  <Download className={`w-3.5 h-3.5 text-primary ${isFetchingProducts ? 'animate-bounce' : ''}`} />
                  <span>{isFetchingProducts ? 'Fetching from Cloud...' : 'Pull Catalog from Supabase'}</span>
                </button>
              </div>
            </div>

            {/* Connection Credentials Form */}
            <div className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Project Credentials
              </h4>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  NEXT_PUBLIC_SUPABASE_URL
                </label>
                <input
                  type="text"
                  placeholder="https://your-project-id.supabase.co"
                  value={supabaseConfig.url}
                  onChange={(e) => setSupabaseConfigState({ ...supabaseConfig, url: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  SUPABASE_API_KEY (Anon or Service Key)
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi... or your Supabase key"
                  value={supabaseConfig.anonKey}
                  onChange={(e) => setSupabaseConfigState({ ...supabaseConfig, anonKey: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-primary font-mono"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveSupabase}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md hover:shadow-primary/30 transition-all tap-feedback"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Supabase Config</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground px-3 py-1.5 rounded-full bg-secondary">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  <span>Auto-saved in .env.local</span>
                </div>
              </div>
            </div>

            {/* Step-by-Step SQL Guide */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5 space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-primary">
                30-Second Setup Guide
              </h4>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>
                  Click the <strong className="text-foreground">&quot;Copy SQL&quot;</strong> button below to copy the schema.
                </li>
                <li>
                  Click <strong className="text-foreground">&quot;Open Supabase SQL&quot;</strong> to open your project&apos;s SQL Editor.
                </li>
                <li>
                  Paste the code, click <strong className="text-foreground">RUN</strong>, then come back here and click <strong className="text-foreground">&quot;Test Connection&quot;</strong>!
                </li>
              </ol>
            </div>

            {/* SQL Table Creation Script */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">
                    Complete Database SQL Schema
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Creates products, store_settings, and orders tables with landmark delivery fields and RLS security.
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/70 text-foreground text-xs font-bold transition-all border border-primary/20 shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-primary" />
                  <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-4 rounded-2xl bg-foreground text-background text-[11px] font-mono overflow-x-auto max-h-72 scrollbar-none">
                {SUPABASE_SQL_SCHEMA}
              </pre>
            </div>
          </div>
        )}

        </main>
      </div>

      {/* ==================================================== */}
      {/* 3. MOBILE SIDEBAR DRAWER (Slide-over for < lg)       */}
      {/* ==================================================== */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside className="relative w-[85%] max-w-xs bg-card border-r border-border shadow-2xl z-10 flex flex-col justify-between overflow-y-auto p-4 sm:p-5 animate-slide-right">
            
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/40 bg-white shadow-sm flex items-center justify-center shrink-0">
                    <Image src="/assets/images/logo.jpeg" alt="Francielle Logo" fill className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wider text-foreground leading-none">
                      FRANCI<span className="text-primary">ELLE</span>
                    </h3>
                    <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">
                      ADMIN NAVIGATION
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Metrics Bar in Drawer */}
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-secondary/50 border border-primary/10">
                <div className="text-center">
                  <p className="text-xs font-black text-foreground">{products.length}</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-primary">₦{(totalCatalogValue / 1000).toFixed(0)}k</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-bold">In Stock</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 mb-1">
                  Main Sections
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id, item.action)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                          : 'text-foreground hover:bg-secondary/70'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                        <div className="text-left truncate">
                          <div className="truncate">{item.label}</div>
                          <div className={`text-[10px] font-normal truncate ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-1 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-secondary text-primary border border-primary/10'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Store Operations */}
              <div className="space-y-1 pt-3 border-t border-border">
                <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2">
                  Store Tools
                </p>
                <Link
                  href="/"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-primary" />
                    <span>View Customer Storefront</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>

                <button
                  onClick={() => {
                    handleExportJSON();
                    setIsMobileSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Download className="w-4 h-4 text-primary" />
                    <span>Backup Catalog (JSON)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Download</span>
                </button>

                <label className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Upload className="w-4 h-4 text-primary" />
                    <span>Import Catalog (JSON)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Restore</span>
                  <input type="file" accept=".json" onChange={(e) => { handleImportJSON(e); setIsMobileSidebarOpen(false); }} className="hidden" />
                </label>

                <button
                  onClick={() => {
                    resetCatalog();
                    setIsMobileSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <RefreshCw className="w-4 h-4" />
                    <span>Reset Store Defaults</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Drawer Footer Contact */}
            <div className="pt-4 border-t border-border mt-4 space-y-2">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary/80 hover:bg-destructive/15 text-xs font-bold text-foreground hover:text-destructive transition-colors border border-border shrink-0 tap-feedback"
              >
                <LogOut className="w-3.5 h-3.5 text-destructive" />
                <span>Lock Admin Session</span>
              </button>

              <a
                href={`https://wa.me/${settings.phoneWhatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2.5 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span className="truncate">WhatsApp: {settings.phoneWhatsapp}</span>
              </a>
              <p className="text-[10px] text-muted-foreground text-center mt-2 font-medium">
                FRANCIELLE BY FRANCES · Nigeria
              </p>
            </div>
          </aside>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. MOBILE BOTTOM NAVIGATION BAR (Fixed for < lg)     */}
      {/* ==================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-card/95 backdrop-blur-md border-t border-border px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => handleNavClick('products')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'products' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Package className="w-4 h-4" />
          <span className="text-[10px] leading-none">Products</span>
          {activeTab === 'products' && <span className="w-1 h-1 rounded-full bg-primary" />}
        </button>

        <button
          onClick={() => handleNavClick('orders')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all relative ${
            activeTab === 'orders' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-[10px] leading-none">Orders</span>
          {orders.length > 0 && (
            <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center">
              {orders.length}
            </span>
          )}
          {activeTab === 'orders' && <span className="w-1 h-1 rounded-full bg-primary" />}
        </button>

        <button
          onClick={() => handleNavClick('variations')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'variations' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span className="text-[10px] leading-none">Variations</span>
          {activeTab === 'variations' && <span className="w-1 h-1 rounded-full bg-primary" />}
        </button>

        <button
          onClick={() => handleNavClick('settings')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all ${
            activeTab === 'settings' ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span className="text-[10px] leading-none">Delivery</span>
          {activeTab === 'settings' && <span className="w-1 h-1 rounded-full bg-primary" />}
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl text-muted-foreground hover:text-foreground transition-all"
        >
          <Menu className="w-4 h-4 text-primary" />
          <span className="text-[10px] leading-none">Menu</span>
        </button>
      </nav>

      {/* ==================================================== */}
      {/* 5. DISPATCH NOTE MODAL (Price-Free for Riders)       */}
      {/* ==================================================== */}
      {dispatchNoteOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-center justify-center animate-fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setDispatchNoteOrder(null)}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <div className="relative bg-card rounded-3xl border border-primary/25 max-w-2xl w-full p-4 sm:p-6 shadow-2xl z-10 my-4 max-h-[94vh] flex flex-col overflow-hidden">
            
            {/* Modal Actions Header (Hidden on print) */}
            <div className="no-print flex flex-wrap items-center justify-between pb-3 border-b border-border gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-foreground">
                    Dispatch Note (No Prices)
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Order #{dispatchNoteOrder.id} · For Courier &amp; Store Keeper
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyRiderText}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-border hover:bg-secondary text-xs font-bold transition-all text-foreground"
                  title="Copy dispatch text for WhatsApp"
                >
                  {copiedRiderText ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                  <span className="hidden sm:inline">{copiedRiderText ? 'Copied' : 'Copy Text'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDispatchImage}
                  disabled={isDownloadingDispatchImage}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-card hover:bg-secondary border border-primary/30 text-primary text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
                  title="Download dispatch slip as image (PNG)"
                >
                  {isDownloadingDispatchImage ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline">Save Image</span>
                  <span className="sm:hidden">PNG</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintDispatchNote}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-xs transition-all"
                  title="Print Slip or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDispatchNoteOrder(null)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-secondary transition-colors ml-1"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Dispatch Note Slip */}
            <div className="flex-1 overflow-y-auto py-3 pr-1">
              <div
                id="printable-dispatch-note"
                className="bg-white text-zinc-900 rounded-2xl border-2 border-zinc-200 p-5 sm:p-6 shadow-sm space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-zinc-900 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-pink-500/40 bg-white flex-shrink-0">
                      <Image
                        src={settings.logoUrl || '/assets/images/logo.jpeg'}
                        alt="Francielle Logo"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-zinc-900">
                        {settings.storeName || 'Francielle By Frances'}
                      </h2>
                      <p className="text-[11px] font-bold tracking-wider text-pink-600 uppercase">
                        OFFICIAL DISPATCH &amp; DELIVERY SLIP
                      </p>
                      <p className="text-[10px] text-zinc-600">
                        Kaduna Dispatch Hub · WhatsApp: +234 911 433 6301
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-md bg-zinc-900 text-white font-mono font-bold text-xs tracking-wider">
                      #{dispatchNoteOrder.id}
                    </span>
                    <p className="text-[10px] text-zinc-600 mt-1">
                      Date: {new Date(dispatchNoteOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Status: {dispatchNoteOrder.status.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Recipient & Destination Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      👤 RECIPIENT INFORMATION
                    </p>
                    <p className="font-black text-sm text-zinc-900">{dispatchNoteOrder.customer.fullName}</p>
                    <p className="font-mono font-bold text-xs text-zinc-800">
                      📞 {dispatchNoteOrder.customer.phone}
                    </p>
                    {dispatchNoteOrder.customer.phoneAlt && (
                      <p className="text-[11px] text-zinc-600">
                        Alt Phone: {dispatchNoteOrder.customer.phoneAlt}
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-500 truncate">
                      ✉️ {dispatchNoteOrder.customer.email}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      📍 DELIVERY DESTINATION
                    </p>
                    <p className="font-bold text-zinc-900">
                      {dispatchNoteOrder.customer.city}, {dispatchNoteOrder.customer.state} State
                    </p>
                    <p className="text-zinc-700 text-[11px] leading-snug">
                      {dispatchNoteOrder.customer.address}
                    </p>
                  </div>
                </div>

                {/* CRITICAL CLOSEST BUS STOP / LANDMARK (HIGHEST PRIORITY FOR RIDER) */}
                <div className="p-3.5 rounded-xl bg-amber-50 border-2 border-amber-400 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <span>🚏 CRITICAL DISPATCH LANDMARK / POPULAR BUS STOP:</span>
                  </p>
                  <p className="text-sm sm:text-base font-black text-zinc-950">
                    {dispatchNoteOrder.customer.landmark || 'Not provided'}
                  </p>
                  <p className="text-[10px] text-amber-900/80 italic">
                    Rider Instruction: Head to this landmark/bus stop first, then contact customer on {dispatchNoteOrder.customer.phone}.
                  </p>
                </div>

                {dispatchNoteOrder.customer.notes && (
                  <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 text-xs">
                    <span className="font-bold text-[10px] uppercase text-zinc-600 block">
                      Customer Delivery Note / Instructions:
                    </span>
                    <p className="text-zinc-800 italic mt-0.5">{dispatchNoteOrder.customer.notes}</p>
                  </div>
                )}

                {/* PACKAGE ITEMS CHECKLIST - STRICTLY NO PRICES */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-wider text-zinc-800">
                      Package Contents ({dispatchNoteOrder.items.reduce((s, i) => s + i.qty, 0)} Items) - Confidential (No Prices Displayed)
                    </p>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase">
                      Packing Checklist
                    </span>
                  </div>

                  <table className="w-full text-xs text-left border border-zinc-200 rounded-lg overflow-hidden">
                    <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase text-[10px] border-b border-zinc-200">
                      <tr>
                        <th className="py-2 px-3 w-8 text-center">#</th>
                        <th className="py-2 px-3">Item Description</th>
                        <th className="py-2 px-3">Option / Variation</th>
                        <th className="py-2 px-3 text-center w-16">Qty</th>
                        <th className="py-2 px-3 text-center w-20">Verified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 text-zinc-800">
                      {dispatchNoteOrder.items.map((it, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50">
                          <td className="py-2.5 px-3 text-center font-bold text-zinc-500">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-zinc-900">
                            {it.name}
                          </td>
                          <td className="py-2.5 px-3 text-pink-600 font-semibold text-[11px]">
                            {it.variant || 'Standard'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-black text-sm text-zinc-900">
                            {it.qty}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="w-4 h-4 mx-auto border-2 border-zinc-400 rounded-xs" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Logistics Disclaimer */}
                <p className="text-[10px] text-zinc-500 italic text-center pt-1 border-t border-zinc-200">
                  * Confidential delivery packing slip. Product prices are omitted for courier logistics privacy. Delivery fee is billed upon dispatch based on distance.
                </p>

                {/* Courier Handover Signatures */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-200 text-[10px] text-zinc-700">
                  <div className="border-t border-dashed border-zinc-400 pt-1 text-center">
                    <p className="font-bold">Packed By (Store)</p>
                    <p className="text-zinc-400 text-[9px] mt-4">Signature &amp; Date</p>
                  </div>
                  <div className="border-t border-dashed border-zinc-400 pt-1 text-center">
                    <p className="font-bold">Rider Handover</p>
                    <p className="text-zinc-400 text-[9px] mt-4">Rider Name &amp; Phone</p>
                  </div>
                  <div className="border-t border-dashed border-zinc-400 pt-1 text-center">
                    <p className="font-bold">Received By Customer</p>
                    <p className="text-zinc-400 text-[9px] mt-4">Customer Signature</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* PRINT SPECIFIC STYLES FOR DISPATCH NOTE */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-dispatch-note,
          #printable-dispatch-note * {
            visibility: visible;
          }
          #printable-dispatch-note {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: #ffffff !important;
            color: #000000 !important;
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            border-radius: 8px !important;
            z-index: 999999;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

