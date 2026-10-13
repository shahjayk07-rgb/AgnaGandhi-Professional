/* GA4 event tracking. No analytics requests are made until a real Measurement ID is configured. */
(()=>{
  const cfg=window.SITE_CONFIG||{};
  const id=String(cfg.ga4MeasurementId||'').trim();
  if(!/^G-[A-Z0-9]+$/.test(id)){
    console.info('Analytics is not active: add the GA4 Measurement ID in site-config.js.');
    return;
  }
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){window.dataLayer.push(arguments)};
  const tagScript=document.createElement('script');tagScript.async=true;tagScript.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(id);document.head.appendChild(tagScript);
  window.gtag('js',new Date());
  window.gtag('config',id,{send_page_view:true, page_title:document.title});
  const send=(name,params={})=>window.gtag('event',name,{...params,page_path:location.pathname,page_title:document.title});
  // Track click destinations without collecting form field values or personal information.
  document.addEventListener('click',e=>{
    const a=e.target.closest('a,button'); if(!a)return;
    const label=(a.getAttribute('aria-label')||a.innerText||a.textContent||'').trim().replace(/\s+/g,' ').slice(0,80);
    const href=a.getAttribute('href')||'';
    if(a.matches('.site-nav a')) send('navigation_click',{link_text:label,link_url:href});
    if(a.matches('.cta, [data-analytics="cta"]')) send('cta_click',{cta_text:label,link_url:href});
    if(href.startsWith('mailto:')) send('email_click',{link_url:'mailto_link'});
    if(href.startsWith('tel:')) send('phone_click',{link_url:'tel_link'});
    if(href && /^https?:\/\//i.test(href) && new URL(href,location.href).hostname!==location.hostname) send('outbound_click',{link_url:href,link_text:label});
    if(a.matches('.mantra-close')) send('navkar_modal_close');
  });
  const form=document.querySelector('#enquiry-form');
  if(form){form.addEventListener('focusin',()=>{if(!form.dataset.analyticsStarted){form.dataset.analyticsStarted='1';send('enquiry_form_start')}},{once:true});form.addEventListener('submit',()=>send('enquiry_form_submit_attempt'));}
  document.querySelectorAll('.site-nav a[href="about.html"]').forEach(a=>a.addEventListener('click',()=>{const count=Number(sessionStorage.getItem('navkar_about_clicks')||0)+1;sessionStorage.setItem('navkar_about_clicks',String(count));if(count>=9){send('navkar_modal_open',{trigger:'about_navigation_nine_clicks'});sessionStorage.setItem('navkar_about_clicks','0')}}));
  // Lightweight scroll milestones; one event per milestone per page.
  const milestones=new Set();
  const checkScroll=()=>{const max=document.documentElement.scrollHeight-innerHeight; if(max<=0)return;const pct=Math.round((scrollY/max)*100);[25,50,75,90].forEach(n=>{if(pct>=n&&!milestones.has(n)){milestones.add(n);send('scroll_depth',{percent_scrolled:n})}})};
  window.addEventListener('scroll',checkScroll,{passive:true});
  // Capture page referrer and campaign parameters through GA4's standard attribution.
})();
