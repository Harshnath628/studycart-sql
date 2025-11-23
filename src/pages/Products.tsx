import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilters, FilterState } from '@/components/ProductFilters';
import { studentMode } from '@/lib/studentMode';

interface Product {
  product_id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  color: string | null;
  storage: number | null;
  image_url?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'All',
    sortBy: 'name-asc',
    priceRange: 'all',
    colors: [],
    storage: []
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);

    // Build SQL query for student mode
    let sqlParts = ['SELECT * FROM products WHERE 1=1'];
    const params: Record<string, any> = {};

    // Search filter
    if (filters.search) {
      sqlParts.push("AND name ILIKE '%<search>%'");
      params.search = filters.search;
    }

    // Category filter
    if (filters.category !== 'All') {
      sqlParts.push("AND category = '<category>'");
      params.category = filters.category;
    }

    // Color filter
    if (filters.colors.length > 0) {
      sqlParts.push(`AND color IN (${filters.colors.map((_, i) => `'<color${i}>'`).join(', ')})`);
      filters.colors.forEach((color, i) => {
        params[`color${i}`] = color;
      });
    }

    // Storage filter
    if (filters.storage.length > 0) {
      const storageValues = filters.storage.map(s => parseInt(s.replace('GB', '').replace('TB', '000')));
      sqlParts.push(`AND storage IN (${storageValues.join(', ')})`);
    }

    // Sort order
    const sortMap: Record<string, string> = {
      'name-asc': 'ORDER BY name ASC',
      'name-desc': 'ORDER BY name DESC',
      'price-asc': 'ORDER BY price ASC',
      'price-desc': 'ORDER BY price DESC'
    };
    sqlParts.push(sortMap[filters.sortBy] || 'ORDER BY name ASC');

    studentMode.logSQL('Filter and Sort Products', sqlParts.join('\n'), params);

    // Build actual Supabase query
    let query = supabase.from('products').select('*');

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters.category !== 'All') {
      query = query.eq('category', filters.category);
    }

    if (filters.colors.length > 0) {
      query = query.in('color', filters.colors);
    }

    if (filters.storage.length > 0) {
      const storageValues = filters.storage.map(s =>
        parseInt(s.replace('GB', '').replace('TB', '000'))
      );
      query = query.in('storage', storageValues);
    }

    // Apply sorting
    const [sortField, sortOrder] = filters.sortBy.split('-');
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    const { data } = await query;

    if (data) {
      // Get images
      const productIds = data.map(p => p.product_id);
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, image_url')
        .in('product_id', productIds)
        .eq('is_primary', true);

      const productsWithImages = data.map(product => ({
        ...product,
        image_url: images?.find(img => img.product_id === product.product_id)?.image_url
      }));

      setProducts(productsWithImages);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Innovation
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the latest technology with our premium collection
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ProductFilters filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass rounded-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No products found</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div
                key={product.product_id}
                style={{ animationDelay: `${index * 0.05}s` }}
                className="animate-fade-in"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}