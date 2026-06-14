import { useState, useEffect } from "react";
import Head from "next/head";
const CATEGORIES = [
  { id:"all",label:"全部",icon:"◈" },{ id:"hardware",label:"硬件机构",icon:"🔧" },
  { id:"software",label:"软件算法",icon:"💻" },{ id:"paper",label:"论文研究",icon:"📄" },
  { id:"industry",label:"产业动态",icon:"🏭" },{ id:"opensource",label:"开源项目",icon:"⭐" },
];
const SCORE_FILTERS=[{id:"all",label:"全部"},{id:"high",label:"高分精选"},{id:"paper",label:"论文"},{id:"opensource",label:"开源"},{id:"industry",label:"产业"}];
const SOURCES=["Boston Dynamics","Figure AI","1X Technologies","Unitree Robotics","Agility Robotics","CMU Robotics","MIT CSAIL","arXiv cs.RO","IEEE Spectrum","The Robot Report"];
const CAT_STYLE={hardware:{bg:"#3b1f6a",color:"#c4b5fd",border:"#7c3aed55"},software:{bg:"#0c2a33",color:"#00e5ff",border:"#00e5ff44"},paper:{bg:"#0a2a20",color:"#34d399",border:"#10b98144"},industry:{bg:"#2a1f0a",color:"#fbbf24",border:"#f59e0b44"},opensource:{bg:"#2a0f18",color:"#fb7185",border:"#f43f5e44"}};
const CAT_LABELS={hardware:"硬件",software:"软件",paper:"论文",industry:"产业",opensource:"开源"};
const S={
  root:{fontFamily:"'PingFang SC','Microsoft YaHei',sans-serif",background:"#0a0e1a",color:"#e2e8f0",minHeight:"100vh",position:"relative",overflow:"hidden"},
  grid:{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,backgroundImage:"linear-gradient(rgba(0,229,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,0.03) 1px,transparent 1px)",backgroundSize:"40px 40px"},
  nav:{position:"sticky",top:0,zIndex:100,background:"rgba(10,14,26,0.95)",borderBottom:"1px solid rgba(99,179,237,0.12)",padding:"0 1.5rem",display:"flex",alignItems:"center",height:52,gap:"1.5rem"},
  logo:{fontFamily:"monospace",fontSize:17,fontWeight:700,color:"#00e5ff",display:"flex",alignItems:"center",gap:7,flexShrink:0,letterSpacing:"0.04em"},
  dot:{width:8,height:8,borderRadius:"50%",background:"#00e5ff",animation:"pulse 2s infinite"},
  navTab:(a)=>({padding:"0 14px",height:52,display:"flex",alignItems:"center",fontSize:13,color:a?"#00e5ff":"#64748b",cursor:"pointer",border:"none",background:"none",borderBottom:a?"2px solid #00e5ff":"2px solid transparent",fontFamily:"inherit",transition:"all 0.2s",whiteSpace:"nowrap"}),
  dateBadge:{marginLeft:"auto",fontFamily:"monospace",fontSize:11,color:"#64748b",padding:"3px 9px",border:"1px solid rgba(99,179,237,0.12)",borderRadius:4},
  wrapper:{position:"relative",zIndex:1,maxWidth:1080,margin:"0 auto",padding:"0 1.5rem",display:"grid",gridTemplateColumns:"190px 1fr",gap:0},
  aside:{padding:"1.5rem 1.25rem 2rem 0",borderRight:"1px solid rgba(99,179,237,0.12)",minHeight:"calc(100vh - 52px)"},
  sectionLabel:{fontSize:10,fontFamily:"monospace",color:"#475569",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:6},
  catBtn:(a)=>({display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"6px 10px",borderRadius:6,fontSize:13,color:a?"#00e5ff":"#94a3b8",cursor:"pointer",border:a?"1px solid rgba(0,229,255,0.2)":"1px solid transparent",background:a?"rgba(0,229,255,0.08)":"transparent",fontFamily:"inherit",transition:"all 0.15s",marginBottom:2}),
  cntBadge:{fontFamily:"monospace",fontSize:10,color:"#475569",background:"#1a2035",padding:"1px 6px",borderRadius:3},
  statRow:{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid rgba(99,179,237,0.08)",fontSize:12},
  statLabel:{color:"#475569"},statVal:{fontFamily:"monospace",color:"#10b981",fontSize:11},
  main:{padding:"1.5rem 0 5rem 1.5rem"},
  mainHeader:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14},
  mainTitle:{fontSize:13,color:"#94a3b8"},
  filterBar:{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"},
  pill:(a)=>({padding:"4px 13px",borderRadius:20,fontSize:12,cursor:"pointer",border:a?"1px solid rgba(0,229,255,0.3)":"1px solid rgba(99,179,237,0.15)",color:a?"#00e5ff":"#94a3b8",background:a?"rgba(0,229,255,0.08)":"transparent",fontFamily:"inherit"}),
  searchWrap:{position:"relative",marginBottom:14},
  searchInput:{width:"100%",background:"#1a2035",border:"1px solid rgba(99,179,237,0.12)",borderRadius:6,padding:"8px 12px 8px 34px",fontSize:13,color:"#e2e8f0",fontFamily:"inherit",outline:"none"},
  card:{background:"#0f1424",border:"1px solid rgba(99,179,237,0.12)",borderRadius:8,padding:"1.1rem 1.35rem",marginBottom:8,position:"relative",overflow:"hidden"},
  cardAccent:{position:"absolute",left:0,top:0,bottom:0,width:3,background:"#00e5ff",borderRadius:"3px 0 0 3px"},
  cardMeta:{display:"flex",alignItems:"center",gap:10,marginBottom:7},
  cardTime:{fontFamily:"monospace",fontSize:11,color:"#475569"},
  srcDot:{width:5,height:5,borderRadius:"50%",background:"#10b981",flexShrink:0},
  cardSrc:{fontSize:11,color:"#475569",display:"flex",alignItems:"center",gap:4},
  scoreBadge:(s)=>({marginLeft:"auto",fontFamily:"monospace",fontSize:11,padding:"2px 7px",borderRadius:3,fontWeight:700,...(s>=80?{background:"rgba(16,185,129,0.15)",color:"#34d399",border:"1px solid rgba(16,185,129,0.3)"}:s>=70?{background:"rgba(245,158,11,0.12)",color:"#fbbf24",border:"1px solid rgba(245,158,11,0.25)"}:{background:"rgba(100,116,139,0.1)",color:"#64748b",border:"1px solid rgba(99,179,237,0.1)"})}),
  cardTitle:{fontSize:15,fontWeight:500,color:"#e2e8f0",lineHeight:1.5,marginBottom:7},
  cardSummary:{fontSize:13,color:"#94a3b8",lineHeight:1.7,marginBottom:9},
  cardReason:{fontSize:12,color:"#64748b",padding:"7px 11px",background:"rgba(0,229,255,0.04)",borderLeft:"2px solid rgba(0,229,255,0.18)",borderRadius:"0 4px 4px 0",marginBottom:9,lineHeight:1.6},
  reasonLabel:{color:"#00e5ff",fontFamily:"monospace",fontSize:10,letterSpacing:"0.05em",textTransform:"uppercase",display:"block",marginBottom:2},
  cardTags:{display:"flex",gap:6,flexWrap:"wrap"},
  tag:(c)=>({padding:"2px 9px",borderRadius:3,fontSize:11,...(CAT_STYLE[c]?{background:CAT_STYLE[c].bg,color:CAT_STYLE[c].color,border:`1px solid ${CAT_STYLE[c].border}`}:{background:"#1a2035",color:"#475569",border:"1px solid rgba(99,179,237,0.1)"})}),
  emptyState:{textAlign:"center",padding:"4rem 2rem",color:"#475569"},
  statusBar:{position:"fixed",bottom:0,left:0,right:0,background:"rgba(10,14,26,0.96)",borderTop:"1px solid rgba(99,179,237,0.1)",padding:"5px 1.5rem",display:"flex",alignItems:"center",gap:12,fontFamily:"monospace",fontSize:10,color:"#475569",zIndex:200},
  sDot:{width:6,height:6,borderRadius:"50%",background:"#10b981"},
  reportSection:{border:"1px solid rgba(99,179,237,0.12)",borderRadius:8,overflow:"hidden",marginBottom:12},
  reportHeader:{display:"flex",alignItems:"center",gap:8,padding:"9px 14px",background:"#1a2035",fontSize:12,fontFamily:"monospace",color:"#00e5ff",letterSpacing:"0.05em",borderBottom:"1px solid rgba(99,179,237,0.12)"},
  reportItem:{padding:"9px 14px",fontSize:13,color:"#94a3b8",lineHeight:1.6},
};
function NewsCard({item}){
  const[hovered,setHovered]=useState(false);
  return(<div style={{...S.card,borderColor:hovered?"rgba(99,179,237,0.25)":"rgba(99,179,237,0.12)",background:hovered?"#141929":"#0f1424"}}onMouseEnter={()=>setHovered(true)}onMouseLeave={()=>setHovered(false)}>
    {hovered&&<div style={S.cardAccent}/>}
    <div style={S.cardMeta}><span style={S.cardTime}>{item.time||"今日"}</span><span style={S.cardSrc}><span style={S.srcDot}/>{item.source}</span><span style={S.scoreBadge(item.score)}>精选 {item.score}</span></div>
    <div style={S.cardTitle}>{item.url?<a href={item.url}target="_blank"rel="noreferrer"style={{color:"inherit",textDecoration:"none"}}>{item.title}</a>:item.title}</div>
    <div style={S.cardSummary}>{item.summary}</div>
    <div style={S.cardReason}><span style={S.reasonLabel}>推荐理由</span>{item.reason}</div>
    <div style={S.cardTags}><span style={S.tag(item.category)}>{CAT_LABELS[item.category]||item.category}</span>{(item.tags||[]).map((t,i)=><span key={i}style={S.tag("")}>{t}</span>)}</div>
  </div>);
}
export default function RobotLab(){
  const[tab,setTab]=useState("selected");
  const[news,setNews]=useState([]);
  const[daily,setDaily]=useState(null);
  const[loading,setLoading]=useState(true);
  const[cat,setCat]=useState("all");
  const[scoreFilter,setScoreFilter]=useState("all");
  const[search,setSearch]=useState("");
  const[generatedAt,setGeneratedAt]=useState("");
  const[todayStr,setTodayStr]=useState("");
  useEffect(()=>{
    setTodayStr(new Date().toLocaleDateString("zh-CN",{month:"long",day:"numeric",weekday:"short"}));
    fetch("/data/index.json").then(r=>r.json()).then(idx=>{const latest=idx.dates&&idx.dates[0];const url=latest?"/data/news-"+latest+".json":"/data/news.json";return fetch(url).then(r=>r.json());}).then(data=>{setNews(data.items||[]);setGeneratedAt(data.generatedAt||"");setLoading(false);}).catch(()=>setLoading(false));
  },[]);
  useEffect(()=>{if(tab==="daily"&&!daily){fetch("/data/index.json").then(r=>r.json()).then(idx=>{const latest=idx.dates&&idx.dates[0];const url=latest?"/data/daily-"+latest+".json":"/data/daily.json";return fetch(url).then(r=>r.json());}).then(data=>setDaily(data.sections||[])).catch(()=>{});}},[tab]);
  const counts={all:news.length,hardware:news.filter(n=>n.category==="hardware").length,software:news.filter(n=>n.category==="software").length,paper:news.filter(n=>n.category==="paper").length,industry:news.filter(n=>n.category==="industry").length,opensource:news.filter(n=>n.category==="opensource").length};
  let filtered=[...news];
  if(cat!=="all")filtered=filtered.filter(n=>n.category===cat);
  if(scoreFilter==="high")filtered=filtered.filter(n=>n.score>=80);
  else if(scoreFilter!=="all")filtered=filtered.filter(n=>n.category===scoreFilter);
  if(search)filtered=filtered.filter(n=>(n.title+n.summary+n.reason+n.source).toLowerCase().includes(search.toLowerCase()));
  filtered.sort((a,b)=>b.score-a.score);
  const updateTime=generatedAt?new Date(generatedAt).toLocaleDateString("zh-CN",{month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"}):"每日 08:00 自动更新";
  return(<>
    <Head><title>Dr. Mao | Robot LAB</title><meta name="viewport"content="width=device-width, initial-scale=1"/><link rel="icon"href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🤖</text></svg>"/></Head>
    <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,229,255,0.4)}50%{opacity:.7;box-shadow:0 0 0 6px rgba(0,229,255,0)}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.ci{animation:fadeUp 0.35s ease both;}.ci:nth-child(1){animation-delay:0.03s}.ci:nth-child(2){animation-delay:0.07s}.ci:nth-child(3){animation-delay:0.11s}.ci:nth-child(4){animation-delay:0.15s}.ci:nth-child(5){animation-delay:0.19s}.ci:nth-child(6){animation-delay:0.23s}.ci:nth-child(7){animation-delay:0.27s}.ci:nth-child(8){animation-delay:0.31s}a:hover{opacity:0.85;}input{box-sizing:border-box;}`}</style>
    <div style={S.root}>
      <div style={S.grid}/>
      <nav style={S.nav}>
        <div style={S.logo}><span style={S.dot}/>Dr. Mao | Robot LAB</div>
        {[["selected","精选"],["daily","机器人日报"],["about","关于"]].map(([id,label])=><button key={id}style={S.navTab(tab===id)}onClick={()=>setTab(id)}>{label}</button>)}
        <span style={S.dateBadge}>{todayStr}</span>
      </nav>
      <div style={S.wrapper}>
        <aside style={S.aside}>
          <div style={{marginBottom:"1.5rem"}}>
            <div style={S.sectionLabel}>分类</div>
            {CATEGORIES.map(c=><button key={c.id}style={S.catBtn(cat===c.id)}onClick={()=>setCat(c.id)}><span>{c.icon} {c.label}</span><span style={S.cntBadge}>{counts[c.id]??0}</span></button>)}
          </div>
          <div style={{marginBottom:"1.5rem"}}>
            <div style={S.sectionLabel}>今日统计</div>
            {[["精选条数",filtered.length+" 条"],["更新时间",updateTime],["更新频率","每日 08:00"],["AI 模型","Sonnet 4"]].map(([k,v])=><div key={k}style={S.statRow}><span style={S.statLabel}>{k}</span><span style={S.statVal}>{v}</span></div>)}
          </div>
          <div><div style={S.sectionLabel}>信源方向</div>{SOURCES.map(s=><div key={s}style={{fontSize:11,color:"#475569",lineHeight:1.9}}>{s}</div>)}</div>
        </aside>
        <main style={S.main}>
          {tab==="selected"&&<>
            <div style={S.mainHeader}><div style={S.mainTitle}>AI 精选 · <span style={{color:"#00e5ff"}}>{filtered.length}</span> 条<span style={{marginLeft:10,fontSize:11,fontFamily:"monospace",color:"rgba(16,185,129,0.6)"}}>每日自动更新</span></div></div>
            <div style={S.filterBar}>{SCORE_FILTERS.map(f=><button key={f.id}style={S.pill(scoreFilter===f.id)}onClick={()=>setScoreFilter(f.id)}>{f.label}</button>)}</div>
            <div style={S.searchWrap}><span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#475569",fontSize:14}}>🔍</span><input style={S.searchInput}placeholder="搜索资讯…"value={search}onChange={e=>setSearch(e.target.value)}/></div>
            {loading?<div style={{textAlign:"center",padding:"4rem",color:"#475569",fontSize:13}}>加载中…</div>:filtered.length>0?<div>{filtered.map((item,i)=><div key={i}className="ci"><NewsCard item={item}/></div>)}</div>:<div style={S.emptyState}><div style={{fontSize:48,marginBottom:16,opacity:0.3}}>🤖</div><p style={{fontSize:14,lineHeight:1.9,color:"#475569"}}>{news.length===0?"今日内容正在生成，每天 08:00 自动更新":"暂无匹配结果"}</p></div>}
          </>}
          {tab==="daily"&&<>
            <div style={S.mainHeader}><div style={S.mainTitle}>机器人日报 · <span style={{color:"#00e5ff"}}>{todayStr}</span></div></div>
            {daily&&daily.length>0?daily.map((sec,i)=><div key={i}style={S.reportSection}><div style={S.reportHeader}>⬡ {sec.title}</div>{sec.items.map((item,j)=><div key={j}style={{...S.reportItem,borderBottom:j<sec.items.length-1?"1px solid rgba(99,179,237,0.08)":"none"}}>· {item}</div>)}</div>):<div style={S.emptyState}><div style={{fontSize:48,marginBottom:16,opacity:0.3}}>📰</div><p style={{fontSize:14,lineHeight:1.9,color:"#475569"}}>今日日报正在生成，每天 08:00 自动更新</p></div>}
          </>}
          {tab==="about"&&<div style={{maxWidth:580}}>
            <div style={{fontFamily:"monospace",fontSize:22,color:"#00e5ff",marginBottom:"1.25rem",fontWeight:700}}>Dr. Mao | Robot LAB</div>
            <p style={{fontSize:14,color:"#94a3b8",lineHeight:1.9,marginBottom:"1rem"}}>Robot LAB 是专注机器人领域的 AI 智能资讯平台，每天早上 8 点自动更新。</p>
            <div style={{border:"1px solid rgba(99,179,237,0.12)",borderRadius:8,overflow:"hidden"}}>
              <div style={{background:"#1a2035",padding:"9px 14px",fontFamily:"monospace",fontSize:11,color:"#00e5ff"}}>SYSTEM INFO</div>
              {[["关注领域","具身智能 / 仿人机器人 / 开源框架"],["信源覆盖","arXiv / GitHub / IEEE / 产业新闻"],["更新机制","GitHub Actions 每日 08:00 自动触发"],["AI 引擎","Claude Sonnet 4"],["部署方式","静态网站 · Netlify"]].map(([k,v],i,arr)=><div key={k}style={{...S.statRow,padding:"9px 14px",borderBottom:i<arr.length-1?"1px solid rgba(99,179,237,0.08)":"none"}}><span style={S.statLabel}>{k}</span><span style={S.statVal}>{v}</span></div>)}
            </div>
          </div>}
        </main>
      </div>
      <div style={S.statusBar}><span style={S.sDot}/><span style={{flex:1}}>每日 08:00 自动更新 · {updateTime}</span><span>Dr. Mao | Robot LAB v2.0</span></div>
    </div>
  </>);
}
