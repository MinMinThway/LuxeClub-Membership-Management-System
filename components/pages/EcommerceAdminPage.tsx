import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { getProducts } from '../../services/mockApi';
import { translations } from '../../constants';

interface EcommerceAdminPageProps {
  language: 'en' | 'my';
}

const EcommerceAdminPage: React.FC<EcommerceAdminPageProps> = ({ language }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const productData = await getProducts();
      setProducts(productData);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.ecommerce} Management</h1>
        <button className="bg-brand-accent text-brand-dark font-bold py-2 px-4 rounded-lg hover:bg-yellow-500 transition duration-300">
          Add New Product
        </button>
      </div>

      <div className="bg-white dark:bg-brand-secondary shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-100 dark:bg-brand-light">
            <tr>
              <th scope="col" className="px-6 py-3">Product Name</th>
              <th scope="col" className="px-6 py-3">Price (MMK)</th>
              <th scope="col" className="px-6 py-3">Discount Price</th>
              <th scope="col" className="px-6 py-3">Stock</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center p-6">Loading products...</td></tr>
            ) : products.length > 0 ? (
              products.map(product => (
                <tr key={product.id} className="border-b border-gray-200 dark:border-brand-light hover:bg-gray-50 dark:hover:bg-brand-light">
                  <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-4">
                    <img src={product.imageUrls[0]} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                    <span>{product.name}</span>
                  </th>
                  <td className={`px-6 py-4 ${product.discountPrice ? 'line-through text-gray-500' : ''}`}>{product.price.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-red-500">
                    {product.discountPrice ? `${product.discountPrice.toLocaleString()}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4">{product.stock.toLocaleString()}</td>
                  <td className="px-6 py-4 space-x-4">
                    <button className="font-medium text-brand-accent hover:underline">Edit</button>
                    <button className="font-medium text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
                <tr><td colSpan={5} className="text-center p-6">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EcommerceAdminPage;