!function(e,s){"object"==typeof exports&&"undefined"!=typeof module?s(exports):"function"==typeof define&&define.amd?define(["exports"],s):s((e="undefined"!=typeof globalThis?globalThis:e||self).Datafeeds={})}(this,(function(e){"use strict";function s(e){return void 0===e?"":"string"==typeof e?e:e.message}class t{constructor(e,s){this._datafeedUrl=e,this._requester=s}getBars(e,t,i){const r={symbol:e.ticker||"",resolution:t,from:i.from,to:i.to};return void 0!==i.countBack&&(r.countback=i.countBack),void 0!==e.currency_code&&(r.currencyCode=e.currency_code),void 0!==e.unit_id&&(r.unitId=e.unit_id),new Promise(((e,t)=>{this._requester.sendRequest(this._datafeedUrl,"history",r).then((s=>{if("ok"!==s.s&&"no_data"!==s.s)return void t(s.errmsg);const i=[],r={noData:!1};if("no_data"===s.s)r.noData=!0,r.nextTime=s.nextTime;else{const e=void 0!==s.v,t=void 0!==s.o;for(let r=0;r<s.t.length;++r){const o={time:1e3*s.t[r],close:parseFloat(s.c[r]),open:parseFloat(s.c[r]),high:parseFloat(s.c[r]),low:parseFloat(s.c[r])};t&&(o.open=parseFloat(s.o[r]),o.high=parseFloat(s.h[r]),o.low=parseFloat(s.l[r])),e&&(o.volume=parseFloat(s.v[r])),i.push(o)}}e({bars:i,meta:r})})).catch((e=>{const i=s(e);console.warn(`HistoryProvider: getBars() failed, error=${i}`),t(i)}))}))}}class i{constructor(e,s){this._subscribers={},this._requestsPending=0,this._historyProvider=e,setInterval(this._updateData.bind(this),s)}subscribeBars(e,s,t,i){this._subscribers.hasOwnProperty(i)||(this._subscribers[i]={lastBarTime:null,listener:t,resolution:s,symbolInfo:e},e.name)}unsubscribeBars(e){delete this._subscribers[e]}_updateData(){if(!(this._requestsPending>0)){this._requestsPending=0;for(const e in this._subscribers)this._requestsPending+=1,this._updateDataForSubscriber(e).then((()=>{this._requestsPending-=1,this._requestsPending})).catch((e=>{this._requestsPending-=1,s(e),this._requestsPending}))}}_updateDataForSubscriber(e){const s=this._subscribers[e],t=parseInt((Date.now()/1e3).toString()),i=t-function(e,s){let t=0;t="D"===e||"1D"===e?s:"M"===e||"1M"===e?31*s:"W"===e||"1W"===e?7*s:s*parseInt(e)/1440;return 24*t*60*60}(s.resolution,10);return this._historyProvider.getBars(s.symbolInfo,s.resolution,{from:i,to:t,countBack:2,firstDataRequest:!1}).then((s=>{this._onSubscriberDataReceived(e,s)}))}_onSubscriberDataReceived(e,s){if(!this._subscribers.hasOwnProperty(e))return;const t=s.bars;if(0===t.length)return;const i=t[t.length-1],r=this._subscribers[e];if(null!==r.lastBarTime&&i.time<r.lastBarTime)return;if(null!==r.lastBarTime&&i.time>r.lastBarTime){if(t.length<2)throw new Error("Not enough bars in history for proper pulse update. Need at least 2.");const e=t[t.length-2];r.listener(e)}r.lastBarTime=i.time,r.listener(i)}}class r{constructor(e){this._subscribers={},this._requestsPending=0,this._timers=null,this._quotesProvider=e}subscribeQuotes(e,s,t,i){this._subscribers[i]={symbols:e,fastSymbols:s,listener:t},this._createTimersIfRequired()}unsubscribeQuotes(e){delete this._subscribers[e],0===Object.keys(this._subscribers).length&&this._destroyTimers()}_createTimersIfRequired(){if(null===this._timers){const e=setInterval(this._updateQuotes.bind(this,1),1e4),s=setInterval(this._updateQuotes.bind(this,0),6e4);this._timers={fastTimer:e,generalTimer:s}}}_destroyTimers(){null!==this._timers&&(clearInterval(this._timers.fastTimer),clearInterval(this._timers.generalTimer),this._timers=null)}_updateQuotes(e){if(!(this._requestsPending>0))for(const t in this._subscribers){this._requestsPending++;const i=this._subscribers[t];this._quotesProvider.getQuotes(1===e?i.fastSymbols:i.symbols).then((e=>{this._requestsPending--,this._subscribers.hasOwnProperty(t)&&(i.listener(e),this._requestsPending)})).catch((e=>{this._requestsPending--,s(e),this._requestsPending}))}}}function o(e,s,t,i){const r=e[s];return!Array.isArray(r)||i&&!Array.isArray(r[0])?r:r[t]}function n(e,s,t){return e+(void 0!==s?"_%|#|%_"+s:"")+(void 0!==t?"_%|#|%_"+t:"")}class a{constructor(e,s,t){this._exchangesList=["NYSE","FOREX","AMEX"],this._symbolsInfo={},this._symbolsList=[],this._datafeedUrl=e,this._datafeedSupportedResolutions=s,this._requester=t,this._readyPromise=this._init(),this._readyPromise.catch((e=>{console.error(`SymbolsStorage: Cannot init, error=${e.toString()}`)}))}resolveSymbol(e,s,t){return this._readyPromise.then((()=>{const i=this._symbolsInfo[n(e,s,t)];return void 0===i?Promise.reject("invalid symbol"):Promise.resolve(i)}))}searchSymbols(e,s,t,i){return this._readyPromise.then((()=>{const r=[],o=0===e.length;e=e.toUpperCase();for(const i of this._symbolsList){const n=this._symbolsInfo[i];if(void 0===n)continue;if(t.length>0&&n.type!==t)continue;if(s&&s.length>0&&n.exchange!==s)continue;const a=n.name.toUpperCase().indexOf(e),l=n.description.toUpperCase().indexOf(e);if(o||a>=0||l>=0){if(!r.some((e=>e.symbolInfo===n))){const e=a>=0?a:8e3+l;r.push({symbolInfo:n,weight:e})}}}const n=r.sort(((e,s)=>e.weight-s.weight)).slice(0,i).map((e=>{const s=e.symbolInfo;return{symbol:s.name,full_name:s.full_name,description:s.description,exchange:s.exchange,params:[],type:s.type,ticker:s.name}}));return Promise.resolve(n)}))}_init(){const e=[],s={};for(const t of this._exchangesList)s[t]||(s[t]=!0,e.push(this._requestExchangeData(t)));return Promise.all(e).then((()=>{this._symbolsList.sort()}))}_requestExchangeData(e){return new Promise(((t,i)=>{this._requester.sendRequest(this._datafeedUrl,"symbol_info",{group:e}).then((s=>{try{this._onExchangeDataReceived(e,s)}catch(e){return void i(e instanceof Error?e:new Error(`SymbolsStorage: Unexpected exception ${e}`))}t()})).catch((e=>{s(e),t()}))}))}_onExchangeDataReceived(e,s){let t=0;try{const e=s.symbol.length,i=void 0!==s.ticker;for(;t<e;++t){const e=s.symbol[t],r=o(s,"exchange-listed",t),a=o(s,"exchange-traded",t),u=a+":"+e,c=o(s,"currency-code",t),h=o(s,"unit-id",t),d=i?o(s,"ticker",t):e,_={ticker:d,name:e,base_name:[r+":"+e],full_name:u,listed_exchange:r,exchange:a,currency_code:c,original_currency_code:o(s,"original-currency-code",t),unit_id:h,original_unit_id:o(s,"original-unit-id",t),unit_conversion_types:o(s,"unit-conversion-types",t,!0),description:o(s,"description",t),has_intraday:l(o(s,"has-intraday",t),!1),has_no_volume:l(o(s,"has-no-volume",t),void 0),visible_plots_set:l(o(s,"visible-plots-set",t),void 0),minmov:o(s,"minmovement",t)||o(s,"minmov",t)||0,minmove2:o(s,"minmove2",t)||o(s,"minmov2",t),fractional:o(s,"fractional",t),pricescale:o(s,"pricescale",t),type:o(s,"type",t),session:o(s,"session-regular",t),session_holidays:o(s,"session-holidays",t),corrections:o(s,"corrections",t),timezone:o(s,"timezone",t),supported_resolutions:l(o(s,"supported-resolutions",t,!0),this._datafeedSupportedResolutions),has_daily:l(o(s,"has-daily",t),!0),intraday_multipliers:l(o(s,"intraday-multipliers",t,!0),["1","5","15","30","60"]),has_weekly_and_monthly:o(s,"has-weekly-and-monthly",t),has_empty_bars:o(s,"has-empty-bars",t),volume_precision:l(o(s,"volume-precision",t),0),format:"price"};this._symbolsInfo[d]=_,this._symbolsInfo[e]=_,this._symbolsInfo[u]=_,void 0===c&&void 0===h||(this._symbolsInfo[n(d,c,h)]=_,this._symbolsInfo[n(e,c,h)]=_,this._symbolsInfo[n(u,c,h)]=_),this._symbolsList.push(e)}}catch(i){throw new Error(`SymbolsStorage: API error when processing exchange ${e} symbol #${t} (${s.symbol[t]}): ${Object(i).message}`)}}}function l(e,s){return void 0!==e?e:s}function u(e,s,t){const i=e[s];return Array.isArray(i)?i[t]:i}class c{constructor(e,s,o,n=1e4){this._configuration={supports_search:!1,supports_group_request:!0,supported_resolutions:["1","5","15","30","60","1D","1W","1M"],supports_marks:!1,supports_timescale_marks:!1},this._symbolsStorage=null,this._datafeedURL=e,this._requester=o,this._historyProvider=new t(e,this._requester),this._quotesProvider=s,this._dataPulseProvider=new i(this._historyProvider,n),this._quotesPulseProvider=new r(this._quotesProvider),this._configurationReadyPromise=this._requestConfiguration().then((e=>{null===e&&(e={supports_search:!1,supports_group_request:!0,supported_resolutions:["1","5","15","30","60","1D","1W","1M"],supports_marks:!1,supports_timescale_marks:!1}),this._setupWithConfiguration(e)}))}onReady(e){this._configurationReadyPromise.then((()=>{e(this._configuration)}))}getQuotes(e,s,t){this._quotesProvider.getQuotes(e).then(s).catch(t)}subscribeQuotes(e,s,t,i){this._quotesPulseProvider.subscribeQuotes(e,s,t,i)}unsubscribeQuotes(e){this._quotesPulseProvider.unsubscribeQuotes(e)}getMarks(e,t,i,r,o){if(!this._configuration.supports_marks)return;const n={symbol:e.ticker||"",from:t,to:i,resolution:o};this._send("marks",n).then((e=>{if(!Array.isArray(e)){const s=[];for(let t=0;t<e.id.length;++t)s.push({id:u(e,"id",t),time:u(e,"time",t),color:u(e,"color",t),text:u(e,"text",t),label:u(e,"label",t),labelFontColor:u(e,"labelFontColor",t),minSize:u(e,"minSize",t)});e=s}r(e)})).catch((e=>{s(e),r([])}))}getTimescaleMarks(e,t,i,r,o){if(!this._configuration.supports_timescale_marks)return;const n={symbol:e.ticker||"",from:t,to:i,resolution:o};this._send("timescale_marks",n).then((e=>{if(!Array.isArray(e)){const s=[];for(let t=0;t<e.id.length;++t)s.push({id:u(e,"id",t),time:u(e,"time",t),color:u(e,"color",t),label:u(e,"label",t),tooltip:u(e,"tooltip",t)});e=s}r(e)})).catch((e=>{s(e),r([])}))}getServerTime(e){this._configuration.supports_time&&this._send("time").then((s=>{const t=parseInt(s);isNaN(t)||e(t)})).catch((e=>{s(e)}))}searchSymbols(e,t,i,r){if(this._configuration.supports_search){const o={limit:30,query:e.toUpperCase(),type:i,exchange:t};this._send("search",o).then((e=>{if(void 0!==e.s)return e.errmsg,void r([]);r(e)})).catch((e=>{s(e),r([])}))}else{if(null===this._symbolsStorage)throw new Error("UdfCompatibleDatafeed: inconsistent configuration (symbols storage)");this._symbolsStorage.searchSymbols(e,t,i,30).then(r).catch(r.bind(null,[]))}}resolveSymbol(e,t,i,r){const o=r&&r.currencyCode,n=r&&r.unitId;function a(e){t(e)}if(this._configuration.supports_group_request){if(null===this._symbolsStorage)throw new Error("UdfCompatibleDatafeed: inconsistent configuration (symbols storage)");this._symbolsStorage.resolveSymbol(e,o,n).then(a).catch(i)}else{const t={symbol:e};void 0!==o&&(t.currencyCode=o),void 0!==n&&(t.unitId=n),this._send("symbols",t).then((e=>{var s,t,r,o,n,l,u,c,h,d,_,m,p,y,b,f,g,v,P,q,w,x,S,k,I,D,R,B,T;if(void 0!==e.s)i("unknown_symbol");else{const i=e.name,U=null!==(s=e.listed_exchange)&&void 0!==s?s:e["exchange-listed"],C=null!==(t=e.exchange)&&void 0!==t?t:e["exchange-traded"],E=null!==(r=e.full_name)&&void 0!==r?r:`${C}:${i}`;a({...e,name:i,base_name:[U+":"+i],full_name:E,listed_exchange:U,exchange:C,currency_code:null!==(o=e.currency_code)&&void 0!==o?o:e["currency-code"],original_currency_code:null!==(n=e.original_currency_code)&&void 0!==n?n:e["original-currency-code"],unit_id:null!==(l=e.unit_id)&&void 0!==l?l:e["unit-id"],original_unit_id:null!==(u=e.original_unit_id)&&void 0!==u?u:e["original-unit-id"],unit_conversion_types:null!==(c=e.unit_conversion_types)&&void 0!==c?c:e["unit-conversion-types"],has_intraday:null!==(d=null!==(h=e.has_intraday)&&void 0!==h?h:e["has-intraday"])&&void 0!==d&&d,has_no_volume:null!==(_=e.has_no_volume)&&void 0!==_?_:e["has-no-volume"],visible_plots_set:null!==(m=e.visible_plots_set)&&void 0!==m?m:e["visible-plots-set"],minmov:null!==(y=null!==(p=e.minmovement)&&void 0!==p?p:e.minmov)&&void 0!==y?y:0,minmove2:null!==(f=null!==(b=e.minmovement2)&&void 0!==b?b:e.minmove2)&&void 0!==f?f:e.minmov2,session:null!==(g=e.session)&&void 0!==g?g:e["session-regular"],session_holidays:null!==(v=e.session_holidays)&&void 0!==v?v:e["session-holidays"],supported_resolutions:null!==(w=null!==(q=null!==(P=e.supported_resolutions)&&void 0!==P?P:e["supported-resolutions"])&&void 0!==q?q:this._configuration.supported_resolutions)&&void 0!==w?w:[],has_daily:null===(S=null!==(x=e.has_daily)&&void 0!==x?x:e["has-daily"])||void 0===S||S,intraday_multipliers:null!==(I=null!==(k=e.intraday_multipliers)&&void 0!==k?k:e["intraday-multipliers"])&&void 0!==I?I:["1","5","15","30","60"],has_weekly_and_monthly:null!==(D=e.has_weekly_and_monthly)&&void 0!==D?D:e["has-weekly-and-monthly"],has_empty_bars:null!==(R=e.has_empty_bars)&&void 0!==R?R:e["has-empty-bars"],volume_precision:null!==(B=e.volume_precision)&&void 0!==B?B:e["volume-precision"],format:null!==(T=e.format)&&void 0!==T?T:"price"})}})).catch((e=>{s(e),i("unknown_symbol")}))}}getBars(e,s,t,i,r){this._historyProvider.getBars(e,s,t).then((e=>{i(e.bars,e.meta)})).catch(r)}subscribeBars(e,s,t,i,r){this._dataPulseProvider.subscribeBars(e,s,t,i)}unsubscribeBars(e){this._dataPulseProvider.unsubscribeBars(e)}_requestConfiguration(){return this._send("config").catch((e=>(s(e),null)))}_send(e,s){return this._requester.sendRequest(this._datafeedURL,e,s)}_setupWithConfiguration(e){if(this._configuration=e,void 0===e.exchanges&&(e.exchanges=[]),!e.supports_search&&!e.supports_group_request)throw new Error("Unsupported datafeed configuration. Must either support search, or support group request");!e.supports_group_request&&e.supports_search||(this._symbolsStorage=new a(this._datafeedURL,e.supported_resolutions||[],this._requester)),JSON.stringify(e)}}class h{constructor(e,s){this._datafeedUrl=e,this._requester=s}getQuotes(e){return new Promise(((t,i)=>{this._requester.sendRequest(this._datafeedUrl,"quotes",{symbols:e}).then((e=>{"ok"===e.s?t(e.d):i(e.errmsg)})).catch((e=>{const t=s(e);i(`network error: ${t}`)}))}))}}class d{constructor(e){e&&(this._headers=e)}sendRequest(e,s,t){if(void 0!==t){const e=Object.keys(t);0!==e.length&&(s+="?"),s+=e.map((e=>`${encodeURIComponent(e)}=${encodeURIComponent(t[e].toString())}`)).join("&")}const i={credentials:"same-origin"};return void 0!==this._headers&&(i.headers=this._headers),fetch(`${e}/${s}`,i).then((e=>e.text())).then((e=>JSON.parse(e)))}}e.UDFCompatibleDatafeed=class extends c{constructor(e,s=1e4){const t=new d;super(e,new h(e,t),t,s)}},Object.defineProperty(e,"__esModule",{value:!0})}));
