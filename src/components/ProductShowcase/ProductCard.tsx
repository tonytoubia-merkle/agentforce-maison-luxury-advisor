import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScene } from '@/contexts/SceneContext';
import { Badge } from '@/components/ui/Badge';
import { ProductDetails } from './ProductDetails';
import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openCheckout } = useScene();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ y: -4, scale: 1.03 }}
        transition={{ duration: 0.2 }}
        className="w-36 flex-shrink-0 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer relative group"
      >
        <div className="relative w-full h-28">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-contain product-blend p-2"
          />
          {product.attributes?.isTravel && (
            <Badge className="absolute top-1.5 left-1.5 bg-blue-500 text-[9px] px-1.5 py-0.5">
              Travel
            </Badge>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
            className="absolute top-1.5 right-1.5 w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Product details"
            title="View details"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <div className="px-2.5 pb-2.5 pt-1 text-white">
          <span className="text-white/50 text-[9px] uppercase tracking-wider block truncate">
            {product.brand}
          </span>
          <h3 className="font-medium text-[11px] mt-0.5 line-clamp-2 leading-tight min-h-[2.25rem]">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs font-medium">
              ${(product.price ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ProductDetails product={product} onClose={() => setShowDetails(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
