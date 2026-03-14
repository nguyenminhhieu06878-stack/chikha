import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { categoriesAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Category = () => {
  const { slug } = useParams();

  // Fetch category and its products
  const { data: categoryData, isLoading } = useQuery(
    ['category', slug],
    async () => {
      const categories = await categoriesAPI.getCategories();
      const category = categories.data.data.find(cat => cat.slug === slug);
      if (!category) throw new Error('Category not found');
      
      const categoryDetails = await categoriesAPI.getCategory(category.id);
      return categoryDetails.data;
    },
    { enabled: !!slug }
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!categoryData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
          <p className="text-gray-600 mt-2">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const category = categoryData;
  const products = category.products || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Header */}
      <div className="mb-8">
        {category.image_url && (
          <div className="aspect-video rounded-lg overflow-hidden mb-6">
            <img
              src={category.image_url}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 text-lg">{category.description}</p>
        )}
        
        <p className="text-gray-500 mt-2">
          {products.length} {products.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subcategories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {category.children.map(subcategory => (
              <a
                key={subcategory.id}
                href={`/category/${subcategory.slug}`}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-center"
              >
                <h3 className="font-medium text-gray-900">{subcategory.name}</h3>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {products.length > 0 ? (
        <div className="product-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found in this category</p>
        </div>
      )}
    </div>
  );
};

export default Category;