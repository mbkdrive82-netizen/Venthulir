import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/auth';
import { cache, invalidateProductCache } from '@/lib/cache';

const STOCK_FIELDS_EXCLUDE = '-initialStock -updatedAt';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ msg: 'Product ID required' }, { status: 400 });
    }

    const cacheKey = `products:item:${id}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
        }
      });
    }

    await connectDB();
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    let product = null;

    if (isObjectId) {
      product = await Product.findById(id).select(STOCK_FIELDS_EXCLUDE).lean();
    } else {
      product = await Product.findOne({ slug: id }).select(STOCK_FIELDS_EXCLUDE).lean();
    }

    // Smart fallback for slug or legacy ID aliases like 'prod-gingelly-oil' or 'gingelly-oil'
    if (!product && !isObjectId) {
      const cleanKeyword = id.replace(/^prod-/, '').replace(/-/g, '.*');
      product = await Product.findOne({
        $or: [
          { slug: { $regex: new RegExp(cleanKeyword, 'i') } },
          { name: { $regex: new RegExp(cleanKeyword, 'i') } },
          { productCode: { $regex: new RegExp(id, 'i') } }
        ]
      }).select(STOCK_FIELDS_EXCLUDE).lean();
    }

    if (!product) {
      return NextResponse.json({ msg: 'Product not found' }, { status: 404 });
    }

    // Ensure fallback image
    let rawImg = product.imageUrl || (product.images && product.images[0]);
    let img = rawImg;
    if (!img || (typeof img === 'string' && img.trim() === '')) {
      const name = (product.name || '').toLowerCase();
      const cat = (product.category || '').toLowerCase();
      if (name.includes('turmeric') || name.includes('manjal') || name.includes('yellow')) img = '/assets/hero/turmeric.png';
      else if (name.includes('chilli') || name.includes('chili') || name.includes('red')) img = '/assets/hero/chilli.png';
      else if (name.includes('coriander') || name.includes('mallie')) img = '/assets/hero/coriander.png';
      else if (name.includes('sambar') || name.includes('masala')) img = '/assets/hero/sambar.png';
      else if (name.includes('coconut')) img = '/assets/hero/oil_coconut.png';
      else if (name.includes('groundnut')) img = '/assets/hero/oil_groundnut.png';
      else if (name.includes('gingelly') || name.includes('sesame')) img = '/assets/hero/oil_gingelly.png';
      else if (name.includes('oil') || cat.includes('oil')) img = '/assets/hero/oil_sunflower.png';
      else img = '/assets/hero/turmeric.png';
    }

    const formatted = {
      ...product,
      _id: product._id.toString(),
      id: product._id.toString(),
      imageUrl: img,
      image: img,
      images: product.images && product.images.length > 0 ? product.images : [img],
      inStock: (product.currentStock === undefined || product.currentStock > 0),
    };

    cache.set(cacheKey, formatted, 120);

    return NextResponse.json(formatted, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
      }
    });
  } catch (err) {
    console.error('API Get Product Detail Error:', err);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!product) {
      return NextResponse.json({ msg: 'Product not found' }, { status: 404 });
    }

    // Purge cached catalog
    invalidateProductCache();

    return NextResponse.json(product);
  } catch (err) {
    console.error('API Update Product Error:', err);
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json({ msg: 'Product not found' }, { status: 404 });
    }

    // Purge cached catalog
    invalidateProductCache();

    return NextResponse.json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error('API Delete Product Error:', err);
    return NextResponse.json({ error: err.message || 'Server Error' }, { status: 500 });
  }
}
