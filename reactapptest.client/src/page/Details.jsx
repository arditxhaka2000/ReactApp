import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductDetails from '../components/ProductDetails'; // Adjust this path based on where you put the ProductDetails component

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Convert id to number and validate
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Product</h1>
                    <p className="text-gray-600 mb-4">The product ID provided is not valid.</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                    >
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    return <ProductDetails productId={productId} />;
};

export default ProductDetailsPage;