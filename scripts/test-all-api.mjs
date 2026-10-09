import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'venthulir_royal_reserves_secret_key_2026';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

let passedCount = 0;
let failedCount = 0;
const results = [];

function recordTest(suite, name, passed, details = '') {
  if (passed) {
    passedCount++;
    console.log(`  ${colors.green}✓ [PASS]${colors.reset} ${name}`);
  } else {
    failedCount++;
    console.log(`  ${colors.red}✗ [FAIL]${colors.reset} ${name} ${details ? `(${details})` : ''}`);
  }
  results.push({ suite, name, passed, details });
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  return { status: res.status, data, headers: res.headers };
}

function generateAdminToken() {
  return jwt.sign(
    {
      id: 'admin_test_id_99999',
      name: 'Venthulir Administrator',
      email: 'admin@venthulir.com',
      isAdmin: true,
      role: 'admin',
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

async function waitForServer(maxRetries = 20, delayMs = 1500) {
  console.log(`${colors.cyan}Connecting to Next.js API server at ${BASE_URL}...${colors.reset}`);
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/categories`);
      if (res.status >= 200 && res.status < 500) {
        console.log(`${colors.green}✓ Server is ready and accepting requests!${colors.reset}\n`);
        return true;
      }
    } catch (e) {
      // retry
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error('Server did not become ready in time.');
}

async function runAllTests() {
  console.log(`\n${colors.bright}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}   VENTHULIR ORGANIC HARVEST - ENDPOINT & TRANSACTION TEST SUITE         ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}========================================================================${colors.reset}\n`);

  await waitForServer();

  const adminToken = generateAdminToken();
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const testUserEmail = `patron_${randomSuffix}@testventhulir.com`;
  const testUserPassword = 'SecurePassword123!';
  let customerToken = '';
  let customerId = '';
  let testProductId = '';
  let testProductCode = '';
  let testCouponCode = `TEST${randomSuffix.toString().slice(-4)}`;
  let testOfferId = '';
  let testOrderId = '';
  let testMessageId = '';

  // -------------------------------------------------------------
  // SUITE 1: AUTHENTICATION & USER MANAGEMENT
  // -------------------------------------------------------------
  console.log(`\n${colors.yellow}▶ SUITE 1: Authentication & Patron Lifecycle Endpoints${colors.reset}`);

  // 1.1 Send Register OTP
  try {
    const res = await request('/api/auth/send-register-otp', {
      method: 'POST',
      body: JSON.stringify({ phone: '9876543210' }),
    });
    recordTest('Auth', 'POST /api/auth/send-register-otp (Dispatch registration OTP)', res.status === 200 || res.status === 201 || !!res.data?.success || !!res.data?.msg);
  } catch (err) {
    recordTest('Auth', 'POST /api/auth/send-register-otp', false, err.message);
  }

  // 1.2 User Registration
  try {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Organic Patron',
        email: testUserEmail,
        password: testUserPassword,
        phone: '9876543210',
      }),
    });
    const ok = (res.status === 200 || res.status === 201) && !!res.data?.token;
    if (ok) {
      customerToken = res.data.token;
      customerId = res.data.user?.id || res.data.user?._id;
    }
    recordTest('Auth', 'POST /api/auth/register (Create new customer account with JWT)', ok, `Status ${res.status}`);
  } catch (err) {
    recordTest('Auth', 'POST /api/auth/register', false, err.message);
  }

  // 1.3 Duplicate Registration Prevention
  try {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Duplicate Patron',
        email: testUserEmail,
        password: testUserPassword,
      }),
    });
    recordTest('Auth', 'POST /api/auth/register (Prevent duplicate email registration)', res.status === 400);
  } catch (err) {
    recordTest('Auth', 'POST /api/auth/register duplicate guard', false, err.message);
  }

  // 1.4 User Login (Success)
  try {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUserEmail,
        password: testUserPassword,
      }),
    });
    const ok = res.status === 200 && !!res.data?.token;
    if (ok) {
      customerToken = res.data.token;
    }
    recordTest('Auth', 'POST /api/auth/login (Valid credentials return JWT token)', ok);
  } catch (err) {
    recordTest('Auth', 'POST /api/auth/login', false, err.message);
  }

  const customerHeaders = { Authorization: `Bearer ${customerToken}` };

  // 1.5 User Login (Invalid credentials rejection)
  try {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testUserEmail,
        password: 'WrongPassword999!',
      }),
    });
    recordTest('Auth', 'POST /api/auth/login (Reject invalid password with 400/401)', res.status === 400 || res.status === 401);
  } catch (err) {
    recordTest('Auth', 'POST /api/auth/login invalid check', false, err.message);
  }

  // 1.6 Current User Profile (GET /api/auth/me)
  try {
    const res = await request('/api/auth/me', {
      method: 'GET',
      headers: customerHeaders,
    });
    recordTest('Auth', 'GET /api/auth/me (Protected: Get current patron profile)', res.status === 200 && res.data?.email === testUserEmail);
  } catch (err) {
    recordTest('Auth', 'GET /api/auth/me', false, err.message);
  }

  // 1.7 Profile Update (PUT /api/auth/profile)
  try {
    const res = await request('/api/auth/profile', {
      method: 'PUT',
      headers: customerHeaders,
      body: JSON.stringify({
        name: 'Organic Patron Updated',
        phone: '9876543211',
      }),
    });
    recordTest('Auth', 'PUT /api/auth/profile (Update patron name & phone)', res.status === 200);
  } catch (err) {
    recordTest('Auth', 'PUT /api/auth/profile', false, err.message);
  }

  // 1.8 Delivery Address Management (PUT /api/auth/address)
  try {
    const resAdd = await request('/api/auth/address', {
      method: 'PUT',
      headers: customerHeaders,
      body: JSON.stringify({
        address: '123 Herbal Garden Lane',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        zipCode: '641001',
      }),
    });
    recordTest('Auth', 'PUT /api/auth/address (Save/Update delivery address)', resAdd.status === 200 && !!resAdd.data?.deliveryAddress);
  } catch (err) {
    recordTest('Auth', 'Address PUT', false, err.message);
  }

  // 1.9 Send Login OTP
  try {
    const res = await request('/api/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail }),
    });
    recordTest('Auth', 'POST /api/auth/send-otp (Send login OTP email)', res.status === 200 || !!res.data?.msg);
  } catch (err) {
    recordTest('Auth', 'POST /api/auth/send-otp', false, err.message);
  }

  // 1.10 Forgot Password Request
  try {
    const res = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: testUserEmail }),
    });
    recordTest('Auth', 'POST /api/auth/forgot-password (Trigger password reset)', res.status === 200 || !!res.data?.msg);
  } catch (err) {
    recordTest('Auth', 'POST /api/auth/forgot-password', false, err.message);
  }

  // -------------------------------------------------------------
  // SUITE 2: CATEGORIES API
  // -------------------------------------------------------------
  console.log(`\n${colors.yellow}▶ SUITE 2: Categories Endpoints${colors.reset}`);
  try {
    const res = await request('/api/categories');
    recordTest('Categories', 'GET /api/categories (Fetch distinct product categories)', res.status === 200 && Array.isArray(res.data));
  } catch (err) {
    recordTest('Categories', 'GET /api/categories', false, err.message);
  }

  // -------------------------------------------------------------
  // SUITE 3: PRODUCTS API & INVENTORY MANAGEMENT
  // -------------------------------------------------------------
  console.log(`\n${colors.yellow}▶ SUITE 3: Products Catalog & Inventory Endpoints${colors.reset}`);

  // 3.1 Public Products Listing
  try {
    const res = await request('/api/products');
    const hasProducts = res.status === 200 && (Array.isArray(res.data?.products) || Array.isArray(res.data));
    recordTest('Products', 'GET /api/products (Public catalog with caching & pagination)', hasProducts);
  } catch (err) {
    recordTest('Products', 'GET /api/products', false, err.message);
  }

  // 3.2 Security Guard: Customer forbidden from creating product
  try {
    const res = await request('/api/products', {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify({ name: 'Hacked Item', price: 10 }),
    });
    recordTest('Products', 'POST /api/products (Security Guard: 403 Forbidden for non-admin)', res.status === 403 || res.status === 401);
  } catch (err) {
    recordTest('Products', 'POST /api/products RBAC guard', false, err.message);
  }

  // 3.3 Create Product as Admin
  try {
    const newProductPayload = {
      name: `Farm Fresh Moringa Elixir ${randomSuffix}`,
      category: 'Herbal Care',
      price: 299,
      originalPrice: 399,
      description: 'Pure cold-extracted organic moringa leaf extract for vitality.',
      stock: 50,
      currentStock: 50,
      inStock: true,
      badge: 'Bestseller',
      benefits: ['Immunity Booster', 'Rich in Antioxidants'],
      variants: [
        { label: '250ml', price: 299, stock: 30 },
        { label: '500ml', price: 549, stock: 20 },
      ],
      imageUrl: '/images/products/moringa.jpg',
    };
    const res = await request('/api/products', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify(newProductPayload),
    });
    const ok = (res.status === 201 || res.status === 200) && res.data?._id;
    if (ok) {
      testProductId = res.data._id;
      testProductCode = res.data.productCode;
    }
    recordTest('Products', `POST /api/products (Create product with variants & auto-generated SKU: ${testProductCode || 'N/A'})`, ok);
  } catch (err) {
    recordTest('Products', 'POST /api/products admin create', false, err.message);
  }

  // 3.4 Get Product by ID
  if (testProductId) {
    try {
      const res = await request(`/api/products/${testProductId}`);
      recordTest('Products', `GET /api/products/:id (Fetch product detail: ${testProductId})`, res.status === 200 && res.data?._id === testProductId);
    } catch (err) {
      recordTest('Products', 'GET /api/products/:id', false, err.message);
    }

    // 3.5 Update Product
    try {
      const res = await request(`/api/products/${testProductId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({
          name: `Farm Fresh Moringa Elixir ${randomSuffix} (Premium Batch)`,
          price: 319,
          stock: 45,
          currentStock: 45,
        }),
      });
      recordTest('Products', 'PUT /api/products/:id (Update product price & inventory)', res.status === 200 && res.data?.price === 319);
    } catch (err) {
      recordTest('Products', 'PUT /api/products/:id', false, err.message);
    }
  }

  // -------------------------------------------------------------
  // SUITE 4: COUPONS & DISCOUNT ENGINE
  // -------------------------------------------------------------
  console.log(`\n${colors.yellow}▶ SUITE 4: Coupons & Discount Validation Endpoints${colors.reset}`);

  // 4.1 Create Coupon (Admin)
  try {
    const res = await request('/api/coupons', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        couponCode: testCouponCode,
        discountPercentage: 15,
        maxUses: 100,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Active',
      }),
    });
    recordTest('Coupons', `POST /api/coupons (Admin create discount coupon ${testCouponCode})`, res.status === 201 || res.status === 200);
  } catch (err) {
    recordTest('Coupons', 'POST /api/coupons', false, err.message);
  }

  // 4.2 List Coupons (Admin)
  try {
    const res = await request('/api/coupons', {
      method: 'GET',
      headers: adminHeaders,
    });
    recordTest('Coupons', 'GET /api/coupons (Admin fetch coupons list)', res.status === 200 && Array.isArray(res.data));
  } catch (err) {
    recordTest('Coupons', 'GET /api/coupons', false, err.message);
  }

  // 4.3 Apply Valid Coupon
  try {
    const res = await request('/api/coupons/apply', {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify({
        code: testCouponCode,
        customerEmail: testUserEmail,
      }),
    });
    const valid = res.status === 200 && res.data?.valid === true && res.data?.discountPercentage === 15;
    recordTest('Coupons', 'POST /api/coupons/apply (Validate coupon & calculate discount)', valid);
  } catch (err) {
    recordTest('Coupons', 'POST /api/coupons/apply', false, err.message);
  }

  // 4.4 Apply Invalid Coupon (Should reject with 404 or 400)
  try {
    const res = await request('/api/coupons/apply', {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify({
        code: 'INVALIDCODE9999',
        customerEmail: testUserEmail,
      }),
    });
    recordTest('Coupons', 'POST /api/coupons/apply (Reject invalid/non-existent coupon code)', res.status === 404 || res.status === 400);
  } catch (err) {
    recordTest('Coupons', 'POST /api/coupons/apply invalid guard', false, err.message);
  }

  // -------------------------------------------------------------
  // SUITE 5: OFFERS & PROMOTIONAL BANNERS
  // -------------------------------------------------------------
  console.log(`\n${colors.yellow}▶ SUITE 5: Offers & Promotional Banners Endpoints${colors.reset}`);

  // 5.1 Public Offers
  try {
    const res = await request('/api/offers');
    recordTest('Offers', 'GET /api/offers (Public fetch active banner announcements)', res.status === 200 && Array.isArray(res.data));
  } catch (err) {
    recordTest('Offers', 'GET /api/offers', false, err.message);
  }

  // 5.2 Create Offer (Admin)
  try {
    const res = await request('/api/offers', {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: `Harvest Festival Combo ${randomSuffix}`,
        description: 'Get cold pressed organic sesame oil and farm turmeric powder combo',
        price: 499,
        offerPrice: 399,
        category: 'Combo Pack',
        badge: 'Festival Special',
        stock: 50,
        startDate: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: '/images/offers/combo.jpg',
      }),
    });
    const ok = (res.status === 201 || res.status === 200) && (res.data?.offer?._id || res.data?._id);
    if (ok) testOfferId = res.data?.offer?._id || res.data?._id;
    recordTest('Offers', 'POST /api/offers (Admin create promo offer banner)', ok);
  } catch (err) {
    recordTest('Offers', 'POST /api/offers', false, err.message);
  }

  // -------------------------------------------------------------
  // SUITE 6: ORDERS API & INVENTORY TRANSACTION PIPELINE
  // -------------------------------------------------------------
  console.log(`\n${colors.yellow}▶ SUITE 6: Orders Pipeline & Atomic Stock Transactions${colors.reset}`);

  let initialStock = 0;
  if (testProductId) {
    const prodRes = await request(`/api/products/${testProductId}`);
    initialStock = prodRes.data?.stock || prodRes.data?.currentStock || 0;
  }

  // 6.1 Place Order with Coupon & Stock Deduction Transaction
  try {
    const orderPayload = {
      customerName: 'Organic Patron',
      customerEmail: testUserEmail,
      phone: '9876543210',
      deliveryAddress: {
        address: '123 Farm House Rd',
        city: 'Pollachi',
        state: 'Tamil Nadu',
        pincode: '642001',
      },
      items: [
        {
          productId: testProductId,
          product: testProductId,
          name: 'Farm Fresh Moringa Elixir',
          price: 319,
          quantity: 2,
          image: '/images/products/moringa.jpg',
        },
      ],
      couponCode: testCouponCode,
      originalAmount: 638,
      discountAmount: 95,
      shippingCharge: 0,
      totalAmount: 543,
      paymentMethod: 'Cash on Delivery',
    };

    const res = await request('/api/orders', {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify(orderPayload),
    });

    const ok = (res.status === 201 || res.status === 200) && res.data?.order?._id;
    if (ok) testOrderId = res.data.order._id;
    recordTest('Orders', 'POST /api/orders (Execute atomic order transaction & checkout)', ok, `Order ID: ${testOrderId}`);
  } catch (err) {
    recordTest('Orders', 'POST /api/orders', false, err.message);
  }

  // 6.2 Verify Atomic Stock Reduction in Database
  if (testProductId && testOrderId) {
    try {
      const prodRes = await request(`/api/products/${testProductId}`);
      const currentStock = prodRes.data?.stock ?? prodRes.data?.currentStock;
      const expectedStock = initialStock - 2;
      const stockDeducted = currentStock === expectedStock;
      recordTest(
        'Orders',
        `Stock Deduction Verification (Initial: ${initialStock} -> Current: ${currentStock}, Expected: ${expectedStock})`,
        stockDeducted
      );
    } catch (err) {
      recordTest('Orders', 'Stock deduction verification', false, err.message);
    }
  }

  // 6.3 Prevent Re-use of Single-use Coupon by Same Customer
  try {
    const orderPayload2 = {
      customerName: 'Organic Patron',
      customerEmail: testUserEmail,
      phone: '9876543210',
      deliveryAddress: { address: '123 Farm House', city: 'Pollachi', pincode: '642001' },
      items: [{ productId: testProductId, product: testProductId, name: 'Moringa', price: 319, quantity: 1 }],
      couponCode: testCouponCode, // Same coupon used again
      totalAmount: 319,
    };
    const res = await request('/api/orders', {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify(orderPayload2),
    });
    recordTest('Orders', 'POST /api/orders (Prevent customer re-using already redeemed coupon)', res.status === 400);
  } catch (err) {
    recordTest('Orders', 'Coupon re-use check', false, err.message);
  }

  // 6.4 Customer Order History (GET /api/orders/my-orders)
  try {
    const res = await request('/api/orders/my-orders', {
      method: 'GET',
      headers: customerHeaders,
    });
    recordTest('Orders', 'GET /api/orders/my-orders (Patron fetches personal order history)', res.status === 200 && Array.isArray(res.data) && res.data.length > 0);
  } catch (err) {
    recordTest('Orders', 'GET /api/orders/my-orders', false, err.message);
  }

  // 6.5 Admin Orders Query (GET /api/orders)
  try {
    const res = await request('/api/orders', {
      method: 'GET',
      headers: adminHeaders,
    });
    recordTest('Orders', 'GET /api/orders (Admin list all system orders)', res.status === 200 && Array.isArray(res.data));
  } catch (err) {
    recordTest('Orders', 'GET /api/orders', false, err.message);
  }

  // 6.6 Single Order Details Query (GET /api/orders/:id)
  if (testOrderId) {
    try {
      const res = await request(`/api/orders/${testOrderId}`, {
        method: 'GET',
        headers: customerHeaders,
      });
      recordTest('Orders', `GET /api/orders/:id (Retrieve specific order details #${testOrderId.slice(-6)})`, res.status === 200 && res.data?._id === testOrderId);
    } catch (err) {
      recordTest('Orders', 'GET /api/orders/:id', false, err.message);
    }

    // 6.7 Admin Status Transition: Pending -> Shipped
    try {
      const res = await request(`/api/orders/${testOrderId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ status: 'Shipped', trackingNumber: 'TRK998877' }),
      });
      const ok = res.status === 200 && (res.data?.order?.status === 'Shipped' || res.data?.status === 'Shipped');
      recordTest('Orders', 'PUT /api/orders/:id (Admin update status to Shipped)', ok);
    } catch (err) {
      recordTest('Orders', 'PUT /api/orders/:id update status', false, err.message);
    }

    // 6.8 Admin Status Transition: Shipped -> Cancelled (Triggers Automatic Stock Restoration)
    try {
      const res = await request(`/api/orders/${testOrderId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ status: 'Cancelled' }),
      });
      const ok = res.status === 200 && (res.data?.order?.status === 'Cancelled' || res.data?.status === 'Cancelled');
      recordTest('Orders', 'PUT /api/orders/:id (Cancel order & trigger auto-stock restoration)', ok);
    } catch (err) {
      recordTest('Orders', 'PUT /api/orders/:id cancel status', false, err.message);
    }

    // 6.9 Verify Automatic Stock Restored
    if (testProductId) {
      try {
        const prodRes = await request(`/api/products/${testProductId}`);
        const currentStock = prodRes.data?.stock ?? prodRes.data?.currentStock;
        const restored = currentStock === initialStock;
        recordTest(
          'Orders',
          `Inventory Auto-Restore Verification (Stock restored back to initial level: ${currentStock} === ${initialStock})`,
          restored
        );
      } catch (err) {
        recordTest('Orders', 'Inventory auto-restore verification', false, err.message);
      }
    }
  }

  // -------------------------------------------------------------
  // SUITE 7: PAYMENT GATEWAY ENDPOINTS (RAZORPAY)
  // -------------------------------------------------------------
  console.log(`\n${colors.yellow}▶ SUITE 7: Payment Gateway Endpoints${colors.reset}`);

  // 7.1 Razorpay Order Creation
  try {
    const res = await request('/api/payment/create-order', {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify({
        amount: 599,
        currency: 'INR',
        receipt: `receipt_${randomSuffix}`,
      }),
    });
    const valid = res.status === 200 || res.status === 201 || (res.data && res.data.id);
    recordTest('Payment', 'POST /api/payment/create-order (Generate Razorpay gateway order)', valid, `Status ${res.status}`);
  } catch (err) {
    recordTest('Payment', 'POST /api/payment/create-order', false, err.message);
  }

  // 7.2 Payment Verification Guard
  try {
    const res = await request('/api/payment/verify', {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify({
        razorpay_order_id: 'order_test_fake',
        razorpay_payment_id: 'pay_test_fake',
        razorpay_signature: 'fake_signature_hash',
      }),
    });
    recordTest('Payment', 'POST /api/payment/verify (Signature validation & tamper protection)', res.status === 400 || res.status === 401);
  } catch (err) {
    recordTest('Payment', 'POST /api/payment/verify signature guard', false, err.message);
  }

  // -------------------------------------------------------------
  // SUITE 8: CONTACT & MESSAGES API
  // -------------------------------------------------------------
  console.log(`\n${colors.yellow}▶ SUITE 8: Contact & Inquiries Endpoints${colors.reset}`);

  // 8.1 Submit Public Message
  try {
    const res = await request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'Senthil Kumar',
        customerEmail: 'senthil@example.com',
        message: 'Interested in ordering 50 units of Cold Pressed Sesame Oil for our store in Chennai.',
      }),
    });
    recordTest('Messages', 'POST /api/messages (Submit customer inquiry/feedback)', res.status === 201 || res.status === 200 || res.data?.msg === 'Success');
  } catch (err) {
    recordTest('Messages', 'POST /api/messages', false, err.message);
  }

  // 8.2 Admin List Messages
  try {
    const res = await request('/api/messages', {
      method: 'GET',
      headers: adminHeaders,
    });
    const hasList = res.status === 200 && Array.isArray(res.data);
    if (hasList && res.data.length > 0) {
      testMessageId = res.data[0]._id;
    }
    recordTest('Messages', 'GET /api/messages (Admin fetch inbox inquiries)', hasList);
  } catch (err) {
    recordTest('Messages', 'GET /api/messages', false, err.message);
  }

  // 8.3 Update Message Status
  if (testMessageId) {
    try {
      const res = await request(`/api/messages/${testMessageId}`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ status: 'Resolved' }),
      });
      recordTest('Messages', 'PATCH /api/messages/:id (Admin mark message as resolved)', res.status === 200 && res.data?.status === 'Resolved');
    } catch (err) {
      recordTest('Messages', 'PATCH /api/messages/:id', false, err.message);
    }
  }

  // -------------------------------------------------------------
  // SUITE 9: ADMIN DASHBOARD, STATS & SETTINGS
  // -------------------------------------------------------------
  console.log(`\n${colors.yellow}▶ SUITE 9: Admin Analytics, Customers & Settings Endpoints${colors.reset}`);

  // 9.1 Admin Analytics & Stats
  try {
    const res = await request('/api/admin/stats', {
      method: 'GET',
      headers: adminHeaders,
    });
    const hasMetrics = res.status === 200 && res.data && typeof res.data.totalRevenue !== 'undefined';
    recordTest('Admin', 'GET /api/admin/stats (Compute real-time sales, revenue & metrics)', hasMetrics);
  } catch (err) {
    recordTest('Admin', 'GET /api/admin/stats', false, err.message);
  }

  // 9.2 Admin Customers List
  try {
    const res = await request('/api/admin/users', {
      method: 'GET',
      headers: adminHeaders,
    });
    recordTest('Admin', 'GET /api/admin/users (Fetch patron database with aggregate stats)', res.status === 200 && Array.isArray(res.data));
  } catch (err) {
    recordTest('Admin', 'GET /api/admin/users', false, err.message);
  }

  // 9.3 Admin Store Settings (GET)
  try {
    const res = await request('/api/admin/settings', {
      method: 'GET',
      headers: adminHeaders,
    });
    recordTest('Admin', 'GET /api/admin/settings (Fetch store configuration & policies)', res.status === 200);
  } catch (err) {
    recordTest('Admin', 'GET /api/admin/settings', false, err.message);
  }

  // 9.4 Admin Store Settings (PUT)
  try {
    const res = await request('/api/admin/settings', {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        storeName: 'Venthulir Organic Harvest',
        deliveryPhone: '8778476414',
        freeDeliveryThreshold: 499,
      }),
    });
    recordTest('Admin', 'PUT /api/admin/settings (Update store configuration & threshold)', res.status === 200);
  } catch (err) {
    recordTest('Admin', 'PUT /api/admin/settings', false, err.message);
  }

  // -------------------------------------------------------------
  // SUITE 10: IMAGE UPLOAD & OPTIMIZATION API GUARD
  // -------------------------------------------------------------
  console.log(`\n${colors.yellow}▶ SUITE 10: Upload & Media Handler Endpoints${colors.reset}`);

  // 10.1 Upload Auth Guard
  try {
    const res = await request('/api/upload', {
      method: 'POST',
      headers: customerHeaders,
    });
    recordTest('Upload', 'POST /api/upload (Security Guard: 403 Forbidden for non-admin)', res.status === 403 || res.status === 401);
  } catch (err) {
    recordTest('Upload', 'POST /api/upload RBAC guard', false, err.message);
  }

  // -------------------------------------------------------------
  // SUITE 11: TEARDOWN & CLEANUP
  // -------------------------------------------------------------
  console.log(`\n${colors.yellow}▶ SUITE 11: Test Resources Cleanup & Teardown${colors.reset}`);

  // 11.1 Delete Test Product
  if (testProductId) {
    try {
      const res = await request(`/api/products/${testProductId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      recordTest('Cleanup', `DELETE /api/products/:id (Clean up test product #${testProductId.slice(-6)})`, res.status === 200);
    } catch (err) {
      recordTest('Cleanup', 'DELETE test product', false, err.message);
    }
  }

  // 11.2 Delete Test Coupon
  if (testCouponCode) {
    try {
      const resList = await request('/api/coupons', { headers: adminHeaders });
      const couponObj = resList.data?.find((c) => c.couponCode === testCouponCode);
      if (couponObj?._id) {
        const resDel = await request(`/api/coupons/${couponObj._id}`, {
          method: 'DELETE',
          headers: adminHeaders,
        });
        recordTest('Cleanup', `DELETE /api/coupons/:id (Clean up test coupon #${testCouponCode})`, resDel.status === 200);
      }
    } catch (err) {
      recordTest('Cleanup', 'DELETE test coupon', false, err.message);
    }
  }

  // 11.3 Delete Test Offer
  if (testOfferId) {
    try {
      const res = await request(`/api/offers/${testOfferId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      recordTest('Cleanup', `DELETE /api/offers/:id (Clean up test offer banner)`, res.status === 200);
    } catch (err) {
      recordTest('Cleanup', 'DELETE test offer', false, err.message);
    }
  }

  // 11.4 Delete Test Message
  if (testMessageId) {
    try {
      const res = await request(`/api/messages/${testMessageId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      recordTest('Cleanup', `DELETE /api/messages/:id (Clean up test inquiry message)`, res.status === 200);
    } catch (err) {
      recordTest('Cleanup', 'DELETE test message', false, err.message);
    }
  }

  // -------------------------------------------------------------
  // SUMMARY REPORT
  // -------------------------------------------------------------
  console.log(`\n${colors.bright}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`${colors.bright}                     FINAL API TEST RESULTS                             ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}========================================================================${colors.reset}`);
  console.log(`Total Endpoints & Transaction Tests : ${passedCount + failedCount}`);
  console.log(`Passed                              : ${colors.green}${passedCount}${colors.reset}`);
  console.log(`Failed                              : ${failedCount > 0 ? colors.red : colors.green}${failedCount}${colors.reset}`);
  const passRate = (((passedCount) / (passedCount + failedCount)) * 100).toFixed(1);
  console.log(`Success Rate                        : ${colors.bright}${passRate}%${colors.reset}\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((e) => {
  console.error('Test Execution Error:', e);
  process.exit(1);
});
