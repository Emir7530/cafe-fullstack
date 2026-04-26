import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { useAuth } from "../context/AuthContext";
import {
  getMenuProducts,
  getMenuCategories,
  createMenuCategory,
  createMenuProduct,
  updateMenuProduct,
  type MenuProduct,
  type Category,
} from "../api/menuApi";
import { getCroppedImageFile } from "../utils/cropImage";
import "./MenuPage.css";

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

const API_BASE_URL = "http://localhost:5000";

const emptyForm: FormState = {
  name: "",
  price: "",
  description: "",
  image: null,
  imagePreview: "",
  categoryId: "",
};

function MenuPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<MenuProduct | null>(null);

  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const [categoryName, setCategoryName] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  const [error, setError] = useState("");

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    useState<CropAreaPixels | null>(null);

  const getFullImageUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_BASE_URL}${imageUrl}`;
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const loadMenuData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productsData, categoriesData] = await Promise.all([
        getMenuProducts(),
        getMenuCategories(),
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch {
      setError("Failed to load menu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, []);

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

  const openEditProductForm = (product: MenuProduct) => {
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

      await createMenuCategory(categoryName.trim());

      setCategoryName("");
      setShowCategoryForm(false);

      await loadMenuData();
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
        await updateMenuProduct(editingProduct.id, payload);
      } else {
        await createMenuProduct(payload);
      }

      await loadMenuData();
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
    <main className="menu-page">
      <section className="menu-hero">
        <p className="menu-label">Our Menu</p>

        <h1>Fresh coffee, simple prices</h1>

        <p>
          These items are shown for customers to view prices. Menu items are not
          directly bought from this page.
        </p>

        {isAdmin && (
          <div className="admin-menu-actions">
            <button className="admin-add-button" onClick={openAddProductForm}>
              + Add Menu Item
            </button>

            <button className="admin-category-button" onClick={openCategoryForm}>
              + Add Menu Category
            </button>
          </div>
        )}
      </section>

      {error && <p className="menu-error">{error}</p>}

      {isAdmin && showCategoryForm && (
        <section className="menu-form-card">
          <div className="menu-form-header">
            <h2>Add Menu Category</h2>

            <button type="button" onClick={closeCategoryForm}>
              ×
            </button>
          </div>

          <form onSubmit={handleCreateCategory} className="category-form">
            <div className="menu-form-field">
              <label>Category Name</label>

              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Hot Coffee"
              />
            </div>

            <button type="submit" disabled={savingCategory}>
              {savingCategory ? "Adding..." : "Add Category"}
            </button>
          </form>
        </section>
      )}

      {isAdmin && showProductForm && (
        <section className="menu-form-card">
          <div className="menu-form-header">
            <h2>{editingProduct ? "Edit Menu Item" : "Add Menu Item"}</h2>

            <button type="button" onClick={closeProductForm}>
              ×
            </button>
          </div>

          <form onSubmit={handleProductSubmit} className="menu-form">
            <div className="menu-form-field">
              <label>Name</label>

              <input
                name="name"
                value={form.name}
                onChange={handleProductFormChange}
                placeholder="Latte"
              />
            </div>

            <div className="menu-form-field">
              <label>Price</label>

              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleProductFormChange}
                placeholder="120"
              />
            </div>

            <div className="menu-form-field">
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

            <div className="menu-form-field">
              <label>Image</label>

              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            <div className="menu-form-field full">
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

                <div className="menu-form-field full">
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
                : "Add Menu Item"}
            </button>
          </form>
        </section>
      )}

      <section className="menu-content">
        {loading ? (
          <p>Loading menu...</p>
        ) : products.length === 0 ? (
          <p>No menu items yet.</p>
        ) : (
          <div className="menu-grid">
            {products.map((product) => (
              <article key={product.id} className="menu-item-card">
                {product.imageUrl && (
                  <div className="menu-item-image">
                    <img
                      src={getFullImageUrl(product.imageUrl)}
                      alt={product.name}
                    />
                  </div>
                )}

                <div className="menu-item-content">
                  <div className="menu-item-top">
                    <h3>{product.name}</h3>
                    <span>{Number(product.price).toFixed(2)} TL</span>
                  </div>

                  <p className="menu-category">{product.category.name}</p>

                  {product.description && (
                    <p className="menu-description">{product.description}</p>
                  )}

                  {isAdmin && (
                    <button
                      className="edit-menu-button"
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

export default MenuPage;