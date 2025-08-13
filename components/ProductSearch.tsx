
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon } from './Icons';

interface ProductSearchProps {
  products: string[];
  onSelect: (product: string) => void;
  value: string;
  onChange: (value: string) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ products, onSelect, value, onChange }) => {
  const [filteredProducts, setFilteredProducts] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
        const lowercasedValue = value.toLowerCase();
        const results = products
            .filter(p => p.toLowerCase().includes(lowercasedValue))
            .slice(0, 10); // Limit results for performance
        setFilteredProducts(results);
        setIsOpen(results.length > 0);
    } else {
        setFilteredProducts([]);
        setIsOpen(false);
    }
  }, [value, products]);
  
   useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (product: string) => {
    onSelect(product);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={wrapperRef}>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <SearchIcon />
            </div>
            <input
                id="product-search"
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => value && setIsOpen(true)}
                placeholder="Ürün adı yazın..."
                className="w-full p-3 pl-10 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                autoComplete="off"
            />
        </div>
      {isOpen && (
        <ul className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredProducts.map((product, index) => (
            <li
              key={index}
              onClick={() => handleSelect(product)}
              className="p-3 hover:bg-teal-700 cursor-pointer"
            >
              {product}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ProductSearch;
