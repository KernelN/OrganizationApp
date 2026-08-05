(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(i){if(i.ep)return;i.ep=!0;const r=e(i);fetch(i.href,r)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const R=globalThis,Q=R.ShadowRoot&&(R.ShadyCSS===void 0||R.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Y=Symbol(),it=new WeakMap;let Tt=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==Y)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(Q&&t===void 0){const s=e!==void 0&&e.length===1;s&&(t=it.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&it.set(e,t))}return t}toString(){return this.cssText}};const Ot=n=>new Tt(typeof n=="string"?n:n+"",void 0,Y),Lt=(n,...t)=>{const e=n.length===1?n[0]:t.reduce((s,i,r)=>s+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+n[r+1],n[0]);return new Tt(e,n,Y)},Rt=(n,t)=>{if(Q)n.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const s=document.createElement("style"),i=R.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=e.cssText,n.appendChild(s)}},rt=Q?n=>n:n=>n instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return Ot(e)})(n):n;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Ut,defineProperty:Bt,getOwnPropertyDescriptor:Ht,getOwnPropertyNames:jt,getOwnPropertySymbols:zt,getPrototypeOf:Wt}=Object,H=globalThis,ot=H.trustedTypes,Gt=ot?ot.emptyScript:"",Ft=H.reactiveElementPolyfillSupport,T=(n,t)=>n,q={toAttribute(n,t){switch(t){case Boolean:n=n?Gt:null;break;case Object:case Array:n=n==null?n:JSON.stringify(n)}return n},fromAttribute(n,t){let e=n;switch(t){case Boolean:e=n!==null;break;case Number:e=n===null?null:Number(n);break;case Object:case Array:try{e=JSON.parse(n)}catch{e=null}}return e}},kt=(n,t)=>!Ut(n,t),at={attribute:!0,type:String,converter:q,reflect:!1,useDefault:!1,hasChanged:kt};Symbol.metadata??=Symbol("metadata"),H.litPropertyMetadata??=new WeakMap;let S=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=at){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);i!==void 0&&Bt(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:r}=Ht(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:i,set(o){const c=i?.call(this);r?.call(this,o),this.requestUpdate(t,c,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??at}static _$Ei(){if(this.hasOwnProperty(T("elementProperties")))return;const t=Wt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(T("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(T("properties"))){const e=this.properties,s=[...jt(e),...zt(e)];for(const i of s)this.createProperty(i,e[i])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[s,i]of e)this.elementProperties.set(s,i)}this._$Eh=new Map;for(const[e,s]of this.elementProperties){const i=this._$Eu(e,s);i!==void 0&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const i of s)e.unshift(rt(i))}else t!==void 0&&e.push(rt(t));return e}static _$Eu(t,e){const s=e.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),this.renderRoot!==void 0&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Rt(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$ET(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(i!==void 0&&s.reflect===!0){const r=(s.converter?.toAttribute!==void 0?s.converter:q).toAttribute(e,s.type);this._$Em=t,r==null?this.removeAttribute(i):this.setAttribute(i,r),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(i!==void 0&&this._$Em!==i){const r=s.getPropertyOptions(i),o=typeof r.converter=="function"?{fromAttribute:r.converter}:r.converter?.fromAttribute!==void 0?r.converter:q;this._$Em=i;const c=o.fromAttribute(e,r.type);this[i]=c??this._$Ej?.get(i)??c,this._$Em=null}}requestUpdate(t,e,s,i=!1,r){if(t!==void 0){const o=this.constructor;if(i===!1&&(r=this[t]),s??=o.getPropertyOptions(t),!((s.hasChanged??kt)(r,e)||s.useDefault&&s.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,s))))return;this.C(t,e,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:s,reflect:i,wrapped:r},o){s&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),r!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||s||(e=void 0),this._$AL.set(t,e)),i===!0&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[i,r]of this._$Ep)this[i]=r;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[i,r]of s){const{wrapped:o}=r,c=this[i];o!==!0||this._$AL.has(i)||c===void 0||this.C(i,void 0,r,c)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(t){}firstUpdated(t){}};S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[T("elementProperties")]=new Map,S[T("finalized")]=new Map,Ft?.({ReactiveElement:S}),(H.reactiveElementVersions??=[]).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const tt=globalThis,ct=n=>n,B=tt.trustedTypes,dt=B?B.createPolicy("lit-html",{createHTML:n=>n}):void 0,Pt="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,Nt="?"+w,qt=`<${Nt}>`,$=document,N=()=>$.createComment(""),C=n=>n===null||typeof n!="object"&&typeof n!="function",et=Array.isArray,Vt=n=>et(n)||typeof n?.[Symbol.iterator]=="function",W=`[ 	
\f\r]`,x=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,lt=/-->/g,ht=/>/g,_=RegExp(`>|${W}(?:([^\\s"'>=/]+)(${W}*=${W}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),ut=/'/g,pt=/"/g,Ct=/^(?:script|style|textarea|title)$/i,Kt=n=>(t,...e)=>({_$litType$:n,strings:t,values:e}),y=Kt(1),E=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),ft=new WeakMap,v=$.createTreeWalker($,129);function Dt(n,t){if(!et(n)||!n.hasOwnProperty("raw"))throw Error("invalid template strings array");return dt!==void 0?dt.createHTML(t):t}const Zt=(n,t)=>{const e=n.length-1,s=[];let i,r=t===2?"<svg>":t===3?"<math>":"",o=x;for(let c=0;c<e;c++){const a=n[c];let h,u,l=-1,m=0;for(;m<a.length&&(o.lastIndex=m,u=o.exec(a),u!==null);)m=o.lastIndex,o===x?u[1]==="!--"?o=lt:u[1]!==void 0?o=ht:u[2]!==void 0?(Ct.test(u[2])&&(i=RegExp("</"+u[2],"g")),o=_):u[3]!==void 0&&(o=_):o===_?u[0]===">"?(o=i??x,l=-1):u[1]===void 0?l=-2:(l=o.lastIndex-u[2].length,h=u[1],o=u[3]===void 0?_:u[3]==='"'?pt:ut):o===pt||o===ut?o=_:o===lt||o===ht?o=x:(o=_,i=void 0);const g=o===_&&n[c+1].startsWith("/>")?" ":"";r+=o===x?a+qt:l>=0?(s.push(h),a.slice(0,l)+Pt+a.slice(l)+w+g):a+w+(l===-2?c:g)}return[Dt(n,r+(n[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),s]};class D{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let r=0,o=0;const c=t.length-1,a=this.parts,[h,u]=Zt(t,e);if(this.el=D.createElement(h,s),v.currentNode=this.el.content,e===2||e===3){const l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(i=v.nextNode())!==null&&a.length<c;){if(i.nodeType===1){if(i.hasAttributes())for(const l of i.getAttributeNames())if(l.endsWith(Pt)){const m=u[o++],g=i.getAttribute(l).split(w),O=/([.?@])?(.*)/.exec(m);a.push({type:1,index:r,name:O[2],strings:g,ctor:O[1]==="."?Xt:O[1]==="?"?Qt:O[1]==="@"?Yt:j}),i.removeAttribute(l)}else l.startsWith(w)&&(a.push({type:6,index:r}),i.removeAttribute(l));if(Ct.test(i.tagName)){const l=i.textContent.split(w),m=l.length-1;if(m>0){i.textContent=B?B.emptyScript:"";for(let g=0;g<m;g++)i.append(l[g],N()),v.nextNode(),a.push({type:2,index:++r});i.append(l[m],N())}}}else if(i.nodeType===8)if(i.data===Nt)a.push({type:2,index:r});else{let l=-1;for(;(l=i.data.indexOf(w,l+1))!==-1;)a.push({type:7,index:r}),l+=w.length-1}r++}}static createElement(t,e){const s=$.createElement("template");return s.innerHTML=t,s}}function A(n,t,e=n,s){if(t===E)return t;let i=s!==void 0?e._$Co?.[s]:e._$Cl;const r=C(t)?void 0:t._$litDirective$;return i?.constructor!==r&&(i?._$AO?.(!1),r===void 0?i=void 0:(i=new r(n),i._$AT(n,e,s)),s!==void 0?(e._$Co??=[])[s]=i:e._$Cl=i),i!==void 0&&(t=A(n,i._$AS(n,t.values),i,s)),t}class Jt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??$).importNode(e,!0);v.currentNode=i;let r=v.nextNode(),o=0,c=0,a=s[0];for(;a!==void 0;){if(o===a.index){let h;a.type===2?h=new M(r,r.nextSibling,this,t):a.type===1?h=new a.ctor(r,a.name,a.strings,this,t):a.type===6&&(h=new te(r,this,t)),this._$AV.push(h),a=s[++c]}o!==a?.index&&(r=v.nextNode(),o++)}return v.currentNode=$,i}p(t){let e=0;for(const s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class M{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&t?.nodeType===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=A(this,t,e),C(t)?t===p||t==null||t===""?(this._$AH!==p&&this._$AR(),this._$AH=p):t!==this._$AH&&t!==E&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Vt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==p&&C(this._$AH)?this._$AA.nextSibling.data=t:this.T($.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i=typeof s=="number"?this._$AC(t):(s.el===void 0&&(s.el=D.createElement(Dt(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const r=new Jt(i,this),o=r.u(this.options);r.p(e),this.T(o),this._$AH=r}}_$AC(t){let e=ft.get(t.strings);return e===void 0&&ft.set(t.strings,e=new D(t)),e}k(t){et(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const r of t)i===e.length?e.push(s=new M(this.O(N()),this.O(N()),this,this.options)):s=e[i],s._$AI(r),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const s=ct(t).nextSibling;ct(t).remove(),t=s}}setConnected(t){this._$AM===void 0&&(this._$Cv=t,this._$AP?.(t))}}class j{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,r){this.type=1,this._$AH=p,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=r,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=p}_$AI(t,e=this,s,i){const r=this.strings;let o=!1;if(r===void 0)t=A(this,t,e,0),o=!C(t)||t!==this._$AH&&t!==E,o&&(this._$AH=t);else{const c=t;let a,h;for(t=r[0],a=0;a<r.length-1;a++)h=A(this,c[s+a],e,a),h===E&&(h=this._$AH[a]),o||=!C(h)||h!==this._$AH[a],h===p?t=p:t!==p&&(t+=(h??"")+r[a+1]),this._$AH[a]=h}o&&!i&&this.j(t)}j(t){t===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Xt extends j{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===p?void 0:t}}class Qt extends j{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==p)}}class Yt extends j{constructor(t,e,s,i,r){super(t,e,s,i,r),this.type=5}_$AI(t,e=this){if((t=A(this,t,e,0)??p)===E)return;const s=this._$AH,i=t===p&&s!==p||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,r=t!==p&&(s===p||i);i&&this.element.removeEventListener(this.name,this,s),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class te{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){A(this,t)}}const ee=tt.litHtmlPolyfillSupport;ee?.(D,M),(tt.litHtmlVersions??=[]).push("3.3.3");const se=(n,t,e)=>{const s=e?.renderBefore??t;let i=s._$litPart$;if(i===void 0){const r=e?.renderBefore??null;s._$litPart$=i=new M(t.insertBefore(N(),r),r,void 0,e??{})}return i._$AI(n),i};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const st=globalThis;let k=class extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=se(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return E}};k._$litElement$=!0,k.finalized=!0,st.litElementHydrateSupport?.({LitElement:k});const ne=st.litElementPolyfillSupport;ne?.({LitElement:k});(st.litElementVersions??=[]).push("4.2.2");/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const mt=new WeakMap,gt=n=>{if((e=>e.pattern!==void 0)(n))return n.pattern;let t=mt.get(n);return t===void 0&&mt.set(n,t=new URLPattern({pathname:n.path})),t};let ie=class{constructor(t,e,s){this.routes=[],this.o=[],this.t={},this.i=i=>{if(i.routes===this)return;const r=i.routes;this.o.push(r),r.h=this,i.stopImmediatePropagation(),i.onDisconnect=()=>{this.o?.splice(this.o.indexOf(r)>>>0,1)};const o=yt(this.t);o!==void 0&&r.goto(o)},(this.l=t).addController(this),this.routes=[...e],this.fallback=s?.fallback}link(t){if(t?.startsWith("/"))return t;if(t?.startsWith("."))throw Error("Not implemented");return t??=this.u,(this.h?.link()??"")+t}async goto(t){let e;if(this.routes.length===0&&this.fallback===void 0)e=t,this.u="",this.t={0:e};else{const s=this.p(t);if(s===void 0)throw Error("No route found for "+t);const i=gt(s).exec({pathname:t}),r=i?.pathname.groups??{};if(e=yt(r),typeof s.enter=="function"&&await s.enter(r)===!1)return;this.v=s,this.t=r,this.u=e===void 0?t:t.substring(0,t.length-e.length)}if(e!==void 0)for(const s of this.o)s.goto(e);this.l.requestUpdate()}outlet(){return this.v?.render?.(this.t)}get params(){return this.t}p(t){const e=this.routes.find((s=>gt(s).test({pathname:t})));return e||this.fallback===void 0?e:this.fallback?{...this.fallback,path:"/*"}:void 0}hostConnected(){this.l.addEventListener(I.eventName,this.i);const t=new I(this);this.l.dispatchEvent(t),this._=t.onDisconnect}hostDisconnected(){this._?.(),this.h=void 0}};const yt=n=>{let t;for(const e of Object.keys(n))/\d+/.test(e)&&(t===void 0||e>t)&&(t=e);return t&&n[t]};class I extends Event{constructor(t){super(I.eventName,{bubbles:!0,composed:!0,cancelable:!1}),this.routes=t}}I.eventName="lit-routes-connected";/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const re=location.origin||location.protocol+"//"+location.host;class oe extends ie{constructor(){super(...arguments),this.m=t=>{const e=t.button!==0||t.metaKey||t.ctrlKey||t.shiftKey;if(t.defaultPrevented||e)return;const s=t.composedPath().find((o=>o.tagName==="A"));if(s===void 0||s.target!==""||s.hasAttribute("download")||s.getAttribute("rel")==="external")return;const i=s.href;if(i===""||i.startsWith("mailto:"))return;const r=window.location;s.origin===re&&(t.preventDefault(),i!==r.href&&(window.history.pushState({},"",i),this.goto(s.pathname)))},this.R=t=>{this.goto(window.location.pathname)}}hostConnected(){super.hostConnected(),window.addEventListener("click",this.m),window.addEventListener("popstate",this.R),this.goto(window.location.pathname)}hostDisconnected(){super.hostDisconnected(),window.removeEventListener("click",this.m),window.removeEventListener("popstate",this.R)}}const V=(n,t)=>t.some(e=>n instanceof e);let wt,_t;function ae(){return wt||(wt=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ce(){return _t||(_t=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const K=new WeakMap,G=new WeakMap,z=new WeakMap;function de(n){const t=new Promise((e,s)=>{const i=()=>{n.removeEventListener("success",r),n.removeEventListener("error",o)},r=()=>{e(b(n.result)),i()},o=()=>{s(n.error),i()};n.addEventListener("success",r),n.addEventListener("error",o)});return z.set(t,n),t}function le(n){if(K.has(n))return;const t=new Promise((e,s)=>{const i=()=>{n.removeEventListener("complete",r),n.removeEventListener("error",o),n.removeEventListener("abort",o)},r=()=>{e(),i()},o=()=>{s(n.error||new DOMException("AbortError","AbortError")),i()};n.addEventListener("complete",r),n.addEventListener("error",o),n.addEventListener("abort",o)});K.set(n,t)}let Z={get(n,t,e){if(n instanceof IDBTransaction){if(t==="done")return K.get(n);if(t==="store")return e.objectStoreNames[1]?void 0:e.objectStore(e.objectStoreNames[0])}return b(n[t])},set(n,t,e){return n[t]=e,!0},has(n,t){return n instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in n}};function It(n){Z=n(Z)}function he(n){return ce().includes(n)?function(...t){return n.apply(J(this),t),b(this.request)}:function(...t){return b(n.apply(J(this),t))}}function ue(n){return typeof n=="function"?he(n):(n instanceof IDBTransaction&&le(n),V(n,ae())?new Proxy(n,Z):n)}function b(n){if(n instanceof IDBRequest)return de(n);if(G.has(n))return G.get(n);const t=ue(n);return t!==n&&(G.set(n,t),z.set(t,n)),t}const J=n=>z.get(n);function pe(n,t,{blocked:e,upgrade:s,blocking:i,terminated:r}={}){const o=indexedDB.open(n,t),c=b(o);return s&&o.addEventListener("upgradeneeded",a=>{s(b(o.result),a.oldVersion,a.newVersion,b(o.transaction),a)}),e&&o.addEventListener("blocked",a=>e(a.oldVersion,a.newVersion,a)),c.then(a=>{r&&a.addEventListener("close",()=>r()),i&&a.addEventListener("versionchange",h=>i(h.oldVersion,h.newVersion,h))}).catch(()=>{}),c}const fe=["get","getKey","getAll","getAllKeys","count"],me=["put","add","delete","clear"],F=new Map;function vt(n,t){if(!(n instanceof IDBDatabase&&!(t in n)&&typeof t=="string"))return;if(F.get(t))return F.get(t);const e=t.replace(/FromIndex$/,""),s=t!==e,i=me.includes(e);if(!(e in(s?IDBIndex:IDBObjectStore).prototype)||!(i||fe.includes(e)))return;const r=async function(o,...c){const a=this.transaction(o,i?"readwrite":"readonly");let h=a.store;return s&&(h=h.index(c.shift())),(await Promise.all([h[e](...c),i&&a.done]))[0]};return F.set(t,r),r}It(n=>({...n,get:(t,e,s)=>vt(t,e)||n.get(t,e,s),has:(t,e)=>!!vt(t,e)||n.has(t,e)}));const ge=["continue","continuePrimaryKey","advance"],bt={},X=new WeakMap,Mt=new WeakMap,ye={get(n,t){if(!ge.includes(t))return n[t];let e=bt[t];return e||(e=bt[t]=function(...s){X.set(this,Mt.get(this)[t](...s))}),e}};async function*we(...n){let t=this;if(t instanceof IDBCursor||(t=await t.openCursor(...n)),!t)return;t=t;const e=new Proxy(t,ye);for(Mt.set(e,t),z.set(e,J(t));t;)yield e,t=await(X.get(e)||t.continue()),X.delete(e)}function $t(n,t){return t===Symbol.asyncIterator&&V(n,[IDBIndex,IDBObjectStore,IDBCursor])||t==="iterate"&&V(n,[IDBIndex,IDBObjectStore])}It(n=>({...n,get(t,e,s){return $t(t,e)?we:n.get(t,e,s)},has(t,e){return $t(t,e)||n.has(t,e)}}));class _e{async getTasks(){throw new Error("Not implemented")}async getTask(t){throw new Error("Not implemented")}async createTask(t){throw new Error("Not implemented")}async updateTask(t,e){throw new Error("Not implemented")}async deleteTask(t){throw new Error("Not implemented")}async getTags(){throw new Error("Not implemented")}async getTag(t){throw new Error("Not implemented")}async createTag(t){throw new Error("Not implemented")}async updateTag(t,e){throw new Error("Not implemented")}async deleteTag(t){throw new Error("Not implemented")}async getDependencies(){throw new Error("Not implemented")}async addDependency(t,e,s="hard"){throw new Error("Not implemented")}async removeDependency(t){throw new Error("Not implemented")}async getTimeLogs(t=null){throw new Error("Not implemented")}async createTimeLog(t){throw new Error("Not implemented")}async getSettings(){throw new Error("Not implemented")}async updateSettings(t){throw new Error("Not implemented")}}const ve="cronograma_db",be=1,d={TASKS:"tasks",TAGS:"tags",DEPENDENCIES:"dependencies",TIME_LOGS:"time_logs",SETTINGS:"settings"},St={id:"global_settings",work_windows:{monday:[{start:"09:00",end:"17:00"}],tuesday:[{start:"09:00",end:"17:00"}],wednesday:[{start:"09:00",end:"17:00"}],thursday:[{start:"09:00",end:"17:00"}],friday:[{start:"09:00",end:"17:00"}],saturday:[],sunday:[]},break_windows:{monday:[{start:"12:00",end:"13:00"}],tuesday:[{start:"12:00",end:"13:00"}],wednesday:[{start:"12:00",end:"13:00"}],thursday:[{start:"12:00",end:"13:00"}],friday:[{start:"12:00",end:"13:00"}],saturday:[],sunday:[]},scheduler_interval_minutes:5,scheduling_horizon_days:7,slot_granularity_minutes:15,accent_color:"#6366F1",github_sync:{enabled:!1,pat:"",repo:"",owner:"",auto_sync_interval_seconds:30}};function U(n){const t=new Error(n);return t.source="ulid",t}const nt="0123456789ABCDEFGHJKMNPQRSTVWXYZ",P=nt.length,Et=Math.pow(2,48)-1,$e=10,Se=16;function Ee(n){let t=Math.floor(n()*P);return t===P&&(t=P-1),nt.charAt(t)}function Ae(n,t){if(isNaN(n))throw new Error(n+" must be a number");if(n>Et)throw U("cannot encode time greater than "+Et);if(n<0)throw U("time must be positive");if(Number.isInteger(Number(n))===!1)throw U("time must be an integer");let e,s="";for(;t>0;t--)e=n%P,s=nt.charAt(e)+s,n=(n-e)/P;return s}function xe(n,t){let e="";for(;n>0;n--)e=Ee(t)+e;return e}function Te(n=!1,t){t||(t=typeof window<"u"?window:null);const e=t&&(t.crypto||t.msCrypto);if(e)return()=>{const s=new Uint8Array(1);return e.getRandomValues(s),s[0]/255};try{const s=require("crypto");return()=>s.randomBytes(1).readUInt8()/255}catch{}if(n){try{console.error("secure crypto unusable, falling back to insecure Math.random()!")}catch{}return()=>Math.random()}throw U("secure crypto unusable, insecure Math.random not allowed")}function ke(n){return n||(n=Te()),function(e){return isNaN(e)&&(e=Date.now()),Ae(e,$e)+xe(Se,n)}}const Pe=ke();function L(){return Pe()}class Ne extends _e{constructor(){super(),this.dbPromise=this.initDB()}async initDB(){return pe(ve,be,{upgrade(t){if(!t.objectStoreNames.contains(d.TASKS)){const e=t.createObjectStore(d.TASKS,{keyPath:"id"});e.createIndex("status","status",{unique:!1}),e.createIndex("parent_task_id","parent_task_id",{unique:!1})}if(t.objectStoreNames.contains(d.TAGS)||t.createObjectStore(d.TAGS,{keyPath:"id"}),!t.objectStoreNames.contains(d.DEPENDENCIES)){const e=t.createObjectStore(d.DEPENDENCIES,{keyPath:"id"});e.createIndex("task_id","task_id",{unique:!1}),e.createIndex("depends_on_id","depends_on_id",{unique:!1}),e.createIndex("compound",["task_id","depends_on_id"],{unique:!0})}t.objectStoreNames.contains(d.TIME_LOGS)||t.createObjectStore(d.TIME_LOGS,{keyPath:"id"}).createIndex("task_id","task_id",{unique:!1}),t.objectStoreNames.contains(d.SETTINGS)||t.createObjectStore(d.SETTINGS,{keyPath:"id"})}}).then(async t=>(await t.get(d.SETTINGS,"global_settings")||await t.put(d.SETTINGS,St),t))}async getTasks(){return(await this.dbPromise).getAll(d.TASKS)}async getTask(t){return(await this.dbPromise).get(d.TASKS,t)}async createTask(t){const e=await this.dbPromise,s=new Date().toISOString(),i={id:t.id||L(),title:t.title,description:t.description||"",color:t.color||"#6366F1",priority:t.priority??0,tag_ids:t.tag_ids||[],deadline:t.deadline||null,alert_window_minutes:t.alert_window_minutes??null,duration_minutes:t.duration_minutes||30,splittable:t.splittable??!0,ignore_breaks:t.ignore_breaks??!1,recurrence:t.recurrence||null,manual_schedule:t.manual_schedule||null,status:t.status||"active",completed_at:t.completed_at||null,created_at:t.created_at||s,updated_at:s,parent_task_id:t.parent_task_id||null,accumulated_count:t.accumulated_count||0};return await e.put(d.TASKS,i),i}async updateTask(t,e){const s=await this.dbPromise,i=await s.get(d.TASKS,t);if(!i)throw new Error(`Task ${t} not found`);const r={...i,...e,updated_at:new Date().toISOString()};return await s.put(d.TASKS,r),r}async deleteTask(t){const s=(await this.dbPromise).transaction([d.TASKS,d.DEPENDENCIES,d.TIME_LOGS],"readwrite");await s.objectStore(d.TASKS).delete(t);const i=s.objectStore(d.DEPENDENCIES),r=await i.getAll();for(const o of r)(o.task_id===t||o.depends_on_id===t)&&await i.delete(o.id);await s.done}async getTags(){return(await this.dbPromise).getAll(d.TAGS)}async getTag(t){return(await this.dbPromise).get(d.TAGS,t)}async createTag(t){const e=await this.dbPromise,s=new Date().toISOString(),i={id:t.id||L(),name:t.name,color:t.color||"#3B82F6",duration_minutes:t.duration_minutes??null,deadline:t.deadline||null,start_date:t.start_date||null,needs_dedicated_timeslot:t.needs_dedicated_timeslot??!1,time_window_mode:t.time_window_mode||"none",time_windows:t.time_windows||{},auto_expand_config:t.auto_expand_config||null,created_at:s,updated_at:s};return await e.put(d.TAGS,i),i}async updateTag(t,e){const s=await this.dbPromise,i=await s.get(d.TAGS,t);if(!i)throw new Error(`Tag ${t} not found`);const r={...i,...e,updated_at:new Date().toISOString()};return await s.put(d.TAGS,r),r}async deleteTag(t){await(await this.dbPromise).delete(d.TAGS,t)}async getDependencies(){return(await this.dbPromise).getAll(d.DEPENDENCIES)}async addDependency(t,e,s="hard"){if(t===e)throw new Error("A task cannot depend on itself");const i=await this.dbPromise,r=await i.getAll(d.DEPENDENCIES);if(this._hasCycle(t,e,r))throw new Error("Adding this dependency creates a cyclic dependency loop");const o={id:L(),task_id:t,depends_on_id:e,type:s,created_at:new Date().toISOString()};return await i.put(d.DEPENDENCIES,o),o}async removeDependency(t){await(await this.dbPromise).delete(d.DEPENDENCIES,t)}_hasCycle(t,e,s){const i=new Map;for(const c of s)i.has(c.task_id)||i.set(c.task_id,[]),i.get(c.task_id).push(c.depends_on_id);i.has(t)||i.set(t,[]),i.get(t).push(e);const r=new Set,o=[e];for(;o.length>0;){const c=o.pop();if(c===t)return!0;if(!r.has(c)){r.add(c);const a=i.get(c)||[];for(const h of a)o.push(h)}}return!1}async getTimeLogs(t=null){const e=await this.dbPromise;return t?e.getAllFromIndex(d.TIME_LOGS,"task_id",t):e.getAll(d.TIME_LOGS)}async createTimeLog(t){const e=await this.dbPromise,s={id:t.id||L(),task_id:t.task_id,logged_minutes:t.logged_minutes,notes:t.notes||"",logged_at:t.logged_at||new Date().toISOString()};return await e.put(d.TIME_LOGS,s),s}async getSettings(){return await(await this.dbPromise).get(d.SETTINGS,"global_settings")||St}async updateSettings(t){const e=await this.dbPromise,i={...await this.getSettings(),...t};return await e.put(d.SETTINGS,i),i}}class Ce extends EventTarget{emit(t,e={}){this.dispatchEvent(new CustomEvent(t,{detail:e}))}on(t,e){const s=i=>e(i.detail);return this.addEventListener(t,s),()=>this.removeEventListener(t,s)}}const f=new Ce;function De(n){let t=n.replace("#","");t.length===3&&(t=t.split("").map(l=>l+l).join(""));const e=parseInt(t,16),s=(e>>16&255)/255,i=(e>>8&255)/255,r=(e&255)/255,o=Math.max(s,i,r),c=Math.min(s,i,r);let a=0,h=0;const u=(o+c)/2;if(o!==c){const l=o-c;switch(h=u>.5?l/(2-o-c):l/(o+c),o){case s:a=(i-r)/l+(i<r?6:0);break;case i:a=(r-s)/l+2;break;case r:a=(s-i)/l+4;break}a/=6}return{h:Math.round(a*360),s:Math.round(h*100),l:Math.round(u*100)}}function At(n){if(!n||!/^#[0-9A-Fa-f]{6}$/.test(n))return;const{h:t,s:e,l:s}=De(n);document.documentElement.style.setProperty("--accent-h",`${t}`),document.documentElement.style.setProperty("--accent-s",`${e}%`),document.documentElement.style.setProperty("--accent-l",`${s}%`)}class Ie{constructor(){this.schedule={computed_at:null,horizon_end:null,blocks:[],alerts:[],tag_windows_computed:[]},this.listeners=new Set}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(){for(const t of this.listeners)t()}setSchedule(t){this.schedule=t||{computed_at:null,horizon_end:null,blocks:[],alerts:[],tag_windows_computed:[]},this.notify()}get blocks(){return this.schedule.blocks||[]}get alerts(){return this.schedule.alerts||[]}}const Me=new Ie;class Oe{constructor(){this.dal=new Ne,this.tasks=[],this.tags=[],this.dependencies=[],this.settings=null,this.listeners=new Set,this.initialized=!1,this.worker=null,this.recomputeTimer=null}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(){for(const t of this.listeners)t()}async init(){if(!this.initialized)try{this.settings=await this.dal.getSettings(),this.tasks=await this.dal.getTasks(),this.tags=await this.dal.getTags(),this.dependencies=await this.dal.getDependencies(),this.settings?.accent_color&&At(this.settings.accent_color),this.initWorker(),this.initialized=!0,this.notify(),f.emit("app:ready",{initialized:!0}),this.requestScheduleRecompute(0)}catch(t){console.error("Failed to initialize AppState:",t)}}initWorker(){try{this.worker=new Worker(new URL("/assets/cronograma.worker-D82_Zikr.js",import.meta.url),{type:"module"}),this.worker.onmessage=t=>{const{type:e,payload:s}=t.data||{};e==="SCHEDULE_UPDATED"&&(Me.setSchedule(s),f.emit("schedule:updated",s),this.notify())}}catch(t){console.warn("Worker initialization failed (will fallback to main thread if needed):",t)}}requestScheduleRecompute(t=150){this.recomputeTimer&&clearTimeout(this.recomputeTimer),this.recomputeTimer=setTimeout(()=>{this.worker&&this.worker.postMessage({type:"RECOMPUTE",payload:{tasks:this.tasks,tags:this.tags,dependencies:this.dependencies,settings:this.settings,now:new Date().toISOString()}})},t)}async addTask(t){const e=await this.dal.createTask(t);return this.tasks=[...this.tasks,e],this.notify(),f.emit("task:created",e),this.requestScheduleRecompute(),e}async updateTask(t,e){const s=await this.dal.updateTask(t,e);return this.tasks=this.tasks.map(i=>i.id===t?s:i),this.notify(),f.emit("task:updated",s),this.requestScheduleRecompute(),s}async deleteTask(t){await this.dal.deleteTask(t),this.tasks=this.tasks.filter(e=>e.id!==t),this.dependencies=this.dependencies.filter(e=>e.task_id!==t&&e.depends_on_id!==t),this.notify(),f.emit("task:deleted",{id:t}),this.requestScheduleRecompute()}async addTag(t){const e=await this.dal.createTag(t);return this.tags=[...this.tags,e],this.notify(),f.emit("tag:created",e),this.requestScheduleRecompute(),e}async updateTag(t,e){const s=await this.dal.updateTag(t,e);return this.tags=this.tags.map(i=>i.id===t?s:i),this.notify(),f.emit("tag:updated",s),this.requestScheduleRecompute(),s}async deleteTag(t){await this.dal.deleteTag(t),this.tags=this.tags.filter(e=>e.id!==t),this.notify(),f.emit("tag:deleted",{id:t}),this.requestScheduleRecompute()}async addDependency(t,e,s="hard"){const i=await this.dal.addDependency(t,e,s);return this.dependencies=[...this.dependencies,i],this.notify(),f.emit("dependency:created",i),this.requestScheduleRecompute(),i}async removeDependency(t){await this.dal.removeDependency(t),this.dependencies=this.dependencies.filter(e=>e.id!==t),this.notify(),f.emit("dependency:deleted",{id:t}),this.requestScheduleRecompute()}async updateSettings(t){const e=await this.dal.updateSettings(t);return this.settings=e,e.accent_color&&At(e.accent_color),this.notify(),f.emit("settings:updated",e),this.requestScheduleRecompute(),e}}const xt=new Oe;class Le extends k{static styles=Lt`
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
  `;constructor(){super(),this.currentPath=window.location.hash||"#calendar",this._router=new oe(this,[{path:"",render:()=>this.renderPage("Calendar",y`<div class="card-elevated" style="padding: 24px;"><h2>📅 Calendar View</h2><p style="color: var(--color-text-secondary); margin-top: 8px;">Interactive timeline, day grid, and slot manager coming in Phase 4.</p></div>`)},{path:"calendar",render:()=>this.renderPage("Calendar",y`<div class="card-elevated" style="padding: 24px;"><h2>📅 Calendar View</h2><p style="color: var(--color-text-secondary); margin-top: 8px;">Interactive timeline, day grid, and slot manager coming in Phase 4.</p></div>`)},{path:"tasks",render:()=>this.renderPage("Tasks",y`<div class="card-elevated" style="padding: 24px;"><h2>📋 Tasks View</h2><p style="color: var(--color-text-secondary); margin-top: 8px;">Task list, filterable drawer, and dependency graph coming in Phase 3.</p></div>`)},{path:"tags",render:()=>this.renderPage("Tags",y`<div class="card-elevated" style="padding: 24px;"><h2>🏷️ Tags View</h2><p style="color: var(--color-text-secondary); margin-top: 8px;">Tag time budget windows and auto-expand rules coming in Phase 3.</p></div>`)},{path:"history",render:()=>this.renderPage("History",y`<div class="card-elevated" style="padding: 24px;"><h2>📜 History View</h2><p style="color: var(--color-text-secondary); margin-top: 8px;">Completed tasks, tag breakdown, and historical logs coming in Phase 4.</p></div>`)},{path:"settings",render:()=>this.renderPage("Settings",y`<div class="card-elevated" style="padding: 24px;"><h2>⚙️ Settings View</h2><p style="color: var(--color-text-secondary); margin-top: 8px;">Work windows, break hours, theme customization, and GitHub sync settings coming in Phase 5.</p></div>`)}]),window.addEventListener("hashchange",()=>{this.currentPath=window.location.hash||"#calendar",this.requestUpdate()})}connectedCallback(){super.connectedCallback(),xt.init(),xt.subscribe(()=>this.requestUpdate())}isActive(t){return(window.location.hash||"#calendar")===t}renderPage(t,e){return y`
      <div class="header-bar">
        <h1 class="page-title">${t}</h1>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span class="badge badge-accent">Offline-First IDB</span>
        </div>
      </div>
      <div class="content-area">
        ${e}
      </div>
    `}render(){return y`
      <!-- Desktop Sidebar -->
      <aside class="sidebar">
        <div>
          <div class="brand">
            <div class="brand-logo">C</div>
            <div class="brand-title">Cronograma</div>
          </div>
          <ul class="nav-list">
            <li class="nav-item ${this.isActive("#calendar")?"active":""}">
              <a href="#calendar">
                <span class="nav-icon">📅</span>
                <span>Calendar</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive("#tasks")?"active":""}">
              <a href="#tasks">
                <span class="nav-icon">📋</span>
                <span>Tasks</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive("#tags")?"active":""}">
              <a href="#tags">
                <span class="nav-icon">🏷️</span>
                <span>Tags</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive("#history")?"active":""}">
              <a href="#history">
                <span class="nav-icon">📜</span>
                <span>History</span>
              </a>
            </li>
            <li class="nav-item ${this.isActive("#settings")?"active":""}">
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
        ${this._router.outlet()}
      </main>

      <!-- Mobile Bottom Nav -->
      <nav class="bottom-nav">
        <a href="#calendar" class="${this.isActive("#calendar")?"active":""}">
          <span>📅</span>
          <span>Calendar</span>
        </a>
        <a href="#tasks" class="${this.isActive("#tasks")?"active":""}">
          <span>📋</span>
          <span>Tasks</span>
        </a>
        <a href="#tags" class="${this.isActive("#tags")?"active":""}">
          <span>🏷️</span>
          <span>Tags</span>
        </a>
        <a href="#history" class="${this.isActive("#history")?"active":""}">
          <span>📜</span>
          <span>History</span>
        </a>
        <a href="#settings" class="${this.isActive("#settings")?"active":""}">
          <span>⚙️</span>
          <span>Settings</span>
        </a>
      </nav>
    `}}customElements.define("app-shell",Le);"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(n=>{console.warn("Service Worker registration failed:",n)})});
