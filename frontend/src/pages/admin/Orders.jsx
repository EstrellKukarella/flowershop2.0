import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatPrice } from '../../utils/formatters';

export default function AdminOrders() {
    // This would fetch all orders for admin, currently reusing user orders endpoint 
    // but in real app would need admin specific endpoint
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch for now as we didn't implement admin get all orders
        // In real implementation, add GET /admin/orders endpoint
        setLoading(false);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <h1 className="text-2xl font-bold mb-6">Orders</h1>
            <p className="text-gray-500">Order management coming soon...</p>
        </div>
    );
}
