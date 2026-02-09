import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Barcode, Search, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface BarcodeProduct {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  serving_size: string;
  image_url?: string;
}

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (product: BarcodeProduct) => void;
}

export function BarcodeScanner({ isOpen, onClose, onProductFound }: BarcodeScannerProps) {
  const { language } = useLanguage();
  const pt = language === "pt";
  const [manualCode, setManualCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setIsScanning(false);
      setError(null);
      setManualCode("");
    }
  }, [isOpen]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    setIsScanning(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Try BarcodeDetector API if available
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e"]
        });
        detectBarcode(detector);
      } else {
        setError(pt
          ? "Seu navegador não suporta detecção automática. Use o código manual abaixo."
          : "Your browser doesn't support auto detection. Use the manual code below.");
        stopCamera();
        setIsScanning(false);
      }
    } catch {
      setError(pt ? "Não foi possível acessar a câmera" : "Could not access camera");
      setIsScanning(false);
    }
  };

  const detectBarcode = async (detector: any) => {
    if (!videoRef.current || !streamRef.current) return;
    try {
      const barcodes = await detector.detect(videoRef.current);
      if (barcodes.length > 0) {
        stopCamera();
        setIsScanning(false);
        await lookupProduct(barcodes[0].rawValue);
        return;
      }
    } catch { /* continue scanning */ }
    if (streamRef.current) {
      requestAnimationFrame(() => detectBarcode(detector));
    }
  };

  const lookupProduct = async (barcode: string) => {
    setIsSearching(true);
    setError(null);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
      const data = await res.json();

      if (data.status !== 1 || !data.product) {
        setError(pt ? "Produto não encontrado. Tente outro código." : "Product not found. Try another code.");
        setIsSearching(false);
        return;
      }

      const p = data.product;
      const n = p.nutriments || {};
      const product: BarcodeProduct = {
        name: p.product_name_pt || p.product_name || pt ? "Produto desconhecido" : "Unknown product",
        brand: p.brands || "",
        calories: Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
        protein: Math.round((n.proteins_100g || 0) * 10) / 10,
        carbs: Math.round((n.carbohydrates_100g || 0) * 10) / 10,
        fat: Math.round((n.fat_100g || 0) * 10) / 10,
        fiber: Math.round((n.fiber_100g || 0) * 10) / 10,
        sugar: Math.round((n.sugars_100g || 0) * 10) / 10,
        serving_size: p.serving_size || "100g",
        image_url: p.image_url,
      };

      onProductFound(product);
      onClose();
      toast.success(pt ? `Produto encontrado: ${product.name}` : `Product found: ${product.name}`);
    } catch {
      setError(pt ? "Erro ao buscar produto" : "Error looking up product");
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSearch = () => {
    if (manualCode.trim().length < 8) {
      toast.error(pt ? "Código de barras inválido" : "Invalid barcode");
      return;
    }
    lookupProduct(manualCode.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Barcode className="h-5 w-5 text-primary" />
            {pt ? "Scanner de Código de Barras" : "Barcode Scanner"}
          </DialogTitle>
          <DialogDescription>
            {pt ? "Escaneie ou digite o código de barras do produto" : "Scan or type the product barcode"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera preview */}
          {isScanning && (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-2 border-primary/50 m-8 rounded" />
            </div>
          )}

          {/* Scan button */}
          {!isScanning && (
            <Button variant="outline" className="w-full" onClick={startCamera}>
              <Barcode className="h-4 w-4 mr-2" />
              {pt ? "Escanear com câmera" : "Scan with camera"}
            </Button>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {pt ? "ou" : "or"}
              </span>
            </div>
          </div>

          {/* Manual input */}
          <div className="flex gap-2">
            <Input
              placeholder={pt ? "Digite o código de barras..." : "Enter barcode..."}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
            />
            <Button onClick={handleManualSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded p-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            {pt
              ? "Dados nutricionais fornecidos pelo Open Food Facts (por 100g)"
              : "Nutritional data provided by Open Food Facts (per 100g)"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
