"use client";

import React from "react";
import Image from "next/image";
import { getSafeImageSrc } from "@/lib/imageUtils";
import { useTheme } from "@/context/ThemeContext";
import { downloadCertificatePDF } from "@/lib/pdfGenerator";

interface CertificateProps {
  isOpen: boolean;
  onClose: () => void;
  certData: {
    mintId: string;
    productName: string;
    club: string;
    season: string;
    edition?: string;
    imageSrc?: string;
    customerName: string;
    orderDate: string;
  } | null;
}

export default function CertificateOfAuthenticity({ isOpen, onClose, certData }: CertificateProps) {
  const { isWhite } = useTheme();

  if (!isOpen || !certData) return null;

  const handleDownloadCoA = () => {
    downloadCertificatePDF(certData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xl rounded-3xl p-6 sm:p-9 transition-all duration-200 border ${
          isWhite
            ? "bg-[#faf8f5] border-black/15 text-black shadow-2xl"
            : "bg-[#111114] border-white/15 text-white shadow-2xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-5 right-5 z-30 w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer font-mono text-xs border ${
            isWhite
              ? "bg-black/5 hover:bg-black/10 text-black border-black/10"
              : "bg-white/5 hover:bg-white/10 text-white border-white/10"
          }`}
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Certificate Card Frame */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border-2 border-dashed space-y-6 ${
            isWhite ? "border-black/20 bg-white" : "border-white/20 bg-[#0e0e11]"
          }`}
        >
          {/* Header */}
          <div className="text-center border-b pb-4 border-black/10 dark:border-white/10">
            <span className="font-mono text-[9px] tracking-widest text-[#ff5500] uppercase font-bold block mb-1">
              THEJERSEYHUB ATELIER // VAULT REGISTRY
            </span>
            <h3 className="text-xl sm:text-2xl font-bold font-serif tracking-wide">
              Certificate of Authenticity
            </h3>
            <p className="font-mono text-[10px] opacity-50 mt-1 uppercase">
              Cryptographic Physical-to-Digital Provenance Seal
            </p>
          </div>

          {/* Mint Code Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 font-mono text-xs">
            <div>
              <span className="opacity-50 text-[9px] block">VAULT MINT SERIAL:</span>
              <span className="font-bold text-[#ff5500] text-sm">{certData.mintId}</span>
            </div>
            <div className="text-right">
              <span className="opacity-50 text-[9px] block">AUTHENTICATION:</span>
              <span className="font-bold text-emerald-500 text-[11px]">[MATCH GRADE]</span>
            </div>
          </div>

          {/* Kit Details */}
          <div className="grid grid-cols-12 gap-3 items-center">
            {certData.imageSrc && (
              <div className="col-span-4 relative h-24 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center p-1">
                <Image
                  src={getSafeImageSrc(certData.imageSrc)}
                  alt={certData.productName}
                  fill
                  className="object-contain"
                />
              </div>
            )}
            <div className={`space-y-1.5 font-mono text-xs ${certData.imageSrc ? "col-span-8" : "col-span-12"}`}>
              <p className="font-bold text-sm leading-snug">{certData.productName}</p>
              <p className="text-[10px] opacity-60">{certData.club} • {certData.season}</p>
              <div className="pt-1 text-[10px] space-y-0.5 opacity-70">
                <p>Owner: <strong className="font-bold">{certData.customerName}</strong></p>
                <p>Issued: <strong>{certData.orderDate}</strong></p>
              </div>
            </div>
          </div>

          {/* Vault Authenticity Seal */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono text-[10px] flex items-center gap-2">
            <span className="font-bold text-[9px] px-1 py-0.5 rounded bg-emerald-500/20">[VERIFIED]</span>
            <span>
              Guaranteed match-grade polyester fabric weight, embroidery stitch count, and official manufacturer SKU authenticity.
            </span>
          </div>

          {/* Print Action */}
          <button
            type="button"
            onClick={handleDownloadCoA}
            className="w-full py-3 bg-[#ff5500] hover:bg-[#ff661a] text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            <span>Download Official CoA (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
