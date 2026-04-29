import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import Cropper from "react-easy-crop";
import { useAuth } from "../context/AuthContext";
import {
  getMenuProducts,
  getMenuCategories,
  createMenuCategory,
  createMenuProduct,
  updateMenuProduct,
  deleteMenuProduct,
  deleteMenuCategory,
  type MenuProduct,
  type Category,
} from "../api/menuApi";
import { getImageUrl } from "../api/config";
import { getCroppedImageFile } from "../utils/cropImage";
import "../styles/MenuPage.css";

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

function MenuPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<MenuProduct | null>(null);

  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showManageCategories, setShowManageCategories] = useState(false);

  const [categoryName, setCategoryName] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);

  const [error, setError] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceSort, setPriceSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);

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
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }

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
    setShowManageCategories(false);
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
    setShowManageCategories(false);
  };

  const closeProductForm = () => {
    if (form.imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(form.imagePreview);
    }

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
    setShowManageCategories(false);
  };

  const closeCategoryForm = () => {
    setShowCategoryForm(false);
    setCategoryName("");
    setError("");
  };

  const toggleManageCategories = () => {
    setError("");
    setShowManageCategories((current) => !current);
    setShowProductForm(false);
    setShowCategoryForm(false);
  };

  const handleCreateCategory = async (e: FormEvent<HTMLFormElement>) => {
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

  const handleProductSubmit = async (e: FormEvent<HTMLFormElement>) => {
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

  const handleDeleteProduct = async (product: MenuProduct) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteMenuProduct(product.id);
      await loadMenuData();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}" category?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteMenuCategory(category.id);

      if (selectedCategoryId === String(category.id)) {
        setSelectedCategoryId("all");
      }

      await loadMenuData();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong.");
      }
    }
  };

  const clearFilters = () => {
    setSelectedCategoryId("all");
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setPriceSort("default");
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const productPrice = Number(product.price);
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const matchesCategory =
          selectedCategoryId === "all" ||
          product.categoryId === Number(selectedCategoryId);

        const matchesSearch =
          normalizedSearch === "" ||
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.description?.toLowerCase().includes(normalizedSearch);

        const matchesMinPrice =
          minPrice === "" || productPrice >= Number(minPrice);

        const matchesMaxPrice =
          maxPrice === "" || productPrice <= Number(maxPrice);

        return (
          matchesCategory &&
          matchesSearch &&
          matchesMinPrice &&
          matchesMaxPrice
        );
      })
      .sort((a, b) => {
        if (priceSort === "low-to-high") {
          return Number(a.price) - Number(b.price);
        }

        if (priceSort === "high-to-low") {
          return Number(b.price) - Number(a.price);
        }

        return 0;
      });
  }, [products, selectedCategoryId, searchTerm, minPrice, maxPrice, priceSort]);

  const selectedCategoryName =
    selectedCategoryId === "all"
      ? "All Menu"
      : categories.find((category) => String(category.id) === selectedCategoryId)
          ?.name || "Menu";

  const activeAdvancedFilterCount = [
    searchTerm.trim() !== "",
    minPrice !== "",
    maxPrice !== "",
    priceSort !== "default",
  ].filter(Boolean).length;

  return (
    <main className="menu-page">
      <section className="menu-hero">
        <p className="menu-label">Our Menu</p>

        <h1>Fresh coffee, simple prices</h1>

        <p>
          Explore our drinks, desserts, and cafe favorites. These items are
          shown for customers to view prices.
        </p>

        {isAdmin && (
          <div className="admin-menu-actions">
            <button className="admin-add-button" onClick={openAddProductForm}>
              + Add Menu Item
            </button>

            <button className="admin-category-button" onClick={openCategoryForm}>
              + Add Category
            </button>

            <button
              className="admin-manage-button"
              onClick={toggleManageCategories}
            >
              Manage Categories
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

      {isAdmin && showManageCategories && (
        <section className="menu-form-card manage-category-card">
          <div className="menu-form-header">
            <h2>Manage Categories</h2>

            <button type="button" onClick={() => setShowManageCategories(false)}>
              ×
            </button>
          </div>

          {categories.length === 0 ? (
            <p className="admin-empty-text">No categories yet.</p>
          ) : (
            <div className="manage-category-list">
              {categories.map((category) => (
                <div key={category.id} className="manage-category-row">
                  <span>{category.name}</span>

                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
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

            {editingProduct && form.imagePreview && !form.image && (
              <div className="current-image-preview">
                <p>Current Image</p>
                <img src={form.imagePreview} alt={form.name} />
              </div>
            )}

            {form.image && form.imagePreview && (
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

      <section className="menu-main">
        <div className="menu-toolbar">
          <div className="menu-toolbar-top">
            <div className="category-tabs">
              <button
                className={selectedCategoryId === "all" ? "active" : ""}
                onClick={() => setSelectedCategoryId("all")}
                type="button"
              >
                All Menu
              </button>

              {categories.map((category) => (
                <button
                  key={category.id}
                  className={
                    selectedCategoryId === String(category.id) ? "active" : ""
                  }
                  onClick={() => setSelectedCategoryId(String(category.id))}
                  type="button"
                >
                  {category.name}
                </button>
              ))}
            </div>

            <button
              className={`menu-filter-toggle ${showFilters ? "active" : ""}`}
              onClick={() => setShowFilters((current) => !current)}
              type="button"
              aria-expanded={showFilters}
            >
              {showFilters
                ? "Hide Filters"
                : `Filters${
                    activeAdvancedFilterCount > 0
                      ? ` (${activeAdvancedFilterCount})`
                      : ""
                  }`}
            </button>
          </div>

          {showFilters && (
            <div className="menu-filter-panel">
              <div className="menu-result-summary">
                <p>Showing</p>
                <h2>
                  {loading
                    ? "Loading..."
                    : `${filteredProducts.length} ${
                        filteredProducts.length === 1 ? "item" : "items"
                      }`}
                </h2>
                <span>{selectedCategoryName}</span>
              </div>

              <div className="menu-controls">
                <div className="menu-search-field">
                  <label>Search</label>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search coffee, dessert..."
                  />
                </div>

                <div className="price-filter-field">
                  <label>Min Price</label>
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="price-filter-field">
                  <label>Max Price</label>
                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="300"
                  />
                </div>

                <div className="price-filter-field">
                  <label>Sort</label>
                  <select
                    value={priceSort}
                    onChange={(e) => setPriceSort(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                  </select>
                </div>

                <button
                  className="clear-filter-button"
                  onClick={clearFilters}
                  type="button"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <p className="menu-status-text">Loading menu...</p>
        ) : products.length === 0 ? (
          <p className="menu-status-text">No menu items yet.</p>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-filter-result">
            <h3>No items found</h3>
            <p>Try changing the category, search text, or price filters.</p>
            <button onClick={clearFilters} type="button">
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredProducts.map((product) => (
              <article key={product.id} className="menu-item-card">
                {product.imageUrl ? (
                  <div className="menu-item-image">
                    <img
                      src={getFullImageUrl(product.imageUrl)}
                      alt={product.name}
                    />
                  </div>
                ) : (
                  <div className="menu-item-image menu-item-placeholder">
                    <span>{product.name.charAt(0)}</span>
                  </div>
                )}

                <div className="menu-item-content">
                  <div className="menu-item-top">
                    <h3>{product.name}</h3>
                    <span>{Number(product.price).toFixed(2)} TL</span>
                  </div>

                  {isAdmin && (
                    <div className="menu-item-admin-actions">
                      <button
                        className="edit-menu-button"
                        onClick={() => openEditProductForm(product)}
                        type="button"
                      >
                        Edit Item
                      </button>

                      <button
                        className="delete-menu-button"
                        onClick={() => handleDeleteProduct(product)}
                        type="button"
                      >
                        Delete Item
                      </button>
                    </div>
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
