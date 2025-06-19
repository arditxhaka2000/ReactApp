import React, { useEffect, useState } from 'react';
import '../components/Collections.css';
const Collections = () => {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(false);  
    const [error, setError] = useState(null);       

    const fetchCollections = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('https://localhost:7100/api/collections');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            if (!Array.isArray(data)) throw new Error('Expected an array of collections');

            setCollections(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    return (
        <div className="container my-5">
            <h2 className="text-center mb-4">Our Collections</h2>

            {loading && <p className="text-center">Loading...</p>}
            {error && <p className="text-danger text-center">Error: {error}</p>}

            <div className="row g-4">
                {collections.map((collection) => (
                    <div key={collection.id} className="col-12 col-md-6 col-lg-3">
                        <div className="collection-card position-relative">
                            <img
                                src={collection.imageUrl}
                                alt={collection.name}
                                className="img-fluid full-image"
                                loading="lazy"
                            />
                            <div className="collection-overlay">
                                <h4>{collection.name}</h4>
                                <p>{collection.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default Collections;
