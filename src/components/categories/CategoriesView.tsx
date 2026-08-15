import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  FolderPlus,
  Package,
  Sparkles,
  X,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { Category } from '../../types/pos';

export const CategoriesView: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory, settings } = usePOS();
  const curr = settings.currencySymbol || '৳';

  const [showModal, setShowModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorGradient, setColorGradient] = useState('from-sky-500 to-blue-600');

  const gradientsList = [
    { label: 'Sky Blue', value: 'from-sky-500 to-blue-600' },
    { label: 'Emerald Green', value: 'from-emerald-500 to-teal-600' },
    { label: 'Amber Orange', value: 'from-amber-500 to-orange-600' },
    { label: 'Purple Violet', value: 'from-purple-500 to-indigo-600' },
    { label: 'Rose Pink', value: 'from-pink-500 to-rose-600' },
    { label: 'Cyan Teal', value: 'from-cyan-500 to-blue-600' },
    { label: 'Dark Slate', value: 'from-slate-700 to-slate-900' },
  ];

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setDescription('');
    setColorGradient('from-sky-500 to-blue-600');
    setShowModal(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCat(c);
    setName(c.name);
    setDescription(c.description || '');
    setColorGradient(c.color || 'from-sky-500 to-blue-600');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCat) {
      updateCategory({
        ...editingCat,
        name: name.trim(),
        description: description.trim(),
        color: colorGradient,
      });
    } else {
      addCategory({
        name: name.trim(),
        description: description.trim(),
        color: colorGradient,
        iconName: 'Layers',
      });
    }
    setShowModal(false);
  };

  return (
    <div id="categories-page" className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-sky-500" />
            <span>Product Categories</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize inventory into departments, track valuation and product distribution
          </p>
        </div>

        <button
          id="add-new-category-btn"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.categoryId === cat.id);
          const totalValuation = catProducts.reduce((sum, p) => sum + p.sellingPrice * p.stock, 0);
          const totalUnits = catProducts.reduce((sum, p) => sum + p.stock, 0);

          return (
            <div
              key={cat.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shadow-sm`}
                  >
                    <Layers className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Edit Category"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {categories.length > 1 && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete category "${cat.name}"? Products in this category will become uncategorized.`
                            )
                          ) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white">{cat.name}</h3>
                {cat.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {catProducts.length} items ({totalUnits} pcs)
                </span>
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                  {curr}{totalValuation.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingCat ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Frozen Foods & Ice Creams"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short note about items in this department"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category Accent Theme
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {gradientsList.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setColorGradient(g.value)}
                      className={`h-8 rounded-lg bg-gradient-to-r ${g.value} border transition-all ${
                        colorGradient === g.value ? 'ring-2 ring-sky-500 scale-105 border-white' : 'border-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
                >
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
