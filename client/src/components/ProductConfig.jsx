import React from 'react';
import { Package, Check, Sparkles, Shield, Database, DollarSign, Layers } from 'lucide-react';

export default function ProductConfig({ products, selectedProduct, onSelectProduct }) {
  const getProductIcon = (id) => {
    if (id.includes('crm')) return Sparkles;
    if (id.includes('sec')) return Shield;
    if (id.includes('bi')) return Database;
    return Package;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-teal-400" />
          SaaS Product Knowledge Base
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Choose which SaaS software the AI Voice Sales Bot is currently configured to pitch and sell.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {products.map((prod) => {
          const isSelected = selectedProduct?.id === prod.id;
          const Icon = getProductIcon(prod.id);

          return (
            <div
              key={prod.id}
              className={`rounded-2xl p-6 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'glass-panel-glow border-teal-500/50 shadow-teal-500/10'
                  : 'glass-panel border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-500 text-slate-950 shadow-md">
                      <Check className="w-3.5 h-3.5" /> Active Pitch
                    </span>
                  ) : (
                    <button
                      onClick={() => onSelectProduct(prod)}
                      className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-teal-500 transition-colors cursor-pointer"
                    >
                      Select Product
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{prod.name}</h3>
                  <p className="text-xs text-teal-400 font-medium mt-0.5">{prod.tagline}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {prod.description}
                </p>

                {/* Target Audience */}
                <div className="text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-400 font-medium">Target ICP: </span>
                  <span className="text-slate-200">{prod.target_audience}</span>
                </div>

                {/* Pricing Tiers */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-teal-400" /> Pricing Tiers
                  </span>
                  <div className="space-y-1.5">
                    {Array.isArray(prod.pricing_tiers) && prod.pricing_tiers.map((t, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs flex items-center justify-between">
                        <span className="font-semibold text-white">{t.tier}</span>
                        <span className="font-mono text-teal-400 font-bold">{t.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-teal-400" /> Core Capabilities
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {Array.isArray(prod.key_features) && prod.key_features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-400 mt-0.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={() => onSelectProduct(prod)}
                disabled={isSelected}
                className={`w-full mt-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30 cursor-default'
                    : 'bg-slate-900 hover:bg-teal-500 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-teal-400 cursor-pointer shadow'
                }`}
              >
                {isSelected ? 'Currently Selected' : `Pitch ${prod.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
