import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { studentMode } from '@/lib/studentMode';

const CART_SESSION_KEY = 'cart_session_id';

function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem(CART_SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem(CART_SESSION_KEY, sessionId);
  }
  return sessionId;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product: {
    product_id: string;
    name: string;
    price: number;
    slug: string;
    image_url?: string;
  };
}

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    initCart();
  }, []);

  const initCart = async () => {
    const sessionId = getOrCreateSessionId();
    
    studentMode.logSQL(
      'Initialize Cart',
      `SELECT * FROM carts WHERE session_id = '<session_id>'`,
      { session_id: sessionId }
    );

    // Get or create cart
    let { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (!cart) {
      studentMode.logSQL(
        'Create Cart',
        `INSERT INTO carts (session_id) VALUES ('<session_id>')`,
        { session_id: sessionId }
      );

      const { data: newCart } = await supabase
        .from('carts')
        .insert({ session_id: sessionId })
        .select('id')
        .single();
      cart = newCart;
    }

    if (cart) {
      setCartId(cart.id);
      await loadCartItems(cart.id);
    }
    setLoading(false);
  };

  const loadCartItems = async (cartId: string) => {
    studentMode.logSQL(
      'View Cart',
      `SELECT cart_items.*, products.*
FROM cart_items
JOIN products ON cart_items.product_id = products.product_id
WHERE cart_id = '<cart_id>'`,
      { cart_id: cartId }
    );

    const { data } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products (
          product_id,
          name,
          price,
          slug
        )
      `)
      .eq('cart_id', cartId);

    if (data) {
      // Get images for products
      const productIds = data.map(item => item.product_id);
      const { data: images } = await supabase
        .from('product_images')
        .select('product_id, image_url')
        .in('product_id', productIds)
        .eq('is_primary', true);

      const itemsWithImages = data.map(item => ({
        ...item,
        product: {
          ...item.product,
          image_url: images?.find(img => img.product_id === item.product_id)?.image_url
        }
      })) as CartItem[];

      setCartItems(itemsWithImages);
    }
  };

  const addToCart = async (productId: string) => {
    if (!cartId) return;

    studentMode.logSQL(
      'Add to Cart',
      `INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES ('<cart_id>', '<product_id>', 1)
ON CONFLICT (cart_id, product_id)
DO UPDATE SET quantity = cart_items.quantity + 1`,
      { cart_id: cartId, product_id: productId }
    );

    const existingItem = cartItems.find(item => item.product_id === productId);

    if (existingItem) {
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + 1 })
        .eq('id', existingItem.id);
    } else {
      await supabase
        .from('cart_items')
        .insert({ cart_id: cartId, product_id: productId, quantity: 1 });
    }

    await loadCartItems(cartId);
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cartId) return;

    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    studentMode.logSQL(
      'Update Cart Quantity',
      `UPDATE cart_items
SET quantity = <new_quantity>
WHERE cart_id = '<cart_id>' AND product_id = '<product_id>'`,
      { cart_id: cartId, product_id: item.product_id, new_quantity: quantity }
    );

    if (quantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      await loadCartItems(cartId);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!cartId) return;

    const item = cartItems.find(i => i.id === itemId);
    if (!item) return;

    studentMode.logSQL(
      'Remove from Cart',
      `DELETE FROM cart_items
WHERE cart_id = '<cart_id>' AND product_id = '<product_id>'`,
      { cart_id: cartId, product_id: item.product_id }
    );

    await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    await loadCartItems(cartId);
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartCount,
  };
}