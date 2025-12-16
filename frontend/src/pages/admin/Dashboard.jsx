import { Link } from 'react-router-dom';

export default function Dashboard() {
    const menuItems = [
        { title: 'Products', path: '/admin/products', icon: '👕' },
        { title: 'Orders', path: '/admin/orders', icon: '📦' },
        { title: 'Payments', path: '/admin/payments', icon: '💰' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

            <div className="grid grid-cols-2 gap-4">
                {menuItems.map(item => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="bg-white p-6 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2
                     hover:shadow-md transition-shadow"
                    >
                        <span className="text-4xl">{item.icon}</span>
                        <span className="font-medium">{item.title}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
