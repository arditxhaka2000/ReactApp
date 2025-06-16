import React, { useEffect, useState } from 'react';

// Separate component for individual product row
const ProductRow = ({ product }) => (
    <tr>
        <td>{product.name}</td>
        <td>{product.category}</td>
        <td>${product.price?.toFixed(2) ?? 'N/A'}</td>
        <td>{product.brand}</td>
        <td>
            <span className={`status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                {product.inStock ? 'Yes' : 'No'}
            </span>
        </td>
    </tr>
);

// Loading component
const LoadingState = () => (
    <tr>
        <td colSpan="5" className="loading">
            Loading products...
        </td>
    </tr>
);

// Error component
const ErrorState = ({ error, onRetry }) => (
    <tr>
        <td colSpan="5" className="error">
            <p>Error loading products: {error}</p>
            <button onClick={onRetry} className="retry-btn">
                Try Again
            </button>
        </td>
    </tr>
);

// Empty state component
const EmptyState = () => (
    <tr>
        <td colSpan="5" className="empty">
            No products found.
        </td>
    </tr>
);

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Improved fetch function with proper error handling
    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('https://localhost:7100/api/products');

            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Check content type
            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                throw new Error('Response is not JSON');
            }

            const data = await response.json();
            console.log(data);
            // Validate data structure
            if (!Array.isArray(data)) {
                throw new Error('Expected an array of products');
            }

            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Function to render table body content
    const renderTableBody = () => {
        if (loading) {
            return <LoadingState />;
        }

        if (error) {
            return <ErrorState error={error} onRetry={fetchProducts} />;
        }

        if (products.length === 0) {
            return <EmptyState />;
        }

        return products.map(product => (
            <ProductRow key={product.id} product={product} />
        ));
    };

    return (
        <div className="products-container">
            <div className="header">
                <h2>Product List</h2>
                <button
                    onClick={fetchProducts}
                    disabled={loading}
                    className="refresh-btn"
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            <div className="table-wrapper">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Brand</th>
                            <th>In Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {renderTableBody()}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
        .products-container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header h2 {
          margin: 0;
          color: #333;
          font-size: 24px;
        }

        .refresh-btn {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }

        .refresh-btn:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .refresh-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .table-wrapper {
          overflow-x: auto;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          background: white;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 600px;
        }

        .products-table th {
          background-color: #f8f9fa;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #495057;
          border-bottom: 2px solid #dee2e6;

        }

        .products-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #dee2e6;
          vertical-align: middle;
          color:black
        }

        .products-table tbody tr:hover {
          background-color: #f8f9fa;
        }

        .status {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .status.in-stock {
          background-color: #d4edda;
          color: #155724;
        }

        .status.out-of-stock {
          background-color: #f8d7da;
          color: #721c24;
        }

        .loading, .error, .empty {
          text-align: center;
          padding: 40px 20px;
          color: #6c757d;
        }

        .error {
          color: #dc3545;
        }

        .error p {
          margin: 0 0 15px 0;
        }

        .retry-btn {
          padding: 6px 12px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .retry-btn:hover {
          background-color: #c82333;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .products-container {
            padding: 10px;
          }

          .header {
            flex-direction: column;
            gap: 10px;
          }

          .products-table th,
          .products-table td {
            padding: 8px 12px;
            font-size: 14px;
          }

          .header h2 {
            font-size: 20px;
          }
        }
      `}</style>
        </div>
    );
};

export default Products;