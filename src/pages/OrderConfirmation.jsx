import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Navbar from "../components/Navbar";
import Footer from "../sections/Footer";
import { 
  Check, 
  Truck, 
  ShoppingBag, 
  Share2, 
  Package, 
  MapPin, 
  Edit3, 
  CreditCard, 
  Heart, 
  Sparkles, 
  Gift, 
  ShieldCheck 
} from "lucide-react";
import toast from "react-hot-toast";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Prioritize state passed directly from Checkout navigation; fallback to Firestore query on refresh
  // 1. Check router state -> then sessionStorage -> fallback to Firestore
  const [order, setOrder] = useState(() => {
    if (location.state?.order) {
      try {
        sessionStorage.setItem(`sf_order_${orderId}`, JSON.stringify(location.state.order));
      } catch (e) {}
      return location.state.order;
    }
    try {
      const cached = sessionStorage.getItem(`sf_order_${orderId}`);
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    // If order data was already passed via router navigation state, skip network fetch
    if (order && order.items && order.items.length > 0) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchOrderFromFirestore = async () => {
      if (!orderId) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        if (isMounted) setLoading(true);
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (!isMounted) return;

        if (orderSnap.exists()) {
          const fetchedData = orderSnap.data();

          let orderItems = Array.isArray(fetchedData.items) ? fetchedData.items : [];
          if (!orderItems.length) {
            try {
              const itemsSnap = await getDocs(collection(db, "orders", orderId, "order_items"));
              orderItems = itemsSnap.docs.map((d) => d.data());
            } catch (subErr) {
              console.warn("Subcollection order_items check bypassed:", subErr.message);
            }
          }

          const rawPhone = String(
            fetchedData.customer?.phone || 
            fetchedData.phone || 
            fetchedData.customerPhone || 
            ""
          ).replace(/\D/g, "");

          setOrder({
            ...fetchedData,
            orderId: fetchedData.orderId || orderSnap.id,
            items: orderItems,
            shippingAddress: fetchedData.customer?.shippingAddress || fetchedData.shippingAddress || "",
            city: fetchedData.customer?.city || fetchedData.city || "",
            state: fetchedData.customer?.state || fetchedData.state || "West Bengal",
            pinCode: fetchedData.customer?.pinCode || fetchedData.pinCode || "",
            customerPhone: rawPhone ? (rawPhone.length === 10 ? `+91 ${rawPhone}` : rawPhone) : "",
            customerEmail: fetchedData.customer?.email || fetchedData.customerEmail || fetchedData.email || "",
            customerName: fetchedData.customer?.name || fetchedData.customerName || fetchedData.name || "Valued Customer",
            finalOrderValue: fetchedData.pricing?.finalOrderValue ?? fetchedData.finalOrderValue ?? 0,
            subtotal: fetchedData.pricing?.subtotal ?? fetchedData.subtotal ?? 0,
            discountAmount: fetchedData.pricing?.discountAmount ?? fetchedData.discountAmount ?? 0,
            shippingCharge: fetchedData.pricing?.shippingCharge ?? fetchedData.shippingCharge ?? 0,
            paymentId: fetchedData.razorpayPaymentId || fetchedData.paymentId || "Verified",
            paymentMethod: fetchedData.paymentMethod || "UPI / Netbanking (Razorpay)",
            paymentStatus: fetchedData.paymentStatus || "PAID",
            courierPartner: fetchedData.courierTier || fetchedData.courierPartner || "Delhivery Surface",
            awbCode: fetchedData.awbCode || null,
            createdAt: fetchedData.createdAt || fetchedData.orderDateTime || null,
          });
        } else {
          toast.error("Order not found in records.");
        }
      } catch (err) {
        console.warn("Could not retrieve order directly from Firestore:", err.message);
        toast.error("Could not load order details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchOrderFromFirestore();

    return () => {
      isMounted = false;
    };
  }, [orderId]); // Fixed dependency array: prevents re-trigger loops

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF0F6] flex items-center justify-center font-sans">
        <p className="text-sm font-black text-[#E02171] animate-pulse tracking-wide uppercase">
          Wrapping your frills receipt in pink... 🎀
        </p>
      </div>
    );
  }

  const orderDisplayId = order?.orderId 
    ? (order.orderId.startsWith("#") ? order.orderId : `#${order.orderId}`)
    : `#${orderId || "SF1256"}`;

  const rawDate = order?.createdAt || order?.orderDateTime;
  const formattedDate = rawDate?.toDate 
    ? rawDate.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : rawDate instanceof Date
    ? rawDate.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const totalItemsCount = (order?.items || []).reduce((acc, item) => acc + Number(item.quantity || 1), 0);

  return (
    <div className="min-h-screen w-full bg-[#FFF5F8] text-gray-800 font-sans pb-16 selection:bg-pink-200">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 pt-24 sm:pt-28">
        
        {/* 🌸 Hero Artwork Banner */}
        <div className="w-full flex justify-center mb-6">
          <div className="w-full max-w-4xl rounded-3xl overflow-hidden shadow-xs border border-pink-100 bg-white">
            <img 
              src="/images/OrderConfirmationPage/ScrunchiefrillsOrderConfirmationBanner.png" 
              alt="Your frills are officially on their way!" 
              className="w-full h-auto object-contain block"
            />
          </div>
        </div>

        {/* 📋 Order Confirmation Header Strip & Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          
          {/* Order Confirmed Box */}
          <div className="md:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <Check size={26} strokeWidth={3} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-gray-900">Order Confirmed!</h3>
                <span className="text-base">🎀</span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-xs font-bold text-gray-500">Order ID</span>
                <span className="text-sm font-black text-[#E02171]">{orderDisplayId}</span>
              </div>
              <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                Placed on {formattedDate}
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="md:col-span-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (order?.awbCode) {
                  window.open(`https://shiprocket.co/tracking/${order.awbCode}`, "_blank");
                } else {
                  toast(`Courier Partner: ${order?.courierPartner || "Delhivery Surface"}. AWB tracking link generated upon parcel pickup! 🚚`);
                }
              }}
              className="w-full bg-[#E02171] hover:bg-pink-600 text-white font-black text-xs uppercase py-3.5 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
            >
              <Truck size={16} /> Track My Frills
            </button>

            <button
              onClick={() => navigate("/shop")}
              className="w-full bg-white hover:bg-pink-50/50 border border-pink-200 text-gray-800 font-black text-xs uppercase py-3.5 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
            >
              <ShoppingBag size={16} className="text-[#E02171]" /> Continue Shopping
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Scrunchiefrills™ Order",
                    text: `Just ordered my scrunchies with Order ID ${orderDisplayId}! Slay the frill way 💗`,
                    url: window.location.href,
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Order link copied to clipboard! 🌸");
                }
              }}
              className="w-full bg-white hover:bg-pink-50/50 border border-pink-200 text-gray-700 font-bold text-xs py-3 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 size={15} className="text-[#E02171]" /> Share The Joy
            </button>

            <div className="bg-pink-50/70 border border-dashed border-pink-200 rounded-2xl p-2.5 flex items-center justify-center text-center">
              <span className="font-serif italic font-bold text-[#E02171] text-[11px] leading-tight">
                Tag us @scrunchiefrills we'd love to see! ♡
              </span>
            </div>
          </div>

        </div>

        {/* 📦 Master Grid: Order Details & Fulfillment Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
          
          {/* =====================================================
              LEFT COLUMN: ITEMS & SUMMARY BREAKDOWN (5 Cols)
              ===================================================== */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Dynamic Items List */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Order Items ({totalItemsCount})
              </h3>

              <div className="space-y-4">
                {(order?.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || "/images/ScrunchiefrillsComingSoon1.png"}
                        alt={item.name || "Scrunchie"}
                        onError={(e) => { e.target.src = "/images/ScrunchiefrillsComingSoon1.png"; }}
                        className="w-12 h-12 object-cover rounded-2xl border border-pink-100 bg-pink-50/50 flex-shrink-0"
                      />
                      <div>
                        <p className="font-black text-gray-900 leading-snug">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">SKU: {item.sku || "SFS-STN-CLD"}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                    <span className="font-black text-gray-900 flex-shrink-0">
                      ₹{Number(item.price || 249) * Number(item.quantity || 1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-3 text-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 mb-2">
                Order Summary
              </h3>

              <div className="flex justify-between font-bold text-gray-600">
                <span>Subtotal ({totalItemsCount} items)</span>
                <span className="text-gray-900">₹{order?.subtotal || 0}</span>
              </div>

              {Number(order?.discountAmount) > 0 && (
                <div className="flex justify-between font-bold text-[#E02171]">
                  <span>Discount (LAUNCH MRP SAVINGS)</span>
                  <span>- ₹{order?.discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-gray-600">
                <span>Shipping Charge</span>
                <span className="text-gray-900">
                  {Number(order?.shippingCharge) === 0 ? "FREE" : `₹${order?.shippingCharge}`}
                </span>
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <span className="font-black text-sm text-gray-900 uppercase">Total Paid</span>
                <span className="text-xl font-black text-[#E02171]">₹{order?.finalOrderValue || 0}</span>
              </div>

              {Number(order?.discountAmount) > 0 && (
                <div className="mt-2 bg-pink-50 border border-pink-200 text-[#E02171] font-black text-xs py-2 rounded-2xl text-center flex items-center justify-center gap-1.5 shadow-xs">
                  <span>💖</span> You saved ₹{order?.discountAmount}! <span>🎉</span>
                </div>
              )}
            </div>

          </div>

          {/* =====================================================
              RIGHT COLUMN: STATUS, ADDRESS & PAYMENT (7 Cols)
              ===================================================== */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Status */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Delivery Status
                </h3>
                <span className="text-xs">🚚💨</span>
              </div>

              {/* 5-Step Timeline Tracker */}
              <div className="relative flex items-center justify-between max-w-lg mx-auto mb-6 px-2">
                <div className="absolute left-6 right-6 top-3 h-0.5 bg-gray-200 -z-0" />
                <div className="absolute left-6 w-1/4 top-3 h-0.5 bg-[#E02171] -z-0" />

                <div className="flex flex-col items-center relative z-10 text-center">
                  <div className="w-6 h-6 rounded-full bg-[#E02171] text-white flex items-center justify-center text-[10px] shadow-sm">
                    <Check size={13} strokeWidth={3} />
                  </div>
                  <span className="text-[10px] font-black text-[#E02171] mt-1.5 leading-tight">
                    Order<br />Confirmed
                  </span>
                  <span className="text-[8px] text-gray-400 mt-0.5">{formattedDate.split(",")[1] || "Just now"}</span>
                </div>

                <div className="flex flex-col items-center relative z-10 text-center">
                  <div className="w-6 h-6 rounded-full bg-pink-200 border-2 border-white flex items-center justify-center" />
                  <span className="text-[10px] font-bold text-gray-500 mt-1.5 leading-tight">
                    Processing<br />Soon
                  </span>
                </div>

                <div className="flex flex-col items-center relative z-10 text-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center" />
                  <span className="text-[10px] font-bold text-gray-400 mt-1.5 leading-tight">
                    Shipped<br />Soon
                  </span>
                </div>

                <div className="flex flex-col items-center relative z-10 text-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center" />
                  <span className="text-[10px] font-bold text-gray-400 mt-1.5 leading-tight">
                    Out for Delivery<br />Soon
                  </span>
                </div>

                <div className="flex flex-col items-center relative z-10 text-center">
                  <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center" />
                  <span className="text-[10px] font-bold text-gray-400 mt-1.5 leading-tight">
                    Delivered<br />Soon
                  </span>
                </div>
              </div>

              <div className="bg-pink-50/70 border border-pink-200/80 rounded-2xl p-3.5 flex items-center gap-3 text-xs font-bold text-gray-700">
                <Package size={22} className="text-[#E02171] flex-shrink-0" />
                <p className="leading-snug">
                  We'll notify you as soon as your frills are packed and shipped! You can also track your order anytime from your account.
                </p>
              </div>
            </div>

            {/* Live Customer Shipping Address Card */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#E02171]" /> Shipping Address
                </h3>
                <button 
                  onClick={() => toast("Address updates can be requested within 2 hours of placement! 🌸")}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#E02171] hover:underline cursor-pointer"
                >
                  <Edit3 size={13} /> Edit
                </button>
              </div>

              <div className="text-xs font-bold text-gray-700 space-y-1">
                <p className="text-sm font-black text-gray-900">{order?.customerName || "Customer"}</p>
                <p className="text-gray-600">{order?.shippingAddress}</p>
                <p className="text-gray-600">
                  {order?.city ? `${order.city}, ` : ""}{order?.state || ""} {order?.pinCode ? `- ${order.pinCode}` : ""}
                </p>
                <p className="text-gray-500 pt-1">{order?.customerPhone}</p>
                {order?.customerEmail && <p className="text-gray-400 text-[11px]">{order.customerEmail}</p>}
              </div>

              <div className="absolute right-6 bottom-4 text-right pointer-events-none opacity-80 select-none">
                <span className="text-[10px] font-serif italic font-bold text-[#E02171] block -mb-1">
                  Almost there! ♡
                </span>
                <span className="text-3xl">🏠</span>
              </div>
            </div>

            {/* Payment Details Card */}
            <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm relative">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                  <CreditCard size={15} className="text-[#E02171]" /> Payment Details
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 text-xs font-bold">
                <span className="text-gray-400">Payment Method</span>
                <span className="text-gray-900 text-right">{order?.paymentMethod || "UPI / Netbanking"}</span>

                <span className="text-gray-400">Payment ID</span>
                <span className="text-gray-900 font-mono text-[11px] text-right">{order?.paymentId || "pay_verified"}</span>

                <span className="text-gray-400">Payment Status</span>
                <span className="text-emerald-600 text-right font-black flex items-center justify-end gap-1">
                  <Check size={14} strokeWidth={3} /> {order?.paymentStatus || "Successful"}
                </span>

                <span className="text-gray-400">Paid on</span>
                <span className="text-gray-900 text-right">{formattedDate}</span>
              </div>

              <div className="absolute right-6 -bottom-2 rotate-6 pointer-events-none select-none">
                <span className="text-[9px] font-black text-[#E02171] bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full shadow-xs">
                  🔒 Secure & Safe Always! ♡
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* 🎀 Value Props Trust Strip */}
        <div className="mt-14 pt-8 border-t border-pink-200 grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Heart size={20} className="text-[#E02171] mb-1.5" />
            <p className="text-xs font-black text-gray-900">Adorable, quirky designs</p>
            <p className="text-[10px] text-gray-400 font-medium">Cute and whimsical prints</p>
          </div>

          <div className="flex flex-col items-center">
            <Sparkles size={20} className="text-[#E02171] mb-1.5" />
            <p className="text-xs font-black text-gray-900">Cloud-sized statement</p>
            <p className="text-[10px] text-gray-400 font-medium">Extra fluffy, extra you</p>
          </div>

          <div className="flex flex-col items-center">
            <Truck size={20} className="text-[#E02171] mb-1.5" />
            <p className="text-xs font-black text-gray-900">Tracked shipping</p>
            <p className="text-[10px] text-gray-400 font-medium">Powered by Shiprocket</p>
          </div>

          <div className="flex flex-col items-center">
            <Gift size={20} className="text-[#E02171] mb-1.5" />
            <p className="text-xs font-black text-gray-900">Thoughtful unboxing</p>
            <p className="text-[10px] text-gray-400 font-medium">Because you deserve it</p>
          </div>

          <div className="col-span-2 sm:col-span-1 flex flex-col items-center">
            <ShieldCheck size={20} className="text-[#E02171] mb-1.5" />
            <p className="text-xs font-black text-gray-900">A small business with a big heart</p>
            <p className="text-[10px] text-gray-400 font-medium">Thank you for supporting independent!</p>
          </div>
        </div>

        {/* Brand Signoff Footnote */}
        <div className="mt-10 flex items-center justify-between text-xs font-serif italic text-[#E02171]">
          <span>Keep Spreading the Frills! ♡</span>
          <span className="hidden sm:inline">See you in your next hair adventure! ♡</span>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderConfirmation;