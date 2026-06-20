import React, { useState, useMemo } from 'react';
import { createProduct, updateProduct, deleteProduct } from '../../lib/api';
import ConfirmModal from '../ConfirmModal';

// Hardcoded color palette
const COLOR_PALETTE = {
  'Warm Ivory': '#F9F7F2',
  'Muted Terracotta': '#9B3018',
  'Dusty Gold': '#C4A46D',
  'Charcoal': '#2E2F30',
  'Forest Green': '#224032',
  'Royal Blue': '#1B365D',
  'Blush Pink': '#F0D4D4',
  'Sage Green': '#9CAF88',
  'Midnight Black': '#121212',
  'Rust Orange': '#B7410E',
  'Indigo': '#4B0082',
  'Cream White': '#FDFBF7',
  'Saffron': '#FF9933',
  'Turmeric Yellow': '#FFC30B',
  'Peacock Blue': '#005E7C',
  'Lotus Pink': '#FFB6C1',
  'Marigold': '#FF7E00',
  'Crimson Red': '#DC143C',
  'Emerald': '#50C878',
  'Mustard': '#FFDB58',
  'Olive': '#808000',
  'Burgundy': '#800020',
  'Teal': '#008080',
  'Magenta': '#FF00FF',
  'Plum': '#8E4585',
  'Coral': '#FF7F50',
  'Mint Green': '#98FF98',
  'Lavender': '#E6E6FA',
  'Peach': '#FFE5B4',
  'Sand': '#C2B280',
  'Coffee': '#6F4E37',
  'Sky Blue': '#87CEEB',
  'Navy Blue': '#000080',
  'Rose Gold': '#B76E79',
  'Silver': '#C0C0C0',
  'Bronze': '#CD7F32'
};

export default function AdminProducts({ products, setProducts, categories, triggerNotification, onRefresh, loading }) {
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [visibleCount, setVisibleCount] = useState(20);

  const [productForm, setProductForm] = useState({
    title: '', category: '', price: '', original_price: '', 
    badge: '', sizes: '', colors: [], colors_hex: {}, images_by_color: {},
    image_main: '', image_hover: '', in_stock: true, description: '', details_care: '', shipping_info: ''
  });

  // Local state for files pending upload
  const [pendingMainImage, setPendingMainImage] = useState(null);
  const [pendingHoverImage, setPendingHoverImage] = useState(null);
  const [pendingColorImages, setPendingColorImages] = useState({}); // { colorName: [file1, file2] }

  const insertMarkdown = (field, prefix, suffix = '') => {
    const textarea = document.getElementById(`textarea-${field}`);
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = productForm[field] || '';
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    setProductForm(prev => ({ ...prev, [field]: newText }));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const renderRichTextEditor = (label, field, required = false) => (
    <div className="md:col-span-2">
      <div className="flex justify-between items-end mb-1">
        <label className="block font-label-caps text-[10px] tracking-widest uppercase">{label} {required && <span style={{ color: '#9B3018' }}>*</span>}</label>
        <div className="flex gap-1">
          <button type="button" onClick={() => insertMarkdown(field, '**', '**')} className="p-1 border border-outline-variant/30 text-[10px] font-bold w-6 h-6 flex items-center justify-center bg-surface-container-low hover:bg-surface-variant cursor-pointer">B</button>
          <button type="button" onClick={() => insertMarkdown(field, '_', '_')} className="p-1 border border-outline-variant/30 text-[10px] italic w-6 h-6 flex items-center justify-center bg-surface-container-low hover:bg-surface-variant cursor-pointer">I</button>
          <button type="button" onClick={() => insertMarkdown(field, '\\n- ')} className="p-1 border border-outline-variant/30 text-[10px] w-6 h-6 flex items-center justify-center bg-surface-container-low hover:bg-surface-variant cursor-pointer">•</button>
        </div>
      </div>
      <textarea id={`textarea-${field}`} required={required} rows="4" className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary font-mono" value={productForm[field] || ''} onChange={e => setProductForm({...productForm, [field]: e.target.value})}></textarea>
      <p className="text-[9px] text-secondary mt-1">Markdown supported. Use **bold** and - bullets.</p>
    </div>
  );

  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        title: product.title || '',
        category: product.category || '',
        price: product.price || '',
        original_price: product.original_price || '',
        badge: product.badge || '',
        sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || ''),
        colors: Array.isArray(product.colors) ? product.colors : [],
        colors_hex: product.colors_hex || {},
        images_by_color: product.images_by_color || {},
        image_main: product.image_main || product.imageMain || '',
        image_hover: product.image_hover || product.imageHover || '',
        in_stock: product.in_stock !== undefined ? product.in_stock : (product.inStock !== undefined ? product.inStock : true),
        description: product.description || '',
        details_care: product.details_care || product.detailsCare || '',
        shipping_info: product.shipping_info || product.shippingInfo || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        title: '', category: '', price: '', original_price: '', 
        badge: '', sizes: '', colors: [], colors_hex: {}, images_by_color: {},
        image_main: '', image_hover: '', in_stock: true, description: '', details_care: '', shipping_info: ''
      });
    }
    setPendingMainImage(null);
    setPendingHoverImage(null);
    setPendingColorImages({});
    setShowProductModal(true);
  };

  const handleMainImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPendingMainImage(file);
      setProductForm(prev => ({ ...prev, image_main: URL.createObjectURL(file) }));
    }
  };

  const handleHoverImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPendingHoverImage(file);
      setProductForm(prev => ({ ...prev, image_hover: URL.createObjectURL(file) }));
    }
  };

  // -- Color & Image Builder Helpers --
  const handleAddColor = () => {
    // Add a placeholder color row. Wait for user to select from dropdown.
    setProductForm(prev => ({
      ...prev,
      colors: [...prev.colors, '']
    }));
  };

  const handleColorChange = (index, newColorName) => {
    setProductForm(prev => {
      const newColors = [...prev.colors];
      const oldColorName = newColors[index];
      newColors[index] = newColorName;

      // Transfer hex and images to new color name
      const newColorsHex = { ...prev.colors_hex };
      const newImagesByColor = { ...prev.images_by_color };

      if (oldColorName && oldColorName !== newColorName) {
        delete newColorsHex[oldColorName];
        delete newImagesByColor[oldColorName];
      }
      
      if (newColorName && COLOR_PALETTE[newColorName]) {
        newColorsHex[newColorName] = COLOR_PALETTE[newColorName];
      }

      // Transfer pending files to new color name
      setPendingColorImages(pending => {
        const p = { ...pending };
        if (oldColorName && oldColorName !== newColorName && p[oldColorName]) {
          p[newColorName] = p[oldColorName];
          delete p[oldColorName];
        }
        return p;
      });

      return {
        ...prev,
        colors: newColors,
        colors_hex: newColorsHex,
        images_by_color: newImagesByColor
      };
    });
  };

  const handleRemoveColor = (index) => {
    setProductForm(prev => {
      const colorName = prev.colors[index];
      const newColors = prev.colors.filter((_, i) => i !== index);
      const newColorsHex = { ...prev.colors_hex };
      const newImagesByColor = { ...prev.images_by_color };
      
      if (colorName) {
        delete newColorsHex[colorName];
        delete newImagesByColor[colorName];
      }

      setPendingColorImages(pending => {
        const p = { ...pending };
        if (colorName) delete p[colorName];
        return p;
      });

      return {
        ...prev,
        colors: newColors,
        colors_hex: newColorsHex,
        images_by_color: newImagesByColor
      };
    });
  };

  const handleColorImageSelect = (colorName, files) => {
    if (!colorName) return;
    const fileArray = Array.from(files);
    
    setPendingColorImages(prev => ({
      ...prev,
      [colorName]: [...(prev[colorName] || []), ...fileArray]
    }));

    // Generate local previews for instant feedback
    const newPreviewUrls = fileArray.map(f => URL.createObjectURL(f));
    setProductForm(prev => ({
      ...prev,
      images_by_color: {
        ...prev.images_by_color,
        [colorName]: [...(prev.images_by_color[colorName] || []), ...newPreviewUrls]
      }
    }));
  };

  const handleRemoveColorImage = (colorName, imageIndex, isPending) => {
    if (isPending) {
      setPendingColorImages(prev => {
        const newArr = [...(prev[colorName] || [])];
        newArr.splice(imageIndex, 1);
        return { ...prev, [colorName]: newArr };
      });
      // Also remove preview
      setProductForm(prev => {
        const newArr = [...(prev.images_by_color[colorName] || [])];
        newArr.splice(imageIndex, 1);
        return { ...prev, images_by_color: { ...prev.images_by_color, [colorName]: newArr } };
      });
    } else {
      // Removing an existing URL image
      setProductForm(prev => {
        const newArr = [...(prev.images_by_color[colorName] || [])];
        newArr.splice(imageIndex, 1);
        return { ...prev, images_by_color: { ...prev.images_by_color, [colorName]: newArr } };
      });
    }
  };


  const handleSaveProduct = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!productForm.title || !productForm.category || !productForm.price || !productForm.image_main) {
      triggerNotification('Please fill all mandatory fields (Title, Category, Price, Main Image).');
      return;
    }

    try {
      setIsUploading(true);
      const { supabase } = await import('../../lib/api');
      
      // Helper to upload a single file
      const uploadFile = async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `products/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('rangova').upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from('rangova').getPublicUrl(fileName);
        return publicData.publicUrl;
      };

      let finalMainImage = productForm.image_main;
      let finalHoverImage = productForm.image_hover;
      let finalImagesByColor = { ...productForm.images_by_color };

      // 1. Upload pending main image
      if (pendingMainImage) {
        finalMainImage = await uploadFile(pendingMainImage);
      }
      
      // 2. Upload pending hover image
      if (pendingHoverImage) {
        finalHoverImage = await uploadFile(pendingHoverImage);
      }

      // 3. Upload pending color images
      for (const colorName of Object.keys(pendingColorImages)) {
        const files = pendingColorImages[colorName];
        if (files && files.length > 0) {
          const uploadedUrls = [];
          for (const file of files) {
            uploadedUrls.push(await uploadFile(file));
          }
          // We must replace the local ObjectURL previews with the real uploadedUrls
          const currentUrls = finalImagesByColor[colorName] || [];
          const withoutPreviews = currentUrls.filter(url => !url.startsWith('blob:'));
          finalImagesByColor[colorName] = [...withoutPreviews, ...uploadedUrls];
        }
      }

      const payload = {
        title: productForm.title.trim(),
        category: productForm.category,
        price: parseFloat(productForm.price),
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        badge: productForm.badge,
        sizes: typeof productForm.sizes === 'string' ? productForm.sizes.split(',').map(s => s.trim()).filter(Boolean) : productForm.sizes,
        colors: productForm.colors.filter(Boolean),
        colors_hex: productForm.colors_hex,
        images_by_color: finalImagesByColor,
        image_main: finalMainImage,
        image_hover: finalHoverImage,
        in_stock: productForm.in_stock,
        description: productForm.description,
        details_care: productForm.details_care,
        shipping_info: productForm.shipping_info
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);
        setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
        if (selectedProduct?.id === editingProduct.id) setSelectedProduct(updated);
        triggerNotification('Product updated successfully');
      } else {
        if (!payload.id) payload.id = productForm.title.toLowerCase().replace(/\s+/g, '-');
        const created = await createProduct(payload);
        setProducts([created, ...products]);
        triggerNotification('Product added successfully');
      }
      setShowProductModal(false);
    } catch (err) {
      console.error(err);
      triggerNotification(`Error saving product: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteProduct = (id) => {
    setItemToDelete(id);
  };

  const confirmDeleteProduct = async () => {
    if (!itemToDelete) return;
    try {
      await deleteProduct(itemToDelete);
      setProducts(products.filter(p => p.id !== itemToDelete));
      if (selectedProduct?.id === itemToDelete) setSelectedProduct(null);
      triggerNotification('Product deleted successfully');
    } catch (err) {
      triggerNotification('Error deleting product');
    } finally {
      setItemToDelete(null);
    }
  };

  const filteredProducts = useMemo(() => 
    products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())),
  [products, searchQuery]);

  React.useEffect(() => {
    setVisibleCount(20);
  }, [searchQuery]);

  const displayedProducts = useMemo(() => filteredProducts.slice(0, visibleCount), [filteredProducts, visibleCount]);

  const loadMoreRef = React.useRef(null);
  React.useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleCount < filteredProducts.length) {
        setVisibleCount(prev => prev + 20);
      }
    });
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredProducts.length]);

  return (
    <div className="flex gap-4 h-full overflow-hidden">
      {/* Main Panel */}
      <div className={`flex flex-col transition-all duration-300 ${selectedProduct ? 'flex-1 min-w-0' : 'w-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-sm text-2xl font-bold text-primary">Products</h2>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-outline-variant/30 text-[10px] font-label-caps uppercase tracking-widest text-primary hover:bg-surface-variant/30 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
              Refresh
            </button>
          </div>
          <button 
            onClick={() => handleOpenProductModal()} 
            style={{ backgroundColor: '#1b1c1c', color: '#fff' }}
            className="font-label-caps text-[10px] uppercase tracking-widest px-6 py-3 hover:opacity-80 transition-opacity border-none cursor-pointer rounded-sm"
          >
            + Add Product
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-base">search</span>
          <input
            type="text"
            placeholder="Search products by title..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-outline-variant/40 bg-white text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        <div className="bg-white border border-outline-variant/30 rounded-sm shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-surface-variant/30 border-b border-outline-variant/30 font-label-caps text-[10px] text-secondary tracking-widest uppercase">
                <tr>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Sizes</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-sm">
                {displayedProducts.map(prod => (
                  <tr 
                    key={prod.id} 
                    onClick={() => setSelectedProduct(selectedProduct?.id === prod.id ? null : prod)}
                    className={`cursor-pointer transition-colors ${selectedProduct?.id === prod.id ? 'bg-surface-variant/40' : 'hover:bg-surface-container-low'}`}
                  >
                    <td className="py-4 px-6 flex items-center gap-3">
                      <img src={prod.image_main || prod.imageMain} alt={prod.title} className="w-10 h-10 object-cover rounded-sm border border-outline-variant/20" />
                      <div>
                        <div className="font-bold text-primary">{prod.title}</div>
                        {prod.badge && <span className="text-[9px] bg-soft-beige px-1 rounded text-primary uppercase font-bold">{prod.badge}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-secondary">{prod.category}</td>
                    <td className="py-4 px-6 font-price-lg font-bold">₹{prod.price}</td>
                    <td className="py-4 px-6 text-secondary text-xs">{(prod.sizes || []).join(', ') || '-'}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 text-[9px] font-label-caps uppercase rounded-sm ${(prod.in_stock || prod.inStock) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {(prod.in_stock || prod.inStock) ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right" onClick={e => e.stopPropagation()}>
                      <button onClick={() => handleOpenProductModal(prod)} className="text-[10px] font-label-caps uppercase text-primary hover:text-muted-terracotta transition-colors bg-transparent border-none cursor-pointer mr-3">Edit</button>
                      <button onClick={() => handleDeleteProduct(prod.id)} className="text-[10px] font-label-caps uppercase text-muted-terracotta hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer">Delete</button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-secondary">No products found.</td>
                  </tr>
                )}
                {visibleCount < filteredProducts.length && (
                  <tr ref={loadMoreRef}>
                    <td colSpan="6" className="py-4 text-center text-secondary">Loading more...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-2 text-xs text-secondary">Showing {displayedProducts.length} of {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} • Click a row to view details</p>
      </div>

      {/* Right Detail Panel */}
      {selectedProduct && (
        <div className="w-96 flex-shrink-0 bg-white border border-outline-variant/30 rounded-sm shadow-sm overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <div className="flex justify-between items-center p-4 border-b border-outline-variant/20 sticky top-0 bg-white z-10">
            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary">Product Details</p>
              <p className="font-bold text-primary">{selectedProduct.title}</p>
            </div>
            <button onClick={() => setSelectedProduct(null)} className="bg-transparent border-none cursor-pointer text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div className="p-4 space-y-5">
            {/* Primary Images */}
            <div className="flex gap-2">
              <div className="flex-1">
                <p className="font-label-caps text-[9px] tracking-widest uppercase text-secondary mb-1">Main Image</p>
                <img src={selectedProduct.image_main || selectedProduct.imageMain} className="w-full aspect-[3/4] object-cover border border-outline-variant/20" alt="Main" />
              </div>
              <div className="flex-1">
                <p className="font-label-caps text-[9px] tracking-widest uppercase text-secondary mb-1">Hover Image</p>
                {selectedProduct.image_hover || selectedProduct.imageHover ? (
                  <img src={selectedProduct.image_hover || selectedProduct.imageHover} className="w-full aspect-[3/4] object-cover border border-outline-variant/20" alt="Hover" />
                ) : (
                  <div className="w-full aspect-[3/4] bg-surface-variant flex items-center justify-center text-xs text-secondary">N/A</div>
                )}
              </div>
            </div>

            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Price</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">₹{selectedProduct.price}</span>
                {selectedProduct.original_price && <span className="text-sm text-secondary line-through">₹{selectedProduct.original_price}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Category</p>
                <p className="font-bold text-sm">{selectedProduct.category}</p>
              </div>
              <div>
                <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Badge</p>
                <p className="text-sm">{selectedProduct.badge || '-'}</p>
              </div>
            </div>

            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Sizes</p>
              <div className="flex gap-2">
                {(selectedProduct.sizes || []).map(s => (
                  <span key={s} className="px-2 py-1 border border-outline-variant/30 text-xs rounded-sm">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-1">Description</p>
              <p className="text-sm text-secondary leading-relaxed">{selectedProduct.description || '-'}</p>
            </div>

            {/* Colors & Images */}
            {selectedProduct.colors && selectedProduct.colors.length > 0 && (
              <div>
                <p className="font-label-caps text-[10px] tracking-widest uppercase text-secondary mb-2">Colors & Media</p>
                <div className="space-y-4">
                  {selectedProduct.colors.map(color => {
                    const hex = (selectedProduct.colors_hex || {})[color];
                    const imgs = (selectedProduct.images_by_color || {})[color] || [];
                    return (
                      <div key={color} className="bg-surface-container-low p-3 border border-outline-variant/20 rounded-sm">
                        <div className="flex items-center gap-2 mb-2">
                          {hex && <div className="w-4 h-4 rounded-full border border-outline-variant/40" style={{ backgroundColor: hex }}></div>}
                          <span className="font-bold text-sm">{color}</span>
                        </div>
                        {imgs.length > 0 ? (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {imgs.map((url, idx) => (
                              <img key={idx} src={url} className="w-16 h-20 object-cover border border-outline-variant/20 flex-shrink-0" alt={color} />
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-secondary">No specific images</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleOpenProductModal(selectedProduct)}
                style={{ backgroundColor: '#1b1c1c', color: '#fff' }}
                className="flex-1 py-2 font-label-caps text-[10px] uppercase tracking-widest border-none cursor-pointer hover:opacity-80 transition-opacity"
              >Edit</button>
              <button
                onClick={() => handleDeleteProduct(selectedProduct.id)}
                className="flex-1 py-2 font-label-caps text-[10px] uppercase tracking-widest border border-red-300 text-red-600 bg-transparent cursor-pointer hover:bg-red-50 transition-colors"
              >Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-headline-sm text-2xl font-bold mb-6 text-primary">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSaveProduct} className="space-y-6 text-left">
              
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Title <span style={{ color: '#9B3018' }}>*</span></label>
                  <input required className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={productForm.title} onChange={e => setProductForm({...productForm, title: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Category <span style={{ color: '#9B3018' }}>*</span></label>
                  <select required className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})}>
                    <option value="">Select...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name || cat.title}>{cat.name || cat.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Price (₹) <span style={{ color: '#9B3018' }}>*</span></label>
                  <input type="number" required className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Original Price (₹)</label>
                  <input type="number" className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={productForm.original_price} onChange={e => setProductForm({...productForm, original_price: e.target.value})} />
                </div>

                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Badge (e.g., New, Sale)</label>
                  <input className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" value={productForm.badge} onChange={e => setProductForm({...productForm, badge: e.target.value})} />
                </div>
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Sizes (comma separated) <span style={{ color: '#9B3018' }}>*</span></label>
                  <input required className="w-full border border-outline-variant/30 p-2 text-sm bg-transparent outline-none focus:border-primary" placeholder="XS, S, M, L, XL" value={productForm.sizes} onChange={e => setProductForm({...productForm, sizes: e.target.value})} />
                </div>

                {renderRichTextEditor('Description', 'description', true)}
                {renderRichTextEditor('Details & Care', 'details_care')}
                {renderRichTextEditor('Shipping Info', 'shipping_info')}
              </div>

              {/* Main Media Uploads */}
              <div className="border border-outline-variant/30 p-4 rounded-sm bg-surface-container-low grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Main Image <span style={{ color: '#9B3018' }}>*</span></label>
                  {productForm.image_main && <img src={productForm.image_main} className="h-24 object-cover mb-2 border border-outline-variant/30" alt="main" />}
                  <input type="file" accept="image/*" onChange={handleMainImageSelect} className="text-xs w-full" disabled={isUploading} />
                </div>
                <div>
                  <label className="block font-label-caps text-[10px] tracking-widest uppercase mb-1">Hover Image</label>
                  {productForm.image_hover && <img src={productForm.image_hover} className="h-24 object-cover mb-2 border border-outline-variant/30" alt="hover" />}
                  <input type="file" accept="image/*" onChange={handleHoverImageSelect} className="text-xs w-full" disabled={isUploading} />
                </div>
              </div>

              {/* Interactive Colors & Images Builder */}
              <div className="border border-outline-variant/30 p-4 rounded-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-headline-sm text-lg font-bold text-primary">Colors & Media</h3>
                  <button type="button" onClick={handleAddColor} className="px-3 py-1 bg-primary text-white text-[10px] font-label-caps uppercase border-none cursor-pointer">
                    + Add Color
                  </button>
                </div>
                
                {productForm.colors.length === 0 && (
                  <p className="text-xs text-secondary italic">No colors added yet.</p>
                )}

                <div className="space-y-4">
                  {productForm.colors.map((colorName, idx) => {
                    const currentHex = productForm.colors_hex[colorName];
                    const currentImages = productForm.images_by_color[colorName] || [];
                    
                    return (
                      <div key={idx} className="p-3 border border-outline-variant/20 bg-surface-container-low rounded-sm relative">
                        <button type="button" onClick={() => handleRemoveColor(idx)} className="absolute top-2 right-2 text-muted-terracotta bg-transparent border-none cursor-pointer">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3 pr-8">
                          <div>
                            <label className="block font-label-caps text-[9px] tracking-widest uppercase mb-1">Select Color</label>
                            <select 
                              className="w-full border border-outline-variant/30 p-2 text-xs bg-transparent outline-none focus:border-primary"
                              value={colorName}
                              onChange={e => handleColorChange(idx, e.target.value)}
                            >
                              <option value="">-- Choose Color --</option>
                              {Object.keys(COLOR_PALETTE).map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-3 mt-4">
                            {currentHex && (
                              <div className="w-6 h-6 rounded-full border border-outline-variant/40" style={{ backgroundColor: currentHex }} title={currentHex}></div>
                            )}
                          </div>
                        </div>

                        {/* Upload Multiple Images for this color */}
                        {colorName && (
                          <div>
                            <label className="block font-label-caps text-[9px] tracking-widest uppercase mb-1">Images for {colorName}</label>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              onChange={e => handleColorImageSelect(colorName, e.target.files)} 
                              className="text-xs mb-2"
                              disabled={isUploading}
                            />
                            
                            <div className="flex flex-wrap gap-2 mt-2">
                              {currentImages.map((imgUrl, imgIdx) => (
                                <div key={imgIdx} className="relative w-16 h-20 border border-outline-variant/20 group">
                                  <img src={imgUrl} className="w-full h-full object-cover" alt="preview" />
                                  <button 
                                    type="button" 
                                    onClick={() => handleRemoveColorImage(colorName, imgIdx, imgUrl.startsWith('blob:'))}
                                    className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full w-5 h-5 flex items-center justify-center border border-red-200 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[12px]">close</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" checked={productForm.in_stock} onChange={e => setProductForm({...productForm, in_stock: e.target.checked})} id="inStockCheckbox" className="accent-primary w-4 h-4" />
                <label htmlFor="inStockCheckbox" className="font-label-caps text-[10px] tracking-widest uppercase cursor-pointer">Product is In Stock</label>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-outline-variant/30">
                <button type="button" onClick={() => setShowProductModal(false)} className="px-6 py-3 border border-outline-variant/30 font-label-caps text-[10px] tracking-widest uppercase hover:bg-surface-variant/30 transition-colors cursor-pointer bg-transparent">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-6 py-3 bg-primary text-white font-label-caps text-[10px] tracking-widest uppercase hover:bg-secondary transition-colors cursor-pointer border-none disabled:opacity-50">
                  {isUploading ? 'Uploading & Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setItemToDelete(null)}
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
}
