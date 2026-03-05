import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Link2, Award, Coins, Shield, ExternalLink, Hash,
  Leaf, Users, TrendingUp, Sparkles, Copy, Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import Footer from "@/components/Footer";
import { toast } from "@/hooks/use-toast";

interface ImpactNFT {
  id: number;
  txHash: string;
  business: string;
  meals: number;
  co2Kg: number;
  valueRescued: number;
  date: string;
  recipientType: "shelter" | "ebt" | "consumer";
  foodItems: string[];
  nutritionScore: number;
  gradient: string;
}

const mockNFTs: ImpactNFT[] = [
  { id: 8847, txHash: "0x7a3f…e91c", business: "Sunrise Bakery", meals: 12, co2Kg: 3.1, valueRescued: 127, date: "2026-03-05", recipientType: "shelter", foodItems: ["Salmon", "Croissants"], nutritionScore: 94, gradient: "from-emerald-500 to-teal-600" },
  { id: 8846, txHash: "0x4b2e…f7d3", business: "Fresh Market", meals: 8, co2Kg: 2.4, valueRescued: 89, date: "2026-03-05", recipientType: "ebt", foodItems: ["Chicken", "Salad"], nutritionScore: 91, gradient: "from-amber-500 to-orange-600" },
  { id: 8845, txHash: "0x9c1d…a4b8", business: "Corner Café", meals: 15, co2Kg: 4.7, valueRescued: 156, date: "2026-03-04", recipientType: "shelter", foodItems: ["Sourdough", "Yogurt", "Sushi"], nutritionScore: 97, gradient: "from-violet-500 to-purple-600" },
  { id: 8844, txHash: "0x2f8a…c3e5", business: "Green Grocer", meals: 6, co2Kg: 1.8, valueRescued: 62, date: "2026-03-04", recipientType: "consumer", foodItems: ["Mixed Veg", "Fruit"], nutritionScore: 88, gradient: "from-blue-500 to-indigo-600" },
  { id: 8843, txHash: "0x5d7c…b2f1", business: "Patisserie Valerie", meals: 22, co2Kg: 5.9, valueRescued: 234, date: "2026-03-04", recipientType: "shelter", foodItems: ["Pastries", "Sandwiches", "Soup"], nutritionScore: 96, gradient: "from-rose-500 to-pink-600" },
  { id: 8842, txHash: "0x1e9b…d6a4", business: "Express Mart", meals: 9, co2Kg: 2.7, valueRescued: 78, date: "2026-03-03", recipientType: "ebt", foodItems: ["Bread", "Cheese"], nutritionScore: 85, gradient: "from-cyan-500 to-sky-600" },
];

function useAnimatedCounter(end: number, duration = 2000, inView: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [end, duration, inView]);
  return count;
}

const NFTCard = ({ nft }: { nft: ImpactNFT }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`0x7a3fe91c...full_hash_${nft.id}`);
    setCopied(true);
    toast({ title: "Transaction hash copied" });
    setTimeout(() => setCopied(false), 2000);
  };

  const recipientBadge = {
    shelter: { label: "Shelter Priority", className: "bg-primary/10 text-primary" },
    ebt: { label: "EBT Impact", className: "bg-accent/10 text-accent" },
    consumer: { label: "Consumer", className: "bg-secondary text-secondary-foreground" },
  }[nft.recipientType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: nft.id % 6 * 0.1 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all group">
        {/* NFT Visual Header */}
        <div className={`relative h-32 bg-gradient-to-br ${nft.gradient} p-4 flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <Badge className="bg-white/20 text-white backdrop-blur-sm text-[10px]">
              <Hash className="h-3 w-3 mr-0.5" />
              {nft.id}
            </Badge>
            <Badge className={`${recipientBadge.className} text-[10px]`}>
              {recipientBadge.label}
            </Badge>
          </div>
          <div className="text-white">
            <p className="text-2xl font-extrabold">{nft.meals} meals</p>
            <p className="text-xs opacity-80">{nft.co2Kg}kg CO₂ · £{nft.valueRescued} value</p>
          </div>
          {/* Decorative pattern */}
          <div className="absolute top-2 right-2 opacity-10">
            <Award className="h-20 w-20 text-white" />
          </div>
        </div>

        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-sm text-foreground">{nft.business}</p>
              <p className="text-xs text-muted-foreground">{nft.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-primary">{nft.nutritionScore}/100</p>
              <p className="text-[10px] text-muted-foreground">Nutrition Score</p>
            </div>
          </div>

          {/* Food items */}
          <div className="flex flex-wrap gap-1 mb-3">
            {nft.foodItems.map(item => (
              <span key={item} className="text-[10px] px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
                {item}
              </span>
            ))}
          </div>

          {/* Transaction */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border">
            <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono text-muted-foreground flex-1 truncate">{nft.txHash}</span>
            <button onClick={handleCopy} className="shrink-0">
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />}
            </button>
            <a href="#" className="shrink-0">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const BlockchainImpact = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const nftsMinted = useAnimatedCounter(8847, 2000, inView);
  const foodTokens = useAnimatedCounter(234000, 2500, inView);
  const b2bRevenue = useAnimatedCounter(361000, 2500, inView);
  const taxReceipts = useAnimatedCounter(1247, 2000, inView);

  const [mintingNFT, setMintingNFT] = useState(false);

  const handleMintDemo = () => {
    setMintingNFT(true);
    setTimeout(() => {
      setMintingNFT(false);
      toast({
        title: "🎉 Impact NFT #8848 Minted!",
        description: "12 meals rescued · 3.1kg CO₂ saved · Polygon Mumbai",
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Breadcrumbs />
      <main className="container mx-auto py-8 space-y-8" ref={ref}>
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Link2 className="h-4 w-4" />
            Blockchain-Verified Impact
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground font-display">
            Every rescue, <span className="text-primary">on-chain forever</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Polygon ERC-721 Impact NFTs + ERC-20 FOOD tokens — verifiable, transparent, permanent.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "NFTs Minted", value: nftsMinted.toLocaleString(), icon: Award, color: "text-primary" },
            { label: "FOOD Tokens", value: `${(foodTokens / 1000).toFixed(0)}K`, icon: Coins, color: "text-accent" },
            { label: "B2B Revenue", value: `£${(b2bRevenue / 1000).toFixed(0)}K`, icon: TrendingUp, color: "text-primary" },
            { label: "Tax Receipts", value: taxReceipts.toLocaleString(), icon: Shield, color: "text-accent" },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{m.label}</p>
                      <p className={`text-2xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                    </div>
                    <m.icon className={`h-5 w-5 ${m.color} opacity-50`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">On-Chain Verification Flow</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { step: "1", label: "Food Rescued", desc: "AI detects & matches surplus" },
                { step: "2", label: "Impact Calculated", desc: "Meals, CO₂, nutrition scored" },
                { step: "3", label: "NFT Minted", desc: "ERC-721 on Polygon PoS" },
                { step: "4", label: "FOOD Tokens", desc: "10 FOOD per £1 recovered" },
                { step: "5", label: "Tax Receipt", desc: "100% deductible certification" },
              ].map(s => (
                <div key={s.step} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-sm flex-1 min-w-[150px]">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">{s.step}</span>
                  <div>
                    <span className="font-semibold text-foreground text-xs">{s.label}</span>
                    <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mint Demo */}
        <div className="text-center">
          <Button
            size="lg"
            className="rounded-full px-8"
            onClick={handleMintDemo}
            disabled={mintingNFT}
          >
            {mintingNFT ? (
              <><Sparkles className="h-4 w-4 mr-2 animate-spin" /> Minting on Polygon…</>
            ) : (
              <><Award className="h-4 w-4 mr-2" /> Mint Demo Impact NFT</>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Simulated minting — real Polygon integration in production</p>
        </div>

        {/* NFT Gallery */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Impact NFT Gallery
            <Badge variant="outline" className="ml-2 text-xs">{mockNFTs.length} recent</Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockNFTs.map(nft => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        </div>

        {/* Token Economics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Coins className="h-4 w-4 text-accent" />
              FOOD Token Economics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Token Symbol", value: "FOOD", sub: "ERC-20" },
                { label: "Mint Rate", value: "10/£1", sub: "Per £1 recovered" },
                { label: "Total Supply", value: "234K", sub: "Circulating" },
                { label: "B2B Fee", value: "25%", sub: "Of base value" },
              ].map(t => (
                <div key={t.label} className="text-center p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-2xl font-extrabold text-foreground">{t.value}</p>
                  <p className="text-xs font-medium text-primary mt-1">{t.label}</p>
                  <p className="text-[10px] text-muted-foreground">{t.sub}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bottom Banner */}
        <div className="rounded-3xl p-8 text-primary-foreground text-center" style={{ background: "var(--gradient-impact)" }}>
          <h2 className="text-2xl font-bold mb-2">Verifiable Impact, Forever</h2>
          <p className="opacity-80 mb-6 max-w-xl mx-auto">
            "Consumer apps claim impact. NourishNet proves it — every meal, every gram of CO₂, permanently on Polygon."
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "NFTs Minted", value: "8,847" },
              { label: "Meals Verified", value: "127K" },
              { label: "CO₂ Tracked", value: "59.2T" },
              { label: "Network Value", value: "£1.7M" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold">{s.value}</p>
                <p className="text-sm opacity-80 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlockchainImpact;
