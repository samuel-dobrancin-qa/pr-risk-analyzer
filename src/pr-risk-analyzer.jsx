import { useState } from "react";

// ─── Secret scrubber ──────────────────────────────────────────────────────────
const SECRET_PATTERNS = [
  { label: "AWS Access Key",        regex: /AKIA[0-9A-Z]{16}/g },
  { label: "GitHub Token",          regex: /gh[pousr]_[A-Za-z0-9]{36,}/g },
  { label: "Generic API Key",       regex: /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?([A-Za-z0-9\-_.]{16,64})['"]?/gi },
  { label: "Bearer Token",          regex: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi },
  { label: "Private Key Block",     regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g },
  { label: "Generic Secret",        regex: /(?:secret|password|passwd|pwd|token)\s*[:=]\s*['"]?([^\s'"]{8,64})['"]?/gi },
  { label: "Connection String",     regex: /(?:mongodb|postgres|mysql|redis):\/\/[^\s"']+/gi },
  { label: "Email Address",         regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { label: "URL with Credentials",  regex: /https?:\/\/[^:@\s]+:[^@\s]+@[^\s]+/g },
  { label: "Internal IP",           regex: /\b(?:10|172\.(?:1[6-9]|2\d|3[01])|192\.168)\.\d{1,3}\.\d{1,3}\b/g },
];

function scrubSecrets(text) {
  let scrubbed = text;
  const found = [];
  SECRET_PATTERNS.forEach(({ label, regex }) => {
    const hits = text.match(regex);
    if (hits) {
      found.push({ label, count: [...new Set(hits)].length });
      scrubbed = scrubbed.replace(regex, `[REDACTED:${label.replace(/ /g,"_").toUpperCase()}]`);
    }
  });
  return { scrubbed, found };
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_PR = {
  url: "https://github.com/facebook/react/pull/31734",
  title: "Fix useEffect cleanup timing in StrictMode",
  repo: "facebook/react",
  files: 12,
  additions: 347,
  deletions: 89,
  diff_summary: `Modified files:
- packages/react-reconciler/src/ReactFiberHooks.js (+120, -45): Core hook lifecycle changes
- packages/react-reconciler/src/ReactFiberCommitWork.js (+80, -20): Commit phase cleanup
- packages/react-dom/src/__tests__/ReactHooksWithNoopRenderer-test.js (+90, -10): Test updates
- packages/react/src/ReactHooks.js (+15, -5): Public API surface
- packages/react-reconciler/src/ReactFiberWorkLoop.js (+42, -9): Work loop modifications`
};

// ─── Tiny components ──────────────────────────────────────────────────────────
function RiskBadge({ score }) {
  const level = score >= 75 ? "critical" : score >= 50 ? "high" : score >= 25 ? "medium" : "low";
  const C = { critical:["#fee2e2","#991b1b","#fca5a5","#ef4444"], high:["#ffedd5","#9a3412","#fdba74","#f97316"], medium:["#fef9c3","#854d0e","#fde047","#eab308"], low:["#dcfce7","#166534","#86efac","#22c55e"] };
  const [bg,text,border,dot] = C[level];
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 12px",borderRadius:20,background:bg,border:`1px solid ${border}`}}>
      <div style={{width:8,height:8,borderRadius:"50%",background:dot,boxShadow:`0 0 6px ${dot}`}}/>
      <span style={{fontSize:13,fontWeight:600,color:text,fontFamily:"'DM Mono',monospace",letterSpacing:.5}}>{level.toUpperCase()} RISK · {score}/100</span>
    </div>
  );
}

function ScoreRing({ score }) {
  const norm = 54 - 7/2, circ = 2*Math.PI*norm, dash = (score/100)*circ;
  const color = score>=75?"#ef4444":score>=50?"#f97316":score>=25?"#eab308":"#22c55e";
  return (
    <div style={{position:"relative",width:120,height:120,flexShrink:0}}>
      <svg width={120} height={120} style={{transform:"rotate(-90deg)"}}>
        <circle cx={60} cy={60} r={norm} fill="none" stroke="#e5e7eb" strokeWidth={7}/>
        <circle cx={60} cy={60} r={norm} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{transition:"stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)",filter:`drop-shadow(0 0 8px ${color}80)`}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:28,fontWeight:800,color,fontFamily:"'DM Mono',monospace",lineHeight:1}}>{score}</span>
        <span style={{fontSize:10,color:"#9ca3af",fontFamily:"'DM Mono',monospace",letterSpacing:1}}>RISK</span>
      </div>
    </div>
  );
}

function Pill({ label, color="#6366f1" }) {
  return <span style={{display:"inline-block",padding:"2px 10px",borderRadius:12,background:color+"18",border:`1px solid ${color}40`,fontSize:12,fontWeight:500,color,fontFamily:"'DM Mono',monospace"}}>{label}</span>;
}

function Card({ title, icon, children, delay=0 }) {
  return (
    <div style={{background:"#fff",borderRadius:16,border:"1px solid #e5e7eb",padding:24,animation:`fadeUp 0.5s ease ${delay}s both`}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <span style={{fontSize:18}}>{icon}</span>
        <h3 style={{margin:0,fontSize:15,fontWeight:700,color:"#111827",fontFamily:"'Sora',sans-serif"}}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function CheckItem({ text }) {
  const [done, setDone] = useState(false);
  return (
    <div onClick={()=>setDone(d=>!d)} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:"1px solid #f3f4f6",alignItems:"flex-start",cursor:"pointer"}}>
      <div style={{width:20,height:20,borderRadius:6,flexShrink:0,marginTop:1,background:done?"#dcfce7":"#f9fafb",border:`1px solid ${done?"#86efac":"#e5e7eb"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,transition:"all .15s"}}>
        {done?"✓":""}
      </div>
      <span style={{fontSize:13.5,color:done?"#9ca3af":"#374151",lineHeight:1.5,textDecoration:done?"line-through":"none",transition:"all .15s"}}>{text}</span>
    </div>
  );
}

function ComponentTag({ name, risk, reason }) {
  const c = {high:"#ef4444",medium:"#f97316",low:"#22c55e"}[risk]||"#6b7280";
  return (
    <div style={{border:`1px solid ${c}30`,borderRadius:10,padding:"10px 14px",marginBottom:8,background:c+"0a"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:reason?4:0}}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:"#1f2937",fontWeight:500}}>{name}</span>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          <div style={{width:6,height:6,borderRadius:"50%",background:c}}/>
          <span style={{fontSize:11,color:c,fontWeight:700,textTransform:"uppercase",letterSpacing:.5}}>{risk}</span>
        </div>
      </div>
      {reason&&<p style={{margin:0,fontSize:12,color:"#6b7280",lineHeight:1.5}}>{reason}</p>}
    </div>
  );
}

// ─── Transparency Panel ───────────────────────────────────────────────────────
function TransparencyPanel({ prData, onConfirm, onCancel }) {
  const { scrubbed, found } = scrubSecrets(prData.diff_summary || "");
  const rows = [
    { label:"PR URL",      value: prData.url },
    { label:"Repository",  value: prData.repo },
    { label:"PR Title",    value: prData.title },
    { label:"File count",  value: `${prData.files||"unknown"} files` },
    { label:"Diff content",value: found.length ? `Sent with ${found.length} secret type(s) redacted` : "Sent — no secrets detected" },
  ];
  const neverSent = ["Your API keys","Auth tokens","Full file contents","Your identity","Browser cookies","Repo source code"];

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{background:"#fff",borderRadius:20,maxWidth:580,width:"100%",boxShadow:"0 25px 60px rgba(0,0,0,0.25)",overflow:"hidden",animation:"fadeUp .25s ease"}}>

        {/* header */}
        <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",padding:"22px 26px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
            <span style={{fontSize:22}}>🔒</span>
            <h2 style={{margin:0,fontSize:18,fontWeight:800,color:"#f8fafc",fontFamily:"'Sora',sans-serif"}}>What gets sent to AI</h2>
          </div>
          <p style={{margin:0,fontSize:13,color:"#94a3b8",lineHeight:1.5}}>
            Review exactly what leaves your browser. Secrets are automatically redacted before anything is sent.
          </p>
        </div>

        <div style={{padding:24}}>

          {/* scrubber result */}
          {found.length > 0 ? (
            <div style={{background:"#fef3c7",border:"1px solid #fcd34d",borderRadius:12,padding:14,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:16}}>⚠️</span>
                <span style={{fontWeight:700,fontSize:14,color:"#92400e"}}>Secrets detected &amp; redacted automatically</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {found.map((f,i)=>(
                  <span key={i} style={{padding:"2px 10px",borderRadius:10,background:"#fde68a",fontSize:12,fontWeight:600,color:"#78350f",fontFamily:"'DM Mono',monospace"}}>
                    {f.label} ×{f.count}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div style={{background:"#f0fdf4",border:"1px solid #86efac",borderRadius:12,padding:14,marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>✅</span>
                <span style={{fontWeight:700,fontSize:14,color:"#166534"}}>No secrets detected in diff</span>
              </div>
            </div>
          )}

          {/* data manifest */}
          <p style={{margin:"0 0 10px",fontSize:13,fontWeight:700,color:"#374151"}}>Data sent to Anthropic API:</p>
          <div style={{background:"#f8fafc",borderRadius:10,border:"1px solid #e5e7eb",overflow:"hidden",marginBottom:16}}>
            {rows.map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:i<rows.length-1?"1px solid #f3f4f6":"none",gap:12}}>
                <span style={{fontSize:13,color:"#6b7280",fontFamily:"'DM Mono',monospace",flexShrink:0,minWidth:90}}>{r.label}</span>
                <span style={{fontSize:13,color:"#111827",flex:1,textAlign:"right",wordBreak:"break-all"}}>{r.value}</span>
                <span style={{fontSize:15,flexShrink:0}}>✅</span>
              </div>
            ))}
          </div>

          {/* redacted preview */}
          {found.length > 0 && (
            <details style={{marginBottom:16}}>
              <summary style={{fontSize:13,color:"#6366f1",cursor:"pointer",fontWeight:600,marginBottom:8,userSelect:"none"}}>
                View redacted diff preview ▾
              </summary>
              <pre style={{background:"#1e293b",color:"#94a3b8",borderRadius:10,padding:14,fontSize:11,overflow:"auto",maxHeight:150,fontFamily:"'DM Mono',monospace",lineHeight:1.6,margin:0}}>
                {scrubbed.slice(0,800)}{scrubbed.length>800?"\n…":""}
              </pre>
            </details>
          )}

          {/* never sent */}
          <div style={{background:"#f8fafc",borderRadius:10,border:"1px solid #e5e7eb",padding:14,marginBottom:22}}>
            <p style={{margin:"0 0 8px",fontSize:12,fontWeight:700,color:"#374151"}}>🚫 Never sent to any server:</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {neverSent.map(t=>(
                <span key={t} style={{padding:"2px 10px",borderRadius:10,background:"#f3f4f6",fontSize:12,color:"#6b7280",fontFamily:"'DM Mono',monospace"}}>{t}</span>
              ))}
            </div>
          </div>

          {/* actions */}
          <div style={{display:"flex",gap:10}}>
            <button onClick={onCancel} style={{flex:1,padding:13,borderRadius:10,border:"1.5px solid #e5e7eb",background:"#fff",cursor:"pointer",fontSize:14,fontWeight:600,color:"#6b7280",fontFamily:"'Sora',sans-serif"}}>
              Cancel
            </button>
            <button onClick={()=>onConfirm(scrubbed)} style={{flex:2,padding:13,borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366f1,#7c3aed)",cursor:"pointer",fontSize:14,fontWeight:700,color:"#fff",fontFamily:"'Sora',sans-serif",boxShadow:"0 4px 15px rgba(99,102,241,0.3)"}}>
              Looks good — Run Analysis →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PRRiskAnalyzer() {
  const [prUrl, setPrUrl]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [prContext, setPrContext]         = useState("");
  const [result, setResult]             = useState(null);
  const [error, setError]               = useState(null);
  const [activeTab, setActiveTab]       = useState("overview");
  const [showPanel, setShowPanel]       = useState(false);
  const [pendingData, setPendingData]   = useState(null);

  const parseJSON = text => {
    try { return JSON.parse(text.replace(/```json|```/g,"").trim()); }
    catch { const m = text.match(/\{[\s\S]*\}/); if(m) return JSON.parse(m[0]); throw new Error("Could not parse AI response."); }
  };

  const requestAnalysis = async (demo=false, urlOverride=null) => {
    if (demo) { setPendingData(DEMO_PR); setShowPanel(true); return; }
    const url = (urlOverride || prUrl)?.trim();
    if (!url) return;

    const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    if (!match) { setError("Invalid GitHub PR URL. Expected: https://github.com/owner/repo/pull/123"); return; }
    const [, owner, repo, number] = match;

    setPendingData({
      url,
      title: `PR #${number}`,
      repo: `${owner}/${repo}`,
      files: null,
      additions: null,
      deletions: null,
      diff_summary: prContext.trim() || `Pull request #${number} from ${owner}/${repo}. No additional context provided.`
    });
    setShowPanel(true);
  };

  const runAnalysis = async (scrubbedDiff) => {
    setShowPanel(false);
    setLoading(true); setError(null); setResult(null);
    const pr = pendingData;
    const prompt = `You are a senior QA engineer. Analyze this GitHub Pull Request based on the provided context and produce a thorough QA risk assessment.

Repository: ${pr.repo}
PR URL: ${pr.url}
Files changed: ${pr.files ?? "unknown"}, Additions: ${pr.additions ?? "unknown"}, Deletions: ${pr.deletions ?? "unknown"}

--- PR CONTEXT ---
${scrubbedDiff}
--- END CONTEXT ---

Based on this context, return ONLY a valid JSON object (no markdown, no backticks):
{
  "risk_score": <integer 0-100, based on scope and complexity of changes>,
  "risk_summary": "<2 specific sentences about the actual risks in this PR>",
  "affected_components": [{"name":"<actual file or component from context>","risk":"high|medium|low","reason":"<specific reason>"}],
  "test_cases": [{"id":"TC-001","area":"<area>","title":"<specific test>","steps":["step 1","step 2","step 3"],"type":"functional|regression|edge_case|integration"}],
  "regression_checklist": ["<specific item based on actual changes>"],
  "slack_message": "<emoji slack alert with risk score and key change summary, under 200 chars>"
}
Generate AS MANY test cases as the PR actually requires — use your judgment:
- A 1-line typo fix: 1-2 test cases
- A small bug fix: 2-4 test cases  
- A medium feature or refactor: 4-8 test cases
- A large or risky change: 8-15 test cases

Generate AS MANY checklist items as needed (minimum 3, maximum 15) based on actual scope.

Quality rules:
- Every test case must be specific to THIS PR — no generic "verify the page loads" tests
- Every checklist item must reference actual files or functionality changed
- If the PR is small and simple, fewer focused tests beat many vague ones
- If the PR is large and risky, cover every affected area thoroughly

Be specific to the actual PR — no generic answers. Return ONLY the JSON.`

    try {
      const res  = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:4000,messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const text = data.content.map(b=>b.text||"").join("");
      setResult({...parseJSON(text), pr});
      setActiveTab("overview");
    } catch(e) { setError(e.message||"Analysis failed."); }
    finally { setLoading(false); }
  };

  const TABS = [{id:"overview",label:"Overview",icon:"📊"},{id:"testcases",label:"Test Cases",icon:"🧪"},{id:"components",label:"Components",icon:"🗂️"},{id:"regression",label:"Regression",icon:"🔁"},{id:"slack",label:"Slack Bot",icon:"💬"}];
  const TYPE_COLOR = {functional:"#6366f1",regression:"#f97316",edge_case:"#ec4899",integration:"#0ea5e9"};

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box} body{margin:0;background:#f8fafc}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .tb:hover{background:#f3f4f6!important}
        .tb.on{background:#fff!important;color:#111827!important;box-shadow:0 1px 3px rgba(0,0,0,.1)!important}
        .ab:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 25px rgba(99,102,241,.4)!important}
        .db:hover{background:#f3f4f6!important}
        .inp:focus{outline:none;border-color:#6366f1!important;box-shadow:0 0 0 3px rgba(99,102,241,.1)!important}
      `}</style>

      {showPanel && pendingData && <TransparencyPanel prData={pendingData} onConfirm={runAnalysis} onCancel={()=>setShowPanel(false)}/>}

      <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Sora',sans-serif"}}>

        {/* Nav */}
        <div style={{background:"#fff",borderBottom:"1px solid #e5e7eb",padding:"0 32px",position:"sticky",top:0,zIndex:100}}>
          <div style={{maxWidth:900,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔬</div>
              <span style={{fontSize:17,fontWeight:800,color:"#111827",letterSpacing:-.5}}>PR Risk Analyzer</span>
              <span style={{fontSize:11,padding:"2px 8px",borderRadius:6,background:"#ede9fe",color:"#7c3aed",fontWeight:600,fontFamily:"'DM Mono',monospace"}}>BETA</span>
            </div>
            <span style={{fontSize:12,color:"#22c55e",fontWeight:600,fontFamily:"'DM Mono',monospace"}}>🔒 Secret scrubbing ON</span>
          </div>
        </div>

        <div style={{maxWidth:900,margin:"0 auto",padding:"40px 24px"}}>

          {/* Hero */}
          <div style={{textAlign:"center",marginBottom:40,animation:"fadeUp .5s ease"}}>
            <h1 style={{fontSize:38,fontWeight:800,color:"#111827",margin:"0 0 12px",letterSpacing:-1.5,lineHeight:1.15}}>
              Know What to Test<br/>
              <span style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Before You Merge</span>
            </h1>
            <p style={{fontSize:16,color:"#6b7280",maxWidth:500,margin:"0 auto",lineHeight:1.6}}>
              Instant AI-powered risk analysis, test cases &amp; regression checklists for any GitHub PR. Secrets scrubbed before anything leaves your browser.
            </p>
          </div>

          {/* Input */}
          <div style={{background:"#fff",borderRadius:20,border:"1px solid #e5e7eb",padding:28,marginBottom:32,animation:"fadeUp .5s ease .1s both",boxShadow:"0 4px 20px rgba(0,0,0,.04)"}}>
            {/* URL row */}
            <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:12}}>
              <input className="inp" type="text" value={prUrl} onChange={e=>setPrUrl(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&prContext.trim()&&requestAnalysis(false,prUrl)}
                placeholder="https://github.com/owner/repo/pull/123"
                style={{flex:1,minWidth:280,padding:"14px 18px",borderRadius:12,border:"1.5px solid #e5e7eb",fontSize:14,color:"#111827",fontFamily:"'DM Mono',monospace",background:"#fafafa",transition:"all .2s"}}
              />
            </div>
            {/* Context area */}
            <div style={{marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                <label style={{fontSize:13,fontWeight:600,color:"#374151"}}>PR Description / Context <span style={{color:"#ef4444"}}>*</span></label>
                <span style={{fontSize:11,color:"#9ca3af"}}>Paste the PR title, description, and files changed</span>
              </div>
              <textarea
                className="inp"
                value={prContext}
                onChange={e=>setPrContext(e.target.value)}
                placeholder={`Paste from the GitHub PR page, e.g.:

Title: Fix memory leak in editor model
Description: This PR fixes a memory leak that occurs when...
Files changed:
- src/vs/editor/common/model.ts
- src/vs/editor/browser/widget/codeEditorWidget.ts`}
                style={{width:"100%",minHeight:130,padding:"14px 18px",borderRadius:12,border:"1.5px solid #e5e7eb",fontSize:13,color:"#111827",fontFamily:"'DM Mono',monospace",background:"#fafafa",transition:"all .2s",resize:"vertical",lineHeight:1.6}}
              />
            </div>
            {/* Why we need this */}
            <div style={{background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontSize:14,flexShrink:0}}>💡</span>
              <p style={{margin:0,fontSize:12,color:"#0369a1",lineHeight:1.6}}>
                <strong>Why paste context?</strong> GitHub's API blocks browser requests (CORS). Pasting the PR description gives Claude real data to work with — producing accurate risk scores instead of generic guesses. Just copy the PR title, description, and file list from the GitHub page.
              </p>
            </div>
            <button className="ab" onClick={()=>requestAnalysis(false,prUrl)} disabled={loading||!prUrl.trim()||!prContext.trim()}
              style={{width:"100%",padding:"14px",borderRadius:12,border:"none",cursor:loading||!prUrl.trim()||!prContext.trim()?"not-allowed":"pointer",background:loading||!prUrl.trim()||!prContext.trim()?"#e5e7eb":"linear-gradient(135deg,#6366f1,#7c3aed)",color:loading||!prUrl.trim()||!prContext.trim()?"#9ca3af":"#fff",fontSize:14,fontWeight:700,fontFamily:"'Sora',sans-serif",transition:"all .2s",boxShadow:"0 4px 15px rgba(99,102,241,.25)"}}>
              {loading?"Analyzing…":"Analyze PR →"}
            </button>
            <div style={{display:"flex",alignItems:"center",gap:12,marginTop:16}}>
              <div style={{flex:1,height:1,background:"#f3f4f6"}}/><span style={{fontSize:12,color:"#9ca3af"}}>or try a demo</span><div style={{flex:1,height:1,background:"#f3f4f6"}}/>
            </div>
            <button className="db" onClick={()=>{setPrUrl(DEMO_PR.url);requestAnalysis(true);}} disabled={loading}
              style={{width:"100%",marginTop:14,padding:12,borderRadius:10,border:"1.5px dashed #d1d5db",background:"transparent",cursor:loading?"not-allowed":"pointer",fontSize:13,color:"#6b7280",fontFamily:"'DM Mono',monospace",transition:"all .2s"}}>
              📦 facebook/react · Fix useEffect cleanup timing in StrictMode
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:60,animation:"fadeUp .3s ease"}}>
              <div style={{width:48,height:48,borderRadius:"50%",border:"3px solid #e5e7eb",borderTopColor:"#6366f1",animation:"spin .8s linear infinite"}}/>
              <div style={{textAlign:"center"}}>
                <p style={{margin:0,fontWeight:600,color:"#111827"}}>Analyzing PR…</p>
                <p style={{margin:"4px 0 0",fontSize:13,color:"#9ca3af"}}>Reading context, assessing risk, generating test cases</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:16,marginBottom:24,color:"#991b1b",fontSize:14}}>⚠️ {error}</div>}

          {/* Results */}
          {result && !loading && (
            <div style={{animation:"fadeUp .4s ease"}}>
              <div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:14,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                <span style={{fontSize:18}}>🔀</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#111827"}}>{result.pr.title}</div>
                  <div style={{fontSize:12,color:"#6b7280",fontFamily:"'DM Mono',monospace"}}>{result.pr.repo}</div>
                </div>
                <RiskBadge score={result.risk_score}/>
              </div>

              {/* Tabs */}
              <div style={{display:"flex",gap:4,background:"#f3f4f6",padding:4,borderRadius:12,marginBottom:20,overflowX:"auto"}}>
                {TABS.map(t=>(
                  <button key={t.id} className={`tb${activeTab===t.id?" on":""}`} onClick={()=>setActiveTab(t.id)}
                    style={{flex:1,minWidth:80,padding:"8px 12px",borderRadius:9,border:"none",cursor:"pointer",background:"transparent",fontSize:13,fontWeight:activeTab===t.id?700:500,color:activeTab===t.id?"#111827":"#6b7280",fontFamily:"'Sora',sans-serif",transition:"all .15s",whiteSpace:"nowrap"}}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {activeTab==="overview" && (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <div style={{gridColumn:"1 / -1"}}>
                    <Card title="Risk Assessment" icon="🎯">
                      <div style={{display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
                        <ScoreRing score={result.risk_score}/>
                        <div style={{flex:1}}>
                          <p style={{margin:"0 0 12px",fontSize:14,color:"#374151",lineHeight:1.7}}>{result.risk_summary}</p>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                            <Pill label={`${result.test_cases?.length||0} test cases`} color="#6366f1"/>
                            <Pill label={`${result.affected_components?.length||0} components`} color="#f97316"/>
                            <Pill label={`${result.regression_checklist?.length||0} checks`} color="#0ea5e9"/>
                          </div>
                          <p style={{margin:0,fontSize:12,color:"#9ca3af",fontStyle:"italic"}}>
                            Test case count is proportional to PR scope and risk — not a fixed number.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  <Card title="Quick Stats" icon="📈" delay={.05}>
                    {[["Files Changed",result.pr.files||"—"],["Lines Added",result.pr.additions?`+${result.pr.additions}`:"—"],["Lines Removed",result.pr.deletions?`-${result.pr.deletions}`:"—"],["High-Risk Components",result.affected_components?.filter(c=>c.risk==="high").length||0]].map(([l,v])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #f3f4f6"}}>
                        <span style={{fontSize:13,color:"#6b7280"}}>{l}</span>
                        <span style={{fontSize:13,fontWeight:700,fontFamily:"'DM Mono',monospace",color:"#111827"}}>{v}</span>
                      </div>
                    ))}
                  </Card>
                  <Card title="Top Risks" icon="⚠️" delay={.1}>
                    {result.affected_components?.slice(0,4).map((c,i)=><ComponentTag key={i} name={c.name} risk={c.risk}/>)}
                  </Card>
                </div>
              )}

              {activeTab==="testcases" && (
                <Card title={`Generated Test Cases (${result.test_cases?.length || 0})`} icon="🧪">
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    {result.test_cases?.map((tc,i)=>(
                      <div key={i} style={{border:"1px solid #e5e7eb",borderRadius:12,padding:16,background:"#fafafa"}}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
                          <span style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#9ca3af"}}>{tc.id}</span>
                          <span style={{fontWeight:700,fontSize:14,color:"#111827",flex:1}}>{tc.title}</span>
                          <Pill label={tc.type?.replace("_"," ")} color={TYPE_COLOR[tc.type]||"#6366f1"}/>
                          <Pill label={tc.area} color="#0ea5e9"/>
                        </div>
                        <ol style={{margin:0,paddingLeft:20}}>
                          {tc.steps?.map((s,j)=><li key={j} style={{fontSize:13,color:"#374151",marginBottom:4,lineHeight:1.5}}>{s}</li>)}
                        </ol>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {activeTab==="components" && (
                <Card title="Affected Component Map" icon="🗂️">
                  {result.affected_components?.map((c,i)=><ComponentTag key={i} name={c.name} risk={c.risk} reason={c.reason}/>)}
                </Card>
              )}

              {activeTab==="regression" && (
                <Card title="Regression Checklist" icon="🔁">
                  <p style={{margin:"0 0 12px",fontSize:13,color:"#9ca3af"}}>
                    {result.regression_checklist?.length} items · Click to check off as you test
                  </p>
                  {result.regression_checklist?.map((item,i)=><CheckItem key={i} text={item}/>)}
                </Card>
              )}

              {activeTab==="slack" && (
                <Card title="Slack Bot Message Preview" icon="💬">
                  <p style={{margin:"0 0 16px",fontSize:13,color:"#6b7280"}}>Message your QA bot would post to #qa-alerts when this PR opens.</p>
                  <div style={{background:"#1a1d21",borderRadius:12,padding:16,fontFamily:"'DM Mono',monospace"}}>
                    <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                      <div style={{width:36,height:36,borderRadius:8,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🤖</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"baseline",marginBottom:6}}>
                          <span style={{color:"#e8e8e8",fontWeight:700,fontSize:14}}>QA Risk Bot</span>
                          <span style={{color:"#616061",fontSize:11}}>Today at {new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                        </div>
                        <div style={{color:"#d1d2d3",fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{result.slack_message}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{marginTop:14,padding:14,background:"#f8fafc",borderRadius:10,border:"1px dashed #e5e7eb"}}>
                    <p style={{margin:"0 0 6px",fontSize:12,fontWeight:700,color:"#374151"}}>💡 Integration tip</p>
                    <p style={{margin:0,fontSize:12,color:"#6b7280",lineHeight:1.6}}>Wire a GitHub webhook → backend → Slack API. Add a GitHub Action to auto-comment the risk score directly on the PR thread.</p>
                  </div>
                </Card>
              )}
            </div>
          )}

          {!result && !loading && !error && (
            <div style={{textAlign:"center",padding:"60px 0",animation:"fadeUp .5s ease .2s both"}}>
              <div style={{fontSize:64,marginBottom:16}}>🔬</div>
              <p style={{fontSize:15,color:"#9ca3af"}}>Paste a GitHub PR URL above to get started</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
