import React, { useState } from "react";
import { Package, ChevronDown, ChevronUp, MapPin, CreditCard, ExternalLink, Clock } from "lucide-react";

const getStatusBadge = (status = "PROCESSING") => {
  const norm = String(status).toUpperCase();
  switch (norm) {
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "SHIPPED":
    case "IN_TRANSIT":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "CANCELLED":
    case "CANCELED":
      return "bg-red-100 text-red-600 border-red-200";
    case "PAID":
    case "PROCESSING":
    default:
      return "bg-pink-100 text-[#E02171] border-pink-200";
  }
};

const OrderHistoryCard = ({ order, onTrackClick }) => {
  const [expanded, setExpanded] = useState(false);

  const items = Array.isArray(order.items) ? order.items : [];
  const pricing = order.pricing || {};
  const totalPaid = pricing.finalOrderValue || order.finalOrderValue || 0;
  const shippingCharge = pricing.shippingCharge ?? order.shippingCharge ?? 0;
  const discountAmount = pricing.discountAmount ?? order.discountAmount ?? 0;
  const subtotal = pricing.subtotal ?? order.subtotal ?? 0;

  // Format creation timestamp
  const formattedDate = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : order.order_date || "Recent Order";

  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-xs overflow-hidden transition-all hover:border-pink-200">
      {/* Header bar */}
      <div className="p-5 flex flex-wrap items-center justify-between gap-4 border-b border-pink-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-[#E02171]">
            <Package size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-gray-900 tracking-tight">
                #{order.orderId || order.id}
              </span>
              <span
                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getStatusBadge(
                  order.orderStatus || order.fulfillmentStatus
                )}`}
              >
                {order.orderStatus || order.fulfillmentStatus || "Processing"}
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              Placed on {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-medium">Total Paid</span>
            <span className="text-sm font-black text-[#E02171]">₹{totalPaid}</span>
          </div>

          {order.shipmentId && (
            <button
              onClick={() => onTrackClick(order)}
              className="px-3 py-1.5 bg-[#FFF0F6] hover:bg-[#FFE0ED] text-[#E02171] rounded-xl text-xs font-black transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Clock size={13} />
              Track
            </button>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Toggle order details"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Item preview list */}
      <div className="p-5 space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={item.image || "/images/ScrunchiefrillsComingSoon1.png"}
                alt={item.name}
                className="w-12 h-12 object-cover rounded-xl border border-pink-50 flex-shrink-0"
              />
              <div>
                <p className="font-black text-gray-900 leading-snug">{item.name}</p>
                <p className="text-[10px] text-gray-400 font-medium">
                  SKU: {item.sku || "SFS-ITEM"} &bull; Qty: {item.quantity || 1}
                </p>
              </div>
            </div>
            <span className="font-black text-gray-800">
              ₹{(item.price || 0) * (item.quantity || 1)}
            </span>
          </div>
        ))}
      </div>

      {/* Collapsible Details */}
      {expanded && (
        <div className="bg-[#FFF9FB] p-5 border-t border-pink-100 text-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery address */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <MapPin size={12} /> Shipping Destination
              </p>
              <p className="font-bold text-gray-800">{order.customer?.name || order.name}</p>
              <p className="text-gray-600 leading-relaxed text-[11px]">
                {order.customer?.shippingAddress || order.shippingAddress}
              </p>
              <p className="text-gray-600 text-[11px]">
                {order.customer?.city || order.city}, {order.customer?.state || order.state} -{" "}
                {order.customer?.pinCode || order.pinCode}
              </p>
              <p className="text-gray-500 text-[11px] mt-1">
                Phone: {order.customer?.phone || order.phone}
              </p>
            </div>

            {/* Payment & Logistics breakdown */}
            <div className="space-y-1.5 text-gray-600">
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
                <CreditCard size={12} /> Payment & Fulfillment
              </p>
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-bold text-gray-800">
                  {order.paymentMethod || "Prepaid (Razorpay)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold text-emerald-600">
                  {order.paymentStatus || "PAID"}
                </span>
              </div>
              {order.courierPartner && (
                <div className="flex justify-between">
                  <span>Courier Partner:</span>
                  <span className="font-bold text-gray-800">{order.courierPartner}</span>
                </div>
              )}
              {order.shipmentId && (
                <div className="flex justify-between">
                  <span>Shipment ID:</span>
                  <span className="font-bold text-gray-800 font-mono text-[11px]">
                    {order.shipmentId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Detailed receipt breakdown */}
          <div className="border-t border-pink-100 pt-3 space-y-1 text-[11px]">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal:</span>
              <span>₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#E02171]">
                <span>Launch Savings:</span>
                <span>-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Shipping Fee:</span>
              <span>{shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}</span>
            </div>
            <div className="flex justify-between font-black text-gray-900 text-xs pt-1 border-t border-pink-100">
              <span>Grand Total:</span>
              <span className="text-[#E02171]">₹{totalPaid}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistoryCard;