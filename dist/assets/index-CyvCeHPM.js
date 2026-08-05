(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const a of r)if(a.type==="childList")for(const n of a.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function t(r){const a={};return r.integrity&&(a.integrity=r.integrity),r.referrerPolicy&&(a.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?a.credentials="include":r.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(r){if(r.ep)return;r.ep=!0;const a=t(r);fetch(r.href,a)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const B=globalThis,Y=B.ShadowRoot&&(B.ShadyCSS===void 0||B.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ee=Symbol(),ae=new WeakMap;let ke=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==ee)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Y&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=ae.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&ae.set(t,e))}return e}toString(){return this.cssText}};const Ne=i=>new ke(typeof i=="string"?i:i+"",void 0,ee),b=(i,...e)=>{const t=i.length===1?i[0]:e.reduce((s,r,a)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(r)+i[a+1],i[0]);return new ke(t,i,ee)},Ie=(i,e)=>{if(Y)i.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),r=B.litNonce;r!==void 0&&s.setAttribute("nonce",r),s.textContent=t.cssText,i.appendChild(s)}},ne=Y?i=>i:i=>i instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return Ne(t)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Oe,defineProperty:Me,getOwnPropertyDescriptor:ze,getOwnPropertyNames:Be,getOwnPropertySymbols:Re,getPrototypeOf:Le}=Object,j=globalThis,oe=j.trustedTypes,je=oe?oe.emptyScript:"",We=j.reactiveElementPolyfillSupport,D=(i,e)=>i,V={toAttribute(i,e){switch(e){case Boolean:i=i?je:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,e){let t=i;switch(e){case Boolean:t=i!==null;break;case Number:t=i===null?null:Number(i);break;case Object:case Array:try{t=JSON.parse(i)}catch{t=null}}return t}},Ee=(i,e)=>!Oe(i,e),de={attribute:!0,type:String,converter:V,reflect:!1,useDefault:!1,hasChanged:Ee};Symbol.metadata??=Symbol("metadata"),j.litPropertyMetadata??=new WeakMap;let S=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=de){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),r=this.getPropertyDescriptor(e,s,t);r!==void 0&&Me(this.prototype,e,r)}}static getPropertyDescriptor(e,t,s){const{get:r,set:a}=ze(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:r,set(n){const c=r?.call(this);a?.call(this,n),this.requestUpdate(e,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??de}static _$Ei(){if(this.hasOwnProperty(D("elementProperties")))return;const e=Le(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(D("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(D("properties"))){const t=this.properties,s=[...Be(t),...Re(t)];for(const r of s)this.createProperty(r,t[r])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[s,r]of t)this.elementProperties.set(s,r)}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const r=this._$Eu(t,s);r!==void 0&&this._$Eh.set(r,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const r of s)t.unshift(ne(r))}else e!==void 0&&t.push(ne(e));return t}static _$Eu(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Ie(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,s);if(r!==void 0&&s.reflect===!0){const a=(s.converter?.toAttribute!==void 0?s.converter:V).toAttribute(t,s.type);this._$Em=e,a==null?this.removeAttribute(r):this.setAttribute(r,a),this._$Em=null}}_$AK(e,t){const s=this.constructor,r=s._$Eh.get(e);if(r!==void 0&&this._$Em!==r){const a=s.getPropertyOptions(r),n=typeof a.converter=="function"?{fromAttribute:a.converter}:a.converter?.fromAttribute!==void 0?a.converter:V;this._$Em=r;const c=n.fromAttribute(t,a.type);this[r]=c??this._$Ej?.get(r)??c,this._$Em=null}}requestUpdate(e,t,s,r=!1,a){if(e!==void 0){const n=this.constructor;if(r===!1&&(a=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??Ee)(a,t)||s.useDefault&&s.reflect&&a===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:r,wrapped:a},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),a!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),r===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[r,a]of this._$Ep)this[r]=a;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,a]of s){const{wrapped:n}=a,c=this[r];n!==!0||this._$AL.has(r)||c===void 0||this.C(r,void 0,a,c)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[D("elementProperties")]=new Map,S[D("finalized")]=new Map,We?.({ReactiveElement:S}),(j.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const te=globalThis,ce=i=>i,L=te.trustedTypes,le=L?L.createPolicy("lit-html",{createHTML:i=>i}):void 0,Se="$lit$",x=`lit$${Math.random().toFixed(9).slice(2)}$`,Ae="?"+x,Ue=`<${Ae}>`,E=document,P=()=>E.createComment(""),N=i=>i===null||typeof i!="object"&&typeof i!="function",se=Array.isArray,He=i=>se(i)||typeof i?.[Symbol.iterator]=="function",H=`[ 	
\f\r]`,C=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,pe=/-->/g,he=/>/g,$=RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ue=/'/g,ge=/"/g,Te=/^(?:script|style|textarea|title)$/i,qe=i=>(e,...t)=>({_$litType$:i,strings:e,values:t}),d=qe(1),A=Symbol.for("lit-noChange"),m=Symbol.for("lit-nothing"),me=new WeakMap,_=E.createTreeWalker(E,129);function Ce(i,e){if(!se(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return le!==void 0?le.createHTML(e):e}const Ge=(i,e)=>{const t=i.length-1,s=[];let r,a=e===2?"<svg>":e===3?"<math>":"",n=C;for(let c=0;c<t;c++){const o=i[c];let h,g,p=-1,y=0;for(;y<o.length&&(n.lastIndex=y,g=n.exec(o),g!==null);)y=n.lastIndex,n===C?g[1]==="!--"?n=pe:g[1]!==void 0?n=he:g[2]!==void 0?(Te.test(g[2])&&(r=RegExp("</"+g[2],"g")),n=$):g[3]!==void 0&&(n=$):n===$?g[0]===">"?(n=r??C,p=-1):g[1]===void 0?p=-2:(p=n.lastIndex-g[2].length,h=g[1],n=g[3]===void 0?$:g[3]==='"'?ge:ue):n===ge||n===ue?n=$:n===pe||n===he?n=C:(n=$,r=void 0);const w=n===$&&i[c+1].startsWith("/>")?" ":"";a+=n===C?o+Ue:p>=0?(s.push(h),o.slice(0,p)+Se+o.slice(p)+x+w):o+x+(p===-2?c:w)}return[Ce(i,a+(i[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class I{constructor({strings:e,_$litType$:t},s){let r;this.parts=[];let a=0,n=0;const c=e.length-1,o=this.parts,[h,g]=Ge(e,t);if(this.el=I.createElement(h,s),_.currentNode=this.el.content,t===2||t===3){const p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(r=_.nextNode())!==null&&o.length<c;){if(r.nodeType===1){if(r.hasAttributes())for(const p of r.getAttributeNames())if(p.endsWith(Se)){const y=g[n++],w=r.getAttribute(p).split(x),M=/([.?@])?(.*)/.exec(y);o.push({type:1,index:a,name:M[2],strings:w,ctor:M[1]==="."?Ke:M[1]==="?"?Qe:M[1]==="@"?Ze:W}),r.removeAttribute(p)}else p.startsWith(x)&&(o.push({type:6,index:a}),r.removeAttribute(p));if(Te.test(r.tagName)){const p=r.textContent.split(x),y=p.length-1;if(y>0){r.textContent=L?L.emptyScript:"";for(let w=0;w<y;w++)r.append(p[w],P()),_.nextNode(),o.push({type:2,index:++a});r.append(p[y],P())}}}else if(r.nodeType===8)if(r.data===Ae)o.push({type:2,index:a});else{let p=-1;for(;(p=r.data.indexOf(x,p+1))!==-1;)o.push({type:7,index:a}),p+=x.length-1}a++}}static createElement(e,t){const s=E.createElement("template");return s.innerHTML=e,s}}function T(i,e,t=i,s){if(e===A)return e;let r=s!==void 0?t._$Co?.[s]:t._$Cl;const a=N(e)?void 0:e._$litDirective$;return r?.constructor!==a&&(r?._$AO?.(!1),a===void 0?r=void 0:(r=new a(i),r._$AT(i,t,s)),s!==void 0?(t._$Co??=[])[s]=r:t._$Cl=r),r!==void 0&&(e=T(i,r._$AS(i,e.values),r,s)),e}class Ve{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,r=(e?.creationScope??E).importNode(t,!0);_.currentNode=r;let a=_.nextNode(),n=0,c=0,o=s[0];for(;o!==void 0;){if(n===o.index){let h;o.type===2?h=new O(a,a.nextSibling,this,e):o.type===1?h=new o.ctor(a,o.name,o.strings,this,e):o.type===6&&(h=new Xe(a,this,e)),this._$AV.push(h),o=s[++c]}n!==o?.index&&(a=_.nextNode(),n++)}return _.currentNode=E,r}p(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class O{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,r){this.type=2,this._$AH=m,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=T(this,e,t),N(e)?e===m||e==null||e===""?(this._$AH!==m&&this._$AR(),this._$AH=m):e!==this._$AH&&e!==A&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):He(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==m&&N(this._$AH)?this._$AA.nextSibling.data=e:this.T(E.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,r=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=I.createElement(Ce(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===r)this._$AH.p(t);else{const a=new Ve(r,this),n=a.u(this.options);a.p(t),this.T(n),this._$AH=a}}_$AC(e){let t=me.get(e.strings);return t===void 0&&me.set(e.strings,t=new I(e)),t}k(e){se(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,r=0;for(const a of e)r===t.length?t.push(s=new O(this.O(P()),this.O(P()),this,this.options)):s=t[r],s._$AI(a),r++;r<t.length&&(this._$AR(s&&s._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const s=ce(e).nextSibling;ce(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class W{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,r,a){this.type=1,this._$AH=m,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=a,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=m}_$AI(e,t=this,s,r){const a=this.strings;let n=!1;if(a===void 0)e=T(this,e,t,0),n=!N(e)||e!==this._$AH&&e!==A,n&&(this._$AH=e);else{const c=e;let o,h;for(e=a[0],o=0;o<a.length-1;o++)h=T(this,c[s+o],t,o),h===A&&(h=this._$AH[o]),n||=!N(h)||h!==this._$AH[o],h===m?e=m:e!==m&&(e+=(h??"")+a[o+1]),this._$AH[o]=h}n&&!r&&this.j(e)}j(e){e===m?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Ke extends W{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===m?void 0:e}}class Qe extends W{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==m)}}class Ze extends W{constructor(e,t,s,r,a){super(e,t,s,r,a),this.type=5}_$AI(e,t=this){if((e=T(this,e,t,0)??m)===A)return;const s=this._$AH,r=e===m&&s!==m||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,a=e!==m&&(s===m||r);r&&this.element.removeEventListener(this.name,this,s),a&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class Xe{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){T(this,e)}}const Je=te.litHtmlPolyfillSupport;Je?.(I,O),(te.litHtmlVersions??=[]).push("3.3.3");const Ye=(i,e,t)=>{const s=t?.renderBefore??e;let r=s._$litPart$;if(r===void 0){const a=t?.renderBefore??null;s._$litPart$=r=new O(e.insertBefore(P(),a),a,void 0,t??{})}return r._$AI(i),r};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ie=globalThis;class f extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Ye(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return A}}f._$litElement$=!0,f.finalized=!0,ie.litElementHydrateSupport?.({LitElement:f});const et=ie.litElementPolyfillSupport;et?.({LitElement:f});(ie.litElementVersions??=[]).push("4.2.2");const K=(i,e)=>e.some(t=>i instanceof t);let fe,be;function tt(){return fe||(fe=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function st(){return be||(be=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Q=new WeakMap,q=new WeakMap,U=new WeakMap;function it(i){const e=new Promise((t,s)=>{const r=()=>{i.removeEventListener("success",a),i.removeEventListener("error",n)},a=()=>{t(k(i.result)),r()},n=()=>{s(i.error),r()};i.addEventListener("success",a),i.addEventListener("error",n)});return U.set(e,i),e}function rt(i){if(Q.has(i))return;const e=new Promise((t,s)=>{const r=()=>{i.removeEventListener("complete",a),i.removeEventListener("error",n),i.removeEventListener("abort",n)},a=()=>{t(),r()},n=()=>{s(i.error||new DOMException("AbortError","AbortError")),r()};i.addEventListener("complete",a),i.addEventListener("error",n),i.addEventListener("abort",n)});Q.set(i,e)}let Z={get(i,e,t){if(i instanceof IDBTransaction){if(e==="done")return Q.get(i);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return k(i[e])},set(i,e,t){return i[e]=t,!0},has(i,e){return i instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in i}};function De(i){Z=i(Z)}function at(i){return st().includes(i)?function(...e){return i.apply(X(this),e),k(this.request)}:function(...e){return k(i.apply(X(this),e))}}function nt(i){return typeof i=="function"?at(i):(i instanceof IDBTransaction&&rt(i),K(i,tt())?new Proxy(i,Z):i)}function k(i){if(i instanceof IDBRequest)return it(i);if(q.has(i))return q.get(i);const e=nt(i);return e!==i&&(q.set(i,e),U.set(e,i)),e}const X=i=>U.get(i);function ot(i,e,{blocked:t,upgrade:s,blocking:r,terminated:a}={}){const n=indexedDB.open(i,e),c=k(n);return s&&n.addEventListener("upgradeneeded",o=>{s(k(n.result),o.oldVersion,o.newVersion,k(n.transaction),o)}),t&&n.addEventListener("blocked",o=>t(o.oldVersion,o.newVersion,o)),c.then(o=>{a&&o.addEventListener("close",()=>a()),r&&o.addEventListener("versionchange",h=>r(h.oldVersion,h.newVersion,h))}).catch(()=>{}),c}const dt=["get","getKey","getAll","getAllKeys","count"],ct=["put","add","delete","clear"],G=new Map;function ve(i,e){if(!(i instanceof IDBDatabase&&!(e in i)&&typeof e=="string"))return;if(G.get(e))return G.get(e);const t=e.replace(/FromIndex$/,""),s=e!==t,r=ct.includes(t);if(!(t in(s?IDBIndex:IDBObjectStore).prototype)||!(r||dt.includes(t)))return;const a=async function(n,...c){const o=this.transaction(n,r?"readwrite":"readonly");let h=o.store;return s&&(h=h.index(c.shift())),(await Promise.all([h[t](...c),r&&o.done]))[0]};return G.set(e,a),a}De(i=>({...i,get:(e,t,s)=>ve(e,t)||i.get(e,t,s),has:(e,t)=>!!ve(e,t)||i.has(e,t)}));const lt=["continue","continuePrimaryKey","advance"],ye={},J=new WeakMap,Fe=new WeakMap,pt={get(i,e){if(!lt.includes(e))return i[e];let t=ye[e];return t||(t=ye[e]=function(...s){J.set(this,Fe.get(this)[e](...s))}),t}};async function*ht(...i){let e=this;if(e instanceof IDBCursor||(e=await e.openCursor(...i)),!e)return;e=e;const t=new Proxy(e,pt);for(Fe.set(t,e),U.set(t,X(e));e;)yield t,e=await(J.get(t)||e.continue()),J.delete(t)}function we(i,e){return e===Symbol.asyncIterator&&K(i,[IDBIndex,IDBObjectStore,IDBCursor])||e==="iterate"&&K(i,[IDBIndex,IDBObjectStore])}De(i=>({...i,get(e,t,s){return we(e,t)?ht:i.get(e,t,s)},has(e,t){return we(e,t)||i.has(e,t)}}));class ut{async getTasks(){throw new Error("Not implemented")}async getTask(e){throw new Error("Not implemented")}async createTask(e){throw new Error("Not implemented")}async updateTask(e,t){throw new Error("Not implemented")}async deleteTask(e){throw new Error("Not implemented")}async getTags(){throw new Error("Not implemented")}async getTag(e){throw new Error("Not implemented")}async createTag(e){throw new Error("Not implemented")}async updateTag(e,t){throw new Error("Not implemented")}async deleteTag(e){throw new Error("Not implemented")}async getDependencies(){throw new Error("Not implemented")}async addDependency(e,t,s="hard"){throw new Error("Not implemented")}async removeDependency(e){throw new Error("Not implemented")}async getTimeLogs(e=null){throw new Error("Not implemented")}async createTimeLog(e){throw new Error("Not implemented")}async getSettings(){throw new Error("Not implemented")}async updateSettings(e){throw new Error("Not implemented")}}const gt="cronograma_db",mt=1,l={TASKS:"tasks",TAGS:"tags",DEPENDENCIES:"dependencies",TIME_LOGS:"time_logs",SETTINGS:"settings"},xe={id:"global_settings",work_windows:{monday:[{start:"09:00",end:"17:00"}],tuesday:[{start:"09:00",end:"17:00"}],wednesday:[{start:"09:00",end:"17:00"}],thursday:[{start:"09:00",end:"17:00"}],friday:[{start:"09:00",end:"17:00"}],saturday:[],sunday:[]},break_windows:{monday:[{start:"12:00",end:"13:00"}],tuesday:[{start:"12:00",end:"13:00"}],wednesday:[{start:"12:00",end:"13:00"}],thursday:[{start:"12:00",end:"13:00"}],friday:[{start:"12:00",end:"13:00"}],saturday:[],sunday:[]},scheduler_interval_minutes:5,scheduling_horizon_days:7,slot_granularity_minutes:15,accent_color:"#6366F1",github_sync:{enabled:!1,pat:"",repo:"",owner:"",auto_sync_interval_seconds:30}};function R(i){const e=new Error(i);return e.source="ulid",e}const re="0123456789ABCDEFGHJKMNPQRSTVWXYZ",F=re.length,$e=Math.pow(2,48)-1,ft=10,bt=16;function vt(i){let e=Math.floor(i()*F);return e===F&&(e=F-1),re.charAt(e)}function yt(i,e){if(isNaN(i))throw new Error(i+" must be a number");if(i>$e)throw R("cannot encode time greater than "+$e);if(i<0)throw R("time must be positive");if(Number.isInteger(Number(i))===!1)throw R("time must be an integer");let t,s="";for(;e>0;e--)t=i%F,s=re.charAt(t)+s,i=(i-t)/F;return s}function wt(i,e){let t="";for(;i>0;i--)t=vt(e)+t;return t}function xt(i=!1,e){e||(e=typeof window<"u"?window:null);const t=e&&(e.crypto||e.msCrypto);if(t)return()=>{const s=new Uint8Array(1);return t.getRandomValues(s),s[0]/255};try{const s=require("crypto");return()=>s.randomBytes(1).readUInt8()/255}catch{}if(i){try{console.error("secure crypto unusable, falling back to insecure Math.random()!")}catch{}return()=>Math.random()}throw R("secure crypto unusable, insecure Math.random not allowed")}function $t(i){return i||(i=xt()),function(t){return isNaN(t)&&(t=Date.now()),yt(t,ft)+wt(bt,i)}}const _t=$t();function z(){return _t()}class kt extends ut{constructor(){super(),this.dbPromise=this.initDB()}async initDB(){return ot(gt,mt,{upgrade(e){if(!e.objectStoreNames.contains(l.TASKS)){const t=e.createObjectStore(l.TASKS,{keyPath:"id"});t.createIndex("status","status",{unique:!1}),t.createIndex("parent_task_id","parent_task_id",{unique:!1})}if(e.objectStoreNames.contains(l.TAGS)||e.createObjectStore(l.TAGS,{keyPath:"id"}),!e.objectStoreNames.contains(l.DEPENDENCIES)){const t=e.createObjectStore(l.DEPENDENCIES,{keyPath:"id"});t.createIndex("task_id","task_id",{unique:!1}),t.createIndex("depends_on_id","depends_on_id",{unique:!1}),t.createIndex("compound",["task_id","depends_on_id"],{unique:!0})}e.objectStoreNames.contains(l.TIME_LOGS)||e.createObjectStore(l.TIME_LOGS,{keyPath:"id"}).createIndex("task_id","task_id",{unique:!1}),e.objectStoreNames.contains(l.SETTINGS)||e.createObjectStore(l.SETTINGS,{keyPath:"id"})}}).then(async e=>(await e.get(l.SETTINGS,"global_settings")||await e.put(l.SETTINGS,xe),e))}async getTasks(){return(await this.dbPromise).getAll(l.TASKS)}async getTask(e){return(await this.dbPromise).get(l.TASKS,e)}async createTask(e){const t=await this.dbPromise,s=new Date().toISOString(),r={id:e.id||z(),title:e.title,description:e.description||"",color:e.color||"#6366F1",priority:e.priority??0,tag_ids:e.tag_ids||[],deadline:e.deadline||null,alert_window_minutes:e.alert_window_minutes??null,duration_minutes:e.duration_minutes||30,splittable:e.splittable??!0,ignore_breaks:e.ignore_breaks??!1,recurrence:e.recurrence||null,manual_schedule:e.manual_schedule||null,status:e.status||"active",completed_at:e.completed_at||null,created_at:e.created_at||s,updated_at:s,parent_task_id:e.parent_task_id||null,accumulated_count:e.accumulated_count||0};return await t.put(l.TASKS,r),r}async updateTask(e,t){const s=await this.dbPromise,r=await s.get(l.TASKS,e);if(!r)throw new Error(`Task ${e} not found`);const a={...r,...t,updated_at:new Date().toISOString()};return await s.put(l.TASKS,a),a}async deleteTask(e){const s=(await this.dbPromise).transaction([l.TASKS,l.DEPENDENCIES,l.TIME_LOGS],"readwrite");await s.objectStore(l.TASKS).delete(e);const r=s.objectStore(l.DEPENDENCIES),a=await r.getAll();for(const n of a)(n.task_id===e||n.depends_on_id===e)&&await r.delete(n.id);await s.done}async getTags(){return(await this.dbPromise).getAll(l.TAGS)}async getTag(e){return(await this.dbPromise).get(l.TAGS,e)}async createTag(e){const t=await this.dbPromise,s=new Date().toISOString(),r={id:e.id||z(),name:e.name,color:e.color||"#3B82F6",duration_minutes:e.duration_minutes??null,deadline:e.deadline||null,start_date:e.start_date||null,needs_dedicated_timeslot:e.needs_dedicated_timeslot??!1,time_window_mode:e.time_window_mode||"none",time_windows:e.time_windows||{},auto_expand_config:e.auto_expand_config||null,created_at:s,updated_at:s};return await t.put(l.TAGS,r),r}async updateTag(e,t){const s=await this.dbPromise,r=await s.get(l.TAGS,e);if(!r)throw new Error(`Tag ${e} not found`);const a={...r,...t,updated_at:new Date().toISOString()};return await s.put(l.TAGS,a),a}async deleteTag(e){await(await this.dbPromise).delete(l.TAGS,e)}async getDependencies(){return(await this.dbPromise).getAll(l.DEPENDENCIES)}async addDependency(e,t,s="hard"){if(e===t)throw new Error("A task cannot depend on itself");const r=await this.dbPromise,a=await r.getAll(l.DEPENDENCIES);if(this._hasCycle(e,t,a))throw new Error("Adding this dependency creates a cyclic dependency loop");const n={id:z(),task_id:e,depends_on_id:t,type:s,created_at:new Date().toISOString()};return await r.put(l.DEPENDENCIES,n),n}async removeDependency(e){await(await this.dbPromise).delete(l.DEPENDENCIES,e)}_hasCycle(e,t,s){const r=new Map;for(const c of s)r.has(c.task_id)||r.set(c.task_id,[]),r.get(c.task_id).push(c.depends_on_id);r.has(e)||r.set(e,[]),r.get(e).push(t);const a=new Set,n=[t];for(;n.length>0;){const c=n.pop();if(c===e)return!0;if(!a.has(c)){a.add(c);const o=r.get(c)||[];for(const h of o)n.push(h)}}return!1}async getTimeLogs(e=null){const t=await this.dbPromise;return e?t.getAllFromIndex(l.TIME_LOGS,"task_id",e):t.getAll(l.TIME_LOGS)}async createTimeLog(e){const t=await this.dbPromise,s={id:e.id||z(),task_id:e.task_id,logged_minutes:e.logged_minutes,notes:e.notes||"",logged_at:e.logged_at||new Date().toISOString()};return await t.put(l.TIME_LOGS,s),s}async getSettings(){return await(await this.dbPromise).get(l.SETTINGS,"global_settings")||xe}async updateSettings(e){const t=await this.dbPromise,r={...await this.getSettings(),...e};return await t.put(l.SETTINGS,r),r}}class Et extends EventTarget{emit(e,t={}){this.dispatchEvent(new CustomEvent(e,{detail:t}))}on(e,t){const s=r=>t(r.detail);return this.addEventListener(e,s),()=>this.removeEventListener(e,s)}}const v=new Et;function St(i){let e=i.replace("#","");e.length===3&&(e=e.split("").map(p=>p+p).join(""));const t=parseInt(e,16),s=(t>>16&255)/255,r=(t>>8&255)/255,a=(t&255)/255,n=Math.max(s,r,a),c=Math.min(s,r,a);let o=0,h=0;const g=(n+c)/2;if(n!==c){const p=n-c;switch(h=g>.5?p/(2-n-c):p/(n+c),n){case s:o=(r-a)/p+(r<a?6:0);break;case r:o=(a-s)/p+2;break;case a:o=(s-r)/p+4;break}o/=6}return{h:Math.round(o*360),s:Math.round(h*100),l:Math.round(g*100)}}function _e(i){if(!i||!/^#[0-9A-Fa-f]{6}$/.test(i))return;const{h:e,s:t,l:s}=St(i);document.documentElement.style.setProperty("--accent-h",`${e}`),document.documentElement.style.setProperty("--accent-s",`${t}%`),document.documentElement.style.setProperty("--accent-l",`${s}%`)}class At{constructor(){this.schedule={computed_at:null,horizon_end:null,blocks:[],alerts:[],tag_windows_computed:[]},this.listeners=new Set}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(){for(const e of this.listeners)e()}setSchedule(e){this.schedule=e||{computed_at:null,horizon_end:null,blocks:[],alerts:[],tag_windows_computed:[]},this.notify()}get blocks(){return this.schedule.blocks||[]}get alerts(){return this.schedule.alerts||[]}}const Pe=new At;class Tt{constructor(){this.dal=new kt,this.tasks=[],this.tags=[],this.dependencies=[],this.settings=null,this.listeners=new Set,this.initialized=!1,this.worker=null,this.recomputeTimer=null}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(){for(const e of this.listeners)e()}async init(){if(!this.initialized)try{this.settings=await this.dal.getSettings(),this.tasks=await this.dal.getTasks(),this.tags=await this.dal.getTags(),this.dependencies=await this.dal.getDependencies(),this.settings?.accent_color&&_e(this.settings.accent_color),this.initWorker(),this.initialized=!0,this.notify(),v.emit("app:ready",{initialized:!0}),this.requestScheduleRecompute(0)}catch(e){console.error("Failed to initialize AppState:",e)}}initWorker(){try{this.worker=new Worker(new URL("/assets/cronograma.worker-D82_Zikr.js",import.meta.url),{type:"module"}),this.worker.onmessage=e=>{const{type:t,payload:s}=e.data||{};t==="SCHEDULE_UPDATED"&&(Pe.setSchedule(s),v.emit("schedule:updated",s),this.notify())}}catch(e){console.warn("Worker initialization failed (will fallback to main thread if needed):",e)}}requestScheduleRecompute(e=150){this.recomputeTimer&&clearTimeout(this.recomputeTimer),this.recomputeTimer=setTimeout(()=>{this.worker&&this.worker.postMessage({type:"RECOMPUTE",payload:{tasks:this.tasks,tags:this.tags,dependencies:this.dependencies,settings:this.settings,now:new Date().toISOString()}})},e)}async addTask(e){const t=await this.dal.createTask(e);return this.tasks=[...this.tasks,t],this.notify(),v.emit("task:created",t),this.requestScheduleRecompute(),t}async updateTask(e,t){const s=await this.dal.updateTask(e,t);return this.tasks=this.tasks.map(r=>r.id===e?s:r),this.notify(),v.emit("task:updated",s),this.requestScheduleRecompute(),s}async deleteTask(e){await this.dal.deleteTask(e),this.tasks=this.tasks.filter(t=>t.id!==e),this.dependencies=this.dependencies.filter(t=>t.task_id!==e&&t.depends_on_id!==e),this.notify(),v.emit("task:deleted",{id:e}),this.requestScheduleRecompute()}async addTag(e){const t=await this.dal.createTag(e);return this.tags=[...this.tags,t],this.notify(),v.emit("tag:created",t),this.requestScheduleRecompute(),t}async updateTag(e,t){const s=await this.dal.updateTag(e,t);return this.tags=this.tags.map(r=>r.id===e?s:r),this.notify(),v.emit("tag:updated",s),this.requestScheduleRecompute(),s}async deleteTag(e){await this.dal.deleteTag(e),this.tags=this.tags.filter(t=>t.id!==e),this.notify(),v.emit("tag:deleted",{id:e}),this.requestScheduleRecompute()}async addDependency(e,t,s="hard"){const r=await this.dal.addDependency(e,t,s);return this.dependencies=[...this.dependencies,r],this.notify(),v.emit("dependency:created",r),this.requestScheduleRecompute(),r}async removeDependency(e){await this.dal.removeDependency(e),this.dependencies=this.dependencies.filter(t=>t.id!==e),this.notify(),v.emit("dependency:deleted",{id:e}),this.requestScheduleRecompute()}async updateSettings(e){const t=await this.dal.updateSettings(e);return this.settings=t,t.accent_color&&_e(t.accent_color),this.notify(),v.emit("settings:updated",t),this.requestScheduleRecompute(),t}}const u=new Tt;class Ct extends f{static properties={level:{type:String}};static styles=b`
    :host {
      display: inline-block;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1.2;
    }

    .badge-orange {
      background: rgba(245, 158, 11, 0.15);
      color: #F59E0B;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .badge-red {
      background: rgba(239, 68, 68, 0.15);
      color: #EF4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
  `;render(){return!this.level||this.level==="none"?d``:this.level==="red"?d`<span class="badge badge-red">🚨 Red Alert</span>`:this.level==="orange"?d`<span class="badge badge-orange">⚠️ Approaching</span>`:d``}}customElements.define("alert-badge",Ct);class Dt extends f{static properties={task:{type:Object}};static styles=b`
    :host {
      display: block;
    }

    .card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: var(--space-4, 16px);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: border-color 150ms ease, transform 150ms ease, box-shadow 150ms ease;
    }

    .card:hover {
      border-color: var(--color-border, #2E3242);
      box-shadow: var(--shadow-md);
    }

    .card.completed {
      opacity: 0.6;
    }

    .card.completed .title {
      text-decoration: line-through;
    }

    .card-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .checkbox {
      width: 20px;
      height: 20px;
      border-radius: 6px;
      border: 2px solid var(--color-border, #2E3242);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 150ms ease, border-color 150ms ease;
    }

    .checkbox.checked {
      background: var(--color-accent, #6366F1);
      border-color: var(--color-accent, #6366F1);
      color: #fff;
    }

    .title {
      font-weight: 600;
      font-size: 1rem;
      color: var(--color-text-primary, #F3F4F6);
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: var(--color-text-secondary, #9CA3AF);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color 150ms ease, background 150ms ease;
    }

    .icon-btn:hover {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
    }

    .meta-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 0.8125rem;
      color: var(--color-text-secondary, #9CA3AF);
    }

    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .priority-badge {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-text-muted, #6B7280);
    }
  `;toggleCompletion(){const e=this.task.status==="completed";u.updateTask(this.task.id,{status:e?"active":"completed",completed_at:e?null:new Date().toISOString()})}editTask(){this.dispatchEvent(new CustomEvent("edit-task",{detail:{task:this.task},bubbles:!0,composed:!0}))}deleteTask(){this.dispatchEvent(new CustomEvent("delete-task",{detail:{task:this.task},bubbles:!0,composed:!0}))}render(){if(!this.task)return d``;const e=this.task.status==="completed",t=u.tags.filter(a=>this.task.tag_ids?.includes(a.id)),s=Pe.alerts.find(a=>a.task_id===this.task.id),r=s?s.level:this.task._alert_level||"none";return d`
      <div class="card ${e?"completed":""}">
        <div class="card-header">
          <div class="title-group">
            <div
              class="checkbox ${e?"checked":""}"
              @click="${this.toggleCompletion}"
            >
              ${e?"✓":""}
            </div>
            <div class="title">${this.task.title}</div>
          </div>
          <div class="actions">
            <alert-badge .level="${r}"></alert-badge>
            <button class="icon-btn" @click="${this.editTask}" title="Edit Task">✏️</button>
            <button class="icon-btn" @click="${this.deleteTask}" title="Delete Task">🗑️</button>
          </div>
        </div>

        ${this.task.description?d`<div style="font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.4;">
              ${this.task.description}
            </div>`:""}

        <div class="meta-row">
          <span>⏱️ ${this.task.duration_minutes||30} mins</span>
          <span class="priority-badge">Priority P${this.task.priority??0}</span>
          ${this.task.deadline?d`<span>📅 Deadline: ${new Date(this.task.deadline).toLocaleDateString()}</span>`:""}

          ${t.map(a=>d`
              <span
                class="tag-chip"
                style="background-color: ${a.color}20; color: ${a.color}; border: 1px solid ${a.color}40;"
              >
                🏷️ ${a.name}
              </span>
            `)}
        </div>
      </div>
    `}}customElements.define("task-card",Dt);class Ft extends f{static properties={open:{type:Boolean},title:{type:String}};static styles=b`
    :host {
      display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      z-index: var(--z-drawer, 300);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--transition-normal, 250ms ease);
    }

    .backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      max-width: 480px;
      background: var(--color-bg-surface, #1A1C23);
      border-left: 1px solid var(--color-border, #2E3242);
      z-index: calc(var(--z-drawer, 300) + 1);
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform var(--transition-normal, 250ms ease);
      box-shadow: var(--shadow-lg);
    }

    .drawer.open {
      transform: translateX(0);
    }

    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4, 16px) var(--space-6, 24px);
      border-bottom: 1px solid var(--color-border, #2E3242);
    }

    .drawer-title {
      font-family: var(--font-family-display, sans-serif);
      font-size: var(--font-size-xl, 1.25rem);
      font-weight: 700;
    }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      color: var(--color-text-secondary, #9CA3AF);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--radius-sm, 6px);
      transition: background 150ms ease;
    }

    .close-btn:hover {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: var(--space-6, 24px);
    }

    .drawer-footer {
      padding: var(--space-4, 16px) var(--space-6, 24px);
      border-top: 1px solid var(--color-border, #2E3242);
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3, 12px);
      background: var(--color-bg-base, #121318);
    }
  `;constructor(){super(),this.open=!1,this.title=""}close(){this.open=!1,this.dispatchEvent(new CustomEvent("drawer-close"))}render(){return d`
      <div class="backdrop ${this.open?"open":""}" @click="${this.close}"></div>
      <aside class="drawer ${this.open?"open":""}">
        <div class="drawer-header">
          <h2 class="drawer-title">${this.title}</h2>
          <button class="close-btn" @click="${this.close}">✕</button>
        </div>
        <div class="drawer-body">
          <slot></slot>
        </div>
        <div class="drawer-footer">
          <slot name="footer"></slot>
        </div>
      </aside>
    `}}customElements.define("drawer-panel",Ft);class Pt extends f{static properties={taskId:{type:String}};static styles=b`
    :host {
      display: block;
    }

    .dep-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .dep-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .dep-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      font-size: 0.875rem;
    }

    .add-row {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }

    select, button {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      color: var(--color-text-primary, #F3F4F6);
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .btn-add {
      background: var(--color-accent, #6366F1);
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }

    .error-msg {
      color: #EF4444;
      font-size: 0.8125rem;
      margin-top: 4px;
    }
  `;constructor(){super(),this.taskId="",this.selectedPrereqId="",this.selectedType="hard",this.errorMessage=""}async addDep(){if(!(!this.selectedPrereqId||!this.taskId)){this.errorMessage="";try{await u.addDependency(this.taskId,this.selectedPrereqId,this.selectedType),this.selectedPrereqId="",this.requestUpdate()}catch(e){this.errorMessage=e.message||"Failed to add dependency"}}}async removeDep(e){await u.removeDependency(e),this.requestUpdate()}render(){if(!this.taskId)return d`<div style="color: var(--color-text-muted); font-size: 0.875rem;">Save task first to configure dependencies.</div>`;const e=u.dependencies.filter(s=>s.task_id===this.taskId),t=u.tasks.filter(s=>s.id!==this.taskId&&!e.some(r=>r.depends_on_id===s.id));return d`
      <div class="dep-container">
        <div class="dep-list">
          ${e.length===0?d`<div style="font-size: 0.875rem; color: var(--color-text-muted);">No prerequisites assigned.</div>`:e.map(s=>{const r=u.tasks.find(a=>a.id===s.depends_on_id);return d`
                  <div class="dep-item">
                    <span>
                      Must wait for <strong>${r?.title||s.depends_on_id}</strong>
                      <span style="color: var(--color-text-muted); margin-left: 6px;">(${s.type} dep)</span>
                    </span>
                    <button @click="${()=>this.removeDep(s.id)}">✕</button>
                  </div>
                `})}
        </div>

        ${t.length>0?d`
              <div class="add-row">
                <select
                  .value="${this.selectedPrereqId}"
                  @change="${s=>this.selectedPrereqId=s.target.value}"
                >
                  <option value="">Select Prerequisite Task...</option>
                  ${t.map(s=>d`<option value="${s.id}">${s.title}</option>`)}
                </select>

                <select
                  .value="${this.selectedType}"
                  @change="${s=>this.selectedType=s.target.value}"
                >
                  <option value="hard">Hard (Strict)</option>
                  <option value="soft">Soft (Flexible)</option>
                </select>

                <button class="btn-add" @click="${this.addDep}">+ Add</button>
              </div>
            `:""}

        ${this.errorMessage?d`<div class="error-msg">${this.errorMessage}</div>`:""}
      </div>
    `}}customElements.define("task-dependency-graph",Pt);class Nt extends f{static properties={open:{type:Boolean},task:{type:Object}};static styles=b`
    :host {
      display: block;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary, #9CA3AF);
    }

    input[type="text"],
    input[type="number"],
    input[type="datetime-local"],
    textarea,
    select {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 10px 12px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
      font-family: inherit;
    }

    textarea {
      min-height: 80px;
      resize: vertical;
    }

    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .checkbox-row input {
      width: 18px;
      height: 18px;
      accent-color: var(--color-accent, #6366F1);
      cursor: pointer;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .tag-checkboxes {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 0.8125rem;
      border: 1px solid var(--color-border, #2E3242);
      background: var(--color-bg-base, #121318);
      cursor: pointer;
    }

    .tag-pill.selected {
      border-color: var(--color-accent, #6366F1);
      background: var(--color-accent-subtle, rgba(99, 102, 241, 0.15));
      color: var(--color-accent, #6366F1);
      font-weight: 600;
    }

    .btn-submit {
      background: var(--color-accent, #6366F1);
      color: #ffffff;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: var(--radius-md, 8px);
      border: none;
      cursor: pointer;
    }

    .btn-cancel {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
      padding: 10px 20px;
      border-radius: var(--radius-md, 8px);
      border: 1px solid var(--color-border, #2E3242);
      cursor: pointer;
    }
  `;constructor(){super(),this.open=!1,this.task=null,this.formData=this.getInitialData()}updated(e){e.has("task")&&(this.task?this.formData={...this.task}:this.formData=this.getInitialData())}getInitialData(){return{title:"",description:"",duration_minutes:30,priority:5,tag_ids:[],deadline:"",alert_window_minutes:120,splittable:!0,ignore_breaks:!1}}toggleTag(e){const t=this.formData.tag_ids||[];t.includes(e)?this.formData.tag_ids=t.filter(s=>s!==e):this.formData.tag_ids=[...t,e],this.requestUpdate()}async handleSubmit(e){e.preventDefault(),this.formData.title.trim()&&(this.task?.id?await u.updateTask(this.task.id,this.formData):await u.addTask(this.formData),this.open=!1,this.dispatchEvent(new CustomEvent("form-saved")))}render(){const e=!!this.task?.id,t=u.tags||[];return d`
      <drawer-panel
        ?open="${this.open}"
        .title="${e?"Edit Task":"Create New Task"}"
        @drawer-close="${()=>this.open=!1}"
      >
        <form @submit="${this.handleSubmit}">
          <div class="form-group">
            <label>Title *</label>
            <input
              type="text"
              required
              placeholder="Task title..."
              .value="${this.formData.title||""}"
              @input="${s=>this.formData.title=s.target.value}"
            />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea
              placeholder="Task details and subtasks..."
              .value="${this.formData.description||""}"
              @input="${s=>this.formData.description=s.target.value}"
            ></textarea>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Duration (minutes)</label>
              <input
                type="number"
                min="15"
                step="15"
                .value="${this.formData.duration_minutes||30}"
                @change="${s=>this.formData.duration_minutes=Number(s.target.value)}"
              />
            </div>

            <div class="form-group">
              <label>Priority Score (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                .value="${this.formData.priority??5}"
                @change="${s=>this.formData.priority=Number(s.target.value)}"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Tags</label>
            <div class="tag-checkboxes">
              ${t.map(s=>d`
                  <div
                    class="tag-pill ${this.formData.tag_ids?.includes(s.id)?"selected":""}"
                    @click="${()=>this.toggleTag(s.id)}"
                  >
                    🏷️ ${s.name}
                  </div>
                `)}
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Deadline (Optional)</label>
              <input
                type="datetime-local"
                .value="${this.formData.deadline?this.formData.deadline.substring(0,16):""}"
                @change="${s=>this.formData.deadline=s.target.value?new Date(s.target.value).toISOString():null}"
              />
            </div>

            <div class="form-group">
              <label>Alert Window (mins)</label>
              <input
                type="number"
                min="0"
                step="15"
                .value="${this.formData.alert_window_minutes||120}"
                @change="${s=>this.formData.alert_window_minutes=Number(s.target.value)}"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked="${this.formData.splittable??!0}"
                @change="${s=>this.formData.splittable=s.target.checked}"
              />
              Allow Cronograma to split task across slots
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked="${this.formData.ignore_breaks??!1}"
                @change="${s=>this.formData.ignore_breaks=s.target.checked}"
              />
              Can be scheduled during break hours
            </label>
          </div>

          ${e?d`
                <div class="form-group">
                  <label>Dependencies</label>
                  <task-dependency-graph .taskId="${this.task.id}"></task-dependency-graph>
                </div>
              `:""}
        </form>

        <div slot="footer">
          <button class="btn-cancel" @click="${()=>this.open=!1}">Cancel</button>
          <button class="btn-submit" @click="${this.handleSubmit}">
            ${e?"Save Changes":"Create Task"}
          </button>
        </div>
      </drawer-panel>
    `}}customElements.define("task-form",Nt);class It extends f{static properties={open:{type:Boolean},title:{type:String},message:{type:String},confirmText:{type:String}};static styles=b`
    :host {
      display: block;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: var(--z-modal, 400);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 200ms ease;
    }

    .backdrop.open {
      opacity: 1;
      pointer-events: auto;
    }

    .dialog {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-xl, 16px);
      padding: var(--space-6, 24px);
      width: 90%;
      max-width: 400px;
      box-shadow: var(--shadow-lg);
    }

    .title {
      font-family: var(--font-family-display, sans-serif);
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .message {
      color: var(--color-text-secondary, #9CA3AF);
      font-size: 0.875rem;
      margin-bottom: 24px;
      line-height: 1.5;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .btn-danger {
      background: #EF4444;
      color: #ffffff;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      border: none;
    }

    .btn-secondary {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      border: 1px solid var(--color-border, #2E3242);
    }
  `;constructor(){super(),this.open=!1,this.title="Are you sure?",this.message="This action cannot be undone.",this.confirmText="Delete"}cancel(){this.open=!1,this.dispatchEvent(new CustomEvent("cancel"))}confirm(){this.open=!1,this.dispatchEvent(new CustomEvent("confirm"))}render(){return d`
      <div class="backdrop ${this.open?"open":""}">
        <div class="dialog">
          <div class="title">${this.title}</div>
          <div class="message">${this.message}</div>
          <div class="actions">
            <button class="btn-secondary" @click="${this.cancel}">Cancel</button>
            <button class="btn-danger" @click="${this.confirm}">${this.confirmText}</button>
          </div>
        </div>
      </div>
    `}}customElements.define("confirm-dialog",It);class Ot extends f{static properties={searchQuery:{type:String},statusFilter:{type:String},tagFilter:{type:String},editingTask:{type:Object},deletingTask:{type:Object},isFormOpen:{type:Boolean}};static styles=b`
    :host {
      display: block;
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    input[type="search"], select {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 8px 14px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
    }

    .status-tabs {
      display: flex;
      background: var(--color-bg-surface, #1A1C23);
      padding: 4px;
      border-radius: var(--radius-md, 8px);
      border: 1px solid var(--color-border, #2E3242);
    }

    .tab {
      padding: 6px 14px;
      border-radius: var(--radius-sm, 6px);
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--color-text-secondary, #9CA3AF);
      cursor: pointer;
      border: none;
      background: transparent;

      transition: background 150ms ease, color 150ms ease;
    }

    .tab.active {
      background: var(--color-bg-elevated, #262936);
      color: var(--color-text-primary, #F3F4F6);
      font-weight: 600;
    }

    .btn-create {
      background: var(--color-accent, #6366F1);
      color: #ffffff;
      font-weight: 600;
      padding: 8px 18px;
      border-radius: var(--radius-md, 8px);
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 150ms ease, box-shadow 150ms ease;
    }

    .btn-create:hover {
      background: var(--color-accent-hover, #4F46E5);
      box-shadow: var(--shadow-glow);
    }

    .task-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      background: var(--color-bg-surface, #1A1C23);
      border: 1px dashed var(--color-border, #2E3242);
      border-radius: var(--radius-lg, 12px);
      color: var(--color-text-secondary, #9CA3AF);
    }
  `;constructor(){super(),this.searchQuery="",this.statusFilter="all",this.tagFilter="all",this.editingTask=null,this.deletingTask=null,this.isFormOpen=!1}connectedCallback(){super.connectedCallback(),this.unsubscribe=u.subscribe(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}openCreateForm(){this.editingTask=null,this.isFormOpen=!0}handleEditTask(e){this.editingTask=e.detail.task,this.isFormOpen=!0}handleDeleteTask(e){this.deletingTask=e.detail.task}async confirmDelete(){this.deletingTask&&(await u.deleteTask(this.deletingTask.id),this.deletingTask=null)}getFilteredTasks(){let e=u.tasks||[];if(this.statusFilter==="active"?e=e.filter(t=>t.status==="active"):this.statusFilter==="completed"&&(e=e.filter(t=>t.status==="completed")),this.tagFilter!=="all"&&(e=e.filter(t=>t.tag_ids?.includes(this.tagFilter))),this.searchQuery.trim()){const t=this.searchQuery.toLowerCase();e=e.filter(s=>s.title.toLowerCase().includes(t)||s.description?.toLowerCase().includes(t))}return e.sort((t,s)=>(s.priority??0)-(t.priority??0))}render(){const e=this.getFilteredTasks(),t=u.tags||[];return d`
      <div class="toolbar">
        <div class="filter-group">
          <input
            type="search"
            placeholder="Search tasks..."
            .value="${this.searchQuery}"
            @input="${s=>this.searchQuery=s.target.value}"
          />

          <div class="status-tabs">
            <button
              class="tab ${this.statusFilter==="all"?"active":""}"
              @click="${()=>this.statusFilter="all"}"
            >
              All
            </button>
            <button
              class="tab ${this.statusFilter==="active"?"active":""}"
              @click="${()=>this.statusFilter="active"}"
            >
              Active
            </button>
            <button
              class="tab ${this.statusFilter==="completed"?"active":""}"
              @click="${()=>this.statusFilter="completed"}"
            >
              Completed
            </button>
          </div>

          <select .value="${this.tagFilter}" @change="${s=>this.tagFilter=s.target.value}">
            <option value="all">All Tags</option>
            ${t.map(s=>d`<option value="${s.id}">🏷️ ${s.name}</option>`)}
          </select>
        </div>

        <button class="btn-create" @click="${this.openCreateForm}">
          <span>+</span> Create Task
        </button>
      </div>

      <div class="task-grid">
        ${e.length===0?d`
              <div class="empty-state">
                <h3>No tasks found</h3>
                <p style="margin-top: 8px;">Create a task or change filter criteria.</p>
              </div>
            `:e.map(s=>d`
                <task-card
                  .task="${s}"
                  @edit-task="${this.handleEditTask}"
                  @delete-task="${this.handleDeleteTask}"
                ></task-card>
              `)}
      </div>

      <task-form
        ?open="${this.isFormOpen}"
        .task="${this.editingTask}"
        @drawer-close="${()=>this.isFormOpen=!1}"
      ></task-form>

      <confirm-dialog
        ?open="${!!this.deletingTask}"
        title="Delete Task"
        message="Are you sure you want to delete '${this.deletingTask?.title}'?"
        @cancel="${()=>this.deletingTask=null}"
        @confirm="${this.confirmDelete}"
      ></confirm-dialog>
    `}}customElements.define("task-list-view",Ot);class Mt extends f{static properties={value:{type:String}};static styles=b`
    :host {
      display: block;
    }

    .color-picker-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .swatches {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .swatch {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
      transition: transform 150ms ease, border-color 150ms ease;
    }

    .swatch:hover {
      transform: scale(1.15);
    }

    .swatch.selected {
      border-color: #ffffff;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
    }

    .custom-input {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    input[type="color"] {
      -webkit-appearance: none;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      background: transparent;
    }

    input[type="text"] {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: 6px;
      padding: 6px 10px;
      color: #fff;
      font-size: 0.875rem;
      width: 100px;
    }
  `;constructor(){super(),this.value="#6366F1",this.presets=["#6366F1","#3B82F6","#10B981","#F59E0B","#EF4444","#EC4899","#8B5CF6","#06B6D4"]}selectColor(e){this.value=e,this.dispatchEvent(new CustomEvent("color-change",{detail:{value:e}}))}render(){return d`
      <div class="color-picker-container">
        <div class="swatches">
          ${this.presets.map(e=>d`
              <div
                class="swatch ${this.value?.toUpperCase()===e.toUpperCase()?"selected":""}"
                style="background-color: ${e};"
                @click="${()=>this.selectColor(e)}"
              ></div>
            `)}
        </div>
        <div class="custom-input">
          <input
            type="color"
            .value="${this.value||"#6366F1"}"
            @input="${e=>this.selectColor(e.target.value)}"
          />
          <input
            type="text"
            .value="${this.value||"#6366F1"}"
            @change="${e=>this.selectColor(e.target.value)}"
          />
        </div>
      </div>
    `}}customElements.define("color-picker",Mt);const zt=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];class Bt extends f{static properties={start:{type:String},end:{type:String}};static styles=b`
    :host {
      display: inline-block;
    }

    .range-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    input[type="time"] {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 6px 10px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
      color-scheme: dark;
    }

    .separator {
      color: var(--color-text-muted, #6B7280);
      font-size: 0.875rem;
    }
  `;constructor(){super(),this.start="09:00",this.end="17:00"}handleStartChange(e){this.start=e.target.value,this.emitChange()}handleEndChange(e){this.end=e.target.value,this.emitChange()}emitChange(){this.dispatchEvent(new CustomEvent("range-change",{detail:{start:this.start,end:this.end}}))}render(){return d`
      <div class="range-container">
        <input
          type="time"
          .value="${this.start||"09:00"}"
          @change="${this.handleStartChange}"
        />
        <span class="separator">to</span>
        <input
          type="time"
          .value="${this.end||"17:00"}"
          @change="${this.handleEndChange}"
        />
      </div>
    `}}customElements.define("time-range-input",Bt);class Rt extends f{static properties={timeWindows:{type:Object}};static styles=b`
    :host {
      display: block;
    }

    .editor-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .day-row {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 10px 12px;
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
    }

    .day-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: capitalize;
    }

    .window-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .window-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .btn-add {
      background: transparent;
      border: none;
      color: var(--color-accent, #6366F1);
      cursor: pointer;
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .btn-remove {
      background: transparent;
      border: none;
      color: var(--color-text-secondary, #9CA3AF);
      cursor: pointer;
      font-size: 1rem;
      padding: 2px 6px;
    }
  `;constructor(){super(),this.timeWindows={}}addWindow(e){const t=this.timeWindows[e]||[];this.timeWindows={...this.timeWindows,[e]:[...t,{start:"09:00",end:"17:00"}]},this.emitChange()}removeWindow(e,t){const s=this.timeWindows[e]||[];this.timeWindows={...this.timeWindows,[e]:s.filter((r,a)=>a!==t)},this.emitChange()}updateWindow(e,t,s){const r=[...this.timeWindows[e]||[]];r[t]=s,this.timeWindows={...this.timeWindows,[e]:r},this.emitChange()}emitChange(){this.dispatchEvent(new CustomEvent("time-windows-change",{detail:{timeWindows:this.timeWindows}}))}render(){return d`
      <div class="editor-container">
        ${zt.map(e=>{const t=this.timeWindows[e]||[];return d`
            <div class="day-row">
              <div class="day-header">
                <span>${e}</span>
                <button class="btn-add" type="button" @click="${()=>this.addWindow(e)}">
                  + Add Window
                </button>
              </div>

              <div class="window-list">
                ${t.length===0?d`<span style="font-size: 0.75rem; color: var(--color-text-muted);">No windows</span>`:t.map((s,r)=>d`
                        <div class="window-item">
                          <time-range-input
                            .start="${s.start}"
                            .end="${s.end}"
                            @range-change="${a=>this.updateWindow(e,r,a.detail)}"
                          ></time-range-input>
                          <button
                            class="btn-remove"
                            type="button"
                            @click="${()=>this.removeWindow(e,r)}"
                          >
                            ✕
                          </button>
                        </div>
                      `)}
              </div>
            </div>
          `})}
      </div>
    `}}customElements.define("tag-time-window-editor",Rt);class Lt extends f{static properties={open:{type:Boolean},tag:{type:Object}};static styles=b`
    :host {
      display: block;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary, #9CA3AF);
    }

    input[type="text"], select, input[type="number"] {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 10px 12px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
    }

    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .checkbox-row input {
      width: 18px;
      height: 18px;
      accent-color: var(--color-accent, #6366F1);
      cursor: pointer;
    }

    .btn-submit {
      background: var(--color-accent, #6366F1);
      color: #ffffff;
      font-weight: 600;
      padding: 10px 20px;
      border-radius: var(--radius-md, 8px);
      border: none;
      cursor: pointer;
    }

    .btn-cancel {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
      padding: 10px 20px;
      border-radius: var(--radius-md, 8px);
      border: 1px solid var(--color-border, #2E3242);
      cursor: pointer;
    }
  `;constructor(){super(),this.open=!1,this.tag=null,this.formData=this.getInitialData()}updated(e){e.has("tag")&&(this.tag?this.formData={...this.tag}:this.formData=this.getInitialData())}getInitialData(){return{name:"",color:"#3B82F6",time_window_mode:"none",time_windows:{},needs_dedicated_timeslot:!1,auto_expand_config:{minimum_daily_minutes:60,assigned_days:[0,1,2,3,4]}}}async handleSubmit(e){e.preventDefault(),this.formData.name.trim()&&(this.tag?.id?await u.updateTag(this.tag.id,this.formData):await u.addTag(this.formData),this.open=!1)}render(){const e=!!this.tag?.id;return d`
      <drawer-panel
        ?open="${this.open}"
        .title="${e?"Edit Tag":"Create New Tag"}"
        @drawer-close="${()=>this.open=!1}"
      >
        <form @submit="${this.handleSubmit}">
          <div class="form-group">
            <label>Tag Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Deep Work, Workout..."
              .value="${this.formData.name||""}"
              @input="${t=>this.formData.name=t.target.value}"
            />
          </div>

          <div class="form-group">
            <label>Tag Color</label>
            <color-picker
              .value="${this.formData.color||"#3B82F6"}"
              @color-change="${t=>this.formData.color=t.detail.value}"
            ></color-picker>
          </div>

          <div class="form-group">
            <label>Time Window Mode</label>
            <select
              .value="${this.formData.time_window_mode||"none"}"
              @change="${t=>this.formData.time_window_mode=t.target.value}"
            >
              <option value="none">None (Label Only)</option>
              <option value="manual">Manual Fixed Time Windows</option>
              <option value="auto">Auto-Expanding Windows</option>
            </select>
          </div>

          <div class="form-group">
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked="${this.formData.needs_dedicated_timeslot??!1}"
                @change="${t=>this.formData.needs_dedicated_timeslot=t.target.checked}"
              />
              Needs dedicated time slot (reserves window exclusively)
            </label>
          </div>

          ${this.formData.time_window_mode==="manual"?d`
                <div class="form-group">
                  <label>Configure Fixed Windows (Per Day)</label>
                  <tag-time-window-editor
                    .timeWindows="${this.formData.time_windows||{}}"
                    @time-windows-change="${t=>this.formData.time_windows=t.detail.timeWindows}"
                  ></tag-time-window-editor>
                </div>
              `:""}

          ${this.formData.time_window_mode==="auto"?d`
                <div class="form-group">
                  <label>Baseline Daily Allocation (minutes)</label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    .value="${this.formData.auto_expand_config?.minimum_daily_minutes||60}"
                    @change="${t=>{this.formData.auto_expand_config={...this.formData.auto_expand_config||{},minimum_daily_minutes:Number(t.target.value)}}}"
                  />
                </div>
              `:""}
        </form>

        <div slot="footer">
          <button class="btn-cancel" @click="${()=>this.open=!1}">Cancel</button>
          <button class="btn-submit" @click="${this.handleSubmit}">
            ${e?"Save Changes":"Create Tag"}
          </button>
        </div>
      </drawer-panel>
    `}}customElements.define("tag-form",Lt);class jt extends f{static properties={editingTag:{type:Object},deletingTag:{type:Object},isFormOpen:{type:Boolean}};static styles=b`
    :host {
      display: block;
    }

    .header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .btn-create {
      background: var(--color-accent, #6366F1);
      color: #ffffff;
      font-weight: 600;
      padding: 8px 18px;
      border-radius: var(--radius-md, 8px);
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .tag-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .tag-card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: var(--space-4, 16px);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .tag-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      font-size: 1.125rem;
    }

    .color-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: var(--color-text-secondary, #9CA3AF);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
    }

    .meta {
      font-size: 0.8125rem;
      color: var(--color-text-secondary, #9CA3AF);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      background: var(--color-bg-surface, #1A1C23);
      border: 1px dashed var(--color-border, #2E3242);
      border-radius: var(--radius-lg, 12px);
      color: var(--color-text-secondary, #9CA3AF);
      grid-column: 1 / -1;
    }
  `;constructor(){super(),this.editingTag=null,this.deletingTag=null,this.isFormOpen=!1}connectedCallback(){super.connectedCallback(),this.unsubscribe=u.subscribe(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}openCreateForm(){this.editingTag=null,this.isFormOpen=!0}editTag(e){this.editingTag=e,this.isFormOpen=!0}deleteTag(e){this.deletingTag=e}async confirmDelete(){this.deletingTag&&(await u.deleteTag(this.deletingTag.id),this.deletingTag=null)}render(){const e=u.tags||[];return d`
      <div class="header-row">
        <h2>🏷️ Tag Management</h2>
        <button class="btn-create" @click="${this.openCreateForm}">+ Create Tag</button>
      </div>

      <div class="tag-grid">
        ${e.length===0?d`
              <div class="empty-state">
                <h3>No tags defined</h3>
                <p style="margin-top: 8px;">Create tags to categorize tasks and set time windows.</p>
              </div>
            `:e.map(t=>{const s=(u.tasks||[]).filter(r=>r.tag_ids?.includes(t.id)&&r.status==="active");return d`
                <div class="tag-card">
                  <div class="card-top">
                    <div class="tag-title">
                      <div class="color-dot" style="background-color: ${t.color||"#3B82F6"};"></div>
                      <span>${t.name}</span>
                    </div>
                    <div class="actions">
                      <button class="icon-btn" @click="${()=>this.editTag(t)}">✏️</button>
                      <button class="icon-btn" @click="${()=>this.deleteTag(t)}">🗑️</button>
                    </div>
                  </div>

                  <div class="meta">
                    <span>⚙️ Window Mode: <strong>${t.time_window_mode||"none"}</strong></span>
                    <span>📋 Active Tasks: <strong>${s.length}</strong></span>
                    ${t.needs_dedicated_timeslot?d`<span>🔒 Dedicated Time Slots Reserved</span>`:""}
                  </div>
                </div>
              `})}
      </div>

      <tag-form
        ?open="${this.isFormOpen}"
        .tag="${this.editingTag}"
        @drawer-close="${()=>this.isFormOpen=!1}"
      ></tag-form>

      <confirm-dialog
        ?open="${!!this.deletingTag}"
        title="Delete Tag"
        message="Are you sure you want to delete '${this.deletingTag?.name}'?"
        @cancel="${()=>this.deletingTag=null}"
        @confirm="${this.confirmDelete}"
      ></confirm-dialog>
    `}}customElements.define("tag-list-view",jt);class Wt extends f{static properties={currentRoute:{type:String}};static styles=b`
    :host {
      display: flex;
      flex-direction: row;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      background-color: var(--color-bg-base, #121318);
      color: var(--color-text-primary, #F3F4F6);
      font-family: var(--font-family-sans, sans-serif);
    }

    /* Sidebar Navigation (Desktop) */
    .sidebar {
      width: 260px;
      background: var(--color-bg-surface, #1A1C23);
      border-right: 1px solid var(--color-border, #2E3242);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--space-4, 16px);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      margin-bottom: 24px;
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      background: var(--color-accent, #6366F1);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      font-family: var(--font-family-display);
      box-shadow: 0 0 12px var(--color-accent-subtle, rgba(99, 102, 241, 0.3));
    }

    .brand-title {
      font-family: var(--font-family-display, sans-serif);
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      list-style: none;
    }

    .nav-item a {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-md, 8px);
      color: var(--color-text-secondary, #9CA3AF);
      font-weight: 500;
      text-decoration: none;
      transition: background 150ms ease, color 150ms ease;
    }

    .nav-item a:hover {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
    }

    .nav-item.active a {
      background: var(--color-accent-subtle, rgba(99, 102, 241, 0.15));
      color: var(--color-accent, #6366F1);
      font-weight: 600;
    }

    .nav-icon {
      font-size: 1.2rem;
    }

    /* Main Workspace */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background-color: var(--color-bg-base, #121318);
      position: relative;
    }

    .content-area {
      flex: 1;
      padding: var(--space-6, 24px);
    }

    /* Bottom Navigation Bar (Mobile) */
    .bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 64px;
      background: var(--color-bg-surface, #1A1C23);
      border-top: 1px solid var(--color-border, #2E3242);
      z-index: var(--z-sticky, 200);
      justify-content: space-around;
      align-items: center;
    }

    .bottom-nav a {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--color-text-secondary, #9CA3AF);
      font-size: 0.75rem;
      text-decoration: none;
    }

    .bottom-nav a.active {
      color: var(--color-accent, #6366F1);
      font-weight: 600;
    }

    @media (max-width: 767px) {
      .sidebar {
        display: none;
      }
      .bottom-nav {
        display: flex;
      }
      .content-area {
        padding-bottom: 80px;
      }
    }

    /* Header Bar */
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid var(--color-border, #2E3242);
      background: var(--color-bg-surface, #1A1C23);
    }

    .page-title {
      font-family: var(--font-family-display);
      font-size: 1.25rem;
      font-weight: 700;
    }
  `;constructor(){super(),this.currentRoute=this.getRouteFromHash(),this.onHashChange=this.onHashChange.bind(this)}connectedCallback(){super.connectedCallback(),u.init(),window.addEventListener("hashchange",this.onHashChange),this.unsubscribeState=u.subscribe(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.onHashChange),this.unsubscribeState&&this.unsubscribeState()}getRouteFromHash(){return window.location.hash.replace("#","")||"calendar"}onHashChange(){this.currentRoute=this.getRouteFromHash()}isActive(e){return this.currentRoute===e}renderRouteContent(){switch(this.currentRoute){case"tasks":return this.renderPage("Tasks",d`<task-list-view></task-list-view>`);case"tags":return this.renderPage("Tags",d`<tag-list-view></tag-list-view>`);case"history":return this.renderPage("History",d`<div class="card-elevated" style="padding: 24px;"><h2>📜 History View</h2><p style="color: var(--color-text-secondary); margin-top: 8px;">Completed tasks, tag breakdown, and historical logs coming in Phase 4.</p></div>`);case"settings":return this.renderPage("Settings",d`<div class="card-elevated" style="padding: 24px;"><h2>⚙️ Settings View</h2><p style="color: var(--color-text-secondary); margin-top: 8px;">Work windows, break hours, theme customization, and GitHub sync settings coming in Phase 5.</p></div>`);case"calendar":default:return this.renderPage("Calendar",d`<div class="card-elevated" style="padding: 24px;"><h2>📅 Calendar View</h2><p style="color: var(--color-text-secondary); margin-top: 8px;">Interactive timeline, day grid, and slot manager coming in Phase 4.</p></div>`)}}renderPage(e,t){return d`
      <div class="header-bar">
        <h1 class="page-title">${e}</h1>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-accent">Offline-First IDB</span>
        </div>
      </div>
      <div class="content-area">
        ${t}
      </div>
    `}render(){return d`
      <!-- Desktop Sidebar -->
      <aside class="sidebar">
        <div>
          <div class="brand">
            <div class="brand-logo">C</div>
            <div class="brand-title">Cronograma</div>
          </div>
          <ul class="nav-list">
            <li class="nav-item ${this.isActive("calendar")?"active":""}">
              <a href="#calendar">
                <span class="nav-icon">📅</span>
                <span>Calendar</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive("tasks")?"active":""}">
              <a href="#tasks">
                <span class="nav-icon">📋</span>
                <span>Tasks</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive("tags")?"active":""}">
              <a href="#tags">
                <span class="nav-icon">🏷️</span>
                <span>Tags</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive("history")?"active":""}">
              <a href="#history">
                <span class="nav-icon">📜</span>
                <span>History</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive("settings")?"active":""}">
              <a href="#settings">
                <span class="nav-icon">⚙️</span>
                <span>Settings</span>
              </a>
            </li>
          </ul>
        </div>
        <div style="font-size: var(--font-size-xs); color: var(--color-text-muted); padding: 8px 12px;">
          Cronograma v1.0.0
        </div>
      </aside>

      <!-- Main Workspace -->
      <main class="main-content">
        ${this.renderRouteContent()}
      </main>

      <!-- Mobile Bottom Nav -->
      <nav class="bottom-nav">
        <a href="#calendar" class="${this.isActive("calendar")?"active":""}">
          <span>📅</span>
          <span>Calendar</span>
        </a>
        <a href="#tasks" class="${this.isActive("tasks")?"active":""}">
          <span>📋</span>
          <span>Tasks</span>
        </a>
        <a href="#tags" class="${this.isActive("tags")?"active":""}">
          <span>🏷️</span>
          <span>Tags</span>
        </a>
        <a href="#history" class="${this.isActive("history")?"active":""}">
          <span>📜</span>
          <span>History</span>
        </a>
        <a href="#settings" class="${this.isActive("settings")?"active":""}">
          <span>⚙️</span>
          <span>Settings</span>
        </a>
      </nav>
    `}}customElements.define("app-shell",Wt);"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(i=>{console.warn("Service Worker registration failed:",i)})});
