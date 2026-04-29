import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  getShopProducts,
  getShopCategories,
  createShopCategory,
  createShopProduct,
  updateShopProduct,
  type ShopProduct,
  type Category,
} from "../api/shopApi";
import { getImageUrl } from "../api/config";
import { getCroppedImageFile } from "../utils/cropImage";
import "../styles/ShopPage.css";

type CropAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type FormState = {
  name: string;
  price: string;
  description: string;
  image: File | null;
  imagePreview: string;
  categoryId: string;
};

const emptyForm: FormState = {
  name: "",
  price: "",
  description: "",
  image: null,
  imagePreview: "",
  categoryId: "",
};

function ShopPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);

  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [categoryName, setCategoryName] = useState("");
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CropAreaPixels | null>(null);

  const getFullImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    return getImageUrl(imageUrl);
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const loadShopData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsData, categoriesData] = await Promise.all([
        getShopProducts(),
        getShopCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch {
      setError("Failed to load shop.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShopData();
  }, []);

  const getQuantity = (productId: number) => {
    return quantities[productId] || 1;
  };

  const setQuantity = (productId: number, quantity: number) => {
    setQuantities({
      ...quantities,
      [productId]: Math.max(1, quantity),
    });
  };

  const handleAddToCart = (product: ShopProduct) => {
    const quantity = getQuantity(product.id);

    addToCart(
      {
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: product.imageUrl,
      },
      quantity
    );

    setSuccessMessage(`${quantity} x ${product.name} added to cart.`);

    setTimeout(() => {
      setSuccessMessage("");
    }, 2200);
  };

  const handleProductFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setForm({
      ...form,
      image: file,
      imagePreview: URL.createObjectURL(file),
    });

    resetCrop();
  };

  const openAddProductForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    resetCrop();
    setShowProductForm(true);
    setShowCategoryForm(false);
  };

  const openEditProductForm = (product: ShopProduct) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      price: String(product.price),
      description: product.description || "",
      image: null,
      imagePreview: getFullImageUrl(product.imageUrl),
      categoryId: String(product.categoryId),
    });

    setError("");
    resetCrop();
    setShowProductForm(true);
    setShowCategoryForm(false);
  };

  const closeProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    resetCrop();
  };

  const openCategoryForm = () => {
    setCategoryName("");
    setError("");
    setShowCategoryForm(true);
    setShowProductForm(false);
  };

  const closeCategoryForm = () => {
    setShowCategoryForm(false);
    setCategoryName("");
    setError("");
  };

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!categoryName.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setSavingCategory(true);
      setError("");

      await createShopCategory(categoryName.trim());

      setCategoryName("");
      setShowCategoryForm(false);

      await loadShopData();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSavingCategory(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.price || !form.categoryId) {
      setError("Name, price and category are required.");
      return;
    }

    if (Number(form.price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    try {
      setSavingProduct(true);
      setError("");

      let finalImage = form.image;

      if (form.image && form.imagePreview && croppedAreaPixels) {
        finalImage = await getCroppedImageFile(
          form.imagePreview,
          croppedAreaPixels,
          form.image.name
        );
      }

      const payload = {
        name: form.name.trim(),
        price: Number(form.price),
        description: form.description.trim(),
        categoryId: Number(form.categoryId),
        image: finalImage,
      };

      if (editingProduct) {
        await updateShopProduct(editingProduct.id, payload);
      } else {
        await createShopProduct(payload);
      }

      await loadShopData();
      closeProductForm();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <main className="shop-page">
      <section className="shop-hero">
        <p className="shop-label">Our Shop</p>

        <h1>Shop fresh coffee products</h1>

        <p>
          Buy packaged coffee, espresso beans, and cafe products. Choose quantity
          and add your favorites to cart.
        </p>

        {isAdmin && (
          <div className="admin-shop-actions">
            <button className="admin-add-button" onClick={openAddProductForm}>
              + Add Shop Item
            </button>

            <button className="admin-category-button" onClick={openCategoryForm}>
              + Add Shop Category
            </button>
          </div>
        )}
      </section>

      {error && <p className="shop-error">{error}</p>}
      {successMessage && <p className="shop-success">{successMessage}</p>}

      {isAdmin && showCategoryForm && (
        <section className="shop-form-card">
          <div className="shop-form-header">
            <h2>Add Shop Category</h2>

            <button type="button" onClick={closeCategoryForm}>
              ×
            </button>
          </div>

          <form onSubmit={handleCreateCategory} className="category-form">
            <div className="shop-form-field">
              <label>Category Name</label>

              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Coffee Beans"
              />
            </div>

            <button type="submit" disabled={savingCategory}>
              {savingCategory ? "Adding..." : "Add Category"}
            </button>
          </form>
        </section>
      )}

      {isAdmin && showProductForm && (
        <section className="shop-form-card">
          <div className="shop-form-header">
            <h2>{editingProduct ? "Edit Shop Item" : "Add Shop Item"}</h2>

            <button type="button" onClick={closeProductForm}>
              ×
            </button>
          </div>

          <form onSubmit={handleProductSubmit} className="shop-form">
            <div className="shop-form-field">
              <label>Name</label>

              <input
                name="name"
                value={form.name}
                onChange={handleProductFormChange}
                placeholder="Espresso Blend 1kg"
              />
            </div>

            <div className="shop-form-field">
              <label>Price</label>

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleProductFormChange}
                placeholder="650"
              />
            </div>

            <div className="shop-form-field">
              <label>Category</label>

              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleProductFormChange}
              >
                <option value="">Select category</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="shop-form-field">
              <label>Image</label>

              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            <div className="shop-form-field full">
              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleProductFormChange}
                placeholder="Short description..."
              />
            </div>

            {form.imagePreview && (
              <div className="crop-editor-section">
                <label className="crop-editor-title">
                  Select Square Image Area
                </label>

                <div className="real-cropper-box">
                  <Cropper
                    image={form.imagePreview}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="rect"
                    showGrid={true}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={(_, croppedPixels) => {
                      setCroppedAreaPixels(croppedPixels);
                    }}
                  />
                </div>

                <div className="shop-form-field full">
                  <label>Zoom / Resize Image: {zoom.toFixed(1)}x</label>

                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                </div>

                <p className="crop-help-text">
                  Drag the image to choose the square area. Use zoom to make the
                  selected part bigger or smaller.
                </p>
              </div>
            )}

            <button type="submit" disabled={savingProduct}>
              {savingProduct
                ? "Saving..."
                : editingProduct
                  ? "Save Changes"
                  : "Add Shop Item"}
            </button>
          </form>
        </section>
      )}

      <section className="shop-content">
        {loading ? (
          <p>Loading shop...</p>
        ) : products.length === 0 ? (
          <p>No shop items yet.</p>
        ) : (
          <div className="shop-grid">
            {products.map((product) => (
              <article key={product.id} className="shop-item-card">
                {product.imageUrl && (
                  <div className="shop-item-image">
                    <img
                      src={getFullImageUrl(product.imageUrl)}
                      alt={product.name}
                    />
                  </div>
                )}

                <div className="shop-item-content">
                  <div className="shop-item-top">
                    <h3>{product.name}</h3>
                    <span>{Number(product.price).toFixed(2)} TL</span>
                  </div>

                  <p className="shop-category">{product.category.name}</p>

                  <p className="shop-description">
                    {product.description || ""}
                  </p>
                  
                  <div className="shop-cart-actions">
                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(product.id, getQuantity(product.id) - 1)
                        }
                      >
                        -
                      </button>

                      <span>{getQuantity(product.id)}</span>

                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(product.id, getQuantity(product.id) + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="add-to-cart-button"
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
                    </button>
                  </div>

                  {isAdmin && (
                    <button
                      className="edit-shop-button"
                      onClick={() => openEditProductForm(product)}
                    >
                      Edit Item
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ShopPage;
