// ==FILE: js/components/Slider.js (All-in-one)==
'use strict';

// -- Embla Carousel Minified Engine Core -------------------------
// NOTE: Preserved exactly from source module 27312 to ensure 100% fidelity.
function i(t){return"[object Object]"===Object.prototype.toString.call(t)||Array.isArray(t)}
function o(t,e){let n=Object.keys(t),r=Object.keys(e);return n.length===r.length&&JSON.stringify(Object.keys(t.breakpoints||{}))===JSON.stringify(Object.keys(e.breakpoints||{}))&&n.every(n=>{let r=t[n],u=e[n];return"function"==typeof r?`${r}`==`${u}`:i(r)&&i(u)?o(r,u):r===u})}
function u(t){return t.concat().sort((t,e)=>t.name>e.name?1:-1).map(t=>t.options)}
function c(t){return"number"==typeof t}
function l(t){return"string"==typeof t}
function s(t){return"boolean"==typeof t}
function a(t){return"[object Object]"===Object.prototype.toString.call(t)}
function f(t){return Math.abs(t)}
function d(t){return Math.sign(t)}
function p(t){return v(t).map(Number)}
function m(t){return t[g(t)]}
function g(t){return Math.max(0,t.length-1)}
function h(t,e=0){return Array.from(Array(t),(t,n)=>e+n)}
function v(t){return Object.keys(t)}
function b(t,e){return void 0!==e.MouseEvent&&t instanceof e.MouseEvent}
function x(){let t=[],e={add:function(n,r,i,o={passive:!0}){let u;return"addEventListener"in n?(n.addEventListener(r,i,o),u=()=>n.removeEventListener(r,i,o)):(n.addListener(i),u=()=>n.removeListener(i)),t.push(u),e},clear:function(){t=t.filter(t=>t())}};return e}
function y(t=0,e=0){let n=f(t-e);function r(n){return n<t||n>e}return{length:n,max:e,min:t,constrain:function(n){return r(n)?n<t?t:e:n},reachedAny:r,reachedMax:function(t){return t>e},reachedMin:function(e){return e<t},removeOffset:function(t){return n?t-n*Math.ceil((t-e)/n):t}}}
function S(t){let e=t;function n(t){return c(t)?t:t.get()}return{get:function(){return e},set:function(t){e=n(t)},add:function(t){e+=n(t)},subtract:function(t){e-=n(t)}}}
function w(t,e){let n="x"===t.scroll?function(t){return`translate3d(${t}px,0px,0px)`}:function(t){return`translate3d(0px,${t}px,0px)`},r=e.style,i=null,o=!1;return{clear:function(){!o&&(r.transform="",e.getAttribute("style")||e.removeAttribute("style"))},to:function(e){if(o)return;let u=Math.round(100*t.direction(e))/100;u!==i&&(r.transform=n(u),i=u)},toggleActive:function(t){o=!t}}}
let E={align:"center",axis:"x",container:null,slides:null,containScroll:"trimSnaps",direction:"ltr",slidesToScroll:1,inViewThreshold:0,breakpoints:{},dragFree:!1,dragThreshold:10,loop:!1,skipSnaps:!1,duration:25,startIndex:0,active:!0,watchDrag:!0,watchResize:!0,watchSlides:!0,watchFocus:!0};

function O(t,e,n){let r,i,o,u,j,k,D,N,I=t.ownerDocument,L=I.defaultView,A=function(t){function e(t,e){return function t(e,n){return[e,n].reduce((e,n)=>(v(n).forEach(r=>{let i=e[r],o=n[r],u=a(i)&&a(o);e[r]=u?t(i,o):o}),e),{})}(t,e||{})}return{mergeOptions:e,optionsAtMedia:function(n){let r=n.breakpoints||{},i=v(r).filter(e=>t.matchMedia(e).matches).map(t=>r[t]).reduce((t,n)=>e(t,n),{});return e(n,i)},optionsMediaQueries:function(e){return e.map(t=>v(t.breakpoints||{})).reduce((t,e)=>t.concat(e),[]).map(t.matchMedia)}}}(L),M=(N=[],{init:function(t,e){return(N=e.filter(({options:t})=>!1!==A.optionsAtMedia(t).active)).forEach(e=>e.init(t,A)),e.reduce((t,e)=>Object.assign(t,{[e.name]:e}),{})},destroy:function(){N=N.filter(t=>t.destroy())}}),P=x(),F=(i={},o={init:function(t){r=t},emit:function(t){return(i[t]||[]).forEach(e=>e(r,t)),o},off:function(t,e){return i[t]=(i[t]||[]).filter(t=>t!==e),o},on:function(t,e){return i[t]=(i[t]||[]).concat([e]),o},clear:function(){i={}}}),{mergeOptions:T,optionsAtMedia:C,optionsMediaQueries:V}=A,{on:z,off:B,emit:H}=F,R=!1,$=T(E,O.globalOptions),U=T($),q=[];function J(e,n){R||(U=C($=T($,e)),q=n||q,function(){let{container:e,slides:n}=U;k=(l(e)?t.querySelector(e):e)||t.children[0];let r=l(n)?k.querySelectorAll(n):n;D=[].slice.call(r||k.children)}(),u=function e(n){let r=function(t,e,n,r,i,o,u){var a,E;let O,j,k,D,N,I,L,A,M,P,F,T,C,V,{align:z,axis:B,direction:H,startIndex:R,loop:$,duration:U,dragFree:q,dragThreshold:J,inViewThreshold:K,slidesToScroll:X,skipSnaps:_,containScroll:G,watchResize:Q,watchSlides:Y,watchDrag:W,watchFocus:Z}=o,tt={measure:function(t){let{offsetTop:e,offsetLeft:n,offsetWidth:r,offsetHeight:i}=t;return{top:e,right:n+r,bottom:e+i,left:n,width:r,height:i}}},te=tt.measure(e),tn=n.map(tt.measure),tr=(j="rtl"===H,D=(k="y"===B)||!j?1:-1,N=k?"top":j?"right":"left",I=k?"bottom":j?"left":"right",{scroll:k?"y":"x",cross:k?"x":"y",startEdge:N,endEdge:I,measureSize:function(t){let{height:e,width:n}=t;return k?e:n},direction:function(t){return t*D}}),ti=tr.measureSize(te),to={measure:function(t){return t/100*ti}},tu=(a=z,E=ti,O={start:function(){return 0},center:function(t){return(E-t)/2},end:function(t){return E-t}},{measure:function(t,e){return l(a)?O[a](t):a(E,t,e)}}),tc=!$&&!!G,{slideSizes:tl,slideSizesWithGaps:ts,startGap:ta,endGap:tf}=function(t,e,n,r,i,o){let{measureSize:u,startEdge:c,endEdge:l}=t,s=n[0]&&i,a=function(){if(!s)return 0;let t=n[0];return f(e[c]-t[c])}(),d=s?parseFloat(o.getComputedStyle(m(r)).getPropertyValue(`margin-${l}`)):0,p=n.map(u),h=n.map((t,e,n)=>{let r=e===g(n);return e?r?p[e]+d:n[e+1][c]-t[c]:p[e]+a}).map(f);return{slideSizes:p,slideSizesWithGaps:h,startGap:a,endGap:d}}(tr,te,tn,n,$||!!G,i),td=function(t,e,n,r,i,o,u,l,s){let{startEdge:a,endEdge:d,direction:h}=t,v=c(n);return{groupSlides:function(t){return v?p(t).filter(t=>t%n==0).map(e=>t.slice(e,e+n)):t.length?p(t).reduce((n,c,s)=>{let p=m(n)||0,v=c===g(t),b=i[a]-o[p][a],x=i[a]-o[c][d],y=r||0!==p?0:h(u),S=f(x-(!r&&v?h(l):0)-(b+y));return s&&S>e+2&&n.push(c),v&&n.push(t.length),n},[]).map((e,n,r)=>{let i=Math.max(r[n-1]||0);return t.slice(i,e)}):[]}}}(tr,ti,X,$,te,tn,ta,tf,0),{snaps:tp,snapsAligned:tm}=function(t,e,n,r,i){let{startEdge:o,endEdge:u}=t,{groupSlides:c}=i,l=c(r).map(t=>m(t)[u]-t[0][o]).map(f).map(e.measure),s=r.map(t=>n[o]-t[o]).map(t=>-f(t)),a=c(s).map(t=>t[0]).map((t,e)=>t+l[e]);return{snaps:s,snapsAligned:a}}(tr,tu,te,tn,td),tg=-m(tp)+m(ts),{snapsContained:th,scrollContainLimit:tv}=function(t,e,n,r,i){let o,u,c=y(-e+t,0),l=n.map((t,e)=>{let{min:r,max:i}=c,o=c.constrain(t),u=e===g(n);return e?u||function(t,e){return 1>=f(t-e)}(r,o)?r:function(t,e){return 1>=f(t-e)}(i,o)?i:o:i}).map(t=>parseFloat(t.toFixed(3))),s=(o=l[0],u=m(l),y(l.lastIndexOf(o),l.indexOf(u)+1));return{snapsContained:function(){if(e<=t+2)return[c.max];if("keepSnaps"===r)return l;let{min:n,max:i}=s;return l.slice(n,i)}(),scrollContainLimit:s}}(ti,tg,tm,G,0),tb=tc?th:tm,{limit:tx}=(L=tb[0],{limit:y($?L-tg:m(tb),L)}),ty=function t(e,n,r){let{constrain:i}=y(0,e),o=e+1,u=c(n);function c(t){return r?f((o+t)%o):i(t)}function l(){return t(e,u,r)}let s={get:function(){return u},set:function(t){return u=c(t),s},add:function(t){return l().set(u+t)},clone:l};return s}(g(tb),R,$),tS=ty.clone(),tw=p(n),tE=function(t,e,n,r){let i=x(),o=1e3/60,u=null,c=0,l=0;function s(t){if(!l)return;u||(u=t,n(),n());let i=t-u;for(u=t,c+=i;c>=o;)n(),c-=o;r(c/o),l&&(l=e.requestAnimationFrame(s))}function a(){e.cancelAnimationFrame(l),u=null,c=0,l=0}return{init:function(){i.add(t,"visibilitychange",()=>{t.hidden&&(u=null,c=0)})},destroy:function(){a(),i.clear()},start:function(){l||(l=e.requestAnimationFrame(s))},stop:a,update:n,render:r}}(r,i,()=>(({dragHandler:t,scrollBody:e,scrollBounds:n,options:{loop:r}})=>{r||n.constrain(t.pointerDown()),e.seek()})(tV),t=>(({scrollBody:t,translate:e,location:n,offsetLocation:r,previousLocation:i,scrollLooper:o,slideLooper:u,dragHandler:c,animation:l,eventHandler:s,scrollBounds:a,options:{loop:f}},d)=>{let p=t.settled(),m=!a.shouldConstrain(),g=f?p:p&&m,h=g&&!c.pointerDown();h&&l.stop();let v=n.get()*d+i.get()*(1-d);r.set(v),f&&(o.loop(t.direction()),u.loop()),e.to(r.get()),h&&s.emit("settle"),g||s.emit("scroll")})(tV,t)),tO=tb[ty.get()],tj=S(tO),tk=S(tO),tD=S(tO),tN=S(tO),tI=function(t,e,n,r,i,o){let u=0,c=0,l=i,s=.68,a=t.get(),p=0;function m(t){return l=t,h}function g(t){return s=t,h}let h={direction:function(){return c},duration:function(){return l},velocity:function(){return u},seek:function(){let e=r.get()-t.get(),i=0;return l?(n.set(t),u+=e/l,u*=s,a+=u,t.add(u),i=a-p):(u=0,n.set(r),t.set(r),i=e),c=d(i),p=a,h},settled:function(){return .001>f(r.get()-e.get())},useBaseFriction:function(){return g(.68)},useBaseDuration:function(){return m(i)},useFriction:g,useDuration:m};return h}(tj,tD,tk,tN,U,0),tL=function(t,e,n,r,i){let{reachedAny:o,removeOffset:u,constrain:c}=r;function l(t){return t.concat().sort((t,e)=>f(t)-f(e))[0]}function s(e,r){let i=[e,e+n,e-n];if(!t)return e;if(!r)return l(i);let o=i.filter(t=>d(t)===r);return o.length?l(o):m(i)-n}return{byDistance:function(n,r){let l=i.get()+n,{index:a,distance:d}=function(n){let r=t?u(n):c(n),{index:i}=e.map((t,e)=>({diff:s(t-r,0),index:e})).sort((t,e)=>f(t.diff)-f(e.diff))[0];return{index:i,distance:r}}(l),p=!t&&o(l);if(!r||p)return{index:a,distance:n};let m=n+s(e[a]-d,0);return{index:a,distance:m}},byIndex:function(t,n){let r=s(e[t]-i.get(),n);return{index:t,distance:r}},shortcut:s}}($,tb,tg,tx,tN),tA=function(t,e,n,r,i,o,u){function c(i){let c=i.distance,l=i.index!==e.get();o.add(c),c&&(r.duration()?t.start():(t.update(),t.render(1),t.update())),l&&(n.set(e.get()),e.set(i.index),u.emit("select"))}return{distance:function(t,e){c(i.byDistance(t,e))},index:function(t,n){let r=e.clone().set(t);c(i.byIndex(r.get(),n))}}}(tE,ty,tS,tI,tL,tN,u),tM=function(t){let{max:e,length:n}=t;return{get:function(t){return n?-((t-e)/n):0}}}(tx),tP=x(),tF=(M={},P=null,F=null,T=!1,{init:function(){A=new IntersectionObserver(t=>{T||(t.forEach(t=>{M[n.indexOf(t.target)]=t}),P=null,F=null,u.emit("slidesInView"))},{root:e.parentElement,threshold:K}),n.forEach(t=>A.observe(t))},destroy:function(){A&&A.disconnect(),T=!0},get:function(t=!0){if(t&&P)return P;if(!t&&F)return F;let e=v(M).reduce((e,n)=>{let r=parseInt(n),{isIntersecting:i}=M[r];return(t&&i||!t&&!i)&&e.push(r),e},[]);return t&&(P=e),t||(F=e),e}}),{slideRegistry:tT}=function(t,e,n,r,i,o){let u,{groupSlides:c}=i,{min:l,max:s}=r;return{slideRegistry:(u=c(o),1===n.length?[o]:t&&"keepSnaps"!==e?u.slice(l,s).map((t,e,n)=>{let r=e===g(n);return e?r?h(g(o)-m(n)[0]+1,m(n)[0]):t:h(m(n[0])+1)}):u)}}(tc,G,tb,tv,td,tw),tC=function(t,e,n,r,i,o,u,l){let a={passive:!0,capture:!0},f=0;function d(t){"Tab"===t.code&&(f=new Date().getTime())}return{init:function(p){l&&(o.add(document,"keydown",d,!1),e.forEach((e,d)=>{o.add(e,"focus",e=>{(s(l)||l(p,e))&&function(e){if(new Date().getTime()-f>10)return;u.emit("slideFocusStart"),t.scrollLeft=0;let o=n.findIndex(t=>t.includes(e));c(o)&&(i.useDuration(0),r.index(o,0),u.emit("slideFocus"))}(d)},a)}))}}}(t,n,tT,tA,tI,tP,u,Z),tV={ownerDocument:r,ownerWindow:i,eventHandler:u,containerRect:te,slideRects:tn,animation:tE,axis:tr,dragHandler:function(t,e,n,r,i,o,u,c,l,a,p,m,g,h,v,S,w,E,O){let{cross:j,direction:k}=t,D=["INPUT","SELECT","TEXTAREA"],N={passive:!1},I=x(),L=x(),A=y(50,225).constrain(h.measure(20)),M={mouse:300,touch:400},P={mouse:500,touch:600},F=v?43:25,T=!1,C=0,V=0,z=!1,B=!1,H=!1,R=!1;function $(t){if(!b(t,r)&&t.touches.length>=2)return U(t);let e=o.readPoint(t),n=o.readPoint(t,j),u=f(e-C),l=f(n-V);if(!B&&!R&&(!t.cancelable||!(B=u>l)))return U(t);let s=o.pointerMove(t);u>S&&(H=!0),a.useFriction(.3).useDuration(.75),c.start(),i.add(k(s)),t.preventDefault()}function U(t){var e;let n,r,i=p.byDistance(0,!1).index!==m.get(),u=o.pointerUp(t)*(v?P:M)[R?"mouse":"touch"],c=(e=k(u),n=m.add(-1*d(e)),r=p.byDistance(e,!v).distance,v||f(e)<A?r:w&&i?.5*r:p.byIndex(n.get(),0).distance),s=function(t,e){var n,r;if(0===t||0===e||f(t)<=f(e))return 0;let i=(n=f(t),r=f(e),f(n-r));return f(i/t)}(u,c);B=!1,z=!1,L.clear(),a.useDuration(F-10*s).useFriction(.68+s/50),l.distance(c,!v),R=!1,g.emit("pointerUp")}function q(t){H&&(t.stopPropagation(),t.preventDefault(),H=!1)}return{init:function(t){O&&I.add(e,"dragstart",t=>t.preventDefault(),N).add(e,"touchmove",()=>void 0,N).add(e,"touchend",()=>void 0).add(e,"touchstart",c).add(e,"mousedown",c).add(e,"touchcancel",U).add(e,"contextmenu",U).add(e,"click",q,!0);function c(c){(s(O)||O(t,c))&&function(t){let c,l=b(t,r);if((R=l,H=v&&l&&!t.buttons&&T,T=f(i.get()-u.get())>=2,!l||0===t.button)&&(c=t.target.nodeName||"",!D.includes(c))){let r;z=!0,o.pointerDown(t),a.useFriction(0).useDuration(0),i.set(u),r=R?n:e,L.add(r,"touchmove",$,N).add(r,"touchend",U).add(r,"mousemove",$,N).add(r,"mouseup",U),C=o.readPoint(t),V=o.readPoint(t,j),g.emit("pointerDown")}}(c)}},destroy:function(){I.clear(),L.clear()},pointerDown:function(){return z}}}(tr,t,r,i,tN,function(t,e){let n,r;function i(t){return t.timeStamp}function o(n,r){let i=r||t.scroll,o=`client${"x"===i?"X":"Y"}`;return(b(n,e)?n:n.touches[0])[o]}return{pointerDown:function(t){return n=t,r=t,o(t)},pointerMove:function(t){let e=o(t)-o(r),u=i(t)-i(n)>170;return r=t,u&&(n=t),e},pointerUp:function(t){if(!n||!r)return 0;let e=o(r)-o(n),u=i(t)-i(n),c=i(t)-i(r)>170,l=e/u;return u&&!c&&f(l)>.1?l:0},readPoint:o}}(tr,i),tj,tE,tA,tI,tL,ty,u,to,q,J,_,0,W),eventStore:tP,percentOfView:to,index:ty,indexPrevious:tS,limit:tx,location:tj,offsetLocation:tD,previousLocation:tk,options:o,resizeHandler:function(t,e,n,r,i,o,u){let c,l,a=[t].concat(r),d=[],p=!1;function m(t){return i.measureSize(u.measure(t))}return{init:function(i){o&&(l=m(t),d=r.map(m),c=new ResizeObserver(n=>{(s(o)||o(i,n))&&function(n){for(let o of n){if(p)return;let n=o.target===t,u=r.indexOf(o.target),c=n?l:d[u];if(f(m(n?t:r[u])-c)>=.5){i.reInit(),e.emit("resize");break}}}(n)}),n.requestAnimationFrame(()=>{a.forEach(t=>c.observe(t))}))},destroy:function(){p=!0,c&&c.disconnect()}}}(e,u,i,n,tr,Q,tt),scrollBody:tI,scrollBounds:function(t,e,n,r,i){let o=i.measure(10),u=i.measure(50),c=y(.1,.99),l=!1;function s(){return!l&&!!t.reachedAny(n.get())&&!!t.reachedAny(e.get())}return{shouldConstrain:s,constrain:function(i){if(!s())return;let l=t.reachedMin(e.get())?"min":"max",a=f(t[l]-e.get()),d=n.get()-e.get(),p=c.constrain(a/u);n.subtract(d*p),!i&&f(d)<o&&(n.set(t.constrain(n.get())),r.useDuration(25).useBaseFriction())},toggleActive:function(t){l=!t}}}(tx,tD,tN,tI,to),scrollLooper:function(t,e,n,r){let{reachedMin:i,reachedMax:o}=y(e.min+.1,e.max+.1);return{loop:function(e){if(!(1===e?o(n.get()):-1===e&&i(n.get())))return;let u=-1*e*t;r.forEach(t=>t.add(u))}}}(tg,tx,tD,[tj,tD,tk,tN]),scrollProgress:tM,scrollSnapList:tb.map(tM.get),scrollSnaps:tb,scrollTarget:tL,scrollTo:tA,slideLooper:function(t,e,n,r,i,o,u,c,l){let s=p(i),a=p(i).reverse(),f=g(m(a,u[0]),n,!1).concat(g(m(s,e-u[0]-1),-n,!0));function d(t,e){return t.reduce((t,e)=>t-i[e],e)}function m(t,e){return t.reduce((t,n)=>d(t,e)>0?t.concat([n]):t,[])}function g(i,u,s){let a=o.map((t,n)=>({start:t-r[n]+.5+u,end:t+e-.5+u}));return i.map(e=>{let r=s?0:-n,i=s?n:0,o=a[e][s?"end":"start"];return{index:e,loopPoint:o,slideLocation:S(-1),translate:w(t,l[e]),target:()=>c.get()>o?r:i}})}return{canLoop:function(){return f.every(({index:t})=>.1>=d(s.filter(e=>e!==t),e))},clear:function(){f.forEach(t=>t.translate.clear())},loop:function(){f.forEach(t=>{let{target:e,translate:n,slideLocation:r}=t,i=e();i!==r.get()&&(n.to(i),r.set(i))})},loopPoints:f}}(tr,ti,tg,tl,ts,tp,tb,tD,n),slideFocus:tC,slidesHandler:(V=!1,{init:function(t){Y&&(C=new MutationObserver(e=>{!V&&(s(Y)||Y(t,e))&&function(e){for(let n of e)if("childList"===n.type){t.reInit(),u.emit("slidesChanged");break}}(e)})).observe(e,{childList:!0})},destroy:function(){C&&C.disconnect(),V=!0}}),slidesInView:tF,slideIndexes:tw,slideRegistry:tT,slidesToScroll:td,target:tN,translate:w(tr,e)};return tV}(t,k,D,I,L,n,F);return n.loop&&!r.slideLooper.canLoop()?e(Object.assign({},n,{loop:!1})):r}(U),V([$,...q.map(({options:t})=>t)]).forEach(t=>P.add(t,"change",K)),U.active&&(u.translate.to(u.location.get()),u.animation.init(),u.slidesInView.init(),u.slideFocus.init(Q),u.eventHandler.init(Q),u.resizeHandler.init(Q),u.slidesHandler.init(Q),u.options.loop&&u.slideLooper.loop(),k.offsetParent&&D.length&&u.dragHandler.init(Q),j=M.init(Q,q)))}function K(t,e){let n=G();X(),J(T({startIndex:n},t),e),F.emit("reInit")}function X(){u.dragHandler.destroy(),u.eventStore.clear(),u.translate.clear(),u.slideLooper.clear(),u.resizeHandler.destroy(),u.slidesHandler.destroy(),u.slidesInView.destroy(),u.animation.destroy(),M.destroy(),P.clear()}function _(t,e,n){U.active&&!R&&(u.scrollBody.useBaseFriction().useDuration(!0===e?0:U.duration),u.scrollTo.index(t,n||0))}function G(){return u.index.get()}let Q={canScrollNext:function(){return u.index.add(1).get()!==G()},canScrollPrev:function(){return u.index.add(-1).get()!==G()},containerNode:function(){return k},internalEngine:function(){return u},destroy:function(){R||(R=!0,P.clear(),X(),F.emit("destroy"),F.clear())},off:B,on:z,emit:H,plugins:function(){return j},previousScrollSnap:function(){return u.indexPrevious.get()},reInit:K,rootNode:function(){return t},scrollNext:function(t){_(u.index.add(1).get(),t,-1)},scrollPrev:function(t){_(u.index.add(-1).get(),t,1)},scrollProgress:function(){return u.scrollProgress.get(u.offsetLocation.get())},scrollSnapList:function(){return u.scrollSnapList},scrollTo:_,selectedScrollSnap:G,slideNodes:function(){return D},slidesInView:function(){return u.slidesInView.get()},slidesNotInView:function(){return u.slidesInView.get(!1)}};return J(e,n),setTimeout(()=>F.emit("init"),0),Q}
O.globalOptions = void 0;
const defaultGlobalOptions = { align: "start" };

// -- Slider Context Utility -----------------------------------------
function getSliderContext(el, callback) {
  Promise.resolve().then(() => {
    const root = el.closest('[data-root]');
    if (root && root.__sliderContext) {
      callback(root.__sliderContext);
    }
  });
}

// ---- Root ----
export function initRoot(parentElement, props = {}) {
  const { className, options = {}, ...restProps } = props;

  let isActive = false;
  const childInstances = [];
  const mergedOptions = { ...defaultGlobalOptions, ...options };

  const el = document.createElement('div');
  el.setAttribute('data-root', 'true');
  const baseClass = 'group/slider relative';
  el.className = className ? `${baseClass} ${className}`.trim() : baseClass;

  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') el.setAttribute(k, v);
  });

  const sliderContext = {
    embla: null,
    scrollProgress: 0,
    scrollSnaps: [],
    selectedIndex: 0,
    canScrollPrev: false,
    canScrollNext: false,
    listeners: new Set(),
    subscribe(fn) {
      this.listeners.add(fn);
      return () => this.listeners.delete(fn);
    },
    notify() {
      this.listeners.forEach(fn => fn(this));
    },
    registerViewport(viewportEl) {
      const embla = O(viewportEl, mergedOptions, []);
      this.embla = embla;

      const updateState = () => {
        this.scrollProgress = Math.max(0, Math.min(1, embla.scrollProgress() ?? 0));
        this.scrollSnaps = embla.scrollSnapList() ?? [];
        this.selectedIndex = embla.selectedScrollSnap() ?? 0;
        this.canScrollPrev = embla.canScrollPrev() ?? false;
        this.canScrollNext = embla.canScrollNext() ?? false;
        this.notify();
      };

      updateState();
      embla.on('reInit', updateState);
      embla.on('scroll', updateState);
      embla.on('select', updateState);
      embla.on('slideFocus', updateState);
    }
  };

  el.__sliderContext = sliderContext;

  function destroy() {
    if (sliderContext.embla) {
      sliderContext.embla.destroy();
    }
    sliderContext.listeners.clear();
    childInstances.forEach(inst => inst?.destroy?.());
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy, sliderContext, childInstances };
}

// ---- Viewport ----
export function initViewport(parentElement, props = {}) {
  const { className, ...restProps } = props;

  let isActive = false;
  const childInstances = [];

  const el = document.createElement('div');
  el.setAttribute('data-viewport', 'true');
  if (className) el.className = className;

  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') el.setAttribute(k, v);
  });

  getSliderContext(el, (ctx) => {
    ctx.registerViewport(el);
  });

  function destroy() {
    childInstances.forEach(inst => inst?.destroy?.());
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy, childInstances };
}

// ---- Slides ----
export function initSlides(parentElement, props = {}) {
  const { className, ...restProps } = props;

  let isActive = false;
  const childInstances = [];

  const el = document.createElement('div');
  el.setAttribute('data-slides', 'true');
  const baseClass = 'flex items-stretch will-change-transform';
  el.className = className ? `${baseClass} ${className}`.trim() : baseClass;

  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') el.setAttribute(k, v);
  });

  function destroy() {
    childInstances.forEach(inst => inst?.destroy?.());
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy, childInstances };
}

// ---- Slide ----
export function initSlide(parentElement, props = {}) {
  const { className, ...restProps } = props;

  let isActive = false;
  const childInstances = [];

  const el = document.createElement('div');
  el.setAttribute('data-slide', 'true');
  const baseClass = 'min-w-0 shrink-0 grow-0 select-none';
  el.className = className ? `${baseClass} ${className}`.trim() : baseClass;

  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') el.setAttribute(k, v);
  });

  function destroy() {
    childInstances.forEach(inst => inst?.destroy?.());
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy, childInstances };
}

// ---- NextButton ----
export function initNextButton(parentElement, props = {}) {
  const { className, onClick, ...restProps } = props;

  let isActive = false;
  const childInstances = [];
  let currentCtx = null;
  let unsubscribe = null;

  const el = document.createElement('button');
  el.setAttribute('type', 'button');
  el.setAttribute('aria-label', 'Next slide');
  
  const baseClass = 'cursor-pointer disabled:pointer-events-none';
  el.className = className ? `${baseClass} ${className}`.trim() : baseClass;

  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') el.setAttribute(k, v);
  });

  function updateState(ctx) {
    el.disabled = !ctx.canScrollNext;
  }

  function handleClick(e) {
    if (currentCtx && currentCtx.embla) {
      currentCtx.embla.scrollNext();
    }
  }

  if (onClick) el.addEventListener('click', onClick);
  el.addEventListener('click', handleClick);

  getSliderContext(el, (ctx) => {
    currentCtx = ctx;
    unsubscribe = ctx.subscribe(() => updateState(ctx));
    updateState(ctx);
  });

  function destroy() {
    if (onClick) el.removeEventListener('click', onClick);
    el.removeEventListener('click', handleClick);
    if (unsubscribe) unsubscribe();
    childInstances.forEach(inst => inst?.destroy?.());
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy, childInstances };
}

// ---- PrevButton ----
export function initPrevButton(parentElement, props = {}) {
  const { className, onClick, ...restProps } = props;

  let isActive = false;
  const childInstances = [];
  let currentCtx = null;
  let unsubscribe = null;

  const el = document.createElement('button');
  el.setAttribute('type', 'button');
  el.setAttribute('aria-label', 'Previous slide');

  const baseClass = 'cursor-pointer disabled:pointer-events-none';
  el.className = className ? `${baseClass} ${className}`.trim() : baseClass;

  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') el.setAttribute(k, v);
  });

  function updateState(ctx) {
    el.disabled = !ctx.canScrollPrev;
  }

  function handleClick(e) {
    if (currentCtx && currentCtx.embla) {
      currentCtx.embla.scrollPrev();
    }
  }

  if (onClick) el.addEventListener('click', onClick);
  el.addEventListener('click', handleClick);

  getSliderContext(el, (ctx) => {
    currentCtx = ctx;
    unsubscribe = ctx.subscribe(() => updateState(ctx));
    updateState(ctx);
  });

  function destroy() {
    if (onClick) el.removeEventListener('click', onClick);
    el.removeEventListener('click', handleClick);
    if (unsubscribe) unsubscribe();
    childInstances.forEach(inst => inst?.destroy?.());
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy, childInstances };
}

// ---- SliderNavigation ----
export function initSliderNavigation(parentElement, props = {}) {
  const { className, ...restProps } = props;

  let isActive = false;
  const childInstances = [];
  let unsubscribe = null;
  let currentDotListeners = [];

  const el = document.createElement('div');
  const baseClass = 'flex items-center justify-center gap-2';
  el.className = className ? `${baseClass} ${className}`.trim() : baseClass;

  Object.entries(restProps).forEach(([k, v]) => {
    if (typeof v !== 'function') el.setAttribute(k, v);
  });

  function renderDots(ctx) {
    el.innerHTML = '';
    currentDotListeners.forEach(({ dot, handler }) => {
      dot.removeEventListener('click', handler);
    });
    currentDotListeners = [];

    ctx.scrollSnaps.forEach((_, n) => {
      const dot = document.createElement('button');
      dot.setAttribute('type', 'button');
      dot.setAttribute('aria-label', `Go to slide ${n + 1}`);

      const isActiveState = ctx.selectedIndex === n;
      const activeClass = isActiveState ? 'opacity-100' : 'opacity-30';
      dot.className = `size-6 cursor-pointer rounded-full bg-current transition-opacity duration-400 ease-in-out ${activeClass}`;

      const handler = () => ctx.embla?.scrollTo(n);
      dot.addEventListener('click', handler);
      currentDotListeners.push({ dot, handler });

      el.appendChild(dot);
    });
  }

  getSliderContext(el, (ctx) => {
    unsubscribe = ctx.subscribe(() => renderDots(ctx));
    renderDots(ctx);
  });

  function destroy() {
    currentDotListeners.forEach(({ dot, handler }) => {
      dot.removeEventListener('click', handler);
    });
    if (unsubscribe) unsubscribe();
    childInstances.forEach(inst => inst?.destroy?.());
    el.remove();
  }

  if (parentElement) parentElement.appendChild(el);
  return { el, destroy, childInstances };
}
