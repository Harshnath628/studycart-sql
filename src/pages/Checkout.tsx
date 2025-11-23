import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { Badge } from '@/components/ui/badge';

export default function Checkout() {
  const { cartItems, cartTotal, cartCount } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No items in cart</h2>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link to="/cart" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-4xl font-bold">Order Review</h1>
          <p className="text-muted-foreground mt-2">Review your order before payment</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items ({cartCount})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.product.image_url ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                          <span className="text-xl font-bold text-muted-foreground/20">
                            {item.product.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ${(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Notice */}
            <Card className="glass border-primary/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Payment Integration Coming Soon</h3>
                    <p className="text-sm text-muted-foreground">
                      This is a demonstration e-commerce platform. The payment processing step 
                      will be implemented in the next phase. For now, you can review your order 
                      and see the order summary.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="glass sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">${cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <Badge variant="secondary" className="h-5">Free</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span className="font-medium">${(cartTotal * 0.1).toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold pt-4 border-t">
                  <span>Total</span>
                  <span className="text-primary">${(cartTotal * 1.1).toFixed(2)}</span>
                </div>

                <div className="space-y-3 pt-4">
                  <Button size="lg" className="w-full hover-glow" disabled>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment Coming Soon
                  </Button>

                  <Link to="/cart" className="block">
                    <Button variant="outline" size="lg" className="w-full">
                      Edit Cart
                    </Button>
                  </Link>
                </div>

                <div className="glass rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Package className="w-3 h-3" />
                    <span>Free shipping on all orders</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}