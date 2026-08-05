(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function t(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(o){if(o.ep)return;o.ep=!0;const i=t(o);fetch(o.href,i)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const de=globalThis,Le=de.ShadowRoot&&(de.ShadyCSS===void 0||de.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Ie=Symbol(),ze=new WeakMap;let xt=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==Ie)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(Le&&e===void 0){const s=t!==void 0&&t.length===1;s&&(e=ze.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&ze.set(t,e))}return e}toString(){return this.cssText}};const Kt=r=>new xt(typeof r=="string"?r:r+"",void 0,Ie),T=(r,...e)=>{const t=r.length===1?r[0]:e.reduce((s,o,i)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+r[i+1],r[0]);return new xt(t,r,Ie)},Jt=(r,e)=>{if(Le)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const t of e){const s=document.createElement("style"),o=de.litNonce;o!==void 0&&s.setAttribute("nonce",o),s.textContent=t.cssText,r.appendChild(s)}},Ve=Le?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(const s of e.cssRules)t+=s.cssText;return Kt(t)})(r):r;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Qt,defineProperty:Zt,getOwnPropertyDescriptor:Yt,getOwnPropertyNames:Xt,getOwnPropertySymbols:er,getPrototypeOf:tr}=Object,me=globalThis,Ke=me.trustedTypes,rr=Ke?Ke.emptyScript:"",sr=me.reactiveElementPolyfillSupport,ee=(r,e)=>r,Pe={toAttribute(r,e){switch(e){case Boolean:r=r?rr:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},At=(r,e)=>!Qt(r,e),Je={attribute:!0,type:String,converter:Pe,reflect:!1,useDefault:!1,hasChanged:At};Symbol.metadata??=Symbol("metadata"),me.litPropertyMetadata??=new WeakMap;let W=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Je){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const s=Symbol(),o=this.getPropertyDescriptor(e,s,t);o!==void 0&&Zt(this.prototype,e,o)}}static getPropertyDescriptor(e,t,s){const{get:o,set:i}=Yt(this.prototype,e)??{get(){return this[t]},set(n){this[t]=n}};return{get:o,set(n){const a=o?.call(this);i?.call(this,n),this.requestUpdate(e,a,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Je}static _$Ei(){if(this.hasOwnProperty(ee("elementProperties")))return;const e=tr(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(ee("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(ee("properties"))){const t=this.properties,s=[...Xt(t),...er(t)];for(const o of s)this.createProperty(o,t[o])}const e=this[Symbol.metadata];if(e!==null){const t=litPropertyMetadata.get(e);if(t!==void 0)for(const[s,o]of t)this.elementProperties.set(s,o)}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const o=this._$Eu(t,s);o!==void 0&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const s=new Set(e.flat(1/0).reverse());for(const o of s)t.unshift(Ve(o))}else e!==void 0&&t.push(Ve(e));return t}static _$Eu(e,t){const s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Jt(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){const s=this.constructor.elementProperties.get(e),o=this.constructor._$Eu(e,s);if(o!==void 0&&s.reflect===!0){const i=(s.converter?.toAttribute!==void 0?s.converter:Pe).toAttribute(t,s.type);this._$Em=e,i==null?this.removeAttribute(o):this.setAttribute(o,i),this._$Em=null}}_$AK(e,t){const s=this.constructor,o=s._$Eh.get(e);if(o!==void 0&&this._$Em!==o){const i=s.getPropertyOptions(o),n=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:Pe;this._$Em=o;const a=n.fromAttribute(t,i.type);this[o]=a??this._$Ej?.get(o)??a,this._$Em=null}}requestUpdate(e,t,s,o=!1,i){if(e!==void 0){const n=this.constructor;if(o===!1&&(i=this[e]),s??=n.getPropertyOptions(e),!((s.hasChanged??At)(i,t)||s.useDefault&&s.reflect&&i===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:o,wrapped:i},n){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,n??t??this[e]),i!==!0||n!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),o===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[o,i]of this._$Ep)this[o]=i;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[o,i]of s){const{wrapped:n}=i,a=this[o];n!==!0||this._$AL.has(o)||a===void 0||this.C(o,void 0,i,a)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};W.elementStyles=[],W.shadowRootOptions={mode:"open"},W[ee("elementProperties")]=new Map,W[ee("finalized")]=new Map,sr?.({ReactiveElement:W}),(me.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Me=globalThis,Qe=r=>r,ue=Me.trustedTypes,Ze=ue?ue.createPolicy("lit-html",{createHTML:r=>r}):void 0,Pt="$lit$",F=`lit$${Math.random().toFixed(9).slice(2)}$`,Dt="?"+F,or=`<${Dt}>`,j=document,re=()=>j.createComment(""),se=r=>r===null||typeof r!="object"&&typeof r!="function",je=Array.isArray,ir=r=>je(r)||typeof r?.[Symbol.iterator]=="function",ve=`[ 	
\f\r]`,Q=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ye=/-->/g,Xe=/>/g,U=RegExp(`>|${ve}(?:([^\\s"'>=/]+)(${ve}*=${ve}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),et=/'/g,tt=/"/g,$t=/^(?:script|style|textarea|title)$/i,nr=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),p=nr(1),z=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),rt=new WeakMap,L=j.createTreeWalker(j,129);function Ft(r,e){if(!je(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ze!==void 0?Ze.createHTML(e):e}const ar=(r,e)=>{const t=r.length-1,s=[];let o,i=e===2?"<svg>":e===3?"<math>":"",n=Q;for(let a=0;a<t;a++){const c=r[a];let l,d,u=-1,h=0;for(;h<c.length&&(n.lastIndex=h,d=n.exec(c),d!==null);)h=n.lastIndex,n===Q?d[1]==="!--"?n=Ye:d[1]!==void 0?n=Xe:d[2]!==void 0?($t.test(d[2])&&(o=RegExp("</"+d[2],"g")),n=U):d[3]!==void 0&&(n=U):n===U?d[0]===">"?(n=o??Q,u=-1):d[1]===void 0?u=-2:(u=n.lastIndex-d[2].length,l=d[1],n=d[3]===void 0?U:d[3]==='"'?tt:et):n===tt||n===et?n=U:n===Ye||n===Xe?n=Q:(n=U,o=void 0);const v=n===U&&r[a+1].startsWith("/>")?" ":"";i+=n===Q?c+or:u>=0?(s.push(l),c.slice(0,u)+Pt+c.slice(u)+F+v):c+F+(u===-2?a:v)}return[Ft(r,i+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]};class oe{constructor({strings:e,_$litType$:t},s){let o;this.parts=[];let i=0,n=0;const a=e.length-1,c=this.parts,[l,d]=ar(e,t);if(this.el=oe.createElement(l,s),L.currentNode=this.el.content,t===2||t===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(o=L.nextNode())!==null&&c.length<a;){if(o.nodeType===1){if(o.hasAttributes())for(const u of o.getAttributeNames())if(u.endsWith(Pt)){const h=d[n++],v=o.getAttribute(u).split(F),y=/([.?@])?(.*)/.exec(h);c.push({type:1,index:i,name:y[2],strings:v,ctor:y[1]==="."?lr:y[1]==="?"?dr:y[1]==="@"?pr:he}),o.removeAttribute(u)}else u.startsWith(F)&&(c.push({type:6,index:i}),o.removeAttribute(u));if($t.test(o.tagName)){const u=o.textContent.split(F),h=u.length-1;if(h>0){o.textContent=ue?ue.emptyScript:"";for(let v=0;v<h;v++)o.append(u[v],re()),L.nextNode(),c.push({type:2,index:++i});o.append(u[h],re())}}}else if(o.nodeType===8)if(o.data===Dt)c.push({type:2,index:i});else{let u=-1;for(;(u=o.data.indexOf(F,u+1))!==-1;)c.push({type:7,index:i}),u+=F.length-1}i++}}static createElement(e,t){const s=j.createElement("template");return s.innerHTML=e,s}}function V(r,e,t=r,s){if(e===z)return e;let o=s!==void 0?t._$Co?.[s]:t._$Cl;const i=se(e)?void 0:e._$litDirective$;return o?.constructor!==i&&(o?._$AO?.(!1),i===void 0?o=void 0:(o=new i(r),o._$AT(r,t,s)),s!==void 0?(t._$Co??=[])[s]=o:t._$Cl=o),o!==void 0&&(e=V(r,o._$AS(r,e.values),o,s)),e}class cr{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:s}=this._$AD,o=(e?.creationScope??j).importNode(t,!0);L.currentNode=o;let i=L.nextNode(),n=0,a=0,c=s[0];for(;c!==void 0;){if(n===c.index){let l;c.type===2?l=new ne(i,i.nextSibling,this,e):c.type===1?l=new c.ctor(i,c.name,c.strings,this,e):c.type===6&&(l=new ur(i,this,e)),this._$AV.push(l),c=s[++a]}n!==c?.index&&(i=L.nextNode(),n++)}return L.currentNode=j,o}p(e){let t=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}}class ne{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,o){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=V(this,e,t),se(e)?e===E||e==null||e===""?(this._$AH!==E&&this._$AR(),this._$AH=E):e!==this._$AH&&e!==z&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ir(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==E&&se(this._$AH)?this._$AA.nextSibling.data=e:this.T(j.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:s}=e,o=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=oe.createElement(Ft(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===o)this._$AH.p(t);else{const i=new cr(o,this),n=i.u(this.options);i.p(t),this.T(n),this._$AH=i}}_$AC(e){let t=rt.get(e.strings);return t===void 0&&rt.set(e.strings,t=new oe(e)),t}k(e){je(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let s,o=0;for(const i of e)o===t.length?t.push(s=new ne(this.O(re()),this.O(re()),this,this.options)):s=t[o],s._$AI(i),o++;o<t.length&&(this._$AR(s&&s._$AB.nextSibling,o),t.length=o)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const s=Qe(e).nextSibling;Qe(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}}class he{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,o,i){this.type=1,this._$AH=E,this._$AN=void 0,this.element=e,this.name=t,this._$AM=o,this.options=i,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E}_$AI(e,t=this,s,o){const i=this.strings;let n=!1;if(i===void 0)e=V(this,e,t,0),n=!se(e)||e!==this._$AH&&e!==z,n&&(this._$AH=e);else{const a=e;let c,l;for(e=i[0],c=0;c<i.length-1;c++)l=V(this,a[s+c],t,c),l===z&&(l=this._$AH[c]),n||=!se(l)||l!==this._$AH[c],l===E?e=E:e!==E&&(e+=(l??"")+i[c+1]),this._$AH[c]=l}n&&!o&&this.j(e)}j(e){e===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class lr extends he{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===E?void 0:e}}class dr extends he{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==E)}}class pr extends he{constructor(e,t,s,o,i){super(e,t,s,o,i),this.type=5}_$AI(e,t=this){if((e=V(this,e,t,0)??E)===z)return;const s=this._$AH,o=e===E&&s!==E||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,i=e!==E&&(s===E||o);o&&this.element.removeEventListener(this.name,this,s),i&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ur{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){V(this,e)}}const gr=Me.litHtmlPolyfillSupport;gr?.(oe,ne),(Me.litHtmlVersions??=[]).push("3.3.3");const mr=(r,e,t)=>{const s=t?.renderBefore??e;let o=s._$litPart$;if(o===void 0){const i=t?.renderBefore??null;s._$litPart$=o=new ne(e.insertBefore(re(),i),i,void 0,t??{})}return o._$AI(r),o};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const He=globalThis;class w extends W{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=mr(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return z}}w._$litElement$=!0,w.finalized=!0,He.litElementHydrateSupport?.({LitElement:w});const hr=He.litElementPolyfillSupport;hr?.({LitElement:w});(He.litElementVersions??=[]).push("4.2.2");const De=(r,e)=>e.some(t=>r instanceof t);let st,ot;function fr(){return st||(st=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function br(){return ot||(ot=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const $e=new WeakMap,we=new WeakMap,fe=new WeakMap;function vr(r){const e=new Promise((t,s)=>{const o=()=>{r.removeEventListener("success",i),r.removeEventListener("error",n)},i=()=>{t(I(r.result)),o()},n=()=>{s(r.error),o()};r.addEventListener("success",i),r.addEventListener("error",n)});return fe.set(e,r),e}function wr(r){if($e.has(r))return;const e=new Promise((t,s)=>{const o=()=>{r.removeEventListener("complete",i),r.removeEventListener("error",n),r.removeEventListener("abort",n)},i=()=>{t(),o()},n=()=>{s(r.error||new DOMException("AbortError","AbortError")),o()};r.addEventListener("complete",i),r.addEventListener("error",n),r.addEventListener("abort",n)});$e.set(r,e)}let Fe={get(r,e,t){if(r instanceof IDBTransaction){if(e==="done")return $e.get(r);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return I(r[e])},set(r,e,t){return r[e]=t,!0},has(r,e){return r instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in r}};function Gt(r){Fe=r(Fe)}function yr(r){return br().includes(r)?function(...e){return r.apply(Ge(this),e),I(this.request)}:function(...e){return I(r.apply(Ge(this),e))}}function Tr(r){return typeof r=="function"?yr(r):(r instanceof IDBTransaction&&wr(r),De(r,fr())?new Proxy(r,Fe):r)}function I(r){if(r instanceof IDBRequest)return vr(r);if(we.has(r))return we.get(r);const e=Tr(r);return e!==r&&(we.set(r,e),fe.set(e,r)),e}const Ge=r=>fe.get(r);function Er(r,e,{blocked:t,upgrade:s,blocking:o,terminated:i}={}){const n=indexedDB.open(r,e),a=I(n);return s&&n.addEventListener("upgradeneeded",c=>{s(I(n.result),c.oldVersion,c.newVersion,I(n.transaction),c)}),t&&n.addEventListener("blocked",c=>t(c.oldVersion,c.newVersion,c)),a.then(c=>{i&&c.addEventListener("close",()=>i()),o&&c.addEventListener("versionchange",l=>o(l.oldVersion,l.newVersion,l))}).catch(()=>{}),a}const _r=["get","getKey","getAll","getAllKeys","count"],kr=["put","add","delete","clear"],ye=new Map;function it(r,e){if(!(r instanceof IDBDatabase&&!(e in r)&&typeof e=="string"))return;if(ye.get(e))return ye.get(e);const t=e.replace(/FromIndex$/,""),s=e!==t,o=kr.includes(t);if(!(t in(s?IDBIndex:IDBObjectStore).prototype)||!(o||_r.includes(t)))return;const i=async function(n,...a){const c=this.transaction(n,o?"readwrite":"readonly");let l=c.store;return s&&(l=l.index(a.shift())),(await Promise.all([l[t](...a),o&&c.done]))[0]};return ye.set(e,i),i}Gt(r=>({...r,get:(e,t,s)=>it(e,t)||r.get(e,t,s),has:(e,t)=>!!it(e,t)||r.has(e,t)}));const Sr=["continue","continuePrimaryKey","advance"],nt={},Oe=new WeakMap,Ot=new WeakMap,xr={get(r,e){if(!Sr.includes(e))return r[e];let t=nt[e];return t||(t=nt[e]=function(...s){Oe.set(this,Ot.get(this)[e](...s))}),t}};async function*Ar(...r){let e=this;if(e instanceof IDBCursor||(e=await e.openCursor(...r)),!e)return;e=e;const t=new Proxy(e,xr);for(Ot.set(t,e),fe.set(t,Ge(e));e;)yield t,e=await(Oe.get(t)||e.continue()),Oe.delete(t)}function at(r,e){return e===Symbol.asyncIterator&&De(r,[IDBIndex,IDBObjectStore,IDBCursor])||e==="iterate"&&De(r,[IDBIndex,IDBObjectStore])}Gt(r=>({...r,get(e,t,s){return at(e,t)?Ar:r.get(e,t,s)},has(e,t){return at(e,t)||r.has(e,t)}}));class Pr{async getTasks(){throw new Error("Not implemented")}async getTask(e){throw new Error("Not implemented")}async createTask(e){throw new Error("Not implemented")}async updateTask(e,t){throw new Error("Not implemented")}async deleteTask(e){throw new Error("Not implemented")}async getTags(){throw new Error("Not implemented")}async getTag(e){throw new Error("Not implemented")}async createTag(e){throw new Error("Not implemented")}async updateTag(e,t){throw new Error("Not implemented")}async deleteTag(e){throw new Error("Not implemented")}async getDependencies(){throw new Error("Not implemented")}async addDependency(e,t,s="hard"){throw new Error("Not implemented")}async removeDependency(e){throw new Error("Not implemented")}async getTimeLogs(e=null){throw new Error("Not implemented")}async createTimeLog(e){throw new Error("Not implemented")}async getSettings(){throw new Error("Not implemented")}async updateSettings(e){throw new Error("Not implemented")}}const Dr="cronograma_db",$r=1,f={TASKS:"tasks",TAGS:"tags",DEPENDENCIES:"dependencies",TIME_LOGS:"time_logs",SETTINGS:"settings"},ct={id:"global_settings",work_windows:{monday:[{start:"09:00",end:"17:00"}],tuesday:[{start:"09:00",end:"17:00"}],wednesday:[{start:"09:00",end:"17:00"}],thursday:[{start:"09:00",end:"17:00"}],friday:[{start:"09:00",end:"17:00"}],saturday:[],sunday:[]},break_windows:{monday:[{start:"12:00",end:"13:00"}],tuesday:[{start:"12:00",end:"13:00"}],wednesday:[{start:"12:00",end:"13:00"}],thursday:[{start:"12:00",end:"13:00"}],friday:[{start:"12:00",end:"13:00"}],saturday:[],sunday:[]},scheduler_interval_minutes:5,scheduling_horizon_days:7,slot_granularity_minutes:15,accent_color:"#6366F1",github_sync:{enabled:!1,pat:"",repo:"",owner:"",auto_sync_interval_seconds:30}};function pe(r){const e=new Error(r);return e.source="ulid",e}const Ne="0123456789ABCDEFGHJKMNPQRSTVWXYZ",te=Ne.length,lt=Math.pow(2,48)-1,Fr=10,Gr=16;function Or(r){let e=Math.floor(r()*te);return e===te&&(e=te-1),Ne.charAt(e)}function Cr(r,e){if(isNaN(r))throw new Error(r+" must be a number");if(r>lt)throw pe("cannot encode time greater than "+lt);if(r<0)throw pe("time must be positive");if(Number.isInteger(Number(r))===!1)throw pe("time must be an integer");let t,s="";for(;e>0;e--)t=r%te,s=Ne.charAt(t)+s,r=(r-t)/te;return s}function Rr(r,e){let t="";for(;r>0;r--)t=Or(e)+t;return t}function Ur(r=!1,e){e||(e=typeof window<"u"?window:null);const t=e&&(e.crypto||e.msCrypto);if(t)return()=>{const s=new Uint8Array(1);return t.getRandomValues(s),s[0]/255};try{const s=require("crypto");return()=>s.randomBytes(1).readUInt8()/255}catch{}if(r){try{console.error("secure crypto unusable, falling back to insecure Math.random()!")}catch{}return()=>Math.random()}throw pe("secure crypto unusable, insecure Math.random not allowed")}function Lr(r){return r||(r=Ur()),function(t){return isNaN(t)&&(t=Date.now()),Cr(t,Fr)+Rr(Gr,r)}}const Ir=Lr();function X(){return Ir()}class Mr extends Pr{constructor(){super(),this.dbPromise=this.initDB()}async initDB(){return Er(Dr,$r,{upgrade(e){if(!e.objectStoreNames.contains(f.TASKS)){const t=e.createObjectStore(f.TASKS,{keyPath:"id"});t.createIndex("status","status",{unique:!1}),t.createIndex("parent_task_id","parent_task_id",{unique:!1})}if(e.objectStoreNames.contains(f.TAGS)||e.createObjectStore(f.TAGS,{keyPath:"id"}),!e.objectStoreNames.contains(f.DEPENDENCIES)){const t=e.createObjectStore(f.DEPENDENCIES,{keyPath:"id"});t.createIndex("task_id","task_id",{unique:!1}),t.createIndex("depends_on_id","depends_on_id",{unique:!1}),t.createIndex("compound",["task_id","depends_on_id"],{unique:!0})}e.objectStoreNames.contains(f.TIME_LOGS)||e.createObjectStore(f.TIME_LOGS,{keyPath:"id"}).createIndex("task_id","task_id",{unique:!1}),e.objectStoreNames.contains(f.SETTINGS)||e.createObjectStore(f.SETTINGS,{keyPath:"id"})}}).then(async e=>(await e.get(f.SETTINGS,"global_settings")||await e.put(f.SETTINGS,ct),e))}async getTasks(){return(await this.dbPromise).getAll(f.TASKS)}async getTask(e){return(await this.dbPromise).get(f.TASKS,e)}async createTask(e){const t=await this.dbPromise,s=new Date().toISOString(),o={id:e.id||X(),title:e.title,description:e.description||"",color:e.color||"#6366F1",priority:e.priority??0,tag_ids:e.tag_ids||[],deadline:e.deadline||null,alert_window_minutes:e.alert_window_minutes??null,duration_minutes:e.duration_minutes||30,splittable:e.splittable??!0,ignore_breaks:e.ignore_breaks??!1,recurrence:e.recurrence||null,manual_schedule:e.manual_schedule||null,status:e.status||"active",completed_at:e.completed_at||null,created_at:e.created_at||s,updated_at:s,parent_task_id:e.parent_task_id||null,accumulated_count:e.accumulated_count||0};return await t.put(f.TASKS,o),o}async updateTask(e,t){const s=await this.dbPromise,o=await s.get(f.TASKS,e);if(!o)throw new Error(`Task ${e} not found`);const i={...o,...t,updated_at:new Date().toISOString()};return await s.put(f.TASKS,i),i}async deleteTask(e){const s=(await this.dbPromise).transaction([f.TASKS,f.DEPENDENCIES,f.TIME_LOGS],"readwrite");await s.objectStore(f.TASKS).delete(e);const o=s.objectStore(f.DEPENDENCIES),i=await o.getAll();for(const n of i)(n.task_id===e||n.depends_on_id===e)&&await o.delete(n.id);await s.done}async getTags(){return(await this.dbPromise).getAll(f.TAGS)}async getTag(e){return(await this.dbPromise).get(f.TAGS,e)}async createTag(e){const t=await this.dbPromise,s=new Date().toISOString(),o={id:e.id||X(),name:e.name,color:e.color||"#3B82F6",duration_minutes:e.duration_minutes??null,deadline:e.deadline||null,start_date:e.start_date||null,needs_dedicated_timeslot:e.needs_dedicated_timeslot??!1,time_window_mode:e.time_window_mode||"none",time_windows:e.time_windows||{},auto_expand_config:e.auto_expand_config||null,created_at:s,updated_at:s};return await t.put(f.TAGS,o),o}async updateTag(e,t){const s=await this.dbPromise,o=await s.get(f.TAGS,e);if(!o)throw new Error(`Tag ${e} not found`);const i={...o,...t,updated_at:new Date().toISOString()};return await s.put(f.TAGS,i),i}async deleteTag(e){await(await this.dbPromise).delete(f.TAGS,e)}async getDependencies(){return(await this.dbPromise).getAll(f.DEPENDENCIES)}async addDependency(e,t,s="hard"){if(e===t)throw new Error("A task cannot depend on itself");const o=await this.dbPromise,i=await o.getAll(f.DEPENDENCIES);if(this._hasCycle(e,t,i))throw new Error("Adding this dependency creates a cyclic dependency loop");const n={id:X(),task_id:e,depends_on_id:t,type:s,created_at:new Date().toISOString()};return await o.put(f.DEPENDENCIES,n),n}async removeDependency(e){await(await this.dbPromise).delete(f.DEPENDENCIES,e)}_hasCycle(e,t,s){const o=new Map;for(const a of s)o.has(a.task_id)||o.set(a.task_id,[]),o.get(a.task_id).push(a.depends_on_id);o.has(e)||o.set(e,[]),o.get(e).push(t);const i=new Set,n=[t];for(;n.length>0;){const a=n.pop();if(a===e)return!0;if(!i.has(a)){i.add(a);const c=o.get(a)||[];for(const l of c)n.push(l)}}return!1}async getTimeLogs(e=null){const t=await this.dbPromise;return e?t.getAllFromIndex(f.TIME_LOGS,"task_id",e):t.getAll(f.TIME_LOGS)}async createTimeLog(e){const t=await this.dbPromise,s={id:e.id||X(),task_id:e.task_id,logged_minutes:e.logged_minutes,notes:e.notes||"",logged_at:e.logged_at||new Date().toISOString()};return await t.put(f.TIME_LOGS,s),s}async getSettings(){return await(await this.dbPromise).get(f.SETTINGS,"global_settings")||ct}async updateSettings(e){const t=await this.dbPromise,o={...await this.getSettings(),...e};return await t.put(f.SETTINGS,o),o}}class jr extends EventTarget{emit(e,t={}){this.dispatchEvent(new CustomEvent(e,{detail:t}))}on(e,t){const s=o=>t(o.detail);return this.addEventListener(e,s),()=>this.removeEventListener(e,s)}}const A=new jr;function Hr(r){let e=r.replace("#","");e.length===3&&(e=e.split("").map(u=>u+u).join(""));const t=parseInt(e,16),s=(t>>16&255)/255,o=(t>>8&255)/255,i=(t&255)/255,n=Math.max(s,o,i),a=Math.min(s,o,i);let c=0,l=0;const d=(n+a)/2;if(n!==a){const u=n-a;switch(l=d>.5?u/(2-n-a):u/(n+a),n){case s:c=(o-i)/u+(o<i?6:0);break;case o:c=(i-s)/u+2;break;case i:c=(s-o)/u+4;break}c/=6}return{h:Math.round(c*360),s:Math.round(l*100),l:Math.round(d*100)}}function dt(r){if(!r||!/^#[0-9A-Fa-f]{6}$/.test(r))return;const{h:e,s:t,l:s}=Hr(r);document.documentElement.style.setProperty("--accent-h",`${e}`),document.documentElement.style.setProperty("--accent-s",`${t}%`),document.documentElement.style.setProperty("--accent-l",`${s}%`)}class Nr{constructor(){this.schedule={computed_at:null,horizon_end:null,blocks:[],alerts:[],tag_windows_computed:[]},this.listeners=new Set}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(){for(const e of this.listeners)e()}setSchedule(e){this.schedule=e||{computed_at:null,horizon_end:null,blocks:[],alerts:[],tag_windows_computed:[]},this.notify()}get blocks(){return this.schedule.blocks||[]}get alerts(){return this.schedule.alerts||[]}}const G=new Nr;function Br(r,e){const t=new Set(e.map(i=>i.id)),s=new Map,o=new Map;for(const i of t)s.set(i,[]),o.set(i,0);for(const i of r)t.has(i.task_id)&&t.has(i.depends_on_id)&&(s.get(i.task_id).push({dependsOnId:i.depends_on_id,type:i.type||"hard"}),i.type==="hard"&&o.set(i.task_id,(o.get(i.task_id)||0)+1));return{graph:s,inDegrees:o}}function Wr(r,e){const{graph:t,inDegrees:s}=Br(e,r),o=[],i=[];for(const[a,c]of s.entries())c===0&&o.push(a);const n=new Map;for(const[a,c]of t.entries())for(const l of c)l.type==="hard"&&(n.has(l.dependsOnId)||n.set(l.dependsOnId,[]),n.get(l.dependsOnId).push(a));for(;o.length>0;){const a=o.shift();i.push(a);const c=n.get(a)||[];for(const l of c){const d=s.get(l)-1;s.set(l,d),d===0&&o.push(l)}}if(i.length<r.length){const a=new Set(i);for(const c of r)a.has(c.id)||i.push(c.id)}return i}function pt(r,e,t){const s=new Set,o=[r];for(;o.length>0;){const i=o.shift();if(i===e)return!0;if(!s.has(i)){s.add(i);for(const n of t)n.task_id===i&&n.type==="hard"&&o.push(n.depends_on_id)}}return!1}function qr(r,e,t){if(!r.deadline)return"none";const s=new Date(r.deadline);if(s<=e)return"red";const o=r.duration_hours!=null?r.duration_hours*60:r.duration_minutes||30;if(t<o)return"red";const i=zr(r);if(i!=null&&i>0){const n=s.getTime()-i*60*1e3;if(e.getTime()>=n)return"orange"}return"none"}function zr(r){return r.alert_window_hours!=null?r.alert_window_hours*60:r.alert_window_minutes!=null?r.alert_window_minutes:null}function Vr(r,e){if(!r.deadline)return Number.POSITIVE_INFINITY;const t=new Date(r.deadline).getTime(),s=e.getTime(),o=Math.max(0,Math.floor((t-s)/6e4)),i=r.duration_hours!=null?r.duration_hours*60:r.duration_minutes||30;return o-i}const ie=["monday","tuesday","wednesday","thursday","friday","saturday","sunday"];function ge(r){const t=(r.getDay()+6)%7;return ie[t]}function D(r){const e=new Date(r);if(isNaN(e.getTime()))return"";const t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),o=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${o}`}function Kr(r,e,t,s,o){const i=new Map;for(const n of r){if(!n.time_window_mode||n.time_window_mode==="none")continue;const a=[];if(n.time_window_mode==="manual"){const c=new Date(t);for(;c<=s;){const l=ge(c),d=c.toISOString().split("T")[0],u=n.time_windows?.[l]||[];for(const h of u)a.push({dateStr:d,start:`${d}T${h.start}:00.000Z`,end:`${d}T${h.end}:00.000Z`,rawStart:h.start,rawEnd:h.end});c.setDate(c.getDate()+1)}}else if(n.time_window_mode==="auto"){const l=e.filter(_=>_.tag_ids?.includes(n.id)&&_.status==="active"&&!_.manual_schedule).reduce((_,P)=>_+(P.duration_minutes||0),0),d=n.auto_expand_config?.assigned_days||[0,1,2,3,4],u=n.auto_expand_config?.minimum_daily_minutes||60;let h=0;const v=new Date(t);for(;v<=s;){const _=(v.getDay()+6)%7;d.includes(_)&&h++,v.setDate(v.getDate()+1)}const y=Math.max(1,h),$=Math.max(u,Math.ceil(l/y)),S=new Date(t);for(;S<=s;){const _=(S.getDay()+6)%7,P=ge(S),O=S.toISOString().split("T")[0];if(d.includes(_)){const C=o?.[P]||[];if(C.length>0){const K=C[0].start,[J,ae]=K.split(":").map(Number),b=J*60+ae+$,x=Math.floor(b/60)%24,R=b%60,ce=`${String(x).padStart(2,"0")}:${String(R).padStart(2,"0")}`;a.push({dateStr:O,start:`${O}T${K}:00.000Z`,end:`${O}T${ce}:00.000Z`,rawStart:K,rawEnd:ce})}}S.setDate(S.getDate()+1)}}i.set(n.id,a)}return i}const Jr=[{start:"08:00",end:"20:00"}];function Qr(r,e,t,s,o=15){const i=[];let n=0;const a=new Date(r),c=o*60*1e3;for(a.setTime(Math.ceil(a.getTime()/c)*c);a<e;){const l=new Date(a),d=new Date(a.getTime()+c),u=ge(l),h=D(l),v=`${String(l.getHours()).padStart(2,"0")}:${String(l.getMinutes()).padStart(2,"0")}`;let y=t?.[u];if((!y||y.length===0)&&(y=Jr),y.some(S=>v>=S.start&&v<S.end)){const _=(s?.[u]||[]).some(P=>v>=P.start&&v<P.end);i.push({id:++n,start:l,end:d,dateStr:h,isBreak:_,occupied:!1,tagReserved:null})}a.setTime(a.getTime()+c)}return i}function Zr(r,e,t){let s=0;for(const o of t)o.start>=r&&o.end<=e&&!o.occupied&&!o.isBreak&&(s+=(o.end.getTime()-o.start.getTime())/6e4);return s}function Yr(r,e){const t=[];for(const s of r){if(!s.manual_schedule?.start||!s.manual_schedule?.end)continue;const o=new Date(s.manual_schedule.start),i=new Date(s.manual_schedule.end);for(const n of e)n.start>=o&&n.end<=i&&(n.occupied=!0);t.push({id:`locked_${s.id}`,task_id:s.id,tag_id:s.tag_ids?.[0]||null,start:o.toISOString(),end:i.toISOString(),is_locked:!0,alert_level:"none",is_split_part:!1,split_index:0})}return t}function Xr(r,e,t=15){const s=r.duration_hours!=null?r.duration_hours*60:r.duration_minutes||30,o=Math.ceil(s/t);if(r.splittable){const i=e.slice(0,o);return{allocated:i,isComplete:i.length>=o}}else{let i=[];for(let a=0;a<e.length;a++){const c=e[a];if(i.length===0)i.push(c);else{const l=i[i.length-1];c.start.getTime()===l.end.getTime()?i.push(c):i=[c]}if(i.length===o)return{allocated:i,isComplete:!0}}const n=e.slice(0,o);return{allocated:n,isComplete:n.length>=o}}}function es(r=[],e=[],t=[],s={},o=new Date){const i=o.toISOString();let n=o.getTime();for(const g of r)if(g.deadline){const b=new Date(g.deadline).getTime();b>n&&(n=b)}const a=s.scheduling_horizon_days||7,c=o.getTime()+a*24*60*60*1e3,l=Math.max(n,c),d=new Date(l),u=s.slot_granularity_minutes||15,h=s.work_windows||{},v=s.break_windows||{},y=Qr(o,d,h,v,u),$=r.filter(g=>g.status==="active"),S=$.filter(g=>g.manual_schedule!=null),_=Yr(S,y),P=Kr(e,$,o,d,h),O=$.filter(g=>g.manual_schedule==null);for(const g of O){const b=g.deadline?Zr(o,new Date(g.deadline),y):Number.POSITIVE_INFINITY;g._alert_level=qr(g,o,b),g._slack=Vr(g,o)}Wr(O,t);const C={red:0,orange:1,none:2},K=[...O].sort((g,b)=>{if(C[g._alert_level]!==C[b._alert_level])return C[g._alert_level]-C[b._alert_level];if(pt(g.id,b.id,t))return 1;if(pt(b.id,g.id,t))return-1;if((b.priority||0)!==(g.priority||0))return(b.priority||0)-(g.priority||0);if(g._slack!==b._slack)return g._slack-b._slack;const x=g.duration_hours!=null?g.duration_hours*60:g.duration_minutes||30,R=b.duration_hours!=null?b.duration_hours*60:b.duration_minutes||30;return x-R}),J=[],ae=[];for(const[g,b]of P.entries())ae.push({tag_id:g,windows:b.map(x=>({date:x.dateStr,start:x.rawStart,end:x.rawEnd}))});for(const g of K){let b=y.filter(k=>!k.occupied);g.ignore_breaks||(b=b.filter(k=>!k.isBreak));const x=g.tag_ids?.find(k=>P.has(k));if(x&&P.get(x).length>0){const k=P.get(x);b=b.filter(H=>k.some(qe=>{const zt=new Date(qe.start).getTime(),Vt=new Date(qe.end).getTime();return H.start.getTime()>=zt&&H.end.getTime()<=Vt}))}const{allocated:R,isComplete:ce}=Xr(g,b,u),qt=g.duration_hours!=null?g.duration_hours*60:g.duration_minutes||30;if(!ce||g._alert_level==="red"){const k=Math.ceil(qt/u),H=Math.max(0,(k-R.length)*u);J.push({task_id:g.id,level:"red",message:`Task '${g.title}' cannot be fully scheduled before deadline`,deadline:g.deadline||null,deficit_minutes:H})}else g._alert_level==="orange"&&J.push({task_id:g.id,level:"orange",message:`Task '${g.title}' is approaching its deadline`,deadline:g.deadline||null,deficit_minutes:0});R.forEach((k,H)=>{k.occupied=!0,_.push({id:X(),task_id:g.id,tag_id:x||g.tag_ids?.[0]||null,start:k.start.toISOString(),end:k.end.toISOString(),is_locked:!1,alert_level:g._alert_level,is_split_part:R.length>1,split_index:H})})}return _.sort((g,b)=>new Date(g.start).getTime()-new Date(b.start).getTime()),{computed_at:i,horizon_end:d.toISOString(),blocks:_,alerts:J,tag_windows_computed:ae}}class ts{constructor(){this.dal=new Mr,this.tasks=[],this.tags=[],this.dependencies=[],this.settings=null,this.listeners=new Set,this.initialized=!1,this.worker=null,this.recomputeTimer=null}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}notify(){for(const e of this.listeners)e()}async init(){if(!this.initialized)try{this.settings=await this.dal.getSettings(),this.tasks=await this.dal.getTasks(),this.tags=await this.dal.getTags(),this.dependencies=await this.dal.getDependencies(),this.settings?.accent_color&&dt(this.settings.accent_color),this.initWorker(),this.initialized=!0,this.notify(),A.emit("app:ready",{initialized:!0}),this.requestScheduleRecompute(0)}catch(e){console.error("Failed to initialize AppState:",e)}}initWorker(){try{this.worker=new Worker(new URL("/assets/cronograma.worker-C7l2lOLm.js",import.meta.url),{type:"module"}),this.worker.onmessage=e=>{const{type:t,payload:s}=e.data||{};t==="SCHEDULE_UPDATED"&&(G.setSchedule(s),A.emit("schedule:updated",s),this.notify())},this.worker.onerror=e=>{console.warn("[Worker Error] Fallback to main-thread scheduler:",e),this.worker=null,this.requestScheduleRecompute(0)}}catch(e){console.warn("Worker initialization failed (using main thread scheduler):",e),this.worker=null}}requestScheduleRecompute(e=150){this.recomputeTimer&&clearTimeout(this.recomputeTimer),this.recomputeTimer=setTimeout(()=>{if(this.worker)this.worker.postMessage({type:"RECOMPUTE",payload:{tasks:this.tasks,tags:this.tags,dependencies:this.dependencies,settings:this.settings,now:new Date().toISOString()}});else try{const t=es(this.tasks,this.tags,this.dependencies,this.settings,new Date);G.setSchedule(t),A.emit("schedule:updated",t),this.notify()}catch(t){console.error("[Main Thread Scheduler Error]:",t)}},e)}async addTask(e){const t=await this.dal.createTask(e);return this.tasks=[...this.tasks,t],this.notify(),A.emit("task:created",t),this.requestScheduleRecompute(),t}async updateTask(e,t){const s=await this.dal.updateTask(e,t);return this.tasks=this.tasks.map(o=>o.id===e?s:o),this.notify(),A.emit("task:updated",s),this.requestScheduleRecompute(),s}async deleteTask(e){await this.dal.deleteTask(e),this.tasks=this.tasks.filter(t=>t.id!==e),this.dependencies=this.dependencies.filter(t=>t.task_id!==e&&t.depends_on_id!==e),this.notify(),A.emit("task:deleted",{id:e}),this.requestScheduleRecompute()}async addTag(e){const t=await this.dal.createTag(e);return this.tags=[...this.tags,t],this.notify(),A.emit("tag:created",t),this.requestScheduleRecompute(),t}async updateTag(e,t){const s=await this.dal.updateTag(e,t);return this.tags=this.tags.map(o=>o.id===e?s:o),this.notify(),A.emit("tag:updated",s),this.requestScheduleRecompute(),s}async deleteTag(e){await this.dal.deleteTag(e),this.tags=this.tags.filter(t=>t.id!==e),this.notify(),A.emit("tag:deleted",{id:e}),this.requestScheduleRecompute()}async addDependency(e,t,s="hard"){const o=await this.dal.addDependency(e,t,s);return this.dependencies=[...this.dependencies,o],this.notify(),A.emit("dependency:created",o),this.requestScheduleRecompute(),o}async removeDependency(e){await this.dal.removeDependency(e),this.dependencies=this.dependencies.filter(t=>t.id!==e),this.notify(),A.emit("dependency:deleted",{id:e}),this.requestScheduleRecompute()}async updateSettings(e){const t=await this.dal.updateSettings(e);return this.settings=t,t.accent_color&&dt(t.accent_color),this.notify(),A.emit("settings:updated",t),this.requestScheduleRecompute(),t}}const m=new ts;class rs extends w{static properties={level:{type:String}};static styles=T`
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
  `;render(){return!this.level||this.level==="none"?p``:this.level==="red"?p`<span class="badge badge-red">🚨 Red Alert</span>`:this.level==="orange"?p`<span class="badge badge-orange">⚠️ Approaching</span>`:p``}}customElements.define("alert-badge",rs);class ss extends w{static properties={block:{type:Object},task:{type:Object}};static styles=T`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }

    .event-block {
      height: 100%;
      width: 100%;
      border-radius: var(--radius-md, 8px);
      padding: 6px 10px;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: var(--shadow-sm);
      box-sizing: border-border;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 150ms ease, box-shadow 150ms ease;
    }

    .event-block:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .event-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }

    .title-text {
      font-weight: 700;
      font-size: 0.8125rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .time-text {
      font-size: 0.75rem;
      opacity: 0.9;
    }

    .badge-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .lock-btn {
      background: rgba(0, 0, 0, 0.3);
      border: none;
      color: #fff;
      font-size: 0.75rem;
      padding: 2px 6px;
      border-radius: 4px;
      cursor: pointer;
    }
  `;formatTime(e){return e?new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:!1}):""}toggleLock(e){e.stopPropagation(),this.task&&(this.block.is_locked?m.updateTask(this.task.id,{manual_schedule:null}):m.updateTask(this.task.id,{manual_schedule:{start:this.block.start,end:this.block.end}}))}render(){if(!this.block)return p``;const e=this.task||m.tasks.find(n=>n.id===this.block.task_id),s=(e?.tag_ids?m.tags.find(n=>e.tag_ids.includes(n.id)):null)?.color||e?.color||"#6366F1",o=this.formatTime(this.block.start),i=this.formatTime(this.block.end);return p`
      <div
        class="event-block"
        style="background-color: ${s};"
        title="${e?.title||"Task"} (${o} - ${i})"
      >
        <div class="event-header">
          <div class="title-text">
            ${this.block.is_locked?"🔒 ":""}${e?.title||"Scheduled Block"}
          </div>
          <div class="badge-group">
            <alert-badge .level="${this.block.alert_level||"none"}"></alert-badge>
            <button class="lock-btn" @click="${this.toggleLock}" title="Toggle Manual Lock">
              ${this.block.is_locked?"Unlock":"Lock"}
            </button>
          </div>
        </div>

        <div class="time-text">
          🕒 ${o} – ${i}
          ${this.block.is_split_part?`(Part ${this.block.split_index+1})`:""}
        </div>
      </div>
    `}}customElements.define("calendar-event-block",ss);class os extends w{static properties={selectedDate:{type:Object}};static styles=T`
    :host {
      display: block;
      height: 100%;
    }

    .timeline-container {
      display: flex;
      flex-direction: column;
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-lg, 12px);
      overflow-y: auto;
      height: 700px;
      position: relative;
    }

    .grid-row {
      display: flex;
      height: 60px;
      border-bottom: 1px solid var(--color-border-subtle, #242735);
      position: relative;
    }

    .time-label {
      width: 70px;
      padding: 8px 12px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-text-muted, #6B7280);
      border-right: 1px solid var(--color-border, #2E3242);
      background: var(--color-bg-base, #121318);
      user-select: none;
    }

    .slot-area {
      flex: 1;
      position: relative;
      background: transparent;
    }

    .slot-area.is-work {
      background: rgba(99, 102, 241, 0.03);
    }

    .slot-area.is-break {
      background: rgba(245, 158, 11, 0.06);
    }

    /* Red indicator line for current time */
    .now-indicator {
      position: absolute;
      left: 70px;
      right: 0;
      height: 2px;
      background: #EF4444;
      z-index: 10;
      pointer-events: none;
    }

    .now-indicator::before {
      content: '';
      position: absolute;
      left: -5px;
      top: -4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #EF4444;
    }

    .block-wrapper {
      position: absolute;
      left: 80px;
      right: 16px;
      z-index: 5;
    }
  `;constructor(){super(),this.selectedDate=new Date}connectedCallback(){super.connectedCallback(),this.unsubscribeSchedule=G.subscribe(()=>this.requestUpdate()),this.unsubscribeApp=m.subscribe(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribeSchedule&&this.unsubscribeSchedule(),this.unsubscribeApp&&this.unsubscribeApp()}getBlocksForDay(){const e=D(this.selectedDate);return(G.blocks||[]).filter(s=>D(s.start)===e)}calculateNowPosition(){const e=new Date,t=D(this.selectedDate),s=D(e);if(t!==s)return null;const o=e.getHours(),i=e.getMinutes();return o*60+i}render(){const e=Array.from({length:24},(c,l)=>l),t=ge(this.selectedDate),s=m.settings||{},o=s.work_windows?.[t]||[],i=s.break_windows?.[t]||[],n=this.getBlocksForDay(),a=this.calculateNowPosition();return p`
      <div class="timeline-container">
        ${a!==null?p`<div class="now-indicator" style="top: ${a}px;"></div>`:""}

        ${e.map(c=>{const l=`${String(c).padStart(2,"0")}:00`,d=o.some(h=>l>=h.start&&l<h.end),u=i.some(h=>l>=h.start&&l<h.end);return p`
            <div class="grid-row">
              <div class="time-label">${l}</div>
              <div class="slot-area ${u?"is-break":d?"is-work":""}"></div>
            </div>
          `})}

        ${n.map(c=>{const l=new Date(c.start),d=new Date(c.end),u=l.getHours()*60+l.getMinutes(),h=d.getHours()*60+d.getMinutes(),v=Math.max(30,h-u),y=m.tasks.find($=>$.id===c.task_id);return p`
            <div
              class="block-wrapper"
              style="top: ${u}px; height: ${v}px;"
            >
              <calendar-event-block .block="${c}" .task="${y}"></calendar-event-block>
            </div>
          `})}
      </div>
    `}}customElements.define("calendar-day-view",os);class is extends w{static properties={selectedDate:{type:Object}};static styles=T`
    :host {
      display: block;
    }

    .week-container {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 8px;
      background: var(--color-bg-base, #121318);
    }

    .day-column {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 12px 8px;
      min-height: 500px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .column-header {
      font-weight: 700;
      font-size: 0.875rem;
      text-align: center;
      text-transform: capitalize;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border, #2E3242);
      color: var(--color-text-secondary, #9CA3AF);
    }

    .column-header.today {
      color: var(--color-accent, #6366F1);
    }

    .blocks-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;constructor(){super(),this.selectedDate=new Date}getWeekDays(){const e=new Date(this.selectedDate),t=e.getDay(),s=e.getDate()-t+(t===0?-6:1),o=new Date(e.setDate(s)),i=[];for(let n=0;n<7;n++){const a=new Date(o);a.setDate(o.getDate()+n),i.push(a)}return i}render(){const e=this.getWeekDays(),t=G.blocks||[],s=D(new Date);return p`
      <div class="week-container">
        ${e.map((o,i)=>{const n=D(o),a=n===s,c=ie[i],l=t.filter(d=>D(d.start)===n);return p`
            <div class="day-column">
              <div class="column-header ${a?"today":""}">
                <div>${c.substring(0,3)}</div>
                <div style="font-size: 0.75rem; margin-top: 2px;">${o.getDate()}</div>
              </div>

              <div class="blocks-list">
                ${l.map(d=>{const u=m.tasks.find(h=>h.id===d.task_id);return p`
                    <div style="height: 64px;">
                      <calendar-event-block .block="${d}" .task="${u}"></calendar-event-block>
                    </div>
                  `})}
              </div>
            </div>
          `})}
      </div>
    `}}customElements.define("calendar-week-view",is);class ns extends w{static properties={selectedDate:{type:Object}};static styles=T`
    :host {
      display: block;
    }

    .month-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }

    .header-cell {
      padding: 8px;
      font-weight: 700;
      font-size: 0.8125rem;
      text-align: center;
      color: var(--color-text-secondary, #9CA3AF);
      text-transform: uppercase;
    }

    .day-cell {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-md, 8px);
      min-height: 90px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .day-cell.other-month {
      opacity: 0.3;
    }

    .day-cell.today {
      border-color: var(--color-accent, #6366F1);
    }

    .date-num {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-text-primary, #F3F4F6);
    }

    .chip-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
      overflow: hidden;
    }

    .month-chip {
      background: var(--color-accent-subtle, rgba(99, 102, 241, 0.2));
      color: var(--color-accent, #6366F1);
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;constructor(){super(),this.selectedDate=new Date}getMonthDays(){const e=this.selectedDate.getFullYear(),t=this.selectedDate.getMonth(),s=new Date(e,t,1),o=(s.getDay()+6)%7,i=new Date(s);i.setDate(i.getDate()-o);const n=[];for(let a=0;a<35;a++){const c=new Date(i);c.setDate(i.getDate()+a),n.push(c)}return n}render(){const e=this.getMonthDays(),t=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],s=this.selectedDate.getMonth(),o=D(new Date),i=G.blocks||[];return p`
      <div class="month-grid">
        ${t.map(n=>p`<div class="header-cell">${n}</div>`)}
        ${e.map(n=>{const a=D(n),c=n.getMonth()!==s,l=a===o,d=i.filter(u=>D(u.start)===a);return p`
            <div class="day-cell ${c?"other-month":""} ${l?"today":""}">
              <div class="date-num">${n.getDate()}</div>
              <div class="chip-list">
                ${d.slice(0,3).map(u=>{const h=m.tasks.find(v=>v.id===u.task_id);return p`
                    <div class="month-chip">
                      ${h?.title||"Task"}
                    </div>
                  `})}
                ${d.length>3?p`<div style="font-size: 0.65rem; color: var(--color-text-muted);">
                      +${d.length-3} more
                    </div>`:""}
              </div>
            </div>
          `})}
      </div>
    `}}customElements.define("calendar-month-view",ns);class as extends w{static properties={viewMode:{type:String},selectedDate:{type:Object}};static styles=T`
    :host {
      display: block;
    }

    .calendar-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 20px;
    }

    .nav-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .date-heading {
      font-family: var(--font-family-display, sans-serif);
      font-size: 1.25rem;
      font-weight: 700;
      min-width: 220px;
      text-align: center;
    }

    .btn-nav {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      color: var(--color-text-primary, #F3F4F6);
      padding: 6px 12px;
      border-radius: var(--radius-md, 8px);
      cursor: pointer;
      font-weight: 500;
      transition: background 150ms ease;
    }

    .btn-nav:hover {
      background: var(--color-bg-elevated, #262936);
    }

    .mode-tabs {
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
  `;constructor(){super(),this.viewMode="day",this.selectedDate=new Date}connectedCallback(){super.connectedCallback(),this.unsubscribeSchedule=G.subscribe(()=>this.requestUpdate()),this.unsubscribeApp=m.subscribe(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribeSchedule&&this.unsubscribeSchedule(),this.unsubscribeApp&&this.unsubscribeApp()}navigate(e){const t=new Date(this.selectedDate);this.viewMode==="day"?t.setDate(t.getDate()+e):this.viewMode==="week"?t.setDate(t.getDate()+e*7):this.viewMode==="month"&&t.setMonth(t.getMonth()+e),this.selectedDate=t}goToday(){this.selectedDate=new Date}getFormattedHeading(){return this.viewMode==="day"?this.selectedDate.toLocaleDateString([],{weekday:"short",month:"short",day:"numeric",year:"numeric"}):this.viewMode==="month"?this.selectedDate.toLocaleDateString([],{month:"long",year:"numeric"}):`Week of ${this.selectedDate.toLocaleDateString([],{month:"short",day:"numeric"})}`}render(){return p`
      <div class="calendar-toolbar">
        <div class="nav-controls">
          <button class="btn-nav" @click="${()=>this.navigate(-1)}">‹ Prev</button>
          <button class="btn-nav" @click="${this.goToday}">Today</button>
          <button class="btn-nav" @click="${()=>this.navigate(1)}">Next ›</button>
          <div class="date-heading">${this.getFormattedHeading()}</div>
        </div>

        <div class="mode-tabs">
          <button
            class="tab ${this.viewMode==="day"?"active":""}"
            @click="${()=>this.viewMode="day"}"
          >
            Day
          </button>
          <button
            class="tab ${this.viewMode==="week"?"active":""}"
            @click="${()=>this.viewMode="week"}"
          >
            Week
          </button>
          <button
            class="tab ${this.viewMode==="month"?"active":""}"
            @click="${()=>this.viewMode="month"}"
          >
            Month
          </button>
        </div>
      </div>

      ${this.viewMode==="day"?p`<calendar-day-view .selectedDate="${this.selectedDate}"></calendar-day-view>`:""}
      ${this.viewMode==="week"?p`<calendar-week-view .selectedDate="${this.selectedDate}"></calendar-week-view>`:""}
      ${this.viewMode==="month"?p`<calendar-month-view .selectedDate="${this.selectedDate}"></calendar-month-view>`:""}
    `}}customElements.define("calendar-view",as);class cs extends w{static properties={task:{type:Object}};static styles=T`
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
      padding: 2px 10px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      color: #ffffff;
    }

    .priority-badge {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-text-muted, #6B7280);
    }
  `;toggleCompletion(){const e=this.task.status==="completed";m.updateTask(this.task.id,{status:e?"active":"completed",completed_at:e?null:new Date().toISOString()})}editTask(){this.dispatchEvent(new CustomEvent("edit-task",{detail:{task:this.task},bubbles:!0,composed:!0}))}deleteTask(){this.dispatchEvent(new CustomEvent("delete-task",{detail:{task:this.task},bubbles:!0,composed:!0}))}formatDuration(e){const t=e.duration_hours!=null?Math.round(e.duration_hours*60):e.duration_minutes||30,s=Math.floor(t/60),o=t%60;return s>0&&o>0?`${s}h ${o}m`:s>0?`${s}h`:`${o}m`}render(){if(!this.task)return p``;const e=this.task.status==="completed",t=m.tags.filter(i=>this.task.tag_ids?.includes(i.id)),s=G.alerts.find(i=>i.task_id===this.task.id),o=s?s.level:this.task._alert_level||"none";return p`
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
            <alert-badge .level="${o}"></alert-badge>
            <button class="icon-btn" @click="${this.editTask}" title="Edit Task">✏️</button>
            <button class="icon-btn" @click="${this.deleteTask}" title="Delete Task">🗑️</button>
          </div>
        </div>

        ${this.task.description?p`<div style="font-size: 0.875rem; color: var(--color-text-secondary); line-height: 1.4;">
              ${this.task.description}
            </div>`:""}

        <div class="meta-row">
          <span>⏱️ ${this.formatDuration(this.task)}</span>
          <span class="priority-badge">Priority P${this.task.priority??0}</span>
          ${this.task.deadline?p`<span>📅 Deadline: ${new Date(this.task.deadline).toLocaleDateString()}</span>`:""}

          ${t.map(i=>p`
              <span class="tag-chip" style="background-color: ${i.color||"#3B82F6"};">
                🏷️ ${i.name}
              </span>
            `)}
        </div>
      </div>
    `}}customElements.define("task-card",cs);class ls extends w{static properties={open:{type:Boolean},title:{type:String}};static styles=T`
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
  `;constructor(){super(),this.open=!1,this.title=""}close(){this.open=!1,this.dispatchEvent(new CustomEvent("drawer-close"))}render(){return p`
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
    `}}customElements.define("drawer-panel",ls);class ds extends w{static properties={taskId:{type:String}};static styles=T`
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
  `;constructor(){super(),this.taskId="",this.selectedPrereqId="",this.selectedType="hard",this.errorMessage=""}async addDep(){if(!(!this.selectedPrereqId||!this.taskId)){this.errorMessage="";try{await m.addDependency(this.taskId,this.selectedPrereqId,this.selectedType),this.selectedPrereqId="",this.requestUpdate()}catch(e){this.errorMessage=e.message||"Failed to add dependency"}}}async removeDep(e){await m.removeDependency(e),this.requestUpdate()}render(){if(!this.taskId)return p`<div style="color: var(--color-text-muted); font-size: 0.875rem;">Save task first to configure dependencies.</div>`;const e=m.dependencies.filter(s=>s.task_id===this.taskId),t=m.tasks.filter(s=>s.id!==this.taskId&&!e.some(o=>o.depends_on_id===s.id));return p`
      <div class="dep-container">
        <div class="dep-list">
          ${e.length===0?p`<div style="font-size: 0.875rem; color: var(--color-text-muted);">No prerequisites assigned.</div>`:e.map(s=>{const o=m.tasks.find(i=>i.id===s.depends_on_id);return p`
                  <div class="dep-item">
                    <span>
                      Must wait for <strong>${o?.title||s.depends_on_id}</strong>
                      <span style="color: var(--color-text-muted); margin-left: 6px;">(${s.type} dep)</span>
                    </span>
                    <button @click="${()=>this.removeDep(s.id)}">✕</button>
                  </div>
                `})}
        </div>

        ${t.length>0?p`
              <div class="add-row">
                <select
                  .value="${this.selectedPrereqId}"
                  @change="${s=>this.selectedPrereqId=s.target.value}"
                >
                  <option value="">Select Prerequisite Task...</option>
                  ${t.map(s=>p`<option value="${s.id}">${s.title}</option>`)}
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

        ${this.errorMessage?p`<div class="error-msg">${this.errorMessage}</div>`:""}
      </div>
    `}}customElements.define("task-dependency-graph",ds);class ps extends w{static properties={open:{type:Boolean},task:{type:Object}};static styles=T`
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

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }

    .unit-input-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .unit-input-group span {
      font-size: 0.75rem;
      color: var(--color-text-muted, #6B7280);
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
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 600;
      border: 2px solid transparent;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 150ms ease, transform 150ms ease, border-color 150ms ease;
    }

    .tag-pill:hover {
      opacity: 0.85;
      transform: scale(1.03);
    }

    .tag-pill.selected {
      opacity: 1;
      border-color: #ffffff;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
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
  `;constructor(){super(),this.open=!1,this.task=null,this.formData=this.getInitialData()}willUpdate(e){e.has("open")&&this.open?this.task?this.populateFromTask(this.task):this.formData=this.getInitialData():e.has("task")&&this.open&&this.task&&this.populateFromTask(this.task)}populateFromTask(e){const t=e.duration_hours!=null?Math.round(e.duration_hours*60):e.duration_minutes||30,s=Math.floor(t/60),o=t%60,i=e.alert_window_hours!=null?Math.round(e.alert_window_hours*60):e.alert_window_minutes||120,n=Math.floor(i/1440),a=Math.floor(i%1440/60),c=i%60;this.formData={title:e.title||"",description:e.description||"",priority:e.priority??5,tag_ids:e.tag_ids?[...e.tag_ids]:[],deadline:e.deadline||"",splittable:e.splittable??!0,ignore_breaks:e.ignore_breaks??!1,durationHours:s,durationMinutes:o,alertDays:n,alertHours:a,alertMinutes:c}}getInitialData(){return{title:"",description:"",priority:5,tag_ids:[],deadline:"",splittable:!0,ignore_breaks:!1,durationHours:0,durationMinutes:30,alertDays:0,alertHours:2,alertMinutes:0}}toggleTag(e){const t=this.formData.tag_ids||[];t.includes(e)?this.formData.tag_ids=t.filter(s=>s!==e):this.formData.tag_ids=[...t,e],this.requestUpdate()}async handleSubmit(e){if(e.preventDefault(),!this.formData.title.trim())return;const t=Number(this.formData.durationHours||0)+Number(this.formData.durationMinutes||0)/60,s=Number(this.formData.alertDays||0)*24+Number(this.formData.alertHours||0)+Number(this.formData.alertMinutes||0)/60,o={title:this.formData.title,description:this.formData.description,priority:Math.max(1,Number(this.formData.priority||1)),tag_ids:this.formData.tag_ids,deadline:this.formData.deadline||null,splittable:this.formData.splittable,ignore_breaks:this.formData.ignore_breaks,duration_hours:Number(t.toFixed(2)),duration_minutes:Math.round(t*60),alert_window_hours:Number(s.toFixed(2)),alert_window_minutes:Math.round(s*60)};this.task?.id?await m.updateTask(this.task.id,o):await m.addTask(o),this.closeForm()}closeForm(){this.open=!1,this.dispatchEvent(new CustomEvent("drawer-close",{bubbles:!0,composed:!0}))}render(){const e=!!this.task?.id,t=m.tags||[];return p`
      <drawer-panel
        ?open="${this.open}"
        .title="${e?"Edit Task":"Create New Task"}"
        @drawer-close="${this.closeForm}"
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
              placeholder="Task details..."
              .value="${this.formData.description||""}"
              @input="${s=>this.formData.description=s.target.value}"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Duration</label>
            <div class="grid-2">
              <div class="unit-input-group">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  .value="${this.formData.durationHours??0}"
                  @change="${s=>this.formData.durationHours=Number(s.target.value)}"
                />
                <span>Hours</span>
              </div>
              <div class="unit-input-group">
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  placeholder="30"
                  .value="${this.formData.durationMinutes??30}"
                  @change="${s=>this.formData.durationMinutes=Number(s.target.value)}"
                />
                <span>Mins</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Priority Score (Min: 1, Higher = First)</label>
            <input
              type="number"
              min="1"
              .value="${this.formData.priority??5}"
              @change="${s=>this.formData.priority=Number(s.target.value)}"
            />
          </div>

          <div class="form-group">
            <label>Tags</label>
            <div class="tag-checkboxes">
              ${t.map(s=>{const o=this.formData.tag_ids?.includes(s.id);return p`
                  <div
                    class="tag-pill ${o?"selected":""}"
                    style="background-color: ${s.color||"#3B82F6"}; color: #ffffff;"
                    @click="${()=>this.toggleTag(s.id)}"
                  >
                    🏷️ ${s.name}
                  </div>
                `})}
            </div>
          </div>

          <div class="form-group">
            <label>Deadline (Optional)</label>
            <input
              type="datetime-local"
              .value="${this.formData.deadline?this.formData.deadline.substring(0,16):""}"
              @change="${s=>this.formData.deadline=s.target.value?new Date(s.target.value).toISOString():""}"
            />
          </div>

          <div class="form-group">
            <label>Alert Window Before Deadline</label>
            <div class="grid-3">
              <div class="unit-input-group">
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  .value="${this.formData.alertDays??0}"
                  @change="${s=>this.formData.alertDays=Number(s.target.value)}"
                />
                <span>Days</span>
              </div>
              <div class="unit-input-group">
                <input
                  type="number"
                  min="0"
                  max="23"
                  placeholder="2"
                  .value="${this.formData.alertHours??2}"
                  @change="${s=>this.formData.alertHours=Number(s.target.value)}"
                />
                <span>Hours</span>
              </div>
              <div class="unit-input-group">
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  placeholder="0"
                  .value="${this.formData.alertMinutes??0}"
                  @change="${s=>this.formData.alertMinutes=Number(s.target.value)}"
                />
                <span>Mins</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked="${this.formData.splittable??!0}"
                @change="${s=>this.formData.splittable=s.target.checked}"
              />
              Allow Cronograma to split task across non-contiguous slots
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

          ${e?p`
                <div class="form-group">
                  <label>Dependencies</label>
                  <task-dependency-graph .taskId="${this.task.id}"></task-dependency-graph>
                </div>
              `:""}
        </form>

        <div slot="footer">
          <button class="btn-cancel" @click="${this.closeForm}">Cancel</button>
          <button class="btn-submit" @click="${this.handleSubmit}">
            ${e?"Save Changes":"Create Task"}
          </button>
        </div>
      </drawer-panel>
    `}}customElements.define("task-form",ps);class us extends w{static properties={open:{type:Boolean},title:{type:String},message:{type:String},confirmText:{type:String}};static styles=T`
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
  `;constructor(){super(),this.open=!1,this.title="Are you sure?",this.message="This action cannot be undone.",this.confirmText="Delete"}cancel(){this.open=!1,this.dispatchEvent(new CustomEvent("cancel"))}confirm(){this.open=!1,this.dispatchEvent(new CustomEvent("confirm"))}render(){return p`
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
    `}}customElements.define("confirm-dialog",us);class gs extends w{static properties={searchQuery:{type:String},statusFilter:{type:String},tagFilter:{type:String},editingTask:{type:Object},deletingTask:{type:Object},isFormOpen:{type:Boolean}};static styles=T`
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
  `;constructor(){super(),this.searchQuery="",this.statusFilter="all",this.tagFilter="all",this.editingTask=null,this.deletingTask=null,this.isFormOpen=!1}connectedCallback(){super.connectedCallback(),this.unsubscribe=m.subscribe(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}openCreateForm(){this.editingTask=null,this.isFormOpen=!0}handleEditTask(e){this.editingTask=e.detail.task,this.isFormOpen=!0}handleDeleteTask(e){this.deletingTask=e.detail.task}closeForm(){this.isFormOpen=!1,this.editingTask=null}async confirmDelete(){this.deletingTask&&(await m.deleteTask(this.deletingTask.id),this.deletingTask=null)}getFilteredTasks(){let e=m.tasks||[];if(this.statusFilter==="active"?e=e.filter(t=>t.status==="active"):this.statusFilter==="completed"&&(e=e.filter(t=>t.status==="completed")),this.tagFilter!=="all"&&(e=e.filter(t=>t.tag_ids?.includes(this.tagFilter))),this.searchQuery.trim()){const t=this.searchQuery.toLowerCase();e=e.filter(s=>s.title.toLowerCase().includes(t)||s.description?.toLowerCase().includes(t))}return e.sort((t,s)=>(s.priority??0)-(t.priority??0))}render(){const e=this.getFilteredTasks(),t=m.tags||[];return p`
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
            ${t.map(s=>p`<option value="${s.id}">🏷️ ${s.name}</option>`)}
          </select>
        </div>

        <button class="btn-create" @click="${this.openCreateForm}">
          <span>+</span> Create Task
        </button>
      </div>

      <div class="task-grid">
        ${e.length===0?p`
              <div class="empty-state">
                <h3>No tasks found</h3>
                <p style="margin-top: 8px;">Create a task or change filter criteria.</p>
              </div>
            `:e.map(s=>p`
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
        @drawer-close="${this.closeForm}"
      ></task-form>

      <confirm-dialog
        ?open="${!!this.deletingTask}"
        title="Delete Task"
        message="Are you sure you want to delete '${this.deletingTask?.title}'?"
        @cancel="${()=>this.deletingTask=null}"
        @confirm="${this.confirmDelete}"
      ></confirm-dialog>
    `}}customElements.define("task-list-view",gs);class ms extends w{static properties={value:{type:String}};static styles=T`
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
  `;constructor(){super(),this.value="#6366F1",this.presets=["#6366F1","#3B82F6","#10B981","#F59E0B","#EF4444","#EC4899","#8B5CF6","#06B6D4"]}selectColor(e){this.value=e,this.dispatchEvent(new CustomEvent("color-change",{detail:{value:e}}))}render(){return p`
      <div class="color-picker-container">
        <div class="swatches">
          ${this.presets.map(e=>p`
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
    `}}customElements.define("color-picker",ms);class hs extends w{static properties={start:{type:String},end:{type:String}};static styles=T`
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
  `;constructor(){super(),this.start="09:00",this.end="17:00"}handleStartChange(e){this.start=e.target.value,this.emitChange()}handleEndChange(e){this.end=e.target.value,this.emitChange()}emitChange(){this.dispatchEvent(new CustomEvent("range-change",{detail:{start:this.start,end:this.end}}))}render(){return p`
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
    `}}customElements.define("time-range-input",hs);class fs extends w{static properties={timeWindows:{type:Object}};static styles=T`
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
  `;constructor(){super(),this.timeWindows={}}addWindow(e){const t=this.timeWindows[e]||[];this.timeWindows={...this.timeWindows,[e]:[...t,{start:"09:00",end:"17:00"}]},this.emitChange()}removeWindow(e,t){const s=this.timeWindows[e]||[];this.timeWindows={...this.timeWindows,[e]:s.filter((o,i)=>i!==t)},this.emitChange()}updateWindow(e,t,s){const o=[...this.timeWindows[e]||[]];o[t]=s,this.timeWindows={...this.timeWindows,[e]:o},this.emitChange()}emitChange(){this.dispatchEvent(new CustomEvent("time-windows-change",{detail:{timeWindows:this.timeWindows}}))}render(){return p`
      <div class="editor-container">
        ${ie.map(e=>{const t=this.timeWindows[e]||[];return p`
            <div class="day-row">
              <div class="day-header">
                <span>${e}</span>
                <button class="btn-add" type="button" @click="${()=>this.addWindow(e)}">
                  + Add Window
                </button>
              </div>

              <div class="window-list">
                ${t.length===0?p`<span style="font-size: 0.75rem; color: var(--color-text-muted);">No windows</span>`:t.map((s,o)=>p`
                        <div class="window-item">
                          <time-range-input
                            .start="${s.start}"
                            .end="${s.end}"
                            @range-change="${i=>this.updateWindow(e,o,i.detail)}"
                          ></time-range-input>
                          <button
                            class="btn-remove"
                            type="button"
                            @click="${()=>this.removeWindow(e,o)}"
                          >
                            ✕
                          </button>
                        </div>
                      `)}
              </div>
            </div>
          `})}
      </div>
    `}}customElements.define("tag-time-window-editor",fs);class bs extends w{static properties={open:{type:Boolean},tag:{type:Object}};static styles=T`
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
  `;constructor(){super(),this.open=!1,this.tag=null,this.formData=this.getInitialData()}willUpdate(e){e.has("open")&&this.open?this.tag?this.formData={...this.tag}:this.formData=this.getInitialData():e.has("tag")&&this.open&&this.tag&&(this.formData={...this.tag})}getInitialData(){return{name:"",color:"#3B82F6",time_window_mode:"none",time_windows:{},needs_dedicated_timeslot:!1,auto_expand_config:{minimum_daily_minutes:60,assigned_days:[0,1,2,3,4]}}}async handleSubmit(e){e.preventDefault(),this.formData.name.trim()&&(this.tag?.id?await m.updateTag(this.tag.id,this.formData):await m.addTag(this.formData),this.closeForm())}closeForm(){this.open=!1,this.dispatchEvent(new CustomEvent("drawer-close",{bubbles:!0,composed:!0}))}render(){const e=!!this.tag?.id;return p`
      <drawer-panel
        ?open="${this.open}"
        .title="${e?"Edit Tag":"Create New Tag"}"
        @drawer-close="${this.closeForm}"
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

          ${this.formData.time_window_mode==="manual"?p`
                <div class="form-group">
                  <label>Configure Fixed Windows (Per Day)</label>
                  <tag-time-window-editor
                    .timeWindows="${this.formData.time_windows||{}}"
                    @time-windows-change="${t=>this.formData.time_windows=t.detail.timeWindows}"
                  ></tag-time-window-editor>
                </div>
              `:""}

          ${this.formData.time_window_mode==="auto"?p`
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
          <button class="btn-cancel" @click="${this.closeForm}">Cancel</button>
          <button class="btn-submit" @click="${this.handleSubmit}">
            ${e?"Save Changes":"Create Tag"}
          </button>
        </div>
      </drawer-panel>
    `}}customElements.define("tag-form",bs);class vs extends w{static properties={editingTag:{type:Object},deletingTag:{type:Object},isFormOpen:{type:Boolean}};static styles=T`
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
  `;constructor(){super(),this.editingTag=null,this.deletingTag=null,this.isFormOpen=!1}connectedCallback(){super.connectedCallback(),this.unsubscribe=m.subscribe(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}openCreateForm(){this.editingTag=null,this.isFormOpen=!0}editTag(e){this.editingTag=e,this.isFormOpen=!0}deleteTag(e){this.deletingTag=e}closeForm(){this.isFormOpen=!1,this.editingTag=null}async confirmDelete(){this.deletingTag&&(await m.deleteTag(this.deletingTag.id),this.deletingTag=null)}render(){const e=m.tags||[];return p`
      <div class="header-row">
        <h2>🏷️ Tag Management</h2>
        <button class="btn-create" @click="${this.openCreateForm}">+ Create Tag</button>
      </div>

      <div class="tag-grid">
        ${e.length===0?p`
              <div class="empty-state">
                <h3>No tags defined</h3>
                <p style="margin-top: 8px;">Create tags to categorize tasks and set time windows.</p>
              </div>
            `:e.map(t=>{const s=(m.tasks||[]).filter(o=>o.tag_ids?.includes(t.id)&&o.status==="active");return p`
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
                    ${t.needs_dedicated_timeslot?p`<span>🔒 Dedicated Time Slots Reserved</span>`:""}
                  </div>
                </div>
              `})}
      </div>

      <tag-form
        ?open="${this.isFormOpen}"
        .tag="${this.editingTag}"
        @drawer-close="${this.closeForm}"
      ></tag-form>

      <confirm-dialog
        ?open="${!!this.deletingTag}"
        title="Delete Tag"
        message="Are you sure you want to delete '${this.deletingTag?.name}'?"
        @cancel="${()=>this.deletingTag=null}"
        @confirm="${this.confirmDelete}"
      ></confirm-dialog>
    `}}customElements.define("tag-list-view",vs);class ws extends w{static properties={};static styles=T`
    :host {
      display: block;
      margin-bottom: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: var(--space-4, 16px);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .stat-value {
      font-family: var(--font-family-display, sans-serif);
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-accent, #6366F1);
    }

    .stat-label {
      font-size: 0.8125rem;
      color: var(--color-text-secondary, #9CA3AF);
    }

    .breakdown-card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: var(--space-4, 16px);
    }

    .tag-bar-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 12px;
    }

    .tag-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
    }

    .bar-bg {
      height: 8px;
      background: var(--color-bg-base, #121318);
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 300ms ease;
    }
  `;connectedCallback(){super.connectedCallback(),this.unsubscribe=m.subscribe(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}render(){const e=m.tasks||[],t=e.filter(a=>a.status==="completed"),s=t.length,i=(t.reduce((a,c)=>{const l=c.duration_hours!=null?Math.round(c.duration_hours*60):c.duration_minutes||30;return a+l},0)/60).toFixed(1),n=m.tags||[];return p`
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${s}</div>
          <div class="stat-label">Tasks Completed</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">${i} hrs</div>
          <div class="stat-label">Total Time Completed</div>
        </div>

        <div class="stat-card">
          <div class="stat-value">${e.length>0?Math.round(s/e.length*100):0}%</div>
          <div class="stat-label">Completion Rate</div>
        </div>
      </div>

      <div class="breakdown-card">
        <h4 style="font-size: 0.9375rem; font-weight: 700;">Completion Breakdown by Tag</h4>
        ${n.length===0?p`<div style="font-size: 0.8125rem; color: var(--color-text-muted); margin-top: 8px;">No tags available</div>`:n.map(a=>{const c=t.filter(d=>d.tag_ids?.includes(a.id)),l=s>0?Math.round(c.length/s*100):0;return p`
                <div class="tag-bar-row">
                  <div class="tag-info">
                    <span>🏷️ ${a.name} (${c.length} tasks)</span>
                    <span>${l}%</span>
                  </div>
                  <div class="bar-bg">
                    <div
                      class="bar-fill"
                      style="width: ${l}%; background-color: ${a.color||"#3B82F6"};"
                    ></div>
                  </div>
                </div>
              `})}
      </div>
    `}}customElements.define("history-stats",ws);class ys extends w{static properties={searchQuery:{type:String}};static styles=T`
    :host {
      display: block;
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    input[type="search"] {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 8px 14px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
      width: 260px;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .history-card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .task-title {
      font-weight: 600;
      font-size: 0.9375rem;
      text-decoration: line-through;
      color: var(--color-text-secondary, #9CA3AF);
    }

    .completed-date {
      font-size: 0.75rem;
      color: var(--color-success, #10B981);
      margin-top: 4px;
    }

    .tag-chip {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 9999px;
      color: #fff;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      background: var(--color-bg-surface, #1A1C23);
      border: 1px dashed var(--color-border, #2E3242);
      border-radius: var(--radius-lg, 12px);
      color: var(--color-text-secondary, #9CA3AF);
    }
  `;constructor(){super(),this.searchQuery=""}connectedCallback(){super.connectedCallback(),this.unsubscribe=m.subscribe(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}render(){let t=(m.tasks||[]).filter(s=>s.status==="completed");if(this.searchQuery.trim()){const s=this.searchQuery.toLowerCase();t=t.filter(o=>o.title.toLowerCase().includes(s))}return t.sort((s,o)=>new Date(o.completed_at||0).getTime()-new Date(s.completed_at||0).getTime()),p`
      <history-stats></history-stats>

      <div class="toolbar">
        <h3 style="font-family: var(--font-family-display);">Completed Tasks Log</h3>
        <input
          type="search"
          placeholder="Filter completed tasks..."
          .value="${this.searchQuery}"
          @input="${s=>this.searchQuery=s.target.value}"
        />
      </div>

      <div class="history-list">
        ${t.length===0?p`
              <div class="empty-state">
                <h3>No completed tasks</h3>
                <p style="margin-top: 8px;">Complete tasks from the Tasks view to log them in history.</p>
              </div>
            `:t.map(s=>{const o=s.tag_ids?m.tags.find(n=>s.tag_ids.includes(n.id)):null,i=s.completed_at?new Date(s.completed_at).toLocaleString():"Completed";return p`
                <div class="history-card">
                  <div>
                    <div class="task-title">✓ ${s.title}</div>
                    <div class="completed-date">Completed on ${i}</div>
                  </div>
                  <div>
                    ${o?p`<span class="tag-chip" style="background-color: ${o.color||"#3B82F6"};">
                          🏷️ ${o.name}
                        </span>`:""}
                  </div>
                </div>
              `})}
      </div>
    `}}customElements.define("history-view",ys);function be(){return typeof navigator=="object"&&"userAgent"in navigator?navigator.userAgent:typeof process=="object"&&process.version!==void 0?`Node.js/${process.version.substr(1)} (${process.platform}; ${process.arch})`:"<environment undetectable>"}function Ts(r){return r&&r.__esModule&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r}var N={exports:{}},Te,ut;function Es(){if(ut)return Te;ut=1,Te=r;function r(e,t,s,o){if(typeof s!="function")throw new Error("method for before hook must be a function");return o||(o={}),Array.isArray(t)?t.reverse().reduce(function(i,n){return r.bind(null,e,n,i,o)},s)():Promise.resolve().then(function(){return e.registry[t]?e.registry[t].reduce(function(i,n){return n.hook.bind(null,i,o)},s)():s(o)})}return Te}var Ee,gt;function _s(){if(gt)return Ee;gt=1,Ee=r;function r(e,t,s,o){var i=o;e.registry[s]||(e.registry[s]=[]),t==="before"&&(o=function(n,a){return Promise.resolve().then(i.bind(null,a)).then(n.bind(null,a))}),t==="after"&&(o=function(n,a){var c;return Promise.resolve().then(n.bind(null,a)).then(function(l){return c=l,i(c,a)}).then(function(){return c})}),t==="error"&&(o=function(n,a){return Promise.resolve().then(n.bind(null,a)).catch(function(c){return i(c,a)})}),e.registry[s].push({hook:o,orig:i})}return Ee}var _e,mt;function ks(){if(mt)return _e;mt=1,_e=r;function r(e,t,s){if(e.registry[t]){var o=e.registry[t].map(function(i){return i.orig}).indexOf(s);o!==-1&&e.registry[t].splice(o,1)}}return _e}var ht;function Ss(){if(ht)return N.exports;ht=1;var r=Es(),e=_s(),t=ks(),s=Function.bind,o=s.bind(s);function i(d,u,h){var v=o(t,null).apply(null,h?[u,h]:[u]);d.api={remove:v},d.remove=v,["before","error","after","wrap"].forEach(function(y){var $=h?[u,y,h]:[u,y];d[y]=d.api[y]=o(e,null).apply(null,$)})}function n(){var d="h",u={registry:{}},h=r.bind(null,u,d);return i(h,u,d),h}function a(){var d={registry:{}},u=r.bind(null,d);return i(u,d),u}var c=!1;function l(){return c||(console.warn('[before-after-hook]: "Hook()" repurposing warning, use "Hook.Collection()". Read more: https://git.io/upgrade-before-after-hook-to-1.4'),c=!0),a()}return l.Singular=n.bind(),l.Collection=a.bind(),N.exports=l,N.exports.Hook=l,N.exports.Singular=l.Singular,N.exports.Collection=l.Collection,N.exports}var xs=Ss(),As="9.0.6",Ps=`octokit-endpoint.js/${As} ${be()}`,Ds={method:"GET",baseUrl:"https://api.github.com",headers:{accept:"application/vnd.github.v3+json","user-agent":Ps},mediaType:{format:""}};function $s(r){return r?Object.keys(r).reduce((e,t)=>(e[t.toLowerCase()]=r[t],e),{}):{}}function Fs(r){if(typeof r!="object"||r===null||Object.prototype.toString.call(r)!=="[object Object]")return!1;const e=Object.getPrototypeOf(r);if(e===null)return!0;const t=Object.prototype.hasOwnProperty.call(e,"constructor")&&e.constructor;return typeof t=="function"&&t instanceof t&&Function.prototype.call(t)===Function.prototype.call(r)}function Ct(r,e){const t=Object.assign({},r);return Object.keys(e).forEach(s=>{Fs(e[s])?s in r?t[s]=Ct(r[s],e[s]):Object.assign(t,{[s]:e[s]}):Object.assign(t,{[s]:e[s]})}),t}function ft(r){for(const e in r)r[e]===void 0&&delete r[e];return r}function Ce(r,e,t){if(typeof e=="string"){let[o,i]=e.split(" ");t=Object.assign(i?{method:o,url:i}:{url:o},t)}else t=Object.assign({},e);t.headers=$s(t.headers),ft(t),ft(t.headers);const s=Ct(r||{},t);return t.url==="/graphql"&&(r&&r.mediaType.previews?.length&&(s.mediaType.previews=r.mediaType.previews.filter(o=>!s.mediaType.previews.includes(o)).concat(s.mediaType.previews)),s.mediaType.previews=(s.mediaType.previews||[]).map(o=>o.replace(/-preview/,""))),s}function Gs(r,e){const t=/\?/.test(r)?"&":"?",s=Object.keys(e);return s.length===0?r:r+t+s.map(o=>o==="q"?"q="+e.q.split("+").map(encodeURIComponent).join("+"):`${o}=${encodeURIComponent(e[o])}`).join("&")}var Os=/\{[^{}}]+\}/g;function Cs(r){return r.replace(/(?:^\W+)|(?:(?<!\W)\W+$)/g,"").split(/,/)}function Rs(r){const e=r.match(Os);return e?e.map(Cs).reduce((t,s)=>t.concat(s),[]):[]}function bt(r,e){const t={__proto__:null};for(const s of Object.keys(r))e.indexOf(s)===-1&&(t[s]=r[s]);return t}function Rt(r){return r.split(/(%[0-9A-Fa-f]{2})/g).map(function(e){return/%[0-9A-Fa-f]/.test(e)||(e=encodeURI(e).replace(/%5B/g,"[").replace(/%5D/g,"]")),e}).join("")}function q(r){return encodeURIComponent(r).replace(/[!'()*]/g,function(e){return"%"+e.charCodeAt(0).toString(16).toUpperCase()})}function Z(r,e,t){return e=r==="+"||r==="#"?Rt(e):q(e),t?q(t)+"="+e:e}function B(r){return r!=null}function ke(r){return r===";"||r==="&"||r==="?"}function Us(r,e,t,s){var o=r[t],i=[];if(B(o)&&o!=="")if(typeof o=="string"||typeof o=="number"||typeof o=="boolean")o=o.toString(),s&&s!=="*"&&(o=o.substring(0,parseInt(s,10))),i.push(Z(e,o,ke(e)?t:""));else if(s==="*")Array.isArray(o)?o.filter(B).forEach(function(n){i.push(Z(e,n,ke(e)?t:""))}):Object.keys(o).forEach(function(n){B(o[n])&&i.push(Z(e,o[n],n))});else{const n=[];Array.isArray(o)?o.filter(B).forEach(function(a){n.push(Z(e,a))}):Object.keys(o).forEach(function(a){B(o[a])&&(n.push(q(a)),n.push(Z(e,o[a].toString())))}),ke(e)?i.push(q(t)+"="+n.join(",")):n.length!==0&&i.push(n.join(","))}else e===";"?B(o)&&i.push(q(t)):o===""&&(e==="&"||e==="?")?i.push(q(t)+"="):o===""&&i.push("");return i}function Ls(r){return{expand:Is.bind(null,r)}}function Is(r,e){var t=["+","#",".","/",";","?","&"];return r=r.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g,function(s,o,i){if(o){let a="";const c=[];if(t.indexOf(o.charAt(0))!==-1&&(a=o.charAt(0),o=o.substr(1)),o.split(/,/g).forEach(function(l){var d=/([^:\*]*)(?::(\d+)|(\*))?/.exec(l);c.push(Us(e,a,d[1],d[2]||d[3]))}),a&&a!=="+"){var n=",";return a==="?"?n="&":a!=="#"&&(n=a),(c.length!==0?a:"")+c.join(n)}else return c.join(",")}else return Rt(i)}),r==="/"?r:r.replace(/\/$/,"")}function Ut(r){let e=r.method.toUpperCase(),t=(r.url||"/").replace(/:([a-z]\w+)/g,"{$1}"),s=Object.assign({},r.headers),o,i=bt(r,["method","baseUrl","url","headers","request","mediaType"]);const n=Rs(t);t=Ls(t).expand(i),/^http/.test(t)||(t=r.baseUrl+t);const a=Object.keys(r).filter(d=>n.includes(d)).concat("baseUrl"),c=bt(i,a);if(!/application\/octet-stream/i.test(s.accept)&&(r.mediaType.format&&(s.accept=s.accept.split(/,/).map(d=>d.replace(/application\/vnd(\.\w+)(\.v3)?(\.\w+)?(\+json)?$/,`application/vnd$1$2.${r.mediaType.format}`)).join(",")),t.endsWith("/graphql")&&r.mediaType.previews?.length)){const d=s.accept.match(/(?<![\w-])[\w-]+(?=-preview)/g)||[];s.accept=d.concat(r.mediaType.previews).map(u=>{const h=r.mediaType.format?`.${r.mediaType.format}`:"+json";return`application/vnd.github.${u}-preview${h}`}).join(",")}return["GET","HEAD"].includes(e)?t=Gs(t,c):"data"in c?o=c.data:Object.keys(c).length&&(o=c),!s["content-type"]&&typeof o<"u"&&(s["content-type"]="application/json; charset=utf-8"),["PATCH","PUT"].includes(e)&&typeof o>"u"&&(o=""),Object.assign({method:e,url:t,headers:s},typeof o<"u"?{body:o}:null,r.request?{request:r.request}:null)}function Ms(r,e,t){return Ut(Ce(r,e,t))}function Lt(r,e){const t=Ce(r,e),s=Ms.bind(null,t);return Object.assign(s,{DEFAULTS:t,defaults:Lt.bind(null,t),merge:Ce.bind(null,t),parse:Ut})}var js=Lt(null,Ds);class vt extends Error{constructor(e){super(e),Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor),this.name="Deprecation"}}var le={exports:{}},Se,wt;function Hs(){if(wt)return Se;wt=1,Se=r;function r(e,t){if(e&&t)return r(e)(t);if(typeof e!="function")throw new TypeError("need wrapper function");return Object.keys(e).forEach(function(o){s[o]=e[o]}),s;function s(){for(var o=new Array(arguments.length),i=0;i<o.length;i++)o[i]=arguments[i];var n=e.apply(this,o),a=o[o.length-1];return typeof n=="function"&&n!==a&&Object.keys(a).forEach(function(c){n[c]=a[c]}),n}}return Se}var yt;function Ns(){if(yt)return le.exports;yt=1;var r=Hs();le.exports=r(e),le.exports.strict=r(t),e.proto=e(function(){Object.defineProperty(Function.prototype,"once",{value:function(){return e(this)},configurable:!0}),Object.defineProperty(Function.prototype,"onceStrict",{value:function(){return t(this)},configurable:!0})});function e(s){var o=function(){return o.called?o.value:(o.called=!0,o.value=s.apply(this,arguments))};return o.called=!1,o}function t(s){var o=function(){if(o.called)throw new Error(o.onceError);return o.called=!0,o.value=s.apply(this,arguments)},i=s.name||"Function wrapped with `once`";return o.onceError=i+" shouldn't be called more than once",o.called=!1,o}return le.exports}var Bs=Ns();const It=Ts(Bs);var Ws=It(r=>console.warn(r)),qs=It(r=>console.warn(r)),Y=class extends Error{constructor(r,e,t){super(r),Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor),this.name="HttpError",this.status=e;let s;"headers"in t&&typeof t.headers<"u"&&(s=t.headers),"response"in t&&(this.response=t.response,s=t.response.headers);const o=Object.assign({},t.request);t.request.headers.authorization&&(o.headers=Object.assign({},t.request.headers,{authorization:t.request.headers.authorization.replace(/(?<! ) .*$/," [REDACTED]")})),o.url=o.url.replace(/\bclient_secret=\w+/g,"client_secret=[REDACTED]").replace(/\baccess_token=\w+/g,"access_token=[REDACTED]"),this.request=o,Object.defineProperty(this,"code",{get(){return Ws(new vt("[@octokit/request-error] `error.code` is deprecated, use `error.status`.")),e}}),Object.defineProperty(this,"headers",{get(){return qs(new vt("[@octokit/request-error] `error.headers` is deprecated, use `error.response.headers`.")),s||{}}})}},zs="8.4.1";function Vs(r){if(typeof r!="object"||r===null||Object.prototype.toString.call(r)!=="[object Object]")return!1;const e=Object.getPrototypeOf(r);if(e===null)return!0;const t=Object.prototype.hasOwnProperty.call(e,"constructor")&&e.constructor;return typeof t=="function"&&t instanceof t&&Function.prototype.call(t)===Function.prototype.call(r)}function Ks(r){return r.arrayBuffer()}function Tt(r){const e=r.request&&r.request.log?r.request.log:console,t=r.request?.parseSuccessResponseBody!==!1;(Vs(r.body)||Array.isArray(r.body))&&(r.body=JSON.stringify(r.body));let s={},o,i,{fetch:n}=globalThis;if(r.request?.fetch&&(n=r.request.fetch),!n)throw new Error("fetch is not set. Please pass a fetch implementation as new Octokit({ request: { fetch }}). Learn more at https://github.com/octokit/octokit.js/#fetch-missing");return n(r.url,{method:r.method,body:r.body,redirect:r.request?.redirect,headers:r.headers,signal:r.request?.signal,...r.body&&{duplex:"half"}}).then(async a=>{i=a.url,o=a.status;for(const c of a.headers)s[c[0]]=c[1];if("deprecation"in s){const c=s.link&&s.link.match(/<([^<>]+)>; rel="deprecation"/),l=c&&c.pop();e.warn(`[@octokit/request] "${r.method} ${r.url}" is deprecated. It is scheduled to be removed on ${s.sunset}${l?`. See ${l}`:""}`)}if(!(o===204||o===205)){if(r.method==="HEAD"){if(o<400)return;throw new Y(a.statusText,o,{response:{url:i,status:o,headers:s,data:void 0},request:r})}if(o===304)throw new Y("Not modified",o,{response:{url:i,status:o,headers:s,data:await xe(a)},request:r});if(o>=400){const c=await xe(a);throw new Y(Js(c),o,{response:{url:i,status:o,headers:s,data:c},request:r})}return t?await xe(a):a.body}}).then(a=>({status:o,url:i,headers:s,data:a})).catch(a=>{if(a instanceof Y)throw a;if(a.name==="AbortError")throw a;let c=a.message;throw a.name==="TypeError"&&"cause"in a&&(a.cause instanceof Error?c=a.cause.message:typeof a.cause=="string"&&(c=a.cause)),new Y(c,500,{request:r})})}async function xe(r){const e=r.headers.get("content-type");return/application\/json/.test(e)?r.json().catch(()=>r.text()).catch(()=>""):!e||/^text\/|charset=utf-8$/.test(e)?r.text():Ks(r)}function Js(r){if(typeof r=="string")return r;let e;return"documentation_url"in r?e=` - ${r.documentation_url}`:e="","message"in r?Array.isArray(r.errors)?`${r.message}: ${r.errors.map(JSON.stringify).join(", ")}${e}`:`${r.message}${e}`:`Unknown error: ${JSON.stringify(r)}`}function Re(r,e){const t=r.defaults(e);return Object.assign(function(o,i){const n=t.merge(o,i);if(!n.request||!n.request.hook)return Tt(t.parse(n));const a=(c,l)=>Tt(t.parse(t.merge(c,l)));return Object.assign(a,{endpoint:t,defaults:Re.bind(null,t)}),n.request.hook(a,n)},{endpoint:t,defaults:Re.bind(null,t)})}var Ue=Re(js,{headers:{"user-agent":`octokit-request.js/${zs} ${be()}`}}),Qs="7.1.1";function Zs(r){return`Request failed due to following response errors:
`+r.errors.map(e=>` - ${e.message}`).join(`
`)}var Ys=class extends Error{constructor(r,e,t){super(Zs(t)),this.request=r,this.headers=e,this.response=t,this.name="GraphqlResponseError",this.errors=t.errors,this.data=t.data,Error.captureStackTrace&&Error.captureStackTrace(this,this.constructor)}},Xs=["method","baseUrl","url","headers","request","query","mediaType"],eo=["query","method","url"],Et=/\/api\/v3\/?$/;function to(r,e,t){if(t){if(typeof e=="string"&&"query"in t)return Promise.reject(new Error('[@octokit/graphql] "query" cannot be used as variable name'));for(const n in t)if(eo.includes(n))return Promise.reject(new Error(`[@octokit/graphql] "${n}" cannot be used as variable name`))}const s=typeof e=="string"?Object.assign({query:e},t):e,o=Object.keys(s).reduce((n,a)=>Xs.includes(a)?(n[a]=s[a],n):(n.variables||(n.variables={}),n.variables[a]=s[a],n),{}),i=s.baseUrl||r.endpoint.DEFAULTS.baseUrl;return Et.test(i)&&(o.url=i.replace(Et,"/api/graphql")),r(o).then(n=>{if(n.data.errors){const a={};for(const c of Object.keys(n.headers))a[c]=n.headers[c];throw new Ys(o,a,n.data)}return n.data.data})}function Be(r,e){const t=r.defaults(e);return Object.assign((o,i)=>to(t,o,i),{defaults:Be.bind(null,t),endpoint:t.endpoint})}Be(Ue,{headers:{"user-agent":`octokit-graphql.js/${Qs} ${be()}`},method:"POST",url:"/graphql"});function ro(r){return Be(r,{method:"POST",url:"/graphql"})}var so=/^v1\./,oo=/^ghs_/,io=/^ghu_/;async function no(r){const e=r.split(/\./).length===3,t=so.test(r)||oo.test(r),s=io.test(r);return{type:"token",token:r,tokenType:e?"app":t?"installation":s?"user-to-server":"oauth"}}function ao(r){return r.split(/\./).length===3?`bearer ${r}`:`token ${r}`}async function co(r,e,t,s){const o=e.endpoint.merge(t,s);return o.headers.authorization=ao(r),e(o)}var lo=function(e){if(!e)throw new Error("[@octokit/auth-token] No token passed to createTokenAuth");if(typeof e!="string")throw new Error("[@octokit/auth-token] Token passed to createTokenAuth is not a string");return e=e.replace(/^(token|bearer) +/i,""),Object.assign(no.bind(null,e),{hook:co.bind(null,e)})},Mt="5.2.2",_t=()=>{},po=console.warn.bind(console),uo=console.error.bind(console);function go(r={}){return typeof r.debug!="function"&&(r.debug=_t),typeof r.info!="function"&&(r.info=_t),typeof r.warn!="function"&&(r.warn=po),typeof r.error!="function"&&(r.error=uo),r}var kt=`octokit-core.js/${Mt} ${be()}`,mo=class{static{this.VERSION=Mt}static defaults(e){return class extends this{constructor(...s){const o=s[0]||{};if(typeof e=="function"){super(e(o));return}super(Object.assign({},e,o,o.userAgent&&e.userAgent?{userAgent:`${o.userAgent} ${e.userAgent}`}:null))}}}static{this.plugins=[]}static plugin(...e){const t=this.plugins;return class extends this{static{this.plugins=t.concat(e.filter(o=>!t.includes(o)))}}}constructor(e={}){const t=new xs.Collection,s={baseUrl:Ue.endpoint.DEFAULTS.baseUrl,headers:{},request:Object.assign({},e.request,{hook:t.bind(null,"request")}),mediaType:{previews:[],format:""}};if(s.headers["user-agent"]=e.userAgent?`${e.userAgent} ${kt}`:kt,e.baseUrl&&(s.baseUrl=e.baseUrl),e.previews&&(s.mediaType.previews=e.previews),e.timeZone&&(s.headers["time-zone"]=e.timeZone),this.request=Ue.defaults(s),this.graphql=ro(this.request).defaults(s),this.log=go(e.log),this.hook=t,e.authStrategy){const{authStrategy:i,...n}=e,a=i(Object.assign({request:this.request,log:this.log,octokit:this,octokitOptions:n},e.auth));t.wrap("request",a.hook),this.auth=a}else if(!e.auth)this.auth=async()=>({type:"unauthenticated"});else{const i=lo(e.auth);t.wrap("request",i.hook),this.auth=i}const o=this.constructor;for(let i=0;i<o.plugins.length;++i)Object.assign(this,o.plugins[i](this,e))}},ho="4.0.1";function jt(r){r.hook.wrap("request",(e,t)=>{r.log.debug("request",t);const s=Date.now(),o=r.request.endpoint.parse(t),i=o.url.replace(t.baseUrl,"");return e(t).then(n=>(r.log.info(`${o.method} ${i} - ${n.status} in ${Date.now()-s}ms`),n)).catch(n=>{throw r.log.info(`${o.method} ${i} - ${n.status} in ${Date.now()-s}ms`),n})})}jt.VERSION=ho;var fo="11.4.4-cjs.2";function bo(r){if(!r.data)return{...r,data:[]};if(!("total_count"in r.data&&!("url"in r.data)))return r;const t=r.data.incomplete_results,s=r.data.repository_selection,o=r.data.total_count;delete r.data.incomplete_results,delete r.data.repository_selection,delete r.data.total_count;const i=Object.keys(r.data)[0],n=r.data[i];return r.data=n,typeof t<"u"&&(r.data.incomplete_results=t),typeof s<"u"&&(r.data.repository_selection=s),r.data.total_count=o,r}function We(r,e,t){const s=typeof e=="function"?e.endpoint(t):r.request.endpoint(e,t),o=typeof e=="function"?e:r.request,i=s.method,n=s.headers;let a=s.url;return{[Symbol.asyncIterator]:()=>({async next(){if(!a)return{done:!0};try{const c=await o({method:i,url:a,headers:n}),l=bo(c);return a=((l.headers.link||"").match(/<([^<>]+)>;\s*rel="next"/)||[])[1],{value:l}}catch(c){if(c.status!==409)throw c;return a="",{value:{status:200,headers:{},data:[]}}}}})}}function Ht(r,e,t,s){return typeof t=="function"&&(s=t,t=void 0),Nt(r,[],We(r,e,t)[Symbol.asyncIterator](),s)}function Nt(r,e,t,s){return t.next().then(o=>{if(o.done)return e;let i=!1;function n(){i=!0}return e=e.concat(s?s(o.value,n):o.value.data),i?e:Nt(r,e,t,s)})}Object.assign(Ht,{iterator:We});function Bt(r){return{paginate:Object.assign(Ht.bind(null,r),{iterator:We.bind(null,r)})}}Bt.VERSION=fo;var vo="13.3.2-cjs.1",wo={actions:{addCustomLabelsToSelfHostedRunnerForOrg:["POST /orgs/{org}/actions/runners/{runner_id}/labels"],addCustomLabelsToSelfHostedRunnerForRepo:["POST /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],addRepoAccessToSelfHostedRunnerGroupInOrg:["PUT /orgs/{org}/actions/runner-groups/{runner_group_id}/repositories/{repository_id}"],addSelectedRepoToOrgSecret:["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],addSelectedRepoToOrgVariable:["PUT /orgs/{org}/actions/variables/{name}/repositories/{repository_id}"],approveWorkflowRun:["POST /repos/{owner}/{repo}/actions/runs/{run_id}/approve"],cancelWorkflowRun:["POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel"],createEnvironmentVariable:["POST /repos/{owner}/{repo}/environments/{environment_name}/variables"],createOrUpdateEnvironmentSecret:["PUT /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"],createOrUpdateOrgSecret:["PUT /orgs/{org}/actions/secrets/{secret_name}"],createOrUpdateRepoSecret:["PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}"],createOrgVariable:["POST /orgs/{org}/actions/variables"],createRegistrationTokenForOrg:["POST /orgs/{org}/actions/runners/registration-token"],createRegistrationTokenForRepo:["POST /repos/{owner}/{repo}/actions/runners/registration-token"],createRemoveTokenForOrg:["POST /orgs/{org}/actions/runners/remove-token"],createRemoveTokenForRepo:["POST /repos/{owner}/{repo}/actions/runners/remove-token"],createRepoVariable:["POST /repos/{owner}/{repo}/actions/variables"],createWorkflowDispatch:["POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches"],deleteActionsCacheById:["DELETE /repos/{owner}/{repo}/actions/caches/{cache_id}"],deleteActionsCacheByKey:["DELETE /repos/{owner}/{repo}/actions/caches{?key,ref}"],deleteArtifact:["DELETE /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],deleteEnvironmentSecret:["DELETE /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"],deleteEnvironmentVariable:["DELETE /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"],deleteOrgSecret:["DELETE /orgs/{org}/actions/secrets/{secret_name}"],deleteOrgVariable:["DELETE /orgs/{org}/actions/variables/{name}"],deleteRepoSecret:["DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}"],deleteRepoVariable:["DELETE /repos/{owner}/{repo}/actions/variables/{name}"],deleteSelfHostedRunnerFromOrg:["DELETE /orgs/{org}/actions/runners/{runner_id}"],deleteSelfHostedRunnerFromRepo:["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}"],deleteWorkflowRun:["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}"],deleteWorkflowRunLogs:["DELETE /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],disableSelectedRepositoryGithubActionsOrganization:["DELETE /orgs/{org}/actions/permissions/repositories/{repository_id}"],disableWorkflow:["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/disable"],downloadArtifact:["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}"],downloadJobLogsForWorkflowRun:["GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs"],downloadWorkflowRunAttemptLogs:["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/logs"],downloadWorkflowRunLogs:["GET /repos/{owner}/{repo}/actions/runs/{run_id}/logs"],enableSelectedRepositoryGithubActionsOrganization:["PUT /orgs/{org}/actions/permissions/repositories/{repository_id}"],enableWorkflow:["PUT /repos/{owner}/{repo}/actions/workflows/{workflow_id}/enable"],forceCancelWorkflowRun:["POST /repos/{owner}/{repo}/actions/runs/{run_id}/force-cancel"],generateRunnerJitconfigForOrg:["POST /orgs/{org}/actions/runners/generate-jitconfig"],generateRunnerJitconfigForRepo:["POST /repos/{owner}/{repo}/actions/runners/generate-jitconfig"],getActionsCacheList:["GET /repos/{owner}/{repo}/actions/caches"],getActionsCacheUsage:["GET /repos/{owner}/{repo}/actions/cache/usage"],getActionsCacheUsageByRepoForOrg:["GET /orgs/{org}/actions/cache/usage-by-repository"],getActionsCacheUsageForOrg:["GET /orgs/{org}/actions/cache/usage"],getAllowedActionsOrganization:["GET /orgs/{org}/actions/permissions/selected-actions"],getAllowedActionsRepository:["GET /repos/{owner}/{repo}/actions/permissions/selected-actions"],getArtifact:["GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}"],getCustomOidcSubClaimForRepo:["GET /repos/{owner}/{repo}/actions/oidc/customization/sub"],getEnvironmentPublicKey:["GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/public-key"],getEnvironmentSecret:["GET /repos/{owner}/{repo}/environments/{environment_name}/secrets/{secret_name}"],getEnvironmentVariable:["GET /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"],getGithubActionsDefaultWorkflowPermissionsOrganization:["GET /orgs/{org}/actions/permissions/workflow"],getGithubActionsDefaultWorkflowPermissionsRepository:["GET /repos/{owner}/{repo}/actions/permissions/workflow"],getGithubActionsPermissionsOrganization:["GET /orgs/{org}/actions/permissions"],getGithubActionsPermissionsRepository:["GET /repos/{owner}/{repo}/actions/permissions"],getJobForWorkflowRun:["GET /repos/{owner}/{repo}/actions/jobs/{job_id}"],getOrgPublicKey:["GET /orgs/{org}/actions/secrets/public-key"],getOrgSecret:["GET /orgs/{org}/actions/secrets/{secret_name}"],getOrgVariable:["GET /orgs/{org}/actions/variables/{name}"],getPendingDeploymentsForRun:["GET /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"],getRepoPermissions:["GET /repos/{owner}/{repo}/actions/permissions",{},{renamed:["actions","getGithubActionsPermissionsRepository"]}],getRepoPublicKey:["GET /repos/{owner}/{repo}/actions/secrets/public-key"],getRepoSecret:["GET /repos/{owner}/{repo}/actions/secrets/{secret_name}"],getRepoVariable:["GET /repos/{owner}/{repo}/actions/variables/{name}"],getReviewsForRun:["GET /repos/{owner}/{repo}/actions/runs/{run_id}/approvals"],getSelfHostedRunnerForOrg:["GET /orgs/{org}/actions/runners/{runner_id}"],getSelfHostedRunnerForRepo:["GET /repos/{owner}/{repo}/actions/runners/{runner_id}"],getWorkflow:["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}"],getWorkflowAccessToRepository:["GET /repos/{owner}/{repo}/actions/permissions/access"],getWorkflowRun:["GET /repos/{owner}/{repo}/actions/runs/{run_id}"],getWorkflowRunAttempt:["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}"],getWorkflowRunUsage:["GET /repos/{owner}/{repo}/actions/runs/{run_id}/timing"],getWorkflowUsage:["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/timing"],listArtifactsForRepo:["GET /repos/{owner}/{repo}/actions/artifacts"],listEnvironmentSecrets:["GET /repos/{owner}/{repo}/environments/{environment_name}/secrets"],listEnvironmentVariables:["GET /repos/{owner}/{repo}/environments/{environment_name}/variables"],listJobsForWorkflowRun:["GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs"],listJobsForWorkflowRunAttempt:["GET /repos/{owner}/{repo}/actions/runs/{run_id}/attempts/{attempt_number}/jobs"],listLabelsForSelfHostedRunnerForOrg:["GET /orgs/{org}/actions/runners/{runner_id}/labels"],listLabelsForSelfHostedRunnerForRepo:["GET /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],listOrgSecrets:["GET /orgs/{org}/actions/secrets"],listOrgVariables:["GET /orgs/{org}/actions/variables"],listRepoOrganizationSecrets:["GET /repos/{owner}/{repo}/actions/organization-secrets"],listRepoOrganizationVariables:["GET /repos/{owner}/{repo}/actions/organization-variables"],listRepoSecrets:["GET /repos/{owner}/{repo}/actions/secrets"],listRepoVariables:["GET /repos/{owner}/{repo}/actions/variables"],listRepoWorkflows:["GET /repos/{owner}/{repo}/actions/workflows"],listRunnerApplicationsForOrg:["GET /orgs/{org}/actions/runners/downloads"],listRunnerApplicationsForRepo:["GET /repos/{owner}/{repo}/actions/runners/downloads"],listSelectedReposForOrgSecret:["GET /orgs/{org}/actions/secrets/{secret_name}/repositories"],listSelectedReposForOrgVariable:["GET /orgs/{org}/actions/variables/{name}/repositories"],listSelectedRepositoriesEnabledGithubActionsOrganization:["GET /orgs/{org}/actions/permissions/repositories"],listSelfHostedRunnersForOrg:["GET /orgs/{org}/actions/runners"],listSelfHostedRunnersForRepo:["GET /repos/{owner}/{repo}/actions/runners"],listWorkflowRunArtifacts:["GET /repos/{owner}/{repo}/actions/runs/{run_id}/artifacts"],listWorkflowRuns:["GET /repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs"],listWorkflowRunsForRepo:["GET /repos/{owner}/{repo}/actions/runs"],reRunJobForWorkflowRun:["POST /repos/{owner}/{repo}/actions/jobs/{job_id}/rerun"],reRunWorkflow:["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun"],reRunWorkflowFailedJobs:["POST /repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs"],removeAllCustomLabelsFromSelfHostedRunnerForOrg:["DELETE /orgs/{org}/actions/runners/{runner_id}/labels"],removeAllCustomLabelsFromSelfHostedRunnerForRepo:["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],removeCustomLabelFromSelfHostedRunnerForOrg:["DELETE /orgs/{org}/actions/runners/{runner_id}/labels/{name}"],removeCustomLabelFromSelfHostedRunnerForRepo:["DELETE /repos/{owner}/{repo}/actions/runners/{runner_id}/labels/{name}"],removeSelectedRepoFromOrgSecret:["DELETE /orgs/{org}/actions/secrets/{secret_name}/repositories/{repository_id}"],removeSelectedRepoFromOrgVariable:["DELETE /orgs/{org}/actions/variables/{name}/repositories/{repository_id}"],reviewCustomGatesForRun:["POST /repos/{owner}/{repo}/actions/runs/{run_id}/deployment_protection_rule"],reviewPendingDeploymentsForRun:["POST /repos/{owner}/{repo}/actions/runs/{run_id}/pending_deployments"],setAllowedActionsOrganization:["PUT /orgs/{org}/actions/permissions/selected-actions"],setAllowedActionsRepository:["PUT /repos/{owner}/{repo}/actions/permissions/selected-actions"],setCustomLabelsForSelfHostedRunnerForOrg:["PUT /orgs/{org}/actions/runners/{runner_id}/labels"],setCustomLabelsForSelfHostedRunnerForRepo:["PUT /repos/{owner}/{repo}/actions/runners/{runner_id}/labels"],setCustomOidcSubClaimForRepo:["PUT /repos/{owner}/{repo}/actions/oidc/customization/sub"],setGithubActionsDefaultWorkflowPermissionsOrganization:["PUT /orgs/{org}/actions/permissions/workflow"],setGithubActionsDefaultWorkflowPermissionsRepository:["PUT /repos/{owner}/{repo}/actions/permissions/workflow"],setGithubActionsPermissionsOrganization:["PUT /orgs/{org}/actions/permissions"],setGithubActionsPermissionsRepository:["PUT /repos/{owner}/{repo}/actions/permissions"],setSelectedReposForOrgSecret:["PUT /orgs/{org}/actions/secrets/{secret_name}/repositories"],setSelectedReposForOrgVariable:["PUT /orgs/{org}/actions/variables/{name}/repositories"],setSelectedRepositoriesEnabledGithubActionsOrganization:["PUT /orgs/{org}/actions/permissions/repositories"],setWorkflowAccessToRepository:["PUT /repos/{owner}/{repo}/actions/permissions/access"],updateEnvironmentVariable:["PATCH /repos/{owner}/{repo}/environments/{environment_name}/variables/{name}"],updateOrgVariable:["PATCH /orgs/{org}/actions/variables/{name}"],updateRepoVariable:["PATCH /repos/{owner}/{repo}/actions/variables/{name}"]},activity:{checkRepoIsStarredByAuthenticatedUser:["GET /user/starred/{owner}/{repo}"],deleteRepoSubscription:["DELETE /repos/{owner}/{repo}/subscription"],deleteThreadSubscription:["DELETE /notifications/threads/{thread_id}/subscription"],getFeeds:["GET /feeds"],getRepoSubscription:["GET /repos/{owner}/{repo}/subscription"],getThread:["GET /notifications/threads/{thread_id}"],getThreadSubscriptionForAuthenticatedUser:["GET /notifications/threads/{thread_id}/subscription"],listEventsForAuthenticatedUser:["GET /users/{username}/events"],listNotificationsForAuthenticatedUser:["GET /notifications"],listOrgEventsForAuthenticatedUser:["GET /users/{username}/events/orgs/{org}"],listPublicEvents:["GET /events"],listPublicEventsForRepoNetwork:["GET /networks/{owner}/{repo}/events"],listPublicEventsForUser:["GET /users/{username}/events/public"],listPublicOrgEvents:["GET /orgs/{org}/events"],listReceivedEventsForUser:["GET /users/{username}/received_events"],listReceivedPublicEventsForUser:["GET /users/{username}/received_events/public"],listRepoEvents:["GET /repos/{owner}/{repo}/events"],listRepoNotificationsForAuthenticatedUser:["GET /repos/{owner}/{repo}/notifications"],listReposStarredByAuthenticatedUser:["GET /user/starred"],listReposStarredByUser:["GET /users/{username}/starred"],listReposWatchedByUser:["GET /users/{username}/subscriptions"],listStargazersForRepo:["GET /repos/{owner}/{repo}/stargazers"],listWatchedReposForAuthenticatedUser:["GET /user/subscriptions"],listWatchersForRepo:["GET /repos/{owner}/{repo}/subscribers"],markNotificationsAsRead:["PUT /notifications"],markRepoNotificationsAsRead:["PUT /repos/{owner}/{repo}/notifications"],markThreadAsDone:["DELETE /notifications/threads/{thread_id}"],markThreadAsRead:["PATCH /notifications/threads/{thread_id}"],setRepoSubscription:["PUT /repos/{owner}/{repo}/subscription"],setThreadSubscription:["PUT /notifications/threads/{thread_id}/subscription"],starRepoForAuthenticatedUser:["PUT /user/starred/{owner}/{repo}"],unstarRepoForAuthenticatedUser:["DELETE /user/starred/{owner}/{repo}"]},apps:{addRepoToInstallation:["PUT /user/installations/{installation_id}/repositories/{repository_id}",{},{renamed:["apps","addRepoToInstallationForAuthenticatedUser"]}],addRepoToInstallationForAuthenticatedUser:["PUT /user/installations/{installation_id}/repositories/{repository_id}"],checkToken:["POST /applications/{client_id}/token"],createFromManifest:["POST /app-manifests/{code}/conversions"],createInstallationAccessToken:["POST /app/installations/{installation_id}/access_tokens"],deleteAuthorization:["DELETE /applications/{client_id}/grant"],deleteInstallation:["DELETE /app/installations/{installation_id}"],deleteToken:["DELETE /applications/{client_id}/token"],getAuthenticated:["GET /app"],getBySlug:["GET /apps/{app_slug}"],getInstallation:["GET /app/installations/{installation_id}"],getOrgInstallation:["GET /orgs/{org}/installation"],getRepoInstallation:["GET /repos/{owner}/{repo}/installation"],getSubscriptionPlanForAccount:["GET /marketplace_listing/accounts/{account_id}"],getSubscriptionPlanForAccountStubbed:["GET /marketplace_listing/stubbed/accounts/{account_id}"],getUserInstallation:["GET /users/{username}/installation"],getWebhookConfigForApp:["GET /app/hook/config"],getWebhookDelivery:["GET /app/hook/deliveries/{delivery_id}"],listAccountsForPlan:["GET /marketplace_listing/plans/{plan_id}/accounts"],listAccountsForPlanStubbed:["GET /marketplace_listing/stubbed/plans/{plan_id}/accounts"],listInstallationReposForAuthenticatedUser:["GET /user/installations/{installation_id}/repositories"],listInstallationRequestsForAuthenticatedApp:["GET /app/installation-requests"],listInstallations:["GET /app/installations"],listInstallationsForAuthenticatedUser:["GET /user/installations"],listPlans:["GET /marketplace_listing/plans"],listPlansStubbed:["GET /marketplace_listing/stubbed/plans"],listReposAccessibleToInstallation:["GET /installation/repositories"],listSubscriptionsForAuthenticatedUser:["GET /user/marketplace_purchases"],listSubscriptionsForAuthenticatedUserStubbed:["GET /user/marketplace_purchases/stubbed"],listWebhookDeliveries:["GET /app/hook/deliveries"],redeliverWebhookDelivery:["POST /app/hook/deliveries/{delivery_id}/attempts"],removeRepoFromInstallation:["DELETE /user/installations/{installation_id}/repositories/{repository_id}",{},{renamed:["apps","removeRepoFromInstallationForAuthenticatedUser"]}],removeRepoFromInstallationForAuthenticatedUser:["DELETE /user/installations/{installation_id}/repositories/{repository_id}"],resetToken:["PATCH /applications/{client_id}/token"],revokeInstallationAccessToken:["DELETE /installation/token"],scopeToken:["POST /applications/{client_id}/token/scoped"],suspendInstallation:["PUT /app/installations/{installation_id}/suspended"],unsuspendInstallation:["DELETE /app/installations/{installation_id}/suspended"],updateWebhookConfigForApp:["PATCH /app/hook/config"]},billing:{getGithubActionsBillingOrg:["GET /orgs/{org}/settings/billing/actions"],getGithubActionsBillingUser:["GET /users/{username}/settings/billing/actions"],getGithubBillingUsageReportOrg:["GET /organizations/{org}/settings/billing/usage"],getGithubPackagesBillingOrg:["GET /orgs/{org}/settings/billing/packages"],getGithubPackagesBillingUser:["GET /users/{username}/settings/billing/packages"],getSharedStorageBillingOrg:["GET /orgs/{org}/settings/billing/shared-storage"],getSharedStorageBillingUser:["GET /users/{username}/settings/billing/shared-storage"]},checks:{create:["POST /repos/{owner}/{repo}/check-runs"],createSuite:["POST /repos/{owner}/{repo}/check-suites"],get:["GET /repos/{owner}/{repo}/check-runs/{check_run_id}"],getSuite:["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}"],listAnnotations:["GET /repos/{owner}/{repo}/check-runs/{check_run_id}/annotations"],listForRef:["GET /repos/{owner}/{repo}/commits/{ref}/check-runs"],listForSuite:["GET /repos/{owner}/{repo}/check-suites/{check_suite_id}/check-runs"],listSuitesForRef:["GET /repos/{owner}/{repo}/commits/{ref}/check-suites"],rerequestRun:["POST /repos/{owner}/{repo}/check-runs/{check_run_id}/rerequest"],rerequestSuite:["POST /repos/{owner}/{repo}/check-suites/{check_suite_id}/rerequest"],setSuitesPreferences:["PATCH /repos/{owner}/{repo}/check-suites/preferences"],update:["PATCH /repos/{owner}/{repo}/check-runs/{check_run_id}"]},codeScanning:{commitAutofix:["POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix/commits"],createAutofix:["POST /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"],createVariantAnalysis:["POST /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses"],deleteAnalysis:["DELETE /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}{?confirm_delete}"],deleteCodeqlDatabase:["DELETE /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}"],getAlert:["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}",{},{renamedParameters:{alert_id:"alert_number"}}],getAnalysis:["GET /repos/{owner}/{repo}/code-scanning/analyses/{analysis_id}"],getAutofix:["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/autofix"],getCodeqlDatabase:["GET /repos/{owner}/{repo}/code-scanning/codeql/databases/{language}"],getDefaultSetup:["GET /repos/{owner}/{repo}/code-scanning/default-setup"],getSarif:["GET /repos/{owner}/{repo}/code-scanning/sarifs/{sarif_id}"],getVariantAnalysis:["GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}"],getVariantAnalysisRepoTask:["GET /repos/{owner}/{repo}/code-scanning/codeql/variant-analyses/{codeql_variant_analysis_id}/repos/{repo_owner}/{repo_name}"],listAlertInstances:["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances"],listAlertsForOrg:["GET /orgs/{org}/code-scanning/alerts"],listAlertsForRepo:["GET /repos/{owner}/{repo}/code-scanning/alerts"],listAlertsInstances:["GET /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}/instances",{},{renamed:["codeScanning","listAlertInstances"]}],listCodeqlDatabases:["GET /repos/{owner}/{repo}/code-scanning/codeql/databases"],listRecentAnalyses:["GET /repos/{owner}/{repo}/code-scanning/analyses"],updateAlert:["PATCH /repos/{owner}/{repo}/code-scanning/alerts/{alert_number}"],updateDefaultSetup:["PATCH /repos/{owner}/{repo}/code-scanning/default-setup"],uploadSarif:["POST /repos/{owner}/{repo}/code-scanning/sarifs"]},codeSecurity:{attachConfiguration:["POST /orgs/{org}/code-security/configurations/{configuration_id}/attach"],attachEnterpriseConfiguration:["POST /enterprises/{enterprise}/code-security/configurations/{configuration_id}/attach"],createConfiguration:["POST /orgs/{org}/code-security/configurations"],createConfigurationForEnterprise:["POST /enterprises/{enterprise}/code-security/configurations"],deleteConfiguration:["DELETE /orgs/{org}/code-security/configurations/{configuration_id}"],deleteConfigurationForEnterprise:["DELETE /enterprises/{enterprise}/code-security/configurations/{configuration_id}"],detachConfiguration:["DELETE /orgs/{org}/code-security/configurations/detach"],getConfiguration:["GET /orgs/{org}/code-security/configurations/{configuration_id}"],getConfigurationForRepository:["GET /repos/{owner}/{repo}/code-security-configuration"],getConfigurationsForEnterprise:["GET /enterprises/{enterprise}/code-security/configurations"],getConfigurationsForOrg:["GET /orgs/{org}/code-security/configurations"],getDefaultConfigurations:["GET /orgs/{org}/code-security/configurations/defaults"],getDefaultConfigurationsForEnterprise:["GET /enterprises/{enterprise}/code-security/configurations/defaults"],getRepositoriesForConfiguration:["GET /orgs/{org}/code-security/configurations/{configuration_id}/repositories"],getRepositoriesForEnterpriseConfiguration:["GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}/repositories"],getSingleConfigurationForEnterprise:["GET /enterprises/{enterprise}/code-security/configurations/{configuration_id}"],setConfigurationAsDefault:["PUT /orgs/{org}/code-security/configurations/{configuration_id}/defaults"],setConfigurationAsDefaultForEnterprise:["PUT /enterprises/{enterprise}/code-security/configurations/{configuration_id}/defaults"],updateConfiguration:["PATCH /orgs/{org}/code-security/configurations/{configuration_id}"],updateEnterpriseConfiguration:["PATCH /enterprises/{enterprise}/code-security/configurations/{configuration_id}"]},codesOfConduct:{getAllCodesOfConduct:["GET /codes_of_conduct"],getConductCode:["GET /codes_of_conduct/{key}"]},codespaces:{addRepositoryForSecretForAuthenticatedUser:["PUT /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"],addSelectedRepoToOrgSecret:["PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}"],checkPermissionsForDevcontainer:["GET /repos/{owner}/{repo}/codespaces/permissions_check"],codespaceMachinesForAuthenticatedUser:["GET /user/codespaces/{codespace_name}/machines"],createForAuthenticatedUser:["POST /user/codespaces"],createOrUpdateOrgSecret:["PUT /orgs/{org}/codespaces/secrets/{secret_name}"],createOrUpdateRepoSecret:["PUT /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],createOrUpdateSecretForAuthenticatedUser:["PUT /user/codespaces/secrets/{secret_name}"],createWithPrForAuthenticatedUser:["POST /repos/{owner}/{repo}/pulls/{pull_number}/codespaces"],createWithRepoForAuthenticatedUser:["POST /repos/{owner}/{repo}/codespaces"],deleteForAuthenticatedUser:["DELETE /user/codespaces/{codespace_name}"],deleteFromOrganization:["DELETE /orgs/{org}/members/{username}/codespaces/{codespace_name}"],deleteOrgSecret:["DELETE /orgs/{org}/codespaces/secrets/{secret_name}"],deleteRepoSecret:["DELETE /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],deleteSecretForAuthenticatedUser:["DELETE /user/codespaces/secrets/{secret_name}"],exportForAuthenticatedUser:["POST /user/codespaces/{codespace_name}/exports"],getCodespacesForUserInOrg:["GET /orgs/{org}/members/{username}/codespaces"],getExportDetailsForAuthenticatedUser:["GET /user/codespaces/{codespace_name}/exports/{export_id}"],getForAuthenticatedUser:["GET /user/codespaces/{codespace_name}"],getOrgPublicKey:["GET /orgs/{org}/codespaces/secrets/public-key"],getOrgSecret:["GET /orgs/{org}/codespaces/secrets/{secret_name}"],getPublicKeyForAuthenticatedUser:["GET /user/codespaces/secrets/public-key"],getRepoPublicKey:["GET /repos/{owner}/{repo}/codespaces/secrets/public-key"],getRepoSecret:["GET /repos/{owner}/{repo}/codespaces/secrets/{secret_name}"],getSecretForAuthenticatedUser:["GET /user/codespaces/secrets/{secret_name}"],listDevcontainersInRepositoryForAuthenticatedUser:["GET /repos/{owner}/{repo}/codespaces/devcontainers"],listForAuthenticatedUser:["GET /user/codespaces"],listInOrganization:["GET /orgs/{org}/codespaces",{},{renamedParameters:{org_id:"org"}}],listInRepositoryForAuthenticatedUser:["GET /repos/{owner}/{repo}/codespaces"],listOrgSecrets:["GET /orgs/{org}/codespaces/secrets"],listRepoSecrets:["GET /repos/{owner}/{repo}/codespaces/secrets"],listRepositoriesForSecretForAuthenticatedUser:["GET /user/codespaces/secrets/{secret_name}/repositories"],listSecretsForAuthenticatedUser:["GET /user/codespaces/secrets"],listSelectedReposForOrgSecret:["GET /orgs/{org}/codespaces/secrets/{secret_name}/repositories"],preFlightWithRepoForAuthenticatedUser:["GET /repos/{owner}/{repo}/codespaces/new"],publishForAuthenticatedUser:["POST /user/codespaces/{codespace_name}/publish"],removeRepositoryForSecretForAuthenticatedUser:["DELETE /user/codespaces/secrets/{secret_name}/repositories/{repository_id}"],removeSelectedRepoFromOrgSecret:["DELETE /orgs/{org}/codespaces/secrets/{secret_name}/repositories/{repository_id}"],repoMachinesForAuthenticatedUser:["GET /repos/{owner}/{repo}/codespaces/machines"],setRepositoriesForSecretForAuthenticatedUser:["PUT /user/codespaces/secrets/{secret_name}/repositories"],setSelectedReposForOrgSecret:["PUT /orgs/{org}/codespaces/secrets/{secret_name}/repositories"],startForAuthenticatedUser:["POST /user/codespaces/{codespace_name}/start"],stopForAuthenticatedUser:["POST /user/codespaces/{codespace_name}/stop"],stopInOrganization:["POST /orgs/{org}/members/{username}/codespaces/{codespace_name}/stop"],updateForAuthenticatedUser:["PATCH /user/codespaces/{codespace_name}"]},copilot:{addCopilotSeatsForTeams:["POST /orgs/{org}/copilot/billing/selected_teams"],addCopilotSeatsForUsers:["POST /orgs/{org}/copilot/billing/selected_users"],cancelCopilotSeatAssignmentForTeams:["DELETE /orgs/{org}/copilot/billing/selected_teams"],cancelCopilotSeatAssignmentForUsers:["DELETE /orgs/{org}/copilot/billing/selected_users"],copilotMetricsForOrganization:["GET /orgs/{org}/copilot/metrics"],copilotMetricsForTeam:["GET /orgs/{org}/team/{team_slug}/copilot/metrics"],getCopilotOrganizationDetails:["GET /orgs/{org}/copilot/billing"],getCopilotSeatDetailsForUser:["GET /orgs/{org}/members/{username}/copilot"],listCopilotSeats:["GET /orgs/{org}/copilot/billing/seats"],usageMetricsForOrg:["GET /orgs/{org}/copilot/usage"],usageMetricsForTeam:["GET /orgs/{org}/team/{team_slug}/copilot/usage"]},dependabot:{addSelectedRepoToOrgSecret:["PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"],createOrUpdateOrgSecret:["PUT /orgs/{org}/dependabot/secrets/{secret_name}"],createOrUpdateRepoSecret:["PUT /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],deleteOrgSecret:["DELETE /orgs/{org}/dependabot/secrets/{secret_name}"],deleteRepoSecret:["DELETE /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],getAlert:["GET /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"],getOrgPublicKey:["GET /orgs/{org}/dependabot/secrets/public-key"],getOrgSecret:["GET /orgs/{org}/dependabot/secrets/{secret_name}"],getRepoPublicKey:["GET /repos/{owner}/{repo}/dependabot/secrets/public-key"],getRepoSecret:["GET /repos/{owner}/{repo}/dependabot/secrets/{secret_name}"],listAlertsForEnterprise:["GET /enterprises/{enterprise}/dependabot/alerts"],listAlertsForOrg:["GET /orgs/{org}/dependabot/alerts"],listAlertsForRepo:["GET /repos/{owner}/{repo}/dependabot/alerts"],listOrgSecrets:["GET /orgs/{org}/dependabot/secrets"],listRepoSecrets:["GET /repos/{owner}/{repo}/dependabot/secrets"],listSelectedReposForOrgSecret:["GET /orgs/{org}/dependabot/secrets/{secret_name}/repositories"],removeSelectedRepoFromOrgSecret:["DELETE /orgs/{org}/dependabot/secrets/{secret_name}/repositories/{repository_id}"],setSelectedReposForOrgSecret:["PUT /orgs/{org}/dependabot/secrets/{secret_name}/repositories"],updateAlert:["PATCH /repos/{owner}/{repo}/dependabot/alerts/{alert_number}"]},dependencyGraph:{createRepositorySnapshot:["POST /repos/{owner}/{repo}/dependency-graph/snapshots"],diffRange:["GET /repos/{owner}/{repo}/dependency-graph/compare/{basehead}"],exportSbom:["GET /repos/{owner}/{repo}/dependency-graph/sbom"]},emojis:{get:["GET /emojis"]},gists:{checkIsStarred:["GET /gists/{gist_id}/star"],create:["POST /gists"],createComment:["POST /gists/{gist_id}/comments"],delete:["DELETE /gists/{gist_id}"],deleteComment:["DELETE /gists/{gist_id}/comments/{comment_id}"],fork:["POST /gists/{gist_id}/forks"],get:["GET /gists/{gist_id}"],getComment:["GET /gists/{gist_id}/comments/{comment_id}"],getRevision:["GET /gists/{gist_id}/{sha}"],list:["GET /gists"],listComments:["GET /gists/{gist_id}/comments"],listCommits:["GET /gists/{gist_id}/commits"],listForUser:["GET /users/{username}/gists"],listForks:["GET /gists/{gist_id}/forks"],listPublic:["GET /gists/public"],listStarred:["GET /gists/starred"],star:["PUT /gists/{gist_id}/star"],unstar:["DELETE /gists/{gist_id}/star"],update:["PATCH /gists/{gist_id}"],updateComment:["PATCH /gists/{gist_id}/comments/{comment_id}"]},git:{createBlob:["POST /repos/{owner}/{repo}/git/blobs"],createCommit:["POST /repos/{owner}/{repo}/git/commits"],createRef:["POST /repos/{owner}/{repo}/git/refs"],createTag:["POST /repos/{owner}/{repo}/git/tags"],createTree:["POST /repos/{owner}/{repo}/git/trees"],deleteRef:["DELETE /repos/{owner}/{repo}/git/refs/{ref}"],getBlob:["GET /repos/{owner}/{repo}/git/blobs/{file_sha}"],getCommit:["GET /repos/{owner}/{repo}/git/commits/{commit_sha}"],getRef:["GET /repos/{owner}/{repo}/git/ref/{ref}"],getTag:["GET /repos/{owner}/{repo}/git/tags/{tag_sha}"],getTree:["GET /repos/{owner}/{repo}/git/trees/{tree_sha}"],listMatchingRefs:["GET /repos/{owner}/{repo}/git/matching-refs/{ref}"],updateRef:["PATCH /repos/{owner}/{repo}/git/refs/{ref}"]},gitignore:{getAllTemplates:["GET /gitignore/templates"],getTemplate:["GET /gitignore/templates/{name}"]},interactions:{getRestrictionsForAuthenticatedUser:["GET /user/interaction-limits"],getRestrictionsForOrg:["GET /orgs/{org}/interaction-limits"],getRestrictionsForRepo:["GET /repos/{owner}/{repo}/interaction-limits"],getRestrictionsForYourPublicRepos:["GET /user/interaction-limits",{},{renamed:["interactions","getRestrictionsForAuthenticatedUser"]}],removeRestrictionsForAuthenticatedUser:["DELETE /user/interaction-limits"],removeRestrictionsForOrg:["DELETE /orgs/{org}/interaction-limits"],removeRestrictionsForRepo:["DELETE /repos/{owner}/{repo}/interaction-limits"],removeRestrictionsForYourPublicRepos:["DELETE /user/interaction-limits",{},{renamed:["interactions","removeRestrictionsForAuthenticatedUser"]}],setRestrictionsForAuthenticatedUser:["PUT /user/interaction-limits"],setRestrictionsForOrg:["PUT /orgs/{org}/interaction-limits"],setRestrictionsForRepo:["PUT /repos/{owner}/{repo}/interaction-limits"],setRestrictionsForYourPublicRepos:["PUT /user/interaction-limits",{},{renamed:["interactions","setRestrictionsForAuthenticatedUser"]}]},issues:{addAssignees:["POST /repos/{owner}/{repo}/issues/{issue_number}/assignees"],addLabels:["POST /repos/{owner}/{repo}/issues/{issue_number}/labels"],addSubIssue:["POST /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"],checkUserCanBeAssigned:["GET /repos/{owner}/{repo}/assignees/{assignee}"],checkUserCanBeAssignedToIssue:["GET /repos/{owner}/{repo}/issues/{issue_number}/assignees/{assignee}"],create:["POST /repos/{owner}/{repo}/issues"],createComment:["POST /repos/{owner}/{repo}/issues/{issue_number}/comments"],createLabel:["POST /repos/{owner}/{repo}/labels"],createMilestone:["POST /repos/{owner}/{repo}/milestones"],deleteComment:["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}"],deleteLabel:["DELETE /repos/{owner}/{repo}/labels/{name}"],deleteMilestone:["DELETE /repos/{owner}/{repo}/milestones/{milestone_number}"],get:["GET /repos/{owner}/{repo}/issues/{issue_number}"],getComment:["GET /repos/{owner}/{repo}/issues/comments/{comment_id}"],getEvent:["GET /repos/{owner}/{repo}/issues/events/{event_id}"],getLabel:["GET /repos/{owner}/{repo}/labels/{name}"],getMilestone:["GET /repos/{owner}/{repo}/milestones/{milestone_number}"],list:["GET /issues"],listAssignees:["GET /repos/{owner}/{repo}/assignees"],listComments:["GET /repos/{owner}/{repo}/issues/{issue_number}/comments"],listCommentsForRepo:["GET /repos/{owner}/{repo}/issues/comments"],listEvents:["GET /repos/{owner}/{repo}/issues/{issue_number}/events"],listEventsForRepo:["GET /repos/{owner}/{repo}/issues/events"],listEventsForTimeline:["GET /repos/{owner}/{repo}/issues/{issue_number}/timeline"],listForAuthenticatedUser:["GET /user/issues"],listForOrg:["GET /orgs/{org}/issues"],listForRepo:["GET /repos/{owner}/{repo}/issues"],listLabelsForMilestone:["GET /repos/{owner}/{repo}/milestones/{milestone_number}/labels"],listLabelsForRepo:["GET /repos/{owner}/{repo}/labels"],listLabelsOnIssue:["GET /repos/{owner}/{repo}/issues/{issue_number}/labels"],listMilestones:["GET /repos/{owner}/{repo}/milestones"],listSubIssues:["GET /repos/{owner}/{repo}/issues/{issue_number}/sub_issues"],lock:["PUT /repos/{owner}/{repo}/issues/{issue_number}/lock"],removeAllLabels:["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels"],removeAssignees:["DELETE /repos/{owner}/{repo}/issues/{issue_number}/assignees"],removeLabel:["DELETE /repos/{owner}/{repo}/issues/{issue_number}/labels/{name}"],removeSubIssue:["DELETE /repos/{owner}/{repo}/issues/{issue_number}/sub_issue"],reprioritizeSubIssue:["PATCH /repos/{owner}/{repo}/issues/{issue_number}/sub_issues/priority"],setLabels:["PUT /repos/{owner}/{repo}/issues/{issue_number}/labels"],unlock:["DELETE /repos/{owner}/{repo}/issues/{issue_number}/lock"],update:["PATCH /repos/{owner}/{repo}/issues/{issue_number}"],updateComment:["PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}"],updateLabel:["PATCH /repos/{owner}/{repo}/labels/{name}"],updateMilestone:["PATCH /repos/{owner}/{repo}/milestones/{milestone_number}"]},licenses:{get:["GET /licenses/{license}"],getAllCommonlyUsed:["GET /licenses"],getForRepo:["GET /repos/{owner}/{repo}/license"]},markdown:{render:["POST /markdown"],renderRaw:["POST /markdown/raw",{headers:{"content-type":"text/plain; charset=utf-8"}}]},meta:{get:["GET /meta"],getAllVersions:["GET /versions"],getOctocat:["GET /octocat"],getZen:["GET /zen"],root:["GET /"]},migrations:{deleteArchiveForAuthenticatedUser:["DELETE /user/migrations/{migration_id}/archive"],deleteArchiveForOrg:["DELETE /orgs/{org}/migrations/{migration_id}/archive"],downloadArchiveForOrg:["GET /orgs/{org}/migrations/{migration_id}/archive"],getArchiveForAuthenticatedUser:["GET /user/migrations/{migration_id}/archive"],getStatusForAuthenticatedUser:["GET /user/migrations/{migration_id}"],getStatusForOrg:["GET /orgs/{org}/migrations/{migration_id}"],listForAuthenticatedUser:["GET /user/migrations"],listForOrg:["GET /orgs/{org}/migrations"],listReposForAuthenticatedUser:["GET /user/migrations/{migration_id}/repositories"],listReposForOrg:["GET /orgs/{org}/migrations/{migration_id}/repositories"],listReposForUser:["GET /user/migrations/{migration_id}/repositories",{},{renamed:["migrations","listReposForAuthenticatedUser"]}],startForAuthenticatedUser:["POST /user/migrations"],startForOrg:["POST /orgs/{org}/migrations"],unlockRepoForAuthenticatedUser:["DELETE /user/migrations/{migration_id}/repos/{repo_name}/lock"],unlockRepoForOrg:["DELETE /orgs/{org}/migrations/{migration_id}/repos/{repo_name}/lock"]},oidc:{getOidcCustomSubTemplateForOrg:["GET /orgs/{org}/actions/oidc/customization/sub"],updateOidcCustomSubTemplateForOrg:["PUT /orgs/{org}/actions/oidc/customization/sub"]},orgs:{addSecurityManagerTeam:["PUT /orgs/{org}/security-managers/teams/{team_slug}",{},{deprecated:"octokit.rest.orgs.addSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#add-a-security-manager-team"}],assignTeamToOrgRole:["PUT /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"],assignUserToOrgRole:["PUT /orgs/{org}/organization-roles/users/{username}/{role_id}"],blockUser:["PUT /orgs/{org}/blocks/{username}"],cancelInvitation:["DELETE /orgs/{org}/invitations/{invitation_id}"],checkBlockedUser:["GET /orgs/{org}/blocks/{username}"],checkMembershipForUser:["GET /orgs/{org}/members/{username}"],checkPublicMembershipForUser:["GET /orgs/{org}/public_members/{username}"],convertMemberToOutsideCollaborator:["PUT /orgs/{org}/outside_collaborators/{username}"],createInvitation:["POST /orgs/{org}/invitations"],createOrUpdateCustomProperties:["PATCH /orgs/{org}/properties/schema"],createOrUpdateCustomPropertiesValuesForRepos:["PATCH /orgs/{org}/properties/values"],createOrUpdateCustomProperty:["PUT /orgs/{org}/properties/schema/{custom_property_name}"],createWebhook:["POST /orgs/{org}/hooks"],delete:["DELETE /orgs/{org}"],deleteWebhook:["DELETE /orgs/{org}/hooks/{hook_id}"],enableOrDisableSecurityProductOnAllOrgRepos:["POST /orgs/{org}/{security_product}/{enablement}",{},{deprecated:"octokit.rest.orgs.enableOrDisableSecurityProductOnAllOrgRepos() is deprecated, see https://docs.github.com/rest/orgs/orgs#enable-or-disable-a-security-feature-for-an-organization"}],get:["GET /orgs/{org}"],getAllCustomProperties:["GET /orgs/{org}/properties/schema"],getCustomProperty:["GET /orgs/{org}/properties/schema/{custom_property_name}"],getMembershipForAuthenticatedUser:["GET /user/memberships/orgs/{org}"],getMembershipForUser:["GET /orgs/{org}/memberships/{username}"],getOrgRole:["GET /orgs/{org}/organization-roles/{role_id}"],getWebhook:["GET /orgs/{org}/hooks/{hook_id}"],getWebhookConfigForOrg:["GET /orgs/{org}/hooks/{hook_id}/config"],getWebhookDelivery:["GET /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}"],list:["GET /organizations"],listAppInstallations:["GET /orgs/{org}/installations"],listAttestations:["GET /orgs/{org}/attestations/{subject_digest}"],listBlockedUsers:["GET /orgs/{org}/blocks"],listCustomPropertiesValuesForRepos:["GET /orgs/{org}/properties/values"],listFailedInvitations:["GET /orgs/{org}/failed_invitations"],listForAuthenticatedUser:["GET /user/orgs"],listForUser:["GET /users/{username}/orgs"],listInvitationTeams:["GET /orgs/{org}/invitations/{invitation_id}/teams"],listMembers:["GET /orgs/{org}/members"],listMembershipsForAuthenticatedUser:["GET /user/memberships/orgs"],listOrgRoleTeams:["GET /orgs/{org}/organization-roles/{role_id}/teams"],listOrgRoleUsers:["GET /orgs/{org}/organization-roles/{role_id}/users"],listOrgRoles:["GET /orgs/{org}/organization-roles"],listOrganizationFineGrainedPermissions:["GET /orgs/{org}/organization-fine-grained-permissions"],listOutsideCollaborators:["GET /orgs/{org}/outside_collaborators"],listPatGrantRepositories:["GET /orgs/{org}/personal-access-tokens/{pat_id}/repositories"],listPatGrantRequestRepositories:["GET /orgs/{org}/personal-access-token-requests/{pat_request_id}/repositories"],listPatGrantRequests:["GET /orgs/{org}/personal-access-token-requests"],listPatGrants:["GET /orgs/{org}/personal-access-tokens"],listPendingInvitations:["GET /orgs/{org}/invitations"],listPublicMembers:["GET /orgs/{org}/public_members"],listSecurityManagerTeams:["GET /orgs/{org}/security-managers",{},{deprecated:"octokit.rest.orgs.listSecurityManagerTeams() is deprecated, see https://docs.github.com/rest/orgs/security-managers#list-security-manager-teams"}],listWebhookDeliveries:["GET /orgs/{org}/hooks/{hook_id}/deliveries"],listWebhooks:["GET /orgs/{org}/hooks"],pingWebhook:["POST /orgs/{org}/hooks/{hook_id}/pings"],redeliverWebhookDelivery:["POST /orgs/{org}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"],removeCustomProperty:["DELETE /orgs/{org}/properties/schema/{custom_property_name}"],removeMember:["DELETE /orgs/{org}/members/{username}"],removeMembershipForUser:["DELETE /orgs/{org}/memberships/{username}"],removeOutsideCollaborator:["DELETE /orgs/{org}/outside_collaborators/{username}"],removePublicMembershipForAuthenticatedUser:["DELETE /orgs/{org}/public_members/{username}"],removeSecurityManagerTeam:["DELETE /orgs/{org}/security-managers/teams/{team_slug}",{},{deprecated:"octokit.rest.orgs.removeSecurityManagerTeam() is deprecated, see https://docs.github.com/rest/orgs/security-managers#remove-a-security-manager-team"}],reviewPatGrantRequest:["POST /orgs/{org}/personal-access-token-requests/{pat_request_id}"],reviewPatGrantRequestsInBulk:["POST /orgs/{org}/personal-access-token-requests"],revokeAllOrgRolesTeam:["DELETE /orgs/{org}/organization-roles/teams/{team_slug}"],revokeAllOrgRolesUser:["DELETE /orgs/{org}/organization-roles/users/{username}"],revokeOrgRoleTeam:["DELETE /orgs/{org}/organization-roles/teams/{team_slug}/{role_id}"],revokeOrgRoleUser:["DELETE /orgs/{org}/organization-roles/users/{username}/{role_id}"],setMembershipForUser:["PUT /orgs/{org}/memberships/{username}"],setPublicMembershipForAuthenticatedUser:["PUT /orgs/{org}/public_members/{username}"],unblockUser:["DELETE /orgs/{org}/blocks/{username}"],update:["PATCH /orgs/{org}"],updateMembershipForAuthenticatedUser:["PATCH /user/memberships/orgs/{org}"],updatePatAccess:["POST /orgs/{org}/personal-access-tokens/{pat_id}"],updatePatAccesses:["POST /orgs/{org}/personal-access-tokens"],updateWebhook:["PATCH /orgs/{org}/hooks/{hook_id}"],updateWebhookConfigForOrg:["PATCH /orgs/{org}/hooks/{hook_id}/config"]},packages:{deletePackageForAuthenticatedUser:["DELETE /user/packages/{package_type}/{package_name}"],deletePackageForOrg:["DELETE /orgs/{org}/packages/{package_type}/{package_name}"],deletePackageForUser:["DELETE /users/{username}/packages/{package_type}/{package_name}"],deletePackageVersionForAuthenticatedUser:["DELETE /user/packages/{package_type}/{package_name}/versions/{package_version_id}"],deletePackageVersionForOrg:["DELETE /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"],deletePackageVersionForUser:["DELETE /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"],getAllPackageVersionsForAPackageOwnedByAnOrg:["GET /orgs/{org}/packages/{package_type}/{package_name}/versions",{},{renamed:["packages","getAllPackageVersionsForPackageOwnedByOrg"]}],getAllPackageVersionsForAPackageOwnedByTheAuthenticatedUser:["GET /user/packages/{package_type}/{package_name}/versions",{},{renamed:["packages","getAllPackageVersionsForPackageOwnedByAuthenticatedUser"]}],getAllPackageVersionsForPackageOwnedByAuthenticatedUser:["GET /user/packages/{package_type}/{package_name}/versions"],getAllPackageVersionsForPackageOwnedByOrg:["GET /orgs/{org}/packages/{package_type}/{package_name}/versions"],getAllPackageVersionsForPackageOwnedByUser:["GET /users/{username}/packages/{package_type}/{package_name}/versions"],getPackageForAuthenticatedUser:["GET /user/packages/{package_type}/{package_name}"],getPackageForOrganization:["GET /orgs/{org}/packages/{package_type}/{package_name}"],getPackageForUser:["GET /users/{username}/packages/{package_type}/{package_name}"],getPackageVersionForAuthenticatedUser:["GET /user/packages/{package_type}/{package_name}/versions/{package_version_id}"],getPackageVersionForOrganization:["GET /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}"],getPackageVersionForUser:["GET /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}"],listDockerMigrationConflictingPackagesForAuthenticatedUser:["GET /user/docker/conflicts"],listDockerMigrationConflictingPackagesForOrganization:["GET /orgs/{org}/docker/conflicts"],listDockerMigrationConflictingPackagesForUser:["GET /users/{username}/docker/conflicts"],listPackagesForAuthenticatedUser:["GET /user/packages"],listPackagesForOrganization:["GET /orgs/{org}/packages"],listPackagesForUser:["GET /users/{username}/packages"],restorePackageForAuthenticatedUser:["POST /user/packages/{package_type}/{package_name}/restore{?token}"],restorePackageForOrg:["POST /orgs/{org}/packages/{package_type}/{package_name}/restore{?token}"],restorePackageForUser:["POST /users/{username}/packages/{package_type}/{package_name}/restore{?token}"],restorePackageVersionForAuthenticatedUser:["POST /user/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"],restorePackageVersionForOrg:["POST /orgs/{org}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"],restorePackageVersionForUser:["POST /users/{username}/packages/{package_type}/{package_name}/versions/{package_version_id}/restore"]},privateRegistries:{createOrgPrivateRegistry:["POST /orgs/{org}/private-registries"],deleteOrgPrivateRegistry:["DELETE /orgs/{org}/private-registries/{secret_name}"],getOrgPrivateRegistry:["GET /orgs/{org}/private-registries/{secret_name}"],getOrgPublicKey:["GET /orgs/{org}/private-registries/public-key"],listOrgPrivateRegistries:["GET /orgs/{org}/private-registries"],updateOrgPrivateRegistry:["PATCH /orgs/{org}/private-registries/{secret_name}"]},projects:{addCollaborator:["PUT /projects/{project_id}/collaborators/{username}"],createCard:["POST /projects/columns/{column_id}/cards"],createColumn:["POST /projects/{project_id}/columns"],createForAuthenticatedUser:["POST /user/projects"],createForOrg:["POST /orgs/{org}/projects"],createForRepo:["POST /repos/{owner}/{repo}/projects"],delete:["DELETE /projects/{project_id}"],deleteCard:["DELETE /projects/columns/cards/{card_id}"],deleteColumn:["DELETE /projects/columns/{column_id}"],get:["GET /projects/{project_id}"],getCard:["GET /projects/columns/cards/{card_id}"],getColumn:["GET /projects/columns/{column_id}"],getPermissionForUser:["GET /projects/{project_id}/collaborators/{username}/permission"],listCards:["GET /projects/columns/{column_id}/cards"],listCollaborators:["GET /projects/{project_id}/collaborators"],listColumns:["GET /projects/{project_id}/columns"],listForOrg:["GET /orgs/{org}/projects"],listForRepo:["GET /repos/{owner}/{repo}/projects"],listForUser:["GET /users/{username}/projects"],moveCard:["POST /projects/columns/cards/{card_id}/moves"],moveColumn:["POST /projects/columns/{column_id}/moves"],removeCollaborator:["DELETE /projects/{project_id}/collaborators/{username}"],update:["PATCH /projects/{project_id}"],updateCard:["PATCH /projects/columns/cards/{card_id}"],updateColumn:["PATCH /projects/columns/{column_id}"]},pulls:{checkIfMerged:["GET /repos/{owner}/{repo}/pulls/{pull_number}/merge"],create:["POST /repos/{owner}/{repo}/pulls"],createReplyForReviewComment:["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments/{comment_id}/replies"],createReview:["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],createReviewComment:["POST /repos/{owner}/{repo}/pulls/{pull_number}/comments"],deletePendingReview:["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],deleteReviewComment:["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}"],dismissReview:["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/dismissals"],get:["GET /repos/{owner}/{repo}/pulls/{pull_number}"],getReview:["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],getReviewComment:["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}"],list:["GET /repos/{owner}/{repo}/pulls"],listCommentsForReview:["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments"],listCommits:["GET /repos/{owner}/{repo}/pulls/{pull_number}/commits"],listFiles:["GET /repos/{owner}/{repo}/pulls/{pull_number}/files"],listRequestedReviewers:["GET /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],listReviewComments:["GET /repos/{owner}/{repo}/pulls/{pull_number}/comments"],listReviewCommentsForRepo:["GET /repos/{owner}/{repo}/pulls/comments"],listReviews:["GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews"],merge:["PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge"],removeRequestedReviewers:["DELETE /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],requestReviewers:["POST /repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers"],submitReview:["POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events"],update:["PATCH /repos/{owner}/{repo}/pulls/{pull_number}"],updateBranch:["PUT /repos/{owner}/{repo}/pulls/{pull_number}/update-branch"],updateReview:["PUT /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}"],updateReviewComment:["PATCH /repos/{owner}/{repo}/pulls/comments/{comment_id}"]},rateLimit:{get:["GET /rate_limit"]},reactions:{createForCommitComment:["POST /repos/{owner}/{repo}/comments/{comment_id}/reactions"],createForIssue:["POST /repos/{owner}/{repo}/issues/{issue_number}/reactions"],createForIssueComment:["POST /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"],createForPullRequestReviewComment:["POST /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"],createForRelease:["POST /repos/{owner}/{repo}/releases/{release_id}/reactions"],createForTeamDiscussionCommentInOrg:["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"],createForTeamDiscussionInOrg:["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"],deleteForCommitComment:["DELETE /repos/{owner}/{repo}/comments/{comment_id}/reactions/{reaction_id}"],deleteForIssue:["DELETE /repos/{owner}/{repo}/issues/{issue_number}/reactions/{reaction_id}"],deleteForIssueComment:["DELETE /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions/{reaction_id}"],deleteForPullRequestComment:["DELETE /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions/{reaction_id}"],deleteForRelease:["DELETE /repos/{owner}/{repo}/releases/{release_id}/reactions/{reaction_id}"],deleteForTeamDiscussion:["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions/{reaction_id}"],deleteForTeamDiscussionComment:["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions/{reaction_id}"],listForCommitComment:["GET /repos/{owner}/{repo}/comments/{comment_id}/reactions"],listForIssue:["GET /repos/{owner}/{repo}/issues/{issue_number}/reactions"],listForIssueComment:["GET /repos/{owner}/{repo}/issues/comments/{comment_id}/reactions"],listForPullRequestReviewComment:["GET /repos/{owner}/{repo}/pulls/comments/{comment_id}/reactions"],listForRelease:["GET /repos/{owner}/{repo}/releases/{release_id}/reactions"],listForTeamDiscussionCommentInOrg:["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}/reactions"],listForTeamDiscussionInOrg:["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/reactions"]},repos:{acceptInvitation:["PATCH /user/repository_invitations/{invitation_id}",{},{renamed:["repos","acceptInvitationForAuthenticatedUser"]}],acceptInvitationForAuthenticatedUser:["PATCH /user/repository_invitations/{invitation_id}"],addAppAccessRestrictions:["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",{},{mapToData:"apps"}],addCollaborator:["PUT /repos/{owner}/{repo}/collaborators/{username}"],addStatusCheckContexts:["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",{},{mapToData:"contexts"}],addTeamAccessRestrictions:["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",{},{mapToData:"teams"}],addUserAccessRestrictions:["POST /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",{},{mapToData:"users"}],cancelPagesDeployment:["POST /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}/cancel"],checkAutomatedSecurityFixes:["GET /repos/{owner}/{repo}/automated-security-fixes"],checkCollaborator:["GET /repos/{owner}/{repo}/collaborators/{username}"],checkPrivateVulnerabilityReporting:["GET /repos/{owner}/{repo}/private-vulnerability-reporting"],checkVulnerabilityAlerts:["GET /repos/{owner}/{repo}/vulnerability-alerts"],codeownersErrors:["GET /repos/{owner}/{repo}/codeowners/errors"],compareCommits:["GET /repos/{owner}/{repo}/compare/{base}...{head}"],compareCommitsWithBasehead:["GET /repos/{owner}/{repo}/compare/{basehead}"],createAttestation:["POST /repos/{owner}/{repo}/attestations"],createAutolink:["POST /repos/{owner}/{repo}/autolinks"],createCommitComment:["POST /repos/{owner}/{repo}/commits/{commit_sha}/comments"],createCommitSignatureProtection:["POST /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],createCommitStatus:["POST /repos/{owner}/{repo}/statuses/{sha}"],createDeployKey:["POST /repos/{owner}/{repo}/keys"],createDeployment:["POST /repos/{owner}/{repo}/deployments"],createDeploymentBranchPolicy:["POST /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies"],createDeploymentProtectionRule:["POST /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules"],createDeploymentStatus:["POST /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],createDispatchEvent:["POST /repos/{owner}/{repo}/dispatches"],createForAuthenticatedUser:["POST /user/repos"],createFork:["POST /repos/{owner}/{repo}/forks"],createInOrg:["POST /orgs/{org}/repos"],createOrUpdateCustomPropertiesValues:["PATCH /repos/{owner}/{repo}/properties/values"],createOrUpdateEnvironment:["PUT /repos/{owner}/{repo}/environments/{environment_name}"],createOrUpdateFileContents:["PUT /repos/{owner}/{repo}/contents/{path}"],createOrgRuleset:["POST /orgs/{org}/rulesets"],createPagesDeployment:["POST /repos/{owner}/{repo}/pages/deployments"],createPagesSite:["POST /repos/{owner}/{repo}/pages"],createRelease:["POST /repos/{owner}/{repo}/releases"],createRepoRuleset:["POST /repos/{owner}/{repo}/rulesets"],createUsingTemplate:["POST /repos/{template_owner}/{template_repo}/generate"],createWebhook:["POST /repos/{owner}/{repo}/hooks"],declineInvitation:["DELETE /user/repository_invitations/{invitation_id}",{},{renamed:["repos","declineInvitationForAuthenticatedUser"]}],declineInvitationForAuthenticatedUser:["DELETE /user/repository_invitations/{invitation_id}"],delete:["DELETE /repos/{owner}/{repo}"],deleteAccessRestrictions:["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],deleteAdminBranchProtection:["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],deleteAnEnvironment:["DELETE /repos/{owner}/{repo}/environments/{environment_name}"],deleteAutolink:["DELETE /repos/{owner}/{repo}/autolinks/{autolink_id}"],deleteBranchProtection:["DELETE /repos/{owner}/{repo}/branches/{branch}/protection"],deleteCommitComment:["DELETE /repos/{owner}/{repo}/comments/{comment_id}"],deleteCommitSignatureProtection:["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],deleteDeployKey:["DELETE /repos/{owner}/{repo}/keys/{key_id}"],deleteDeployment:["DELETE /repos/{owner}/{repo}/deployments/{deployment_id}"],deleteDeploymentBranchPolicy:["DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"],deleteFile:["DELETE /repos/{owner}/{repo}/contents/{path}"],deleteInvitation:["DELETE /repos/{owner}/{repo}/invitations/{invitation_id}"],deleteOrgRuleset:["DELETE /orgs/{org}/rulesets/{ruleset_id}"],deletePagesSite:["DELETE /repos/{owner}/{repo}/pages"],deletePullRequestReviewProtection:["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],deleteRelease:["DELETE /repos/{owner}/{repo}/releases/{release_id}"],deleteReleaseAsset:["DELETE /repos/{owner}/{repo}/releases/assets/{asset_id}"],deleteRepoRuleset:["DELETE /repos/{owner}/{repo}/rulesets/{ruleset_id}"],deleteWebhook:["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"],disableAutomatedSecurityFixes:["DELETE /repos/{owner}/{repo}/automated-security-fixes"],disableDeploymentProtectionRule:["DELETE /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}"],disablePrivateVulnerabilityReporting:["DELETE /repos/{owner}/{repo}/private-vulnerability-reporting"],disableVulnerabilityAlerts:["DELETE /repos/{owner}/{repo}/vulnerability-alerts"],downloadArchive:["GET /repos/{owner}/{repo}/zipball/{ref}",{},{renamed:["repos","downloadZipballArchive"]}],downloadTarballArchive:["GET /repos/{owner}/{repo}/tarball/{ref}"],downloadZipballArchive:["GET /repos/{owner}/{repo}/zipball/{ref}"],enableAutomatedSecurityFixes:["PUT /repos/{owner}/{repo}/automated-security-fixes"],enablePrivateVulnerabilityReporting:["PUT /repos/{owner}/{repo}/private-vulnerability-reporting"],enableVulnerabilityAlerts:["PUT /repos/{owner}/{repo}/vulnerability-alerts"],generateReleaseNotes:["POST /repos/{owner}/{repo}/releases/generate-notes"],get:["GET /repos/{owner}/{repo}"],getAccessRestrictions:["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions"],getAdminBranchProtection:["GET /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],getAllDeploymentProtectionRules:["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules"],getAllEnvironments:["GET /repos/{owner}/{repo}/environments"],getAllStatusCheckContexts:["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts"],getAllTopics:["GET /repos/{owner}/{repo}/topics"],getAppsWithAccessToProtectedBranch:["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps"],getAutolink:["GET /repos/{owner}/{repo}/autolinks/{autolink_id}"],getBranch:["GET /repos/{owner}/{repo}/branches/{branch}"],getBranchProtection:["GET /repos/{owner}/{repo}/branches/{branch}/protection"],getBranchRules:["GET /repos/{owner}/{repo}/rules/branches/{branch}"],getClones:["GET /repos/{owner}/{repo}/traffic/clones"],getCodeFrequencyStats:["GET /repos/{owner}/{repo}/stats/code_frequency"],getCollaboratorPermissionLevel:["GET /repos/{owner}/{repo}/collaborators/{username}/permission"],getCombinedStatusForRef:["GET /repos/{owner}/{repo}/commits/{ref}/status"],getCommit:["GET /repos/{owner}/{repo}/commits/{ref}"],getCommitActivityStats:["GET /repos/{owner}/{repo}/stats/commit_activity"],getCommitComment:["GET /repos/{owner}/{repo}/comments/{comment_id}"],getCommitSignatureProtection:["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_signatures"],getCommunityProfileMetrics:["GET /repos/{owner}/{repo}/community/profile"],getContent:["GET /repos/{owner}/{repo}/contents/{path}"],getContributorsStats:["GET /repos/{owner}/{repo}/stats/contributors"],getCustomDeploymentProtectionRule:["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/{protection_rule_id}"],getCustomPropertiesValues:["GET /repos/{owner}/{repo}/properties/values"],getDeployKey:["GET /repos/{owner}/{repo}/keys/{key_id}"],getDeployment:["GET /repos/{owner}/{repo}/deployments/{deployment_id}"],getDeploymentBranchPolicy:["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"],getDeploymentStatus:["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses/{status_id}"],getEnvironment:["GET /repos/{owner}/{repo}/environments/{environment_name}"],getLatestPagesBuild:["GET /repos/{owner}/{repo}/pages/builds/latest"],getLatestRelease:["GET /repos/{owner}/{repo}/releases/latest"],getOrgRuleSuite:["GET /orgs/{org}/rulesets/rule-suites/{rule_suite_id}"],getOrgRuleSuites:["GET /orgs/{org}/rulesets/rule-suites"],getOrgRuleset:["GET /orgs/{org}/rulesets/{ruleset_id}"],getOrgRulesets:["GET /orgs/{org}/rulesets"],getPages:["GET /repos/{owner}/{repo}/pages"],getPagesBuild:["GET /repos/{owner}/{repo}/pages/builds/{build_id}"],getPagesDeployment:["GET /repos/{owner}/{repo}/pages/deployments/{pages_deployment_id}"],getPagesHealthCheck:["GET /repos/{owner}/{repo}/pages/health"],getParticipationStats:["GET /repos/{owner}/{repo}/stats/participation"],getPullRequestReviewProtection:["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],getPunchCardStats:["GET /repos/{owner}/{repo}/stats/punch_card"],getReadme:["GET /repos/{owner}/{repo}/readme"],getReadmeInDirectory:["GET /repos/{owner}/{repo}/readme/{dir}"],getRelease:["GET /repos/{owner}/{repo}/releases/{release_id}"],getReleaseAsset:["GET /repos/{owner}/{repo}/releases/assets/{asset_id}"],getReleaseByTag:["GET /repos/{owner}/{repo}/releases/tags/{tag}"],getRepoRuleSuite:["GET /repos/{owner}/{repo}/rulesets/rule-suites/{rule_suite_id}"],getRepoRuleSuites:["GET /repos/{owner}/{repo}/rulesets/rule-suites"],getRepoRuleset:["GET /repos/{owner}/{repo}/rulesets/{ruleset_id}"],getRepoRulesets:["GET /repos/{owner}/{repo}/rulesets"],getStatusChecksProtection:["GET /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],getTeamsWithAccessToProtectedBranch:["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams"],getTopPaths:["GET /repos/{owner}/{repo}/traffic/popular/paths"],getTopReferrers:["GET /repos/{owner}/{repo}/traffic/popular/referrers"],getUsersWithAccessToProtectedBranch:["GET /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users"],getViews:["GET /repos/{owner}/{repo}/traffic/views"],getWebhook:["GET /repos/{owner}/{repo}/hooks/{hook_id}"],getWebhookConfigForRepo:["GET /repos/{owner}/{repo}/hooks/{hook_id}/config"],getWebhookDelivery:["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}"],listActivities:["GET /repos/{owner}/{repo}/activity"],listAttestations:["GET /repos/{owner}/{repo}/attestations/{subject_digest}"],listAutolinks:["GET /repos/{owner}/{repo}/autolinks"],listBranches:["GET /repos/{owner}/{repo}/branches"],listBranchesForHeadCommit:["GET /repos/{owner}/{repo}/commits/{commit_sha}/branches-where-head"],listCollaborators:["GET /repos/{owner}/{repo}/collaborators"],listCommentsForCommit:["GET /repos/{owner}/{repo}/commits/{commit_sha}/comments"],listCommitCommentsForRepo:["GET /repos/{owner}/{repo}/comments"],listCommitStatusesForRef:["GET /repos/{owner}/{repo}/commits/{ref}/statuses"],listCommits:["GET /repos/{owner}/{repo}/commits"],listContributors:["GET /repos/{owner}/{repo}/contributors"],listCustomDeploymentRuleIntegrations:["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment_protection_rules/apps"],listDeployKeys:["GET /repos/{owner}/{repo}/keys"],listDeploymentBranchPolicies:["GET /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies"],listDeploymentStatuses:["GET /repos/{owner}/{repo}/deployments/{deployment_id}/statuses"],listDeployments:["GET /repos/{owner}/{repo}/deployments"],listForAuthenticatedUser:["GET /user/repos"],listForOrg:["GET /orgs/{org}/repos"],listForUser:["GET /users/{username}/repos"],listForks:["GET /repos/{owner}/{repo}/forks"],listInvitations:["GET /repos/{owner}/{repo}/invitations"],listInvitationsForAuthenticatedUser:["GET /user/repository_invitations"],listLanguages:["GET /repos/{owner}/{repo}/languages"],listPagesBuilds:["GET /repos/{owner}/{repo}/pages/builds"],listPublic:["GET /repositories"],listPullRequestsAssociatedWithCommit:["GET /repos/{owner}/{repo}/commits/{commit_sha}/pulls"],listReleaseAssets:["GET /repos/{owner}/{repo}/releases/{release_id}/assets"],listReleases:["GET /repos/{owner}/{repo}/releases"],listTags:["GET /repos/{owner}/{repo}/tags"],listTeams:["GET /repos/{owner}/{repo}/teams"],listWebhookDeliveries:["GET /repos/{owner}/{repo}/hooks/{hook_id}/deliveries"],listWebhooks:["GET /repos/{owner}/{repo}/hooks"],merge:["POST /repos/{owner}/{repo}/merges"],mergeUpstream:["POST /repos/{owner}/{repo}/merge-upstream"],pingWebhook:["POST /repos/{owner}/{repo}/hooks/{hook_id}/pings"],redeliverWebhookDelivery:["POST /repos/{owner}/{repo}/hooks/{hook_id}/deliveries/{delivery_id}/attempts"],removeAppAccessRestrictions:["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",{},{mapToData:"apps"}],removeCollaborator:["DELETE /repos/{owner}/{repo}/collaborators/{username}"],removeStatusCheckContexts:["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",{},{mapToData:"contexts"}],removeStatusCheckProtection:["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],removeTeamAccessRestrictions:["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",{},{mapToData:"teams"}],removeUserAccessRestrictions:["DELETE /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",{},{mapToData:"users"}],renameBranch:["POST /repos/{owner}/{repo}/branches/{branch}/rename"],replaceAllTopics:["PUT /repos/{owner}/{repo}/topics"],requestPagesBuild:["POST /repos/{owner}/{repo}/pages/builds"],setAdminBranchProtection:["POST /repos/{owner}/{repo}/branches/{branch}/protection/enforce_admins"],setAppAccessRestrictions:["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/apps",{},{mapToData:"apps"}],setStatusCheckContexts:["PUT /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks/contexts",{},{mapToData:"contexts"}],setTeamAccessRestrictions:["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/teams",{},{mapToData:"teams"}],setUserAccessRestrictions:["PUT /repos/{owner}/{repo}/branches/{branch}/protection/restrictions/users",{},{mapToData:"users"}],testPushWebhook:["POST /repos/{owner}/{repo}/hooks/{hook_id}/tests"],transfer:["POST /repos/{owner}/{repo}/transfer"],update:["PATCH /repos/{owner}/{repo}"],updateBranchProtection:["PUT /repos/{owner}/{repo}/branches/{branch}/protection"],updateCommitComment:["PATCH /repos/{owner}/{repo}/comments/{comment_id}"],updateDeploymentBranchPolicy:["PUT /repos/{owner}/{repo}/environments/{environment_name}/deployment-branch-policies/{branch_policy_id}"],updateInformationAboutPagesSite:["PUT /repos/{owner}/{repo}/pages"],updateInvitation:["PATCH /repos/{owner}/{repo}/invitations/{invitation_id}"],updateOrgRuleset:["PUT /orgs/{org}/rulesets/{ruleset_id}"],updatePullRequestReviewProtection:["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_pull_request_reviews"],updateRelease:["PATCH /repos/{owner}/{repo}/releases/{release_id}"],updateReleaseAsset:["PATCH /repos/{owner}/{repo}/releases/assets/{asset_id}"],updateRepoRuleset:["PUT /repos/{owner}/{repo}/rulesets/{ruleset_id}"],updateStatusCheckPotection:["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks",{},{renamed:["repos","updateStatusCheckProtection"]}],updateStatusCheckProtection:["PATCH /repos/{owner}/{repo}/branches/{branch}/protection/required_status_checks"],updateWebhook:["PATCH /repos/{owner}/{repo}/hooks/{hook_id}"],updateWebhookConfigForRepo:["PATCH /repos/{owner}/{repo}/hooks/{hook_id}/config"],uploadReleaseAsset:["POST /repos/{owner}/{repo}/releases/{release_id}/assets{?name,label}",{baseUrl:"https://uploads.github.com"}]},search:{code:["GET /search/code"],commits:["GET /search/commits"],issuesAndPullRequests:["GET /search/issues"],labels:["GET /search/labels"],repos:["GET /search/repositories"],topics:["GET /search/topics"],users:["GET /search/users"]},secretScanning:{createPushProtectionBypass:["POST /repos/{owner}/{repo}/secret-scanning/push-protection-bypasses"],getAlert:["GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"],getScanHistory:["GET /repos/{owner}/{repo}/secret-scanning/scan-history"],listAlertsForEnterprise:["GET /enterprises/{enterprise}/secret-scanning/alerts"],listAlertsForOrg:["GET /orgs/{org}/secret-scanning/alerts"],listAlertsForRepo:["GET /repos/{owner}/{repo}/secret-scanning/alerts"],listLocationsForAlert:["GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations"],updateAlert:["PATCH /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}"]},securityAdvisories:{createFork:["POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/forks"],createPrivateVulnerabilityReport:["POST /repos/{owner}/{repo}/security-advisories/reports"],createRepositoryAdvisory:["POST /repos/{owner}/{repo}/security-advisories"],createRepositoryAdvisoryCveRequest:["POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/cve"],getGlobalAdvisory:["GET /advisories/{ghsa_id}"],getRepositoryAdvisory:["GET /repos/{owner}/{repo}/security-advisories/{ghsa_id}"],listGlobalAdvisories:["GET /advisories"],listOrgRepositoryAdvisories:["GET /orgs/{org}/security-advisories"],listRepositoryAdvisories:["GET /repos/{owner}/{repo}/security-advisories"],updateRepositoryAdvisory:["PATCH /repos/{owner}/{repo}/security-advisories/{ghsa_id}"]},teams:{addOrUpdateMembershipForUserInOrg:["PUT /orgs/{org}/teams/{team_slug}/memberships/{username}"],addOrUpdateProjectPermissionsInOrg:["PUT /orgs/{org}/teams/{team_slug}/projects/{project_id}"],addOrUpdateRepoPermissionsInOrg:["PUT /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],checkPermissionsForProjectInOrg:["GET /orgs/{org}/teams/{team_slug}/projects/{project_id}"],checkPermissionsForRepoInOrg:["GET /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],create:["POST /orgs/{org}/teams"],createDiscussionCommentInOrg:["POST /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],createDiscussionInOrg:["POST /orgs/{org}/teams/{team_slug}/discussions"],deleteDiscussionCommentInOrg:["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],deleteDiscussionInOrg:["DELETE /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],deleteInOrg:["DELETE /orgs/{org}/teams/{team_slug}"],getByName:["GET /orgs/{org}/teams/{team_slug}"],getDiscussionCommentInOrg:["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],getDiscussionInOrg:["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],getMembershipForUserInOrg:["GET /orgs/{org}/teams/{team_slug}/memberships/{username}"],list:["GET /orgs/{org}/teams"],listChildInOrg:["GET /orgs/{org}/teams/{team_slug}/teams"],listDiscussionCommentsInOrg:["GET /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments"],listDiscussionsInOrg:["GET /orgs/{org}/teams/{team_slug}/discussions"],listForAuthenticatedUser:["GET /user/teams"],listMembersInOrg:["GET /orgs/{org}/teams/{team_slug}/members"],listPendingInvitationsInOrg:["GET /orgs/{org}/teams/{team_slug}/invitations"],listProjectsInOrg:["GET /orgs/{org}/teams/{team_slug}/projects"],listReposInOrg:["GET /orgs/{org}/teams/{team_slug}/repos"],removeMembershipForUserInOrg:["DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}"],removeProjectInOrg:["DELETE /orgs/{org}/teams/{team_slug}/projects/{project_id}"],removeRepoInOrg:["DELETE /orgs/{org}/teams/{team_slug}/repos/{owner}/{repo}"],updateDiscussionCommentInOrg:["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}/comments/{comment_number}"],updateDiscussionInOrg:["PATCH /orgs/{org}/teams/{team_slug}/discussions/{discussion_number}"],updateInOrg:["PATCH /orgs/{org}/teams/{team_slug}"]},users:{addEmailForAuthenticated:["POST /user/emails",{},{renamed:["users","addEmailForAuthenticatedUser"]}],addEmailForAuthenticatedUser:["POST /user/emails"],addSocialAccountForAuthenticatedUser:["POST /user/social_accounts"],block:["PUT /user/blocks/{username}"],checkBlocked:["GET /user/blocks/{username}"],checkFollowingForUser:["GET /users/{username}/following/{target_user}"],checkPersonIsFollowedByAuthenticated:["GET /user/following/{username}"],createGpgKeyForAuthenticated:["POST /user/gpg_keys",{},{renamed:["users","createGpgKeyForAuthenticatedUser"]}],createGpgKeyForAuthenticatedUser:["POST /user/gpg_keys"],createPublicSshKeyForAuthenticated:["POST /user/keys",{},{renamed:["users","createPublicSshKeyForAuthenticatedUser"]}],createPublicSshKeyForAuthenticatedUser:["POST /user/keys"],createSshSigningKeyForAuthenticatedUser:["POST /user/ssh_signing_keys"],deleteEmailForAuthenticated:["DELETE /user/emails",{},{renamed:["users","deleteEmailForAuthenticatedUser"]}],deleteEmailForAuthenticatedUser:["DELETE /user/emails"],deleteGpgKeyForAuthenticated:["DELETE /user/gpg_keys/{gpg_key_id}",{},{renamed:["users","deleteGpgKeyForAuthenticatedUser"]}],deleteGpgKeyForAuthenticatedUser:["DELETE /user/gpg_keys/{gpg_key_id}"],deletePublicSshKeyForAuthenticated:["DELETE /user/keys/{key_id}",{},{renamed:["users","deletePublicSshKeyForAuthenticatedUser"]}],deletePublicSshKeyForAuthenticatedUser:["DELETE /user/keys/{key_id}"],deleteSocialAccountForAuthenticatedUser:["DELETE /user/social_accounts"],deleteSshSigningKeyForAuthenticatedUser:["DELETE /user/ssh_signing_keys/{ssh_signing_key_id}"],follow:["PUT /user/following/{username}"],getAuthenticated:["GET /user"],getById:["GET /user/{account_id}"],getByUsername:["GET /users/{username}"],getContextForUser:["GET /users/{username}/hovercard"],getGpgKeyForAuthenticated:["GET /user/gpg_keys/{gpg_key_id}",{},{renamed:["users","getGpgKeyForAuthenticatedUser"]}],getGpgKeyForAuthenticatedUser:["GET /user/gpg_keys/{gpg_key_id}"],getPublicSshKeyForAuthenticated:["GET /user/keys/{key_id}",{},{renamed:["users","getPublicSshKeyForAuthenticatedUser"]}],getPublicSshKeyForAuthenticatedUser:["GET /user/keys/{key_id}"],getSshSigningKeyForAuthenticatedUser:["GET /user/ssh_signing_keys/{ssh_signing_key_id}"],list:["GET /users"],listAttestations:["GET /users/{username}/attestations/{subject_digest}"],listBlockedByAuthenticated:["GET /user/blocks",{},{renamed:["users","listBlockedByAuthenticatedUser"]}],listBlockedByAuthenticatedUser:["GET /user/blocks"],listEmailsForAuthenticated:["GET /user/emails",{},{renamed:["users","listEmailsForAuthenticatedUser"]}],listEmailsForAuthenticatedUser:["GET /user/emails"],listFollowedByAuthenticated:["GET /user/following",{},{renamed:["users","listFollowedByAuthenticatedUser"]}],listFollowedByAuthenticatedUser:["GET /user/following"],listFollowersForAuthenticatedUser:["GET /user/followers"],listFollowersForUser:["GET /users/{username}/followers"],listFollowingForUser:["GET /users/{username}/following"],listGpgKeysForAuthenticated:["GET /user/gpg_keys",{},{renamed:["users","listGpgKeysForAuthenticatedUser"]}],listGpgKeysForAuthenticatedUser:["GET /user/gpg_keys"],listGpgKeysForUser:["GET /users/{username}/gpg_keys"],listPublicEmailsForAuthenticated:["GET /user/public_emails",{},{renamed:["users","listPublicEmailsForAuthenticatedUser"]}],listPublicEmailsForAuthenticatedUser:["GET /user/public_emails"],listPublicKeysForUser:["GET /users/{username}/keys"],listPublicSshKeysForAuthenticated:["GET /user/keys",{},{renamed:["users","listPublicSshKeysForAuthenticatedUser"]}],listPublicSshKeysForAuthenticatedUser:["GET /user/keys"],listSocialAccountsForAuthenticatedUser:["GET /user/social_accounts"],listSocialAccountsForUser:["GET /users/{username}/social_accounts"],listSshSigningKeysForAuthenticatedUser:["GET /user/ssh_signing_keys"],listSshSigningKeysForUser:["GET /users/{username}/ssh_signing_keys"],setPrimaryEmailVisibilityForAuthenticated:["PATCH /user/email/visibility",{},{renamed:["users","setPrimaryEmailVisibilityForAuthenticatedUser"]}],setPrimaryEmailVisibilityForAuthenticatedUser:["PATCH /user/email/visibility"],unblock:["DELETE /user/blocks/{username}"],unfollow:["DELETE /user/following/{username}"],updateAuthenticated:["PATCH /user"]}},yo=wo,M=new Map;for(const[r,e]of Object.entries(yo))for(const[t,s]of Object.entries(e)){const[o,i,n]=s,[a,c]=o.split(/ /),l=Object.assign({method:a,url:c},i);M.has(r)||M.set(r,new Map),M.get(r).set(t,{scope:r,methodName:t,endpointDefaults:l,decorations:n})}var To={has({scope:r},e){return M.get(r).has(e)},getOwnPropertyDescriptor(r,e){return{value:this.get(r,e),configurable:!0,writable:!0,enumerable:!0}},defineProperty(r,e,t){return Object.defineProperty(r.cache,e,t),!0},deleteProperty(r,e){return delete r.cache[e],!0},ownKeys({scope:r}){return[...M.get(r).keys()]},set(r,e,t){return r.cache[e]=t},get({octokit:r,scope:e,cache:t},s){if(t[s])return t[s];const o=M.get(e).get(s);if(!o)return;const{endpointDefaults:i,decorations:n}=o;return n?t[s]=_o(r,e,s,i,n):t[s]=r.request.defaults(i),t[s]}};function Eo(r){const e={};for(const t of M.keys())e[t]=new Proxy({octokit:r,scope:t,cache:{}},To);return e}function _o(r,e,t,s,o){const i=r.request.defaults(s);function n(...a){let c=i.endpoint.merge(...a);if(o.mapToData)return c=Object.assign({},c,{data:c[o.mapToData],[o.mapToData]:void 0}),i(c);if(o.renamed){const[l,d]=o.renamed;r.log.warn(`octokit.${e}.${t}() has been renamed to octokit.${l}.${d}()`)}if(o.deprecated&&r.log.warn(o.deprecated),o.renamedParameters){const l=i.endpoint.merge(...a);for(const[d,u]of Object.entries(o.renamedParameters))d in l&&(r.log.warn(`"${d}" parameter is deprecated for "octokit.${e}.${t}()". Use "${u}" instead`),u in l||(l[u]=l[d]),delete l[d]);return i(l)}return i(...a)}return Object.assign(n,i)}function Wt(r){const e=Eo(r);return{...e,rest:e}}Wt.VERSION=vo;var ko="20.1.2",Ae=mo.plugin(jt,Wt,Bt).defaults({userAgent:`octokit-rest.js/${ko}`});class St{constructor(e={}){this.enabled=e.enabled??!1,this.pat=e.pat||"",this.owner=e.repo_owner||"",this.repo=e.repo_name||"",this.branch=e.branch||"main",this.dataPath=e.data_path||"data/",this.octokit=this.pat?new Ae({auth:this.pat}):null}async testConnection(){if(!this.pat||!this.owner||!this.repo)return{valid:!1,error:"Missing PAT, Owner, or Repo name"};try{const t=await new Ae({auth:this.pat}).rest.repos.get({owner:this.owner,repo:this.repo});return t.status===200?{valid:!0,repoName:t.data.full_name}:{valid:!1,error:`HTTP ${t.status}`}}catch(e){return{valid:!1,error:e.message||"Connection failed"}}}async push(){if(!this.enabled||!this.pat||!this.owner||!this.repo)return{success:!1,reason:"Sync not enabled or configured"};try{const e=new Ae({auth:this.pat}),t={"tasks.json":m.tasks,"tags.json":m.tags,"dependencies.json":m.dependencies,"settings.json":m.settings};for(const[s,o]of Object.entries(t)){const i=`${this.dataPath.replace(/\/$/,"")}/${s}`,n=JSON.stringify(o,null,2),a=btoa(unescape(encodeURIComponent(n)));let c;try{const l=await e.rest.repos.getContent({owner:this.owner,repo:this.repo,path:i,ref:this.branch});l.data?.sha&&(c=l.data.sha)}catch{}await e.rest.repos.createOrUpdateFileContents({owner:this.owner,repo:this.repo,path:i,message:`Cronograma sync: ${new Date().toISOString()}`,content:a,branch:this.branch,sha:c})}return{success:!0,timestamp:new Date().toISOString()}}catch(e){return console.error("[GitHub Sync Error]:",e),{success:!1,error:e.message}}}}class So extends w{static properties={settingsData:{type:Object},showPat:{type:Boolean},syncStatus:{type:String},testResult:{type:Object}};static styles=T`
    :host {
      display: block;
    }

    .settings-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 800px;
    }

    .section-card {
      background: var(--color-bg-surface, #1A1C23);
      border: 1px solid var(--color-border-subtle, #242735);
      border-radius: var(--radius-lg, 12px);
      padding: var(--space-6, 24px);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-title {
      font-family: var(--font-family-display, sans-serif);
      font-size: 1.125rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
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
    input[type="password"],
    input[type="number"],
    select {
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      padding: 10px 12px;
      color: var(--color-text-primary, #F3F4F6);
      font-size: 0.875rem;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
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

    .window-editor {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .day-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--color-bg-base, #121318);
      border: 1px solid var(--color-border, #2E3242);
      border-radius: var(--radius-md, 8px);
      font-size: 0.875rem;
    }

    .day-name {
      text-transform: capitalize;
      font-weight: 600;
      min-width: 100px;
    }

    .btn-save {
      background: var(--color-accent, #6366F1);
      color: #ffffff;
      font-weight: 600;
      padding: 10px 24px;
      border-radius: var(--radius-md, 8px);
      border: none;
      cursor: pointer;
      align-self: flex-start;
      transition: background 150ms ease, box-shadow 150ms ease;
    }

    .btn-save:hover {
      background: var(--color-accent-hover, #4F46E5);
      box-shadow: var(--shadow-glow);
    }

    .btn-secondary {
      background: var(--color-bg-surface-hover, #232631);
      color: var(--color-text-primary, #F3F4F6);
      padding: 8px 16px;
      border-radius: 8px;
      border: 1px solid var(--color-border, #2E3242);
      cursor: pointer;
    }

    .pat-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-msg {
      font-size: 0.8125rem;
      padding: 6px 12px;
      border-radius: 6px;
      display: inline-block;
    }

    .status-success {
      background: rgba(16, 185, 129, 0.15);
      color: #10B981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .status-error {
      background: rgba(239, 68, 68, 0.15);
      color: #EF4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
  `;constructor(){super(),this.settingsData={...m.settings},this.showPat=!1,this.syncStatus="",this.testResult=null}connectedCallback(){super.connectedCallback(),this.unsubscribe=m.subscribe(()=>{this.settingsData={...m.settings},this.requestUpdate()})}disconnectedCallback(){super.disconnectedCallback(),this.unsubscribe&&this.unsubscribe()}async saveSettings(){await m.updateSettings(this.settingsData),this.syncStatus="Settings saved successfully!",setTimeout(()=>this.syncStatus="",3e3)}async testGitHubConnection(){this.testResult={testing:!0};const t=await new St(this.settingsData.github_sync||{}).testConnection();this.testResult=t}async triggerManualSync(){this.syncStatus="Syncing data to GitHub...";const t=await new St(this.settingsData.github_sync||{}).push();t.success?this.syncStatus=`✓ Synced to GitHub at ${new Date(t.timestamp).toLocaleTimeString()}`:this.syncStatus=`✕ Sync failed: ${t.error||t.reason}`}updateWorkWindow(e,t){const s=this.settingsData.work_windows||{};this.settingsData={...this.settingsData,work_windows:{...s,[e]:[t]}}}updateBreakWindow(e,t){const s=this.settingsData.break_windows||{};this.settingsData={...this.settingsData,break_windows:{...s,[e]:[t]}}}render(){const e=this.settingsData.github_sync||{};return p`
      <div class="settings-container">
        <!-- Appearance & Theme -->
        <div class="section-card">
          <div class="section-title">🎨 Theme & Accent Color</div>
          <div class="form-group">
            <label>Primary Accent Color</label>
            <color-picker
              .value="${this.settingsData.accent_color||"#6366F1"}"
              @color-change="${t=>{this.settingsData={...this.settingsData,accent_color:t.detail.value},this.saveSettings()}}"
            ></color-picker>
          </div>
        </div>

        <!-- Working Hours & Work Windows -->
        <div class="section-card">
          <div class="section-title">🕒 Global Working Hours (Per Day)</div>
          <div class="window-editor">
            ${ie.map(t=>{const s=this.settingsData.work_windows?.[t]?.[0]||{start:"09:00",end:"17:00"};return p`
                <div class="day-row">
                  <span class="day-name">${t}</span>
                  <time-range-input
                    .start="${s.start}"
                    .end="${s.end}"
                    @range-change="${o=>this.updateWorkWindow(t,o.detail)}"
                  ></time-range-input>
                </div>
              `})}
          </div>
        </div>

        <!-- Break Windows -->
        <div class="section-card">
          <div class="section-title">☕ Break / Lunch Slots</div>
          <div class="window-editor">
            ${ie.map(t=>{const s=this.settingsData.break_windows?.[t]?.[0]||{start:"12:00",end:"13:00"};return p`
                <div class="day-row">
                  <span class="day-name">${t}</span>
                  <time-range-input
                    .start="${s.start}"
                    .end="${s.end}"
                    @range-change="${o=>this.updateBreakWindow(t,o.detail)}"
                  ></time-range-input>
                </div>
              `})}
          </div>
        </div>

        <!-- Scheduler Parameters -->
        <div class="section-card">
          <div class="section-title">⚙️ Scheduler Parameters</div>
          <div class="grid-2">
            <div class="form-group">
              <label>Time Slot Granularity</label>
              <select
                .value="${String(this.settingsData.slot_granularity_minutes||15)}"
                @change="${t=>{this.settingsData={...this.settingsData,slot_granularity_minutes:Number(t.target.value)}}}"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>

            <div class="form-group">
              <label>Fallback Scheduling Horizon (Days)</label>
              <input
                type="number"
                min="1"
                max="30"
                .value="${this.settingsData.scheduling_horizon_days||7}"
                @change="${t=>{this.settingsData={...this.settingsData,scheduling_horizon_days:Number(t.target.value)}}}"
              />
            </div>
          </div>
        </div>

        <!-- GitHub Octokit Backup Sync -->
        <div class="section-card">
          <div class="section-title">☁️ GitHub Backup Sync (Octokit REST)</div>

          <div class="form-group">
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked="${e.enabled??!1}"
                @change="${t=>{this.settingsData={...this.settingsData,github_sync:{...e||{},enabled:t.target.checked}}}}"
              />
              Enable Automatic GitHub Backup Sync
            </label>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Repository Owner (Username / Org)</label>
              <input
                type="text"
                placeholder="e.g. mygithubuser"
                .value="${e.repo_owner||""}"
                @input="${t=>{this.settingsData={...this.settingsData,github_sync:{...e||{},repo_owner:t.target.value}}}}"
              />
            </div>

            <div class="form-group">
              <label>Repository Name</label>
              <input
                type="text"
                placeholder="e.g. cronograma-data"
                .value="${e.repo_name||""}"
                @input="${t=>{this.settingsData={...this.settingsData,github_sync:{...e||{},repo_name:t.target.value}}}}"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Personal Access Token (PAT)</label>
            <div class="pat-row">
              <input
                type="${this.showPat?"text":"password"}"
                style="flex: 1;"
                placeholder="ghp_..."
                .value="${e.pat||""}"
                @input="${t=>{this.settingsData={...this.settingsData,github_sync:{...e||{},pat:t.target.value}}}}"
              />
              <button
                class="btn-secondary"
                type="button"
                @click="${()=>this.showPat=!this.showPat}"
              >
                ${this.showPat?"Hide":"Reveal"}
              </button>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
            <button class="btn-secondary" type="button" @click="${this.testGitHubConnection}">
              Test Connection
            </button>
            <button class="btn-secondary" type="button" @click="${this.triggerManualSync}">
              Sync Now
            </button>

            ${this.testResult?.valid===!0?p`<span class="status-msg status-success">✓ Connected: ${this.testResult.repoName}</span>`:""}
            ${this.testResult?.valid===!1?p`<span class="status-msg status-error">✕ Error: ${this.testResult.error}</span>`:""}
          </div>

          ${this.syncStatus?p`<div style="font-size: 0.875rem; color: var(--color-accent); font-weight: 500;">
                ${this.syncStatus}
              </div>`:""}
        </div>

        <button class="btn-save" @click="${this.saveSettings}">Save Settings</button>
      </div>
    `}}customElements.define("settings-view",So);class xo extends w{static properties={currentRoute:{type:String}};static styles=T`
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
  `;constructor(){super(),this.currentRoute=this.getRouteFromHash(),this.onHashChange=this.onHashChange.bind(this)}connectedCallback(){super.connectedCallback(),m.init(),window.addEventListener("hashchange",this.onHashChange),this.unsubscribeState=m.subscribe(()=>this.requestUpdate())}disconnectedCallback(){super.disconnectedCallback(),window.removeEventListener("hashchange",this.onHashChange),this.unsubscribeState&&this.unsubscribeState()}getRouteFromHash(){return window.location.hash.replace("#","")||"calendar"}onHashChange(){this.currentRoute=this.getRouteFromHash()}isActive(e){return this.currentRoute===e}renderRouteContent(){switch(this.currentRoute){case"tasks":return this.renderPage("Tasks",p`<task-list-view></task-list-view>`);case"tags":return this.renderPage("Tags",p`<tag-list-view></tag-list-view>`);case"history":return this.renderPage("History",p`<history-view></history-view>`);case"settings":return this.renderPage("Settings",p`<settings-view></settings-view>`);case"calendar":default:return this.renderPage("Calendar",p`<calendar-view></calendar-view>`)}}renderPage(e,t){return p`
      <div class="header-bar">
        <h1 class="page-title">${e}</h1>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-accent">Offline-First IDB</span>
        </div>
      </div>
      <div class="content-area">
        ${t}
      </div>
    `}render(){return p`
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
    `}}customElements.define("app-shell",xo);"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(r=>{console.warn("Service Worker registration failed:",r)})});
