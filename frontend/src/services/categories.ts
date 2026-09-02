export interface CategoryConfig {
  id: string;
  labelKey: string;
  color: string;
  bgLight: string;
  bgDark: string;
  borderColor: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'market', labelKey: 'cat_market', color: '#10b981', bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200', bgDark: 'dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50', borderColor: 'border-emerald-500' },
  { id: 'food', labelKey: 'cat_food', color: '#f59e0b', bgLight: 'bg-amber-50 text-amber-700 border-amber-200', bgDark: 'dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50', borderColor: 'border-amber-500' },
  { id: 'transport', labelKey: 'cat_transport', color: '#3b82f6', bgLight: 'bg-blue-50 text-blue-700 border-blue-200', bgDark: 'dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50', borderColor: 'border-blue-500' },
  { id: 'home', labelKey: 'cat_home', color: '#8b5cf6', bgLight: 'bg-purple-50 text-purple-700 border-purple-200', bgDark: 'dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50', borderColor: 'border-purple-500' },
  { id: 'tech', labelKey: 'cat_tech', color: '#06b6d4', bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200', bgDark: 'dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/50', borderColor: 'border-cyan-500' },
  { id: 'clothing', labelKey: 'cat_clothing', color: '#ec4899', bgLight: 'bg-pink-50 text-pink-700 border-pink-200', bgDark: 'dark:bg-pink-950/40 dark:text-pink-300 dark:border-pink-800/50', borderColor: 'border-pink-500' },
  { id: 'entertainment', labelKey: 'cat_entertainment', color: '#f97316', bgLight: 'bg-orange-50 text-orange-700 border-orange-200', bgDark: 'dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50', borderColor: 'border-orange-500' },
  { id: 'health', labelKey: 'cat_health', color: '#ef4444', bgLight: 'bg-red-50 text-red-700 border-red-200', bgDark: 'dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50', borderColor: 'border-red-500' },
  { id: 'other', labelKey: 'cat_other', color: '#64748b', bgLight: 'bg-slate-100 text-slate-700 border-slate-200', bgDark: 'dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700', borderColor: 'border-slate-500' }
];

export function getCategoryConfig(categoryId?: string): CategoryConfig {
  const found = CATEGORIES.find(c => c.id === categoryId);
  return found || CATEGORIES[CATEGORIES.length - 1]; // defaults to other
}
