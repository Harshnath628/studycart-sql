import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    product_id: string;
    name: string;
    slug: string;
    price: number;
    category: string;
    image_url?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addToCart(product.product_id);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Card className="group glass hover-lift overflow-hidden border-border/50">
      <Link to={`/product/${product.slug}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <span className="text-4xl font-bold text-muted-foreground/20">
                {product.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link to={`/product/${product.slug}`}>
          <div className="mb-2">
            <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
            <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
        </Link>

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold">${product.price.toLocaleString()}</span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="hover-glow"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}