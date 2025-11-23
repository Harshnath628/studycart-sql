import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';

export interface FilterState {
  search: string;
  category: string;
  sortBy: string;
  priceRange: string;
  colors: string[];
  storage: string[];
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const categories = ['All', 'Smartphones', 'Laptops', 'Tablets', 'Audio', 'Wearables', 'Desktops'];
const colors = ['Silver', 'Space Black', 'Natural Titanium', 'Pink', 'White', 'Midnight', 'Titanium'];
const storageOptions = ['128GB', '256GB', '512GB', '1TB'];

export function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'colors' | 'storage', value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const activeFilterCount =
    (filters.category !== 'All' ? 1 : 0) +
    filters.colors.length +
    filters.storage.length +
    (filters.priceRange !== 'all' ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-10 glass"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Category Select */}
        <Select value={filters.category} onValueChange={(v) => updateFilter('category', v)}>
          <SelectTrigger className="w-[160px] glass">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort By */}
        <Select value={filters.sortBy} onValueChange={(v) => updateFilter('sortBy', v)}>
          <SelectTrigger className="w-[160px] glass">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="price-asc">Price (Low)</SelectItem>
            <SelectItem value="price-desc">Price (High)</SelectItem>
          </SelectContent>
        </Select>

        {/* Advanced Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="glass">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 glass" align="start">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Price Range</h4>
                <Select value={filters.priceRange} onValueChange={(v) => updateFilter('priceRange', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All prices</SelectItem>
                    <SelectItem value="0-500">Under $500</SelectItem>
                    <SelectItem value="500-1000">$500 - $1000</SelectItem>
                    <SelectItem value="1000-2000">$1000 - $2000</SelectItem>
                    <SelectItem value="2000+">$2000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h4 className="font-medium mb-3">Color</h4>
                <div className="space-y-2">
                  {colors.map(color => (
                    <div key={color} className="flex items-center space-x-2">
                      <Checkbox
                        id={`color-${color}`}
                        checked={filters.colors.includes(color)}
                        onCheckedChange={() => toggleArrayFilter('colors', color)}
                      />
                      <Label htmlFor={`color-${color}`} className="text-sm cursor-pointer">
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Storage</h4>
                <div className="space-y-2">
                  {storageOptions.map(storage => (
                    <div key={storage} className="flex items-center space-x-2">
                      <Checkbox
                        id={`storage-${storage}`}
                        checked={filters.storage.includes(storage)}
                        onCheckedChange={() => toggleArrayFilter('storage', storage)}
                      />
                      <Label htmlFor={`storage-${storage}`} className="text-sm cursor-pointer">
                        {storage}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => onFilterChange({
                  search: '',
                  category: 'All',
                  sortBy: 'name-asc',
                  priceRange: 'all',
                  colors: [],
                  storage: []
                })}
              >
                Clear All
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}