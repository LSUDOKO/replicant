"use client";

import { useState } from "react";
import { MarketplaceGrid } from "@/components/marketplace/MarketplaceGrid";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { NetworkGuard } from "@/components/shared/NetworkGuard";
import { ShoppingCart, Tag } from "lucide-react";

export default function MarketplacePage() {
  const [showListingForm, setShowListingForm] = useState(false);

  return (
    <NetworkGuard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Marketplace</h1>
            <p className="text-sm text-white/60 mt-1">
              Trade TEE-sealed AI intelligence agents
            </p>
          </div>
          <button
            onClick={() => setShowListingForm(!showListingForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8b5cf6] text-white font-medium hover:bg-[#8b5cf6]/90 transition-colors"
          >
            <Tag size={16} />
            {showListingForm ? "Hide Form" : "List Your Agent"}
          </button>
        </div>

        {/* Listing Form */}
        {showListingForm && (
          <ListingForm onListed={() => setShowListingForm(false)} />
        )}

        {/* Marketplace Grid */}
        <MarketplaceGrid />
      </div>
    </NetworkGuard>
  );
}
