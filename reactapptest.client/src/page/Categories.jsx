import React from 'react';
import './Categories.css'; 

const Categories = () => {
  
  const categories = [
    { id: 1, name: 'Books' },
    { id: 2, name: 'Electronics' },
    { id: 3, name: 'Clothing' },
  ];

  return (
      <div className="category-page">
      <h1>Categories</h1>
      <ul>
        {categories.map(category => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Categories;