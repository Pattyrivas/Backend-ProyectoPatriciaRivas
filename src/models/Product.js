import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Definición del esquema de producto
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  available: { type: Boolean, required: true },
  thumbnails: [String]
});

// Aplicar el plugin de paginación al esquema
productSchema.plugin(mongoosePaginate);

// Exportar el modelo de producto
const Product = mongoose.model('Product', productSchema);
export default Product;
