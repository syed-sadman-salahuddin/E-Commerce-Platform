import { X, Package, MapPin, Calendar, User, ShoppingBag } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getProductImage } from "./productImages";

export default function OrderDetailsDialog({ open, onClose, order }) {
  if (!order) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Order Details: ${order.id}`}
      description={`Placed on ${formatDate(order.createdAt)}`}
      size="lg"
    >
      <div className="space-y-5">
        {/* Header Status & Customer */}
        <div className="grid grid-cols-1 gap-3 rounded-2xl bg-slate-50 p-4 sm:grid-cols-2">
          <div className="flex items-start gap-2.5">
            <User size={18} className="mt-0.5 text-indigo-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Customer</p>
              <p className="text-sm font-semibold text-slate-900">{order.customer}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Package size={18} className="mt-0.5 text-indigo-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-400">Order Status</p>
              <div className="mt-0.5">
                <StatusBadge status={order.status} />
              </div>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="flex items-start gap-2.5 sm:col-span-2 border-t border-slate-200/60 pt-3">
              <MapPin size={18} className="mt-0.5 text-rose-500 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Shipping Address</p>
                <p className="text-sm font-medium text-slate-700">{order.shippingAddress}</p>
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-800">
            Ordered Items ({order.items?.length || 0})
          </p>
          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {order.items?.map((item, idx) => {
              const img = getProductImage({
                id: item.productId,
                name: item.name,
                image: item.image,
              });
              const itemTotal = (item.price || 0) * (item.quantity || 1);

              return (
                <div key={idx} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 p-1 ring-1 ring-slate-200">
                      {img ? (
                        <img
                          src={img}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ShoppingBag size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-400">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(itemTotal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Total Summary */}
        <div className="flex items-center justify-between rounded-xl bg-indigo-50/70 p-4">
          <span className="text-sm font-semibold text-slate-700">Total Order Amount</span>
          <span className="text-xl font-black text-indigo-700">
            {formatCurrency(order.total)}
          </span>
        </div>
      </div>
    </Modal>
  );
}



