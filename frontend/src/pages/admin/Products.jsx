import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatPrice } from '../../utils/formatters';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium">
                    + Add New
                </button>
            </div>

            {loading ? (
                <LoadingSpinner />
            ) : (
                <div className="space-y-3">
                    {products.map(product => (
                        <div key={product.id} className="bg-white p-3 rounded-xl shadow-sm flex gap-3">
                            <img
                                src={product.images?.[0]}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                            />
                            <div className="flex-1">
                                <h3 className="font-medium line-clamp-1">{product.name}</h3>
                                <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                        {product.category}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
