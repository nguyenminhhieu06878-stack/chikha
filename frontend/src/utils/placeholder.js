// Placeholder image utility
export const getPlaceholderImage = (width = 300, height = 300, text = 'No Image') => {
  return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`;
};

export const defaultProductImage = getPlaceholderImage(300, 300, 'Product');

export const PLACEHOLDER_IMAGES = {
  product: defaultProductImage,
  user: getPlaceholderImage(150, 150, 'User'),
  category: getPlaceholderImage(200, 200, 'Category'),
  banner: getPlaceholderImage(800, 400, 'Banner')
};