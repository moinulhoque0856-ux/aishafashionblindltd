let currentCategory = 'vertical';
let editingId = null;
let products = { vertical: [], thai: [], aluminum: [], kai: [] };
const API = 'https://aishafashionblindltd.onrender.com/api';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    await fetchProducts();
    setupEventListeners();
}

function setupEventListeners() {
    // Navigation menu
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) {
                switchPage(page);
            }
        });
    });

    // Hamburger menu
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            document.querySelector('.nav-links').classList.toggle('active');
        });
    }

    // Admin panel
    const openAdminBtn = document.getElementById('openAdminBtn');
    if (openAdminBtn) {
        openAdminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const pass = prompt("Admin Password:");
            if (pass === "aish11##@") {
                document.getElementById('adminModal').style.display = 'flex';
                renderAdminProducts(currentCategory);
            } else if (pass !== null) {
                alert("Wrong password!");
            }
        });
    }

    const closeAdminBtn = document.getElementById('closeAdminBtn');
    if (closeAdminBtn) {
        closeAdminBtn.addEventListener('click', () => {
            document.getElementById('adminModal').style.display = 'none';
        });
    }

    // Admin tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.cat;
            renderAdminProducts(currentCategory);
        });
    });

    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Product modal
    const closeProductModal = document.getElementById('closeProductModal');
    if (closeProductModal) {
        closeProductModal.addEventListener('click', () => {
            document.getElementById('productModal').style.display = 'none';
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const adminModal = document.getElementById('adminModal');
        const productModal = document.getElementById('productModal');
        if (e.target === adminModal) {
            adminModal.style.display = 'none';
        }
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
    });
}

function switchPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const activePage = document.getElementById(`${pageName}-page`);
    if (activePage) {
        activePage.classList.add('active');
    }
    
    // Update active class on nav links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });
    
    // Close mobile menu if open
    document.querySelector('.nav-links').classList.remove('active');
}

async function fetchProducts() {
    try {
        const response = await fetch(`${API}/gallery`);
        if (response.ok) {
            products = await response.json();
            renderGrids();
        } else {
            console.error('Failed to fetch products');
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function renderGrids() {
    const categories = ['vertical', 'thai', 'aluminum', 'kai'];
    categories.forEach(cat => {
        const container = document.getElementById(`${cat}-grid`);
        if (container) {
            const catData = products[cat] || [];
            if (!catData.length) {
                container.innerHTML = '<div class="empty">No products available</div>';
            } else {
                container.innerHTML = catData.map(product => `
                    <div class="product-card" onclick="viewProduct('${cat}', ${product.id})">
                        ${product.image ? 
                            `<img src="${product.image}" alt="${product.name}">` : 
                            '<div class="no-image-placeholder">No Image Available</div>'}
                        <div class="product-info">
                            <h3>${escapeHtml(product.name)}</h3>
                            <div class="price">৳ ${escapeHtml(product.price)}</div>
                        </div>
                    </div>
                `).join('');
            }
        }
    });
}

function renderAdminProducts(category) {
    const container = document.getElementById('adminProductsList');
    if (!container) return;
    
    const catData = products[category] || [];
    if (!catData.length) {
        container.innerHTML = '<div class="empty">No products in this category</div>';
        return;
    }
    
    container.innerHTML = catData.map(product => `
        <div class="admin-product-item">
            <div>
                <strong>${escapeHtml(product.name)}</strong><br>
                <small>Price: ৳ ${escapeHtml(product.price)}</small>
                ${product.description ? `<br><small>${escapeHtml(product.description)}</small>` : ''}
            </div>
            <button onclick="deleteProduct('${category}', ${product.id})" class="delete-btn">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `).join('');
}

async function handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const description = document.getElementById('productDescription').value;
    const imageFile = document.getElementById('productImage').files[0];
    
    if (!name || !price) {
        alert('Please fill in product name and price');
        return;
    }
    
    let imageUrl = '';
    
    // Upload image if selected
    if (imageFile) {
        const statusDiv = document.getElementById('uploadStatus');
        statusDiv.innerHTML = '📤 Uploading image...';
        statusDiv.style.color = '#d97706';
        
        const formData = new FormData();
        formData.append('image', imageFile);
        
        try {
            const uploadResponse = await fetch(`${API}/upload`, {
                method: 'POST',
                body: formData
            });
            
            if (uploadResponse.ok) {
                const uploadResult = await uploadResponse.json();
                imageUrl = uploadResult.url;
                statusDiv.innerHTML = '✅ Image uploaded successfully!';
                statusDiv.style.color = '#10b981';
            } else {
                const error = await uploadResponse.json();
                statusDiv.innerHTML = `❌ Upload failed: ${error.error || 'Unknown error'}`;
                statusDiv.style.color = '#ef4444';
                return;
            }
        } catch (error) {
            console.error('Upload error:', error);
            statusDiv.innerHTML = `❌ Network error: ${error.message}`;
            statusDiv.style.color = '#ef4444';
            return;
        }
    }
    
    // Add product
    const productData = {
        name: name,
        price: price,
        description: description || '',
        image: imageUrl
    };
    
    try {
        const response = await fetch(`${API}/gallery/${currentCategory}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert('✅ Product added successfully!');
            document.getElementById('addProductForm').reset();
            document.getElementById('uploadStatus').innerHTML = '';
            await fetchProducts();
            renderAdminProducts(currentCategory);
        } else {
            const error = await response.json();
            alert(`Failed to add product: ${error.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product. Check console for details.');
    }
}

async function deleteProduct(category, productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API}/gallery/${category}/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await fetchProducts();
            renderAdminProducts(currentCategory);
        } else {
            alert('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
    }
}

function viewProduct(category, productId) {
    const product = products[category].find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const modalDetails = document.getElementById('modalDetails');
    
    modalDetails.innerHTML = `
        <div style="text-align: center;">
            ${product.image ? 
                `<img src="${product.image}" alt="${product.name}" style="max-width: 100%; border-radius: 12px; margin-bottom: 1rem;">` : 
                '<div style="background: #f3f4f6; padding: 3rem; border-radius: 12px; margin-bottom: 1rem;">No Image Available</div>'}
            <h2>${escapeHtml(product.name)}</h2>
            <div class="price" style="font-size: 2rem; margin: 1rem 0;">৳ ${escapeHtml(product.price)}</div>
            ${product.description ? `<p style="color: #6b7280;">${escapeHtml(product.description)}</p>` : ''}
            <a href="https://wa.me/8801716437372?text=I'm%20interested%20in%20${encodeURIComponent(product.name)}" 
               class="whatsapp-btn" 
               style="display: inline-block; margin-top: 1.5rem;" 
               target="_blank">
                <i class="fab fa-whatsapp"></i> Order on WhatsApp
            </a>
        </div>
    `;
    
    modal.style.display = 'flex';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions global for onclick handlers
window.viewProduct = viewProduct;
window.deleteProduct = deleteProduct;