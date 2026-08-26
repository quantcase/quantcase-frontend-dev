"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check } from "lucide-react";
import { useSmallcaseConnect } from "@/hooks/useSmallcaseConnect";
import { useSmallcaseHoldings } from "@/hooks/useSmallcaseHoldings";
import { apiAuthPost, apiAuthGet } from "@/lib/api";
import { BACKEND_URL } from "@/lib/constants";
import { OnboardingThesisFields, type ThesisFieldsState } from "./onboarding-thesis-fields";

const INITIAL_STOCKS = [
  {t:'ZOMATO',n:'Zomato Ltd',w:'High growth potential',s:81,m:80,o:85,d:78,m_txt:'',o_txt:'',d_txt:''},
  {t:'BLUESTONE',n:'Bluestone',w:'Strong consumer brand',s:75,m:72,o:79,d:75,m_txt:'',o_txt:'',d_txt:''},
  {t:'PAYTM',n:'One97 Comm',w:'Regulatory overhang',s:52,m:30,o:70,d:60,m_txt:'',o_txt:'',d_txt:''},
  {t:'HDFCBANK',n:'HDFC Bank',w:'Sector rotation target',s:78,m:75,o:82,d:77,m_txt:'',o_txt:'',d_txt:''},
  {t:'RELIANCE',n:'Reliance Ind',w:'Capital intensity peak',s:72,m:70,o:80,d:65,m_txt:'',o_txt:'',d_txt:''},
  {t:'YESBANK',n:'Yes Bank Ltd',w:'Asset quality concern',s:41,m:40,o:45,d:38,m_txt:'',o_txt:'',d_txt:''},
  {t:'VODAIDEA',n:'Vodafone Idea',w:'Debt burden severe',s:44,m:42,o:50,d:40,m_txt:'',o_txt:'',d_txt:''},
  {t:'TCS',n:'Tata Consultancy',w:'Margin resilience',s:84,m:86,o:80,d:85,m_txt:'',o_txt:'',d_txt:''},
  {t:'INFY',n:'Infosys Ltd',w:'Growth guidance cut',s:68,m:70,o:65,d:69,m_txt:'',o_txt:'',d_txt:''}
];

export default function OnboardingV3() {
  const router = useRouter();
  const [mode, setMode] = useState("pick");
  const [step, setStep] = useState(1);
  const { data: holdingsData } = useSmallcaseHoldings();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [tradingEnabled, setTradingEnabled] = useState(false);
  const [portStocks, setPortStocks] = useState<typeof INITIAL_STOCKS>(INITIAL_STOCKS.slice(1,7));
  const [stocksList, setStocksList] = useState<typeof INITIAL_STOCKS>(INITIAL_STOCKS);

  
  useEffect(() => {
    apiAuthGet(`${BACKEND_URL}/api/post-html-analysis/bulk-scores`, {
      onSuccess: (res: any) => {
        const scoresData = res.data || {};
        const updatedStocks = Object.entries(scoresData).map(([ticker, sc]: [string, any]) => ({
          t: ticker,
          n: sc.n || ticker,
          w: sc.w || 'Analysis pending',
          s: sc.s || 0,
          m: sc.m || 0,
          o: sc.o || 0,
          d: sc.d || 0,
          m_txt: sc.m_txt || '',
          o_txt: sc.o_txt || '',
          d_txt: sc.d_txt || ''
        })).sort((a, b) => b.s - a.s);
        setStocksList(updatedStocks);
        

      },
      onError: () => {}
    });
  }, []);

  useEffect(() => {
    if (holdingsData?.holdings && holdingsData.holdings.length > 0) {
      const tickers = Array.from(new Set(holdingsData.holdings.map(h => h.ticker)));
      apiAuthGet(`${BACKEND_URL}/api/post-html-analysis/bulk-scores?tickers=${tickers.join(',')}`, {
        onSuccess: (res: any) => {
          const scoresData = res.data || {};
          const mapped = holdingsData.holdings.map(h => {
            const sc = scoresData[h.ticker] || {};
            return {
              t: h.ticker,
              n: h.name || h.ticker,
              w: sc.w || 'Analysis pending',
              s: sc.s || 0,
              m: sc.m || 0,
              o: sc.o || 0,
              d: sc.d || 0,
              m_txt: sc.m_txt || '',
              o_txt: sc.o_txt || '',
              d_txt: sc.d_txt || '',
            };
          });
          setPortStocks(mapped);
        },
        onError: () => {}
      });
    }
  }, [holdingsData]);

  const [thesisDraft, setThesisDraft] = useState<ThesisFieldsState>({
    dim: "M",
    subFactors: [],
    thesis: "",
    conviction: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { connect: connectSmallcase, step: connectStep, error: connectError } = useSmallcaseConnect({
    onConnected: () => {
      setIsImportOpen(false);
      setMode("import");
      setStep(2);
    }
  });

  const col = (s: number) => (s >= 70 ? "var(--pos)" : s >= 60 ? "var(--tan2)" : "var(--neg)");

  const toggle = (t: string) => {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else if (next.size < 3) next.add(t);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return stocksList.filter((x) => x.t.toLowerCase().includes(q.toLowerCase()) || x.n.toLowerCase().includes(q.toLowerCase())).slice(0, 50);
  }, [q, stocksList]);

  const picks = useMemo(() => [...sel].map((t) => stocksList.find((x) => x.t === t)).filter((x): x is typeof INITIAL_STOCKS[0] => x !== undefined), [sel, stocksList]);

  const avgScore = useMemo(() => {
    if (mode === "import") {
      const validStocks = portStocks.filter(p => p.s > 0);
      if (validStocks.length === 0) return null;
      return Math.round(validStocks.reduce((s, p) => s + p.s, 0) / validStocks.length);
    }
    if (!picks.length) return null;
    return Math.round(picks.reduce((s, p) => s + p.s, 0) / picks.length);
  }, [mode, picks, portStocks]);

  const nextDisabled = mode === "import" ? false : sel.size < 3 || isSubmitting;
  const nextLabel =
    step === 1
      ? (mode === "import" ? "Score my " + portStocks.length + " holdings " : (sel.size < 3 ? "Pick " + (3 - sel.size) + " more to continue " : "Score my 3 stocks "))
      : step === 2
      ? "This makes sense — continue "
      : isSubmitting ? "Saving..." : "Open my dashboard ";

  const topPick = mode === "import" ? [...portStocks].sort((a,b)=>b.s-a.s)[0] : [...picks].sort((a,b)=>b.s-a.s)[0];

  const [isSaved, setIsSaved] = useState(false);

  const saveAndComplete = (onSuccessCallback: () => void) => {
    setIsSubmitting(true);
    const payload = {
      mode,
      pickedTickers: mode === "pick" ? Array.from(sel) : [],
      thesis: isSaved ? undefined : { // Don't save thesis again if already saved
        ticker: topPick?.t,
        dimension: thesisDraft.dim,
        sub_factors: thesisDraft.subFactors,
        thesis_text: thesisDraft.thesis,
        conviction: thesisDraft.conviction
      }
    };

    apiAuthPost(
      `${BACKEND_URL}/api/onboarding/complete`,
      {
        onSuccess: () => {
          localStorage.setItem("qc_onboarding_completed", "true");
          onSuccessCallback();
        },
        onError: (err) => {
          console.error("Failed to complete onboarding:", err);
          setIsSubmitting(false);
        }
      },
      payload
    );
  };

  const handleSaveEntry = () => {
    saveAndComplete(() => {
      setIsSaved(true);
      setIsSubmitting(false);
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (isSaved) {
        router.push(`/screener/overview?symbol=${topPick?.t}`);
      } else {
        saveAndComplete(() => {
          router.push(`/screener/overview?symbol=${topPick?.t}`);
        });
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const userHolding = holdingsData?.holdings.find(h => h.ticker === topPick?.t);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "recently";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "recently";
    return d.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: '2-digit' }).replace(',', '');
  };

  const formatPrice = (price?: number | null) => {
    if (price == null) return "₹0";
    return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div id="onboarding-root">
      <style dangerouslySetInnerHTML={{ __html: `
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700;800&display=swap");
:root{--navy:#0C1626;--navy2:#101E33;--navy3:#16283F;--ink:#F2F5F9;--muted:#8FA0B4;--dim:#5C6E84;
--tan:#C8925C;--tan2:#E0A96D;--pos:#4ADE80;--neg:#F87171;--line:rgba(255,255,255,.10);
--serif:'Playfair Display',Georgia,serif;--mono:'IBM Plex Mono',ui-monospace,monospace;--sans:'Inter',sans-serif}

#onboarding-root h1, #onboarding-root h2, #onboarding-root h3, #onboarding-root h4, #onboarding-root h5, #onboarding-root h6, #onboarding-root p {
  color: inherit;
  line-height: normal;
}


#onboarding-root{background:var(--cream, #F5F0E6);min-height:100vh;overflow-y:auto;display:flex;flex-direction:column;font-family:var(--sans);color:var(--ink);-webkit-font-smoothing:antialiased}


.outcome{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;margin-top:16px;}
.ochip{display:flex;align-items:center;gap:9px;border:1px solid var(--line);background:rgba(255,255,255,.03);border-radius:8px;padding:9px 13px;font-size:12.5px;color:var(--muted)}
.ochip b{font-family:var(--serif);font-size:16px;color:var(--ink);line-height:1}
.ochip .ok{color:var(--pos);font-size:13px}
.s3grid{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:30px;margin-top:18px;align-items:start}
.paper{--jbg:#EAE8E3;--jsurf:#FFF;--jink:#1A1520;--jink2:#4A4453;--jink3:#8B8593;--jrule:#E2DFD9;--jrule2:#D6D2CB;--vio:#8A6DCA;}
.jcard {
  position: relative;
  background: var(--jsurf);
  border: 1px solid var(--jrule2);
  border-radius: 16px;
  padding: 26px 28px;
  color: var(--jink);
  z-index: 10;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.03);
}
.stack-wrap {
  position: relative;
  margin-top: 36px;
  z-index: 1;
}
.stack-layer {
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
  height: 60px;
  border-radius: 16px 16px 0 0;
  background: var(--jsurf);
  border: 1px solid var(--jrule2);
  border-bottom: none;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.03);
}
.thesisWrap{margin-top:26px;background:var(--jbg);border:1px solid var(--jrule2);border-radius:16px;padding:20px 0 18px}
.thesisHead{display:flex;align-items:baseline;gap:14px;padding:0 22px;margin-bottom:14px}
.thesisHead .t{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--jink3);font-weight:600}
.thesisHead .keep{margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--jink3)}
.thesisHead .keep b{color:var(--vio)}
.trow{display:flex;gap:12px;overflow-x:auto;padding:4px 22px 8px;scrollbar-width:thin}
.trow::-webkit-scrollbar{height:6px}
.trow::-webkit-scrollbar-thumb{background:var(--jrule2);border-radius:4px}
.rail{display:flex;flex-direction:column;gap:12px}
.why{border:1px solid rgba(200,146,92,.32);background:linear-gradient(150deg,rgba(200,146,92,.11),rgba(200,146,92,.02));border-radius:11px;padding:18px}
.why h4{font-family:var(--mono);font-size:10px;letter-spacing:.16em;color:var(--tan);margin-bottom:11px}
.why p{font-size:12.5px;color:var(--muted);line-height:1.6}
.why p b{color:var(--ink)}
.ask{border:1px solid var(--line);border-radius:11px;padding:18px;background:rgba(255,255,255,.028)}
.ask .tag{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;color:var(--dim)}
.ask h3{font-size:15px;font-weight:600;margin-top:8px}
.ask p{font-size:12px;color:var(--muted);line-height:1.5;margin-top:7px}
.ask .act{margin-top:14px;display:flex;align-items:center;gap:11px;flex-wrap:wrap}
@media(max-width:1040px){.s3grid{grid-template-columns:1fr}}

/* ---------- flow map ---------- */
.map{max-width:1240px;margin:0 auto;padding:26px 40px 0}
.map h5{font-family:var(--mono);font-size:11px;letter-spacing:.2em;color:var(--tan);margin-bottom:6px}
.map .sh{font-size:12.5px;color:var(--dim);margin-bottom:16px;line-height:1.6}
.mapgrid{display:grid;grid-template-columns:1.25fr 34px .95fr 34px 1.5fr;gap:0;align-items:center}
.mcol{display:flex;flex-direction:column;gap:9px}
.mstep{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;color:var(--dim);margin-bottom:3px}
.mbox{border:1px solid var(--line);border-radius:8px;padding:12px 14px;background:rgba(255,255,255,.03);font-size:13px;line-height:1.35}
.mbox.a{border-color:rgba(200,146,92,.45);background:rgba(200,146,92,.09)}
.mbox.b{border-color:rgba(74,222,128,.35);background:rgba(74,222,128,.07)}
.mbox b{display:block;font-size:13.5px;margin-bottom:3px}
.mbox span{font-size:11.5px;color:var(--muted)}
.arrow{display:grid;place-items:center;color:var(--dim);font-size:17px}
.later{max-width:1240px;margin:14px auto 0;padding:0 40px}
.laterbox{border:1px dashed rgba(200,146,92,.35);border-radius:8px;padding:13px 16px;font-size:12.5px;color:var(--muted);line-height:1.55;background:rgba(200,146,92,.04)}
.laterbox b{color:var(--tan2);font-family:var(--mono);font-size:10px;letter-spacing:.15em;margin-right:8px}

/* ---------- app ---------- */
.app {

  width: 100%;
  max-width: 1240px;
  margin: 16px auto;
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  background: radial-gradient(900px 520px at 82% -8%, rgba(200,146,92,.10), transparent 62%), linear-gradient(170deg, var(--navy3), var(--navy2) 45%, var(--navy));
  box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
}
#onboarding-root header{display:flex;justify-content:space-between;align-items:center;padding:20px 32px}
.logo{display:flex;align-items:center;gap:11px}
.help{font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--dim);text-decoration:none;padding:7px 12px;border-radius:6px}
.help:hover{color:var(--muted);background:rgba(255,255,255,.04)}
.prog{padding:0 32px 4px;display:flex;align-items:center;gap:14px}
.track{flex:1;height:2px;background:rgba(255,255,255,.09);border-radius:2px;overflow:hidden}
.fill{height:100%;background:linear-gradient(90deg,var(--tan),var(--tan2));width:33.3%;transition:width .5s cubic-bezier(.4,0,.2,1)}
.pct{font-family:var(--mono);font-size:10px;letter-spacing:.16em;color:var(--dim);white-space:nowrap}
.stage{padding:30px 32px 20px;display:flex;flex-direction:column;}
.screen{display:none;flex:1;flex-direction:column;animation:in .45s cubic-bezier(.2,.7,.3,1)}
.screen.on{display:flex}
@keyframes in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.2em;color:var(--tan);margin-bottom:13px}
#onboarding-root h1{color:var(--ink);font-family:var(--serif);font-size:44px;font-weight:600;line-height:1.12;max-width:780px}
#onboarding-root h1 em{font-style:italic;color:var(--tan2)}
.lede{font-size:15.5px;color:var(--muted);margin-top:11px;max-width:620px;line-height:1.55}

/* ===== step 1 doors ===== */
.doors{display:flex;gap:9px;margin-top:22px;margin-bottom:18px}
.door{flex:1;border:1px solid var(--line);border-radius:10px;padding:15px 18px;background:rgba(255,255,255,.028);cursor:pointer;transition:.18s;display:flex;align-items:center;gap:14px}
.door:hover{border-color:rgba(200,146,92,.45);background:rgba(255,255,255,.05)}
.door.on{border-color:var(--tan);background:rgba(200,146,92,.11)}
.door .ic{width:34px;height:34px;border-radius:8px;background:rgba(255,255,255,.06);display:grid;place-items:center;flex-shrink:0}
.door.on .ic{background:rgba(200,146,92,.22)}
.door .tx b{display:block;font-size:14.5px;font-weight:600}
.door .tx span{font-size:12px;color:var(--muted);display:block;margin-top:2px}
.door .badge{margin-left:auto;font-family:var(--mono);font-size:9px;letter-spacing:.11em;color:var(--pos);border:1px solid rgba(74,222,128,.35);border-radius:4px;padding:3px 7px;white-space:nowrap}

.pickwrap{display:grid;grid-template-columns:1.15fr .85fr;gap:32px;flex:1;align-items:start}
.search{display:flex;align-items:center;gap:10px;border:1px solid var(--line);background:rgba(255,255,255,.04);border-radius:9px;padding:12px 15px;margin-bottom:13px}
.search input{flex:1;background:none;border:none;outline:none;color:var(--ink);font-size:15px;font-family:var(--sans)}
.search input::placeholder{color:var(--dim)}
.rowlbl{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:10px;letter-spacing:.16em;color:var(--dim);margin-bottom:10px}
.rowlbl b{color:var(--tan)}
.list{display:flex;flex-direction:column;gap:7px;max-height:300px;overflow-y:auto;padding-right:4px}
.row{display:flex;align-items:center;gap:14px;border:1px solid var(--line);background:rgba(255,255,255,.028);border-radius:9px;padding:12px 16px;cursor:pointer;transition:.18s}
.row:hover{background:rgba(255,255,255,.06);border-color:rgba(200,146,92,.4)}
.row.sel{border-color:var(--tan);background:rgba(200,146,92,.10)}
.row.ro{cursor:default}.row.ro:hover{background:rgba(255,255,255,.028);border-color:var(--line)}
.row .id{flex:1;min-width:0}
.row .tk{font-family:var(--mono);font-size:12px;letter-spacing:.1em;font-weight:600}
.row .nm{font-size:12.5px;color:var(--dim);margin-top:2px}
.row .why{font-size:12px;color:var(--muted);text-align:right;max-width:145px;line-height:1.35}
.row .sc{font-family:var(--serif);font-size:25px;width:42px;text-align:right;font-variant-numeric:tabular-nums}
.tick{width:21px;height:21px;border-radius:50%;border:1.5px solid rgba(255,255,255,.22);flex-shrink:0;display:grid;place-items:center;transition:.18s}
.row.sel .tick{background:var(--tan);border-color:var(--tan)}
.tick svg{opacity:0}.row.sel .tick svg{opacity:1}
.live{border:1px solid var(--line);border-radius:11px;padding:22px;background:rgba(255,255,255,.028)}
.live h4{font-family:var(--mono);font-size:10px;letter-spacing:.18em;color:var(--dim);margin-bottom:16px}
.dialwrap{display:grid;place-items:center;position:relative;height:150px}
.dialwrap svg{transform:rotate(-90deg)}
.dialnum{position:absolute;top:44px;text-align:center}
.dialnum b{font-family:var(--serif);font-size:50px;line-height:1;display:block}
.dialnum span{font-family:var(--mono);font-size:10px;color:var(--dim);letter-spacing:.14em}
.dialcap{text-align:center;font-family:var(--mono);font-size:10px;letter-spacing:.15em;color:var(--muted);min-height:14px}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:18px;min-height:30px}
.pchip{font-family:var(--mono);font-size:10px;letter-spacing:.1em;border:1px solid rgba(200,146,92,.4);background:rgba(200,146,92,.12);color:var(--tan2);border-radius:20px;padding:6px 11px;display:flex;gap:7px}
.pchip s{cursor:pointer;text-decoration:none;opacity:.6}.pchip s:hover{opacity:1}
.empty{font-size:13px;color:var(--dim);line-height:1.5;text-align:center;padding:6px 4px 0}

/* ===== step 2 ===== */
.mods{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:24px}
.mod{border:1px solid var(--line);border-radius:11px;padding:22px;background:rgba(255,255,255,.028);border-top:2px solid var(--tan)}
.mod .letter{font-family:var(--serif);font-size:36px;color:var(--tan);line-height:1;display:flex;align-items:baseline;gap:9px}
.mod .letter u{font-family:var(--sans);font-size:20px;font-weight:700;color:var(--ink);text-decoration:none}
.mod .nm{font-size:17px;font-weight:600;margin-top:11px}
.mod .q{font-family:var(--serif);font-style:italic;font-size:14px;color:var(--muted);margin-top:5px}
.mod .ev{font-size:13px;color:var(--muted);line-height:1.5;margin-top:13px;padding-top:13px;border-top:1px solid var(--line)}
.mod .ev b{color:var(--ink)}
.meter{height:3px;background:rgba(255,255,255,.09);border-radius:3px;margin-top:13px;overflow:hidden}
.meter i{display:block;height:100%;background:var(--tan);border-radius:3px}
.provenance{display:flex;align-items:center;gap:16px;margin-top:20px;padding:16px 20px;border:1px solid var(--line);border-radius:10px;background:rgba(255,255,255,.02)}
.provenance .n{font-family:var(--serif);font-size:32px;color:var(--tan2);line-height:1}
.provenance .t{font-size:13.5px;color:var(--muted);line-height:1.5}
.provenance .t b{color:var(--ink)}

/* ===== step 3 ===== */
.summary{display:flex;gap:9px;margin-top:20px;flex-wrap:wrap}
.scard{border:1px solid var(--line);border-radius:9px;padding:13px 17px;background:rgba(255,255,255,.03);display:flex;align-items:center;gap:13px}
.scard .tk{font-family:var(--mono);font-size:11px;letter-spacing:.1em;color:var(--muted)}
.scard .sc{font-family:var(--serif);font-size:26px}
.scard .dl{font-family:var(--mono);font-size:10px}
.donegrid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:20px}
.opt{border:1px solid var(--line);border-radius:11px;padding:22px;background:rgba(255,255,255,.028);display:flex;flex-direction:column}
.opt.hero{border-color:rgba(200,146,92,.45);background:linear-gradient(150deg,rgba(200,146,92,.13),rgba(200,146,92,.02))}
.opt .tag{font-family:var(--mono);font-size:10px;letter-spacing:.16em;color:var(--dim)}
.opt.hero .tag{color:var(--tan)}
.opt h3{font-size:20px;font-weight:600;margin-top:9px}
.opt p{font-size:13.5px;color:var(--muted);line-height:1.55;margin-top:8px}
.opt .act{margin-top:auto;padding-top:16px;display:flex;align-items:center;gap:12px}
.mini{font-family:var(--mono);font-size:11px;letter-spacing:.12em;padding:9px 15px;border-radius:7px;border:1px solid rgba(200,146,92,.45);color:var(--tan2);background:rgba(200,146,92,.1);cursor:pointer}
.mini:hover{background:rgba(200,146,92,.2)}
.laterbtn{font-family:var(--mono);font-size:11px;letter-spacing:.12em;color:var(--dim);cursor:pointer;background:none;border:none}
.laterbtn:hover{color:var(--muted)}
.trust{font-family:var(--mono);font-size:10px;letter-spacing:.13em;color:var(--dim);margin-top:11px}

/* portfolio payoff */
.scorecard{display:grid;grid-template-columns:190px 1fr;gap:24px;margin-top:20px;border:1px solid var(--line);border-radius:12px;padding:22px;background:rgba(255,255,255,.028)}
.dialbox{display:grid;place-items:center;position:relative}
.dialbox svg{transform:rotate(-90deg)}
.dnum{position:absolute;text-align:center}
.dnum b{font-family:var(--serif);font-size:46px;line-height:1;display:block;color:var(--tan)}
.dnum span{font-family:var(--mono);font-size:9.5px;color:var(--dim);letter-spacing:.13em}
.bench{display:flex;flex-direction:column;gap:13px}
.brow{display:flex;align-items:center;gap:14px;font-size:13px}
.brow .k{width:145px;color:var(--muted)}
.brow .bar{flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden}
.brow .bar i{display:block;height:100%;border-radius:4px}
.brow .v{font-family:var(--mono);font-size:12px;width:24px;text-align:right}
.flags{border-top:1px solid var(--line);margin-top:16px;padding-top:14px;font-size:13px;color:var(--muted);line-height:1.6}
.flags b{color:var(--ink)}.flags .w{color:var(--tan2)}
.jhead{display:flex;justify-content:space-between;align-items:baseline;margin-top:22px;margin-bottom:11px}
.jhead .t{font-family:var(--mono);font-size:10.5px;letter-spacing:.17em;color:var(--dim)}
.jhead .n{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;color:var(--tan2)}
.jent{border:1px solid var(--line);border-radius:10px;padding:15px 18px;background:rgba(255,255,255,.028);margin-bottom:8px;display:flex;gap:18px;align-items:flex-start}
.jent .dt{font-family:var(--mono);font-size:10px;letter-spacing:.1em;color:var(--dim);width:74px;flex-shrink:0;padding-top:3px}
.jent .bd{flex:1}
.jent .ttl{font-size:14.5px;font-weight:600}
.jent .ttl u{text-decoration:none;font-family:var(--mono);font-size:12px;color:var(--tan2)}
.jent .dsc{font-size:13px;color:var(--muted);line-height:1.5;margin-top:5px}
.jent .dsc b{color:var(--ink)}
.jent .then{font-family:var(--serif);font-size:14px;color:var(--muted);white-space:nowrap;text-align:right}
.jent .then b{font-size:24px}

/* ---------- footer ---------- */
.bar{border-top:1px solid var(--line);padding:17px 32px;display:flex;justify-content:space-between;align-items:center;background:rgba(6,13,24,.5)}
.back{font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--dim);background:none;border:none;cursor:pointer;padding:8px 0}
.back:hover{color:var(--muted)}
.cta{display:flex;align-items:center;gap:14px}
.skip{font-family:var(--mono);font-size:11px;letter-spacing:.12em;color:var(--dim);background:none;border:none;cursor:pointer}
.skip:hover{color:var(--muted);text-decoration:underline}
.btn{font-family:var(--sans);font-size:15px;font-weight:600;padding:13px 26px;border-radius:9px;border:none;cursor:pointer;
background:linear-gradient(180deg,#F4EDE3,#E6DACA);color:#0C1626;display:flex;align-items:center;gap:9px;transition:.18s}
.btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(200,146,92,.22)}
.btn:disabled{opacity:.3;cursor:not-allowed}

/* ---------- import sheet ---------- */
.ov{position:absolute;inset:0;background:rgba(4,9,17,.8);backdrop-filter:blur(3px);z-index:50;display:none;align-items:center;justify-content:center;padding:24px}
.ov.on{display:flex}
.sheet{width:100%;max-width:740px;background:#0E1B2C;border:1px solid var(--line);border-radius:15px;padding:28px;animation:pop .3s cubic-bezier(.2,.8,.3,1);max-height:100%;overflow-y:auto}
@keyframes pop{from{transform:scale(.96);opacity:0}to{transform:none;opacity:1}}
.sh-eyebrow{font-family:var(--mono);font-size:10px;letter-spacing:.18em;color:var(--tan);margin-bottom:11px}
.sheet h2{font-family:var(--serif);font-size:27px;font-weight:600;line-height:1.2}
.sheet h2 em{font-style:italic;color:var(--tan2)}
.sheet .s{font-size:13.5px;color:var(--muted);margin-top:10px;line-height:1.55}
.paths{display:grid;grid-template-columns:1fr;gap:12px;margin-top:20px}
.path{border:1px solid var(--line);border-radius:11px;padding:20px;background:rgba(255,255,255,.03);display:flex;flex-direction:column}
.path.primary{border-color:rgba(200,146,92,.45);background:rgba(200,146,92,.07)}
.path .rank{font-family:var(--mono);font-size:9px;letter-spacing:.14em;color:var(--dim);border:1px solid var(--line);border-radius:4px;padding:3px 7px;align-self:flex-start}
.path.primary .rank{color:var(--tan2);border-color:rgba(200,146,92,.45)}
.path h3{font-size:18px;font-weight:600;margin-top:12px}
.path .tm{font-family:var(--mono);font-size:10px;color:var(--tan2);letter-spacing:.1em;margin-top:5px}
.path p{font-size:12.5px;color:var(--muted);line-height:1.5;margin-top:9px}
.bgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:14px}
.bk{border:1px solid var(--line);background:rgba(255,255,255,.04);border-radius:6px;padding:10px 4px;text-align:center;font-family:var(--mono);font-size:8.5px;color:var(--muted);cursor:pointer;transition:.16s}
.bk:hover{border-color:var(--tan);background:rgba(200,146,92,.14);color:var(--tan2)}
.mailbox{margin-top:14px;border:1px dashed var(--line);border-radius:8px;padding:13px;text-align:center;background:rgba(255,255,255,.03)}
.mailbox .ad{font-family:var(--mono);font-size:12.5px;color:var(--tan2)}
.mailbox .cp{font-family:var(--mono);font-size:9px;letter-spacing:.12em;color:var(--dim);margin-top:6px;cursor:pointer}
.scope{border-top:1px solid var(--line);margin-top:20px;padding-top:17px;display:grid;grid-template-columns:1fr 1fr;gap:18px}
.scopecol h5{font-family:var(--mono);font-size:9.5px;letter-spacing:.16em;margin-bottom:10px}
.scopecol.y h5{color:var(--pos)}.scopecol.n h5{color:var(--neg)}
.scopecol div{font-size:12.5px;color:var(--muted);display:flex;gap:9px;align-items:center;padding:4px 0}
.shfoot{display:flex;justify-content:space-between;align-items:center;margin-top:20px}
.link{font-family:var(--mono);font-size:11px;letter-spacing:.11em;color:var(--dim);background:none;border:none;cursor:pointer}
.link:hover{color:var(--muted);text-decoration:underline}
@media(max-width:960px){.mapgrid{grid-template-columns:1fr}.arrow{display:none}.mcol{margin-bottom:12px}
.pickwrap,.donegrid,.mods,.paths,.scope,.scorecard{grid-template-columns:1fr}.doors{flex-direction:column}
#onboarding-root h1{font-size:30px}.map,.later{padding:20px}.stage{padding:22px 20px}
header,.prog,.bar{padding-left:20px;padding-right:20px}.row .why{display:none}.bgrid{grid-template-columns:repeat(2,1fr)}}

@media (max-width: 640px) {
  .bar {
    flex-direction: column-reverse;
    gap: 16px;
    align-items: stretch;
    padding-bottom: 32px;
  }
  .cta {
    flex-direction: column-reverse;
    width: 100%;
    gap: 12px;
  }
  .btn {
    width: 100%;
    justify-content: center;
  }
  .skip, .back {
    width: 100%;
    text-align: center;
    padding: 12px;
  }
}
` }} />

      <div className="app">
        <header>
          <div className="logo">
            <Image src="/logos/logo-text-white.png" alt="Quantcase" width={169} height={39} className="h-7 w-auto" priority />
          </div>
          <a href="#" className="help">NEED HELP?</a>
        </header>

        <div className="prog">
          <div className="track"><div className="fill" style={{ width: (step / 3 * 100) + "%" }}></div></div>
          <div className="pct">STEP {step} OF 3</div>
        </div>

        <div className="stage">
          {step === 1 && (
            <section className="screen on">
              <div className="eyebrow">01 — START HERE</div>
              <h1>{mode === "import" ? <>Everything you own, <em>scored.</em></> : "Which stocks should we score first?"}</h1>
              <p className="lede">{mode === "import" ? "Read-only import complete. Nothing here can place a trade — we asked only to look." : "Every score comes from filings, transcripts and investor decks we've already read — 327 documents per company, cross-referenced."}</p>

              <div className="doors">
                <div className={"door " + (mode === "pick" ? "on" : "")} onClick={() => setMode("pick")}>
                  <div className="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E0A96D" strokeWidth="2.2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4" strokeLinecap="round"/></svg></div>
                  <div className="tx"><b>Search and pick three</b><span>Start fresh — nothing to connect</span></div>
                </div>
                <div className={"door " + (mode === "import" ? "on" : "")} onClick={() => setIsImportOpen(true)}>
                  <div className="ic"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E0A96D" strokeWidth="2.2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                  <div className="tx"><b>Import your holdings</b><span>Connect broker (read-only)</span></div>
                  <div className="badge">RECOMMENDED</div>
                </div>
              </div>

              <div className="pickwrap">
                <div className="picker">
                  {mode === "pick" && (
                    <div className="search">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5C6E84" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" strokeLinecap="round"/></svg>
                      <input type="text" placeholder="Search by ticker or name..." value={q} onChange={(e) => setQ(e.target.value)} />
                    </div>
                  )}
                  <div className="rowlbl">
                    <span id="listLbl">{mode === "import" ? "IMPORTED FROM ZERODHA · READ-ONLY" : "MOST FOLLOWED THIS WEEK"}</span>
                    {mode === "pick" && <b id="cntLbl">({sel.size}/3)</b>}
                  </div>
                  <div className="list">
                    {(mode === "import" ? portStocks : filtered).map((x) => (
                      <div key={x.t} className={"row " + (mode === "import" ? "ro" : sel.has(x.t) ? "sel" : "")} onClick={() => mode === "pick" && toggle(x.t)}>
                        <div className="id"><div className="tk">{x.t}</div><div className="nm">{x.n}</div></div>
                        {x.w && x.w !== 'Analysis pending' && <div className="why">{x.w}</div>}<div className="sc" style={{ color: col(x.s) }}>{x.s}</div>
                        {mode === "pick" && <div className="tick"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0C1626" strokeWidth="3.5"><path d="M4 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round"/></svg></div>}
                      </div>
                    ))}
                    {mode === "pick" && filtered.length === 0 && <div className="empty" style={{ padding: 30 }}>No match. Try a ticker like INFY.</div>}
                  </div>
                </div>

                <div className="live">
                  <h4>{mode === "import" ? "YOUR PORTFOLIO SCORE" : "YOUR WATCHLIST SCORE"}</h4>
                  <div className="dialwrap">
                    <svg width="150" height="150">
                      <circle cx="75" cy="75" r="62" stroke="rgba(255,255,255,.05)" strokeWidth="8" fill="none"/>
                      <circle cx="75" cy="75" r="62" stroke={avgScore !== null ? col(avgScore) : "#5C6E84"} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray="389.6" strokeDashoffset={avgScore !== null ? 389.6 * (1 - avgScore / 100) : 389.6}/>
                    </svg>
                    <div className="dialnum">
                      <b style={{ color: avgScore !== null ? col(avgScore) : "#5C6E84" }}>{avgScore !== null ? avgScore : "—"}</b>
                      <span>{mode === "import" ? "AVG" : "AVG SCORE"}</span>
                    </div>
                  </div>
                  <div className="dialcap">
                    {mode === "import" && avgScore !== null ? "3 HOLDINGS BELOW 55" : (
                      avgScore !== null ? (avgScore >= 75 ? "STRONG — QUALITY, FAIRLY PRICED" : avgScore >= 65 ? "MIXED — WORTH WATCHING" : "WEAK — HANDLE WITH CARE") : ""
                    )}
                  </div>
                  {mode === "pick" && (
                    <>
                      {sel.size === 0 && <div className="empty" style={{ padding: "6px 4px 0" }}>Pick up to 3 stocks to see<br/>your watchlist average.</div>}
                      <div className="chips">
                        {picks.map((p) => (
                          <span key={p.t} className="pchip">{p.t} <s onClick={(e) => { e.stopPropagation(); toggle(p.t); }}>✕</s></span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          )}

          {step === 2 && topPick && (
            <section className="screen on">
              <div className="eyebrow">02 — WHAT THE NUMBER MEANS</div>
              <h1>Your top name scores <em><span>{topPick.s}</span></em>. Here's the <em>why</em>.</h1>
              <p className="lede">Three questions, asked the same way for every company, every quarter — so the score moves only when the business does.</p>
              <div className="mods">
                <div className="mod"><div className="letter">M <u>{topPick.m}</u></div><div className="nm">Management</div><div className="q">"Do they do what they say?"</div><div className="meter"><i style={{ width: topPick.m + "%" }}></i></div><div className="ev">{topPick.m_txt || "Analysis pending"}</div></div>
                <div className="mod"><div className="letter">O <u>{topPick.o}</u></div><div className="nm">Opportunity</div><div className="q">"Is this a good place to be?"</div><div className="meter"><i style={{ width: topPick.o + "%" }}></i></div><div className="ev">{topPick.o_txt || "Analysis pending"}</div></div>
                <div className="mod"><div className="letter">D <u>{topPick.d}</u></div><div className="nm">Deal</div><div className="q">"Is the price right?"</div><div className="meter"><i style={{ width: topPick.d + "%" }}></i></div><div className="ev">{topPick.d_txt || "Analysis pending"}</div></div>
              </div>
            </section>
          )}

                    {step === 3 && (
            <section className="screen on">
              <div className="eyebrow">03 — YOUR FIRST ENTRY</div>
              <h1>
                We know <em>what</em> and <em>when</em>.<br/>Only you know <em>why</em>.
              </h1>
              <p className="lede">
                {mode === "import" 
                  ? `You bought ${topPick?.t || "HDFCBANK"} on ${userHolding ? formatDate(userHolding.created_at || userHolding.updated_at) : "12 Mar 26"} at ${userHolding ? formatPrice(userHolding.avg_price) : "₹1,610"} — we rebuilt that much from your trade history. We've drafted the reason too; correct it or accept it.`
                  : "We've pre-filled a thesis for your top pick from its strongest factor. Change a word or leave it — either way it gets checked against reality later."}
              </p>
              
              {mode === "import" ? (
                <div className="outcome">
                  <div className="ochip"><span className="ok">✓</span><b>{portStocks.length}</b> holdings scored</div>
                  <div className="ochip"><span className="ok">✓</span>Buy dates &amp; score history <b>recovered</b></div>
                  <div className="ochip"><span className="ok">✓</span>Read-only · <b>no</b> trading access</div>
                </div>
              ) : (
                <div className="outcome">
                  <div className="ochip"><span className="ok">✓</span><b>3</b> stocks tracked</div>
                  <div className="ochip"><span className="ok">✓</span>Alerts on every <b>score move</b></div>
                </div>
              )}

              <div className="s3grid">
                <div className="paper">
                  <div className="stack-wrap">
                    <div className="stack-layer" style={{ width: '90%', top: '-18px' }}></div>
                    <div className="stack-layer" style={{ width: '95%', top: '-9px' }}></div>
                    <div className="jcard" style={{ position: 'relative' }}>
                      {isSaved && (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255, 255, 255, 0.95)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--pos)" strokeWidth="2"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          <h3 style={{ marginTop: '16px', fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--ink)' }}>Entry saved</h3>
                          <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--ink-3)', textAlign: 'center', maxWidth: '80%' }}>Your thesis has been securely stored. You can view it in your dashboard.</p>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "4px" }}>
                        <div style={{ fontSize: "24px", fontFamily: "var(--serif)" }}>{topPick?.t || "TICKER"}</div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "15px", fontWeight: 600, color: "var(--jink)" }}>{mode === "import" ? (userHolding ? formatPrice(userHolding.current_price || userHolding.avg_price) : "₹1,742.30") : "₹182.40"}</div>
                          <div style={{ fontSize: "9.5px", fontFamily: "var(--mono)", color: "var(--pos)", letterSpacing: ".05em" }}>↑8.2% <span style={{ color: "var(--jink3)" }}>· MOD {topPick?.s || 0}</span></div>
                        </div>
                      </div>
                    <div style={{ fontSize: "12px", color: "var(--jink2)", marginBottom: "16px" }}>{topPick?.n || ""}</div>
                    <div style={{ display: "flex", gap: "16px", fontSize: "10px", fontFamily: "var(--mono)", letterSpacing: ".1em", marginBottom: "20px" }}>
                      <span style={{ color: "var(--jink)" }}>MANAGEMENT <b style={{ color: "var(--jink)" }}>{topPick?.m || 0}</b></span>
                      <span style={{ color: "var(--jink)" }}>OPPORTUNITY <b style={{ color: "var(--jink)" }}>{topPick?.o || 0}</b></span>
                      <span style={{ color: "var(--jink)" }}>DEAL <b style={{ color: "var(--jink)" }}>{topPick?.d || 0}</b></span>
                    </div>
                    <div style={{ background: "#F6F5F3", borderRadius: "6px", padding: "8px 12px", fontSize: "11px", color: "var(--jink2)", marginBottom: "24px" }}>
                      {mode === "import" 
                        ? <>📌 Bought <b>{userHolding ? `${userHolding.quantity} sh` : "40 sh"}</b> on <b>{userHolding ? formatDate(userHolding.created_at || userHolding.updated_at) : "12 Mar 26"}</b> at <b>{userHolding ? formatPrice(userHolding.avg_price) : "₹1,610"}</b> — score was <b>84</b> then, <b>{topPick?.s || 0}</b> now.</>
                        : <>👁 You're <b>watching</b> this, not holding it. The watch thesis converts to a position entry if you buy.</>}
                    </div>
                    
                    <OnboardingThesisFields 
                      value={thesisDraft} 
                      onChange={setThesisDraft} 
                      dimScores={{ M: topPick?.m || 0, O: topPick?.o || 0, D: topPick?.d || 0 }} 
                      onSave={handleSaveEntry}
                    />
                  </div>
                </div>
                </div>

                <div className="rail">
                  <div className="why">
                    <h4>WHY THIS MATTERS</h4>
                    <p>A score tells you <b>what changed</b>. Your note tells you <b>whether it changes anything for you</b>. We put the two side by side every time the number moves — the only way to find out if your reasoning was any good.</p>
                  </div>
                  {mode === "pick" && (
                    <div className="ask">
                      <div className="tag">THE BIGGER HALF · READ-ONLY</div>
                      <h3>Do the ones you own</h3>
                      <p>Import your holdings and every card arrives with the buy date, the score then and the score now already filled — you only write the reason.</p>
                      <div className="act">
                        <button className="mini" style={{ padding: "6px 10px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--line)", borderRadius: "6px", fontSize: "10px", fontFamily: "var(--mono)", color: "var(--tan)" }} onClick={() => setIsImportOpen(true)}>IMPORT MY HOLDINGS</button>
                        <button className="laterbtn" style={{ fontSize: "11px", color: "var(--dim)", background: "none", border: "none" }}>Maybe later</button>
                      </div>
                      <div style={{ marginTop: "16px", fontSize: "10px", fontFamily: "var(--mono)", color: "var(--dim)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        We cannot place or cancel orders
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="bar">
          <button className="back" style={{ visibility: step > 1 ? "visible" : "hidden" }} onClick={handleBack}>← BACK</button>
          <div className="cta">
            {step < 3 && <button className="skip" onClick={() => router.push("/investor/dashboard")}>Skip — just show me the app</button>}
            <button className="btn" onClick={handleNext} disabled={nextDisabled}>
              {nextLabel}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
        
        {isImportOpen && (
          <div className="ov on" onClick={() => setIsImportOpen(false)}>
            <div className="sheet" onClick={(e) => e.stopPropagation()}>
              <div className="sh-eyebrow">READ-ONLY · NO TRADING PERMISSION</div>
              <h2>Two ways in. <em>Neither lets us touch your money.</em></h2>
              <p className="s">Trading permission is a separate question, asked separately, only if you ever want to place an order here.</p>
              <div className="paths">
                <div className="path primary">
                  <span className="rank">FASTEST · RECOMMENDED</span>
                  <h3>Connect your broker</h3>
                  <div className="tm">~20 SECONDS · INCLUDES BUY DATES</div>
                  <p>Read-only scope. Brings holdings <em>and</em> the trade history we need to build your journal retroactively.</p>
                  <div className="bgrid">
                    {["ZERODHA","GROWW","UPSTOX","ANGEL ONE","ICICI","HDFC SKY","KOTAK","5PAISA"].map((b) => (
                      <div key={b} className="bk" onClick={() => connectSmallcase()}>
                        {connectStep === "creating" || connectStep === "confirming" ? "..." : b}
                      </div>
                    ))}
                  </div>
                  {connectError && <div style={{ color: "var(--neg)", marginTop: "12px", fontSize: "12px" }}>{connectError}</div>}
                </div>
              </div>
              <div className="scope">
                <div className="scopecol y"><h5>WHAT WE GET</h5>
                  <div><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3"><path d="M4 12l5 5L20 6" strokeLinecap="round"/></svg>What you hold, and how much</div>
                  <div><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3"><path d="M4 12l5 5L20 6" strokeLinecap="round"/></svg>When you bought it</div></div>
                <div className="scopecol n"><h5>WHAT WE CANNOT DO</h5>
                  <div><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="3"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/></svg>Place, modify or cancel any order</div>
                  <div><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="3"><path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/></svg>Move funds, or see your bank</div></div>
              </div>
              <div className="shfoot">
                <button className="link" onClick={() => setIsImportOpen(false)}>← I'll just pick a few instead</button>
                <span style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: ".1em", color: "var(--tan2)" }}>UNLINK ANY TIME</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
