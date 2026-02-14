/**
 * Embeddable snippet generators.
 *
 * `getSnippet` returns a tiny `<script>` loader that pulls the full SDK
 * from a CDN at runtime.
 *
 * `getInlineSnippet` returns a fully self-contained inline script with
 * the core tracking logic baked in -- zero external dependencies.
 */

// ---------------------------------------------------------------------------
// CDN-backed loader snippet
// ---------------------------------------------------------------------------

/**
 * Return a `<script>` tag that loads AgentPulse from a CDN, initialises it
 * with the supplied `siteId`, and auto-detects WebMCP support.
 *
 * Users paste this into their HTML `<head>`.
 */
export function getSnippet(siteId: string): string {
  // The loader is intentionally small and human-readable.  It creates a
  // global `__agentPulse` handle for later programmatic access.
  return `<script>
(function(w,d,s,id){
  if(w.__agentPulse)return;
  w.__agentPulseQueue=[];
  w.__agentPulse={track:function(e){w.__agentPulseQueue.push(e)}};
  var js=d.createElement(s);js.id=id;js.async=true;
  js.src="https://cdn.agent-pulse.dev/v1/agent-pulse.min.js";
  js.onload=function(){
    w.__agentPulse=AgentPulse.init({siteId:"${escapeJs(siteId)}"});
    w.__agentPulseQueue.forEach(function(e){w.__agentPulse.track(e)});
    w.__agentPulseQueue=[];
  };
  d.head.appendChild(js);
})(window,document,"script","agent-pulse-js");
</script>`;
}

// ---------------------------------------------------------------------------
// Fully inline snippet (zero external dependencies)
// ---------------------------------------------------------------------------

/**
 * Return a self-contained `<script>` tag with all core tracking logic
 * inlined.  This is ideal for users who want zero CDN calls.
 *
 * The inline version is intentionally stripped down to the essentials:
 * event collection, form-submit interception, and beacon delivery.
 */
export function getInlineSnippet(siteId: string): string {
  const escaped = escapeJs(siteId);

  // The inline body is written as a readable IIFE.  A real production
  // pipeline would minify this further, but readability is preferred here
  // so that adopters can audit the snippet before pasting.
  return `<script>
(function(){
  "use strict";
  var SITE_ID="${escaped}";
  var ENDPOINT="/api/agent-pulse";
  var BATCH=10;
  var INTERVAL=5000;

  /* ---- helpers ---- */
  function uuid(){
    if(typeof crypto!=="undefined"&&typeof crypto.randomUUID==="function") return crypto.randomUUID();
    var b=new Uint8Array(16);
    if(crypto&&crypto.getRandomValues) crypto.getRandomValues(b);
    else for(var i=0;i<16;i++) b[i]=Math.floor(Math.random()*256);
    return Array.from(b,function(v){return("0"+v.toString(16)).slice(-2)}).join("");
  }
  function now(){return new Date().toISOString()}
  function keys(o){try{return Object.keys(o)}catch(e){return[]}}

  var sid=uuid();
  var queue=[];
  var lastAgent=null;

  /* ---- flush ---- */
  function flush(){
    if(!queue.length) return;
    var batch=queue.splice(0);
    var body=JSON.stringify({events:batch});
    try{
      if(navigator.sendBeacon) navigator.sendBeacon(ENDPOINT,new Blob([body],{type:"application/json"}));
      else fetch(ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:body,keepalive:true});
    }catch(e){}
  }
  setInterval(flush,INTERVAL);
  if(typeof document!=="undefined"){
    document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")flush()});
  }
  if(typeof window!=="undefined"){
    window.addEventListener("pagehide",flush);
  }

  /* ---- track ---- */
  function track(type,data){
    queue.push({type:type,siteId:SITE_ID,sessionId:sid,timestamp:now(),data:data});
    if(queue.length>=BATCH) flush();
  }

  /* ---- form submit listener ---- */
  if(typeof document!=="undefined"){
    document.addEventListener("submit",function(e){
      if(typeof e.agentInvoked==="boolean") lastAgent=e.agentInvoked;
    },true);
  }

  /* ---- WebMCP hooks ---- */
  function hookModelContext(){
    if(typeof navigator==="undefined"||!navigator.modelContext) return;
    var mc=navigator.modelContext;
    var origReg=mc.registerTool.bind(mc);
    mc.registerTool=function(tool){
      track("tool_register",{toolName:tool.name,hasSchema:!!tool.inputSchema,declarative:false});
      var origExec=tool.execute;
      tool.execute=function(input){
        var t0=performance.now();var ok=true;
        var ai=lastAgent;lastAgent=null;
        return origExec.apply(tool,arguments).then(function(r){
          track("tool_call",{toolName:tool.name,agentInvoked:!!ai,responseTimeMs:performance.now()-t0,success:true,inputKeys:keys(input)});
          return r;
        }).catch(function(err){
          track("tool_error",{toolName:tool.name,errorType:err&&err.name||"UnknownError",message:String(err&&err.message||err)});
          track("tool_call",{toolName:tool.name,agentInvoked:!!ai,responseTimeMs:performance.now()-t0,success:false,inputKeys:keys(input)});
          throw err;
        });
      };
      origReg(tool);
    };
    var tc=(mc.tools&&mc.tools.length)||0;
    track("agent_visit",{toolCount:tc,userAgent:navigator.userAgent||"",referrer:document.referrer||""});
  }

  /* ---- init ---- */
  if(typeof document!=="undefined"&&document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",hookModelContext);
  }else{
    hookModelContext();
  }

  /* ---- public handle ---- */
  if(typeof window!=="undefined"){
    window.__agentPulse={siteId:SITE_ID,sessionId:sid,flush:flush};
  }
})();
</script>`;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/** Escape a string for safe inclusion inside a JS string literal. */
function escapeJs(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/<\//g, '<\\/');
}
