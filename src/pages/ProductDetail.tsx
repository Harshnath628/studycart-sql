import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { studentMode } from '@/lib/studentMode';
import { toast } from 'sonner';

interface ProductDetail {
  product_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  color: string | null;
  storage: number | null;
  specs: any;
  stock_quantity: number;
  images: string[];
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    if (slug) {
      loadProduct(slug);
    }
  }, [slug]);

  const loadProduct = async (slug: string) => {
    studentMode.logSQL(
      'View Product Details',
      `SELECT * FROM products WHERE slug = '<slug>' LIMIT 1`,
      { slug }
    );

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (product) {
      const { data: images } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', product.product_id)
        .order('sort_order');

      setProduct({
        ...product,
        images: images?.map(img => img.image_url) || []
      });
    }

    setLoading(false);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.product_id);
    toast.success(`${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass rounded-lg p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-96 w-96 bg-muted rounded-lg" />
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        {/* Product Detail */}
        <div className="grid md:grid-cols-2 gap-12 animate-fade-in">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden glass">
              {product.images[selectedImage] ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                  <span className="text-6xl font-bold text-muted-foreground/20">
                    {product.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden glass transition-all ${
                      selectedImage === index
                        ? 'ring-2 ring-primary scale-95'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-4">{product.category}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mb-6">
                ${product.price.toLocaleString()}
              </p>
            </div>

            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Specs */}
            {product.specs && (
              <div className="glass rounded-lg p-6">
                <h3 className="font-semibold mb-4">Specifications</h3>
                <div className="space-y-3">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                  {product.color && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Color</span>
                      <span className="font-medium">{product.color}</span>
                    </div>
                  )}
                  {product.storage && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Storage</span>
                      <span className="font-medium">{product.storage}GB</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-muted-foreground">
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full hover-glow"
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}