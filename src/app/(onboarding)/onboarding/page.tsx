"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

const STOCKS = [
  {t:'ZOMATO',n:'Zomato Ltd',w:'High growth potential',s:81,m:80,o:85,d:78},
  {t:'BLUESTONE',n:'Bluestone',w:'Strong consumer brand',s:75,m:72,o:79,d:75},
  {t:'PAYTM',n:'One97 Comm',w:'Regulatory overhang',s:52,m:30,o:70,d:60},
  {t:'HDFCBANK',n:'HDFC Bank',w:'Sector rotation target',s:78,m:75,o:82,d:77},
  {t:'RELIANCE',n:'Reliance Ind',w:'Capital intensity peak',s:72,m:70,o:80,d:65},
  {t:'YESBANK',n:'Yes Bank Ltd',w:'Asset quality concern',s:41,m:40,o:45,d:38},
  {t:'VODAIDEA',n:'Vodafone Idea',w:'Debt burden severe',s:44,m:42,o:50,d:40},
  {t:'TCS',n:'Tata Consultancy',w:'Margin resilience',s:84,m:86,o:80,d:85},
  {t:'INFY',n:'Infosys Ltd',w:'Growth guidance cut',s:68,m:70,o:65,d:69}
];
const PORT = STOCKS.slice(1,7);

export default function OnboardingV3() {
  const router = useRouter();
  const [mode, setMode] = useState("pick");
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");
  const [isImportOpen, setIsImportOpen] = useState(false);

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
    return STOCKS.filter((x) => x.t.toLowerCase().includes(q.toLowerCase()) || x.n.toLowerCase().includes(q.toLowerCase()));
  }, [q]);

  const picks = useMemo(() => [...sel].map((t) => STOCKS.find((x) => x.t === t)).filter((x): x is typeof STOCKS[0] => x !== undefined), [sel]);

  const avgScore = useMemo(() => {
    if (mode === "import") {
      return Math.round(PORT.reduce((s, p) => s + p.s, 0) / PORT.length);
    }
    if (!picks.length) return null;
    return Math.round(picks.reduce((s, p) => s + p.s, 0) / picks.length);
  }, [mode, picks]);

  const nextDisabled = mode === "import" ? false : sel.size < 3;
  const nextLabel =
    step === 1
      ? (mode === "import" ? "Score my " + PORT.length + " holdings " : (sel.size < 3 ? "Pick " + (3 - sel.size) + " more to continue " : "Score my 3 stocks "))
      : step === 2
      ? "This makes sense — continue "
      : "Open my dashboard ";

  const topPick = mode === "import" ? [...PORT].sort((a,b)=>b.s-a.s)[0] : [...picks].sort((a,b)=>b.s-a.s)[0];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      localStorage.setItem("qc_onboarding_completed", "true");
      router.push("/investor/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div id="onboarding-root">
      <style dangerouslySetInnerHTML={{ __html: `
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700;800&display=swap");
:root{--navy:#0C1626;--navy2:#101E33;--navy3:#16283F;--ink:#F2F5F9;--muted:#8FA0B4;--dim:#5C6E84;
--tan:#C8925C;--tan2:#E0A96D;--pos:#4ADE80;--neg:#F87171;--line:rgba(255,255,255,.10);
--serif:'Playfair Display',Georgia,serif;--mono:'IBM Plex Mono',ui-monospace,monospace;--sans:'Inter',sans-serif}
*{box-sizing:border-box;margin:0;padding:0}
#onboarding-root h1, #onboarding-root h2, #onboarding-root h3, #onboarding-root h4, #onboarding-root h5, #onboarding-root h6, #onboarding-root p {
  color: inherit;
  line-height: normal;
}
#onboarding-root input, #onboarding-root button {
  color: inherit;
  font-family: inherit;
  line-height: normal;
}

#onboarding-root{background:#060D18;min-height:100vh;font-family:var(--sans);color:var(--ink);-webkit-font-smoothing:antialiased}

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
.app{max-width:1240px;margin:24px auto 60px;border:1px solid var(--line);border-radius:14px;overflow:hidden;min-height:790px;display:flex;flex-direction:column;position:relative;
background:radial-gradient(900px 520px at 82% -8%,rgba(200,146,92,.10),transparent 62%),linear-gradient(170deg,var(--navy3),var(--navy2) 45%,var(--navy))}
#onboarding-root header{display:flex;justify-content:space-between;align-items:center;padding:20px 32px}
.logo{display:flex;align-items:center;gap:11px}.logo .mark{width:30px;height:30px}
.logo .wd{font-family:var(--serif);font-size:23px;color:#fff}
.help{font-family:var(--mono);font-size:11px;letter-spacing:.14em;color:var(--dim);text-decoration:none;padding:7px 12px;border-radius:6px}
.help:hover{color:var(--muted);background:rgba(255,255,255,.04)}
.prog{padding:0 32px 4px;display:flex;align-items:center;gap:14px}
.track{flex:1;height:2px;background:rgba(255,255,255,.09);border-radius:2px;overflow:hidden}
.fill{height:100%;background:linear-gradient(90deg,var(--tan),var(--tan2));width:33.3%;transition:width .5s cubic-bezier(.4,0,.2,1)}
.pct{font-family:var(--mono);font-size:10px;letter-spacing:.16em;color:var(--dim);white-space:nowrap}
.stage{flex:1;padding:30px 32px 20px;display:flex;flex-direction:column}
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
.paths{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px}
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
#onboarding-root h1{font-size:30px}.map,.later{padding:20px}.app{margin:16px;border-radius:12px}.stage{padding:22px 20px}
header,.prog,.bar{padding-left:20px;padding-right:20px}.row .why{display:none}.bgrid{grid-template-columns:repeat(2,1fr)}}
` }} />

      <div className="app">
        <header>
          <div className="logo">
            <div className="mark"><svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#C8925C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <div className="wd">Quantcase</div>
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
                    {(mode === "import" ? PORT : filtered).map((x) => (
                      <div key={x.t} className={"row " + (mode === "import" ? "ro" : sel.has(x.t) ? "sel" : "")} onClick={() => mode === "pick" && toggle(x.t)}>
                        <div className="id"><div className="tk">{x.t}</div><div className="nm">{x.n}</div></div>
                        <div className="why">{x.w}</div><div className="sc" style={{ color: col(x.s) }}>{x.s}</div>
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
                <div className="mod"><div className="letter">M <u>{topPick.m}</u></div><div className="nm">Management</div><div className="q">"Do they do what they say?"</div><div className="meter"><i style={{ width: topPick.m + "%" }}></i></div><div className="ev">Met <b>11 of 12</b> stated commitments across the last four calls.</div></div>
                <div className="mod"><div className="letter">O <u>{topPick.o}</u></div><div className="nm">Opportunity</div><div className="q">"Is this a good place to be?"</div><div className="meter"><i style={{ width: topPick.o + "%" }}></i></div><div className="ev">Sector credit growth <b>running ahead of nominal GDP</b> for six quarters.</div></div>
                <div className="mod"><div className="letter">D <u>{topPick.d}</u></div><div className="nm">Deal</div><div className="q">"Is the price right?"</div><div className="meter"><i style={{ width: topPick.d + "%" }}></i></div><div className="ev">Trading <b>12% above</b> its own five-year median multiple.</div></div>
              </div>
              <div className="provenance"><div className="n">327</div><div className="t"><b>documents read per company</b> — annual reports, investor presentations, exchange filings, concall transcripts, peer comparisons. Every line links back to the page it came from.</div></div>
            </section>
          )}

          {step === 3 && mode === "pick" && (
            <section className="screen on">
              <div className="eyebrow">03 — YOU'RE SET</div>
              <h1>Your watchlist is live.<br/>We'll tell you <em>when something changes.</em></h1>
              <p className="lede">You'll get an alert the moment a score moves — and the sentence explaining why.</p>
              <div className="summary">
                {picks.map((p) => (
                  <div key={p.t} className="scard">
                    <span className="tk">{p.t}</span>
                    <span className="sc" style={{ color: col(p.s) }}>{p.s}</span>
                    <span className="dl" style={{ color: p.s >= 70 ? "#4ADE80" : "#F87171" }}>{p.s >= 70 ? "▲" : "▼"} TRACKING</span>
                  </div>
                ))}
              </div>
              <div className="donegrid">
                <div className="opt hero">
                  <div className="tag">THE BIGGER HALF · READ-ONLY</div>
                  <h3>Now do the ones you actually own</h3>
                  <p>You're watching {sel.size}. Import your holdings and we'll score every one, flag the ones whose story changed, and write your journal backwards from trades you've already made.</p>
                  <div className="act"><button className="mini" onClick={() => setIsImportOpen(true)}>IMPORT MY HOLDINGS</button><button className="laterbtn" onClick={() => router.push("/investor/dashboard")}>Maybe later</button></div>
                  <div className="trust">NO TRADING PERMISSION</div>
                </div>
                <div className="opt">
                  <div className="tag">OPTIONAL</div>
                  <h3>Keep a decision journal</h3>
                  <p>Write down why you bought. We resurface it when the score changes, so you can check your thesis against what actually happened.</p>
                  <div className="act"><button className="mini">TURN ON JOURNAL</button><button className="laterbtn">Maybe later</button></div>
                  <div className="trust">PRIVATE TO YOU · NEVER SHARED</div>
                </div>
              </div>
            </section>
          )}

          {step === 3 && mode === "import" && (
            <section className="screen on">
              <div className="eyebrow">03 — YOU'RE SET</div>
              <h1><span>{PORT.length}</span> holdings scored. <em>And a journal you didn't have to write.</em></h1>
              <p className="lede">Rebuilt from your own trade history — what you bought, when, and what the score was that day.</p>
              <div className="scorecard">
                <div className="dialbox">
                  <svg width="160" height="160"><circle cx="80" cy="80" r="66" stroke="rgba(255,255,255,.08)" strokeWidth="10" fill="none"/>
                  <circle cx="80" cy="80" r="66" stroke="#C8925C" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray="414.7" strokeDashoffset="120"/></svg>
                  <div className="dnum"><b>71</b><span>PORTFOLIO AVG</span></div>
                </div>
                <div>
                  <div className="bench">
                    <div className="brow"><span className="k">Your portfolio</span><span className="bar"><i style={{ width: "71%", background: "#C8925C" }}></i></span><span className="v" style={{ color: "#C8925C" }}>71</span></div>
                    <div className="brow"><span className="k">Nifty 50 average</span><span className="bar"><i style={{ width: "66%", background: "#5C6E84" }}></i></span><span className="v" style={{ color: "#8FA0B4" }}>66</span></div>
                    <div className="brow"><span className="k">Your best holding</span><span className="bar"><i style={{ width: "84%", background: "#4ADE80" }}></i></span><span className="v" style={{ color: "#4ADE80" }}>84</span></div>
                    <div className="brow"><span className="k">Your worst holding</span><span className="bar"><i style={{ width: "41%", background: "#F87171" }}></i></span><span className="v" style={{ color: "#F87171" }}>41</span></div>
                  </div>
                  <div className="flags"><b>Three holdings need a look.</b> <span className="w">YESBANK (41)</span>, <span className="w">VODAIDEA (44)</span> and <span className="w">PAYTM (52)</span> all sit below 55 — and in every case Management is what's dragging. Worth understanding before it repeats.</div>
                </div>
              </div>
              <div className="jhead"><span className="t">YOUR JOURNAL — REBUILT FROM YOUR TRADES</span><span className="n">NOTHING TO WRITE</span></div>
              <div className="jent"><div className="dt">12 MAR 26</div><div className="bd"><div className="ttl">Bought <u>HDFCBANK</u> · 40 sh @ ₹1,610</div><div className="dsc">Score was <b>84</b> the day you bought. It's <b>78</b> now — Management fell after a promised disclosure didn't arrive. Business performance unchanged.</div></div><div className="then">84 → <b style={{ color: "#C8925C" }}>78</b></div></div>
              <div className="jent"><div className="dt">04 NOV 25</div><div className="bd"><div className="ttl">Bought <u>YESBANK</u> · 900 sh @ ₹21.40</div><div className="dsc">Score was <b>49</b> the day you bought — already bottom decile. It's <b>41</b> now. <b>Your longest-held low score.</b></div></div><div className="then">49 → <b style={{ color: "#F87171" }}>41</b></div></div>
              <div className="donegrid" style={{ gridTemplateColumns: "1fr" }}>
                <div className="opt">
                  <div className="tag">LAST ONE · SEPARATE PERMISSION</div>
                  <h3>Want to trade from here too?</h3>
                  <p>Right now we can only read. If you'd like to act on a signal without switching apps, that's a separate permission — and we'll ask for it the first time you tap Buy, not before.</p>
                  <div className="act"><button className="mini">ENABLE TRADING NOW</button><button className="laterbtn">Ask me when I need it</button></div>
                  <div className="trust">SEBI-REGISTERED · MONEY STAYS IN YOUR DEMAT</div>
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
                      <div key={b} className="bk" onClick={() => { setIsImportOpen(false); setMode("import"); }}>{b}</div>
                    ))}
                  </div>
                </div>
                <div className="path">
                  <span className="rank">WORKS FOR ANY BROKER</span>
                  <h3>Forward your CAS statement</h3>
                  <div className="tm">~1 MINUTE · HOLDINGS ONLY</div>
                  <p>Your monthly CDSL/NSDL statement lists everything you own across every broker. Forward the email — no account access at all.</p>
                  <div className="mailbox"><div className="ad">holdings@quantcase.in</div><div className="cp">COPY ADDRESS</div></div>
                  <p style={{ fontSize: "11.5px", color: "var(--dim)", marginTop: "11px" }}>No buy dates in a CAS, so the journal starts from today rather than backfilling.</p>
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
