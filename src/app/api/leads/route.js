import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Lead from '@/models/Lead';
import { requireAdmin } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, phone, location } = body;

    if (!name?.trim() || !phone?.trim() || !location?.trim()) {
      return NextResponse.json(
        { error: 'Name, phone number, and location are required.' },
        { status: 400 }
      );
    }

    // Basic Indian phone number validation
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Please provide a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    await connectDB();

    const timestamp = new Date();
    const dateFormatted = timestamp.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = timestamp.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    // Save lead to MongoDB immediately
    const lead = new Lead({
      name: name.trim(),
      phone: cleanPhone,
      location: location.trim(),
      source: 'Website Visitor Popup',
      syncedToSheet: false,
      createdAt: timestamp,
    });
    await lead.save();

    // Send to Google Sheets Webhook in background asynchronously (non-blocking)
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    if (webhookUrl) {
      const payload = {
        timestamp: timestamp.toISOString(),
        date: dateFormatted,
        time: timeFormatted,
        name: name.trim(),
        phone: cleanPhone,
        location: location.trim(),
        source: 'Website Visitor Popup',
      };

      // Fire & update without holding up the user response
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          if (res.ok) {
            await Lead.findByIdAndUpdate(lead._id, { syncedToSheet: true }).catch(() => {});
          }
        })
        .catch((sheetErr) => {
          console.error('Google Sheet Webhook Sync Warning:', sheetErr.message);
        });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured successfully',
        leadId: lead._id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('API Lead Capture Error:', err);
    return NextResponse.json(
      { error: 'Failed to capture lead. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) {
      return NextResponse.json({ msg: auth.error }, { status: auth.status });
    }

    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 }).limit(500);
    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (err) {
    console.error('API Fetch Leads Error:', err);
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
  }
}
