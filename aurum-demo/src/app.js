(function(){
const IMG=/*IMG*/{};
const PAGES=/*PAGES*/{};
const TITLES={index:'메인',about:'센터소개',programs:'프로그램',contact:'오시는 길'};
const root=document.documentElement,main=document.getElementById('main'),top=document.getElementById('top');
const modal=document.getElementById('inquiry'),sheet=modal.querySelector('.sheet'),quick=document.querySelector('.quick');
let current=null,io=null,lastFocus=null,lastY=0;

for(const k in IMG)root.style.setProperty('--img-'+k,'url("'+IMG[k]+'")');
function hydrate(scope){scope.querySelectorAll('img[data-img]').forEach(i=>{if(IMG[i.dataset.img])i.src=IMG[i.dataset.img]})}
hydrate(document);

function parse(){const p=(location.hash||'#/').replace(/^#\/?/,'').split('/').filter(Boolean);return{page:PAGES[p[0]]?p[0]:'index',sub:p[1]||''}}

function observe(){
  if(io)io.disconnect();
  const els=document.querySelectorAll('.rv:not(.in),.rv-img:not(.in)');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return}
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  els.forEach(e=>io.observe(e));
}

function goTo(id,smooth){const el=document.getElementById(id);if(!el)return;window.scrollTo({top:el.getBoundingClientRect().top+scrollY-(innerWidth>1080?150:140),behavior:smooth?'smooth':'auto'})}

function render(){
  const {page,sub}=parse();
  setMenu(false);
  if(page!==current){
    main.innerHTML=PAGES[page];
    hydrate(main);
    current=page;
    document.title=TITLES[page]+' | 아우름 배드민턴 센터';
    document.querySelectorAll('.nav a[data-route]').forEach(a=>{const on=a.dataset.route===page;a.classList.toggle('active',on);on?a.setAttribute('aria-current','page'):a.removeAttribute('aria-current')});
    main.style.animation='none';void main.offsetWidth;main.style.animation='';
    bindPage();
    if(sub)requestAnimationFrame(()=>setTimeout(()=>goTo(sub,false),60));
    else window.scrollTo(0,0);
  }else if(sub)goTo(sub,true);
  else window.scrollTo({top:0,behavior:'smooth'});
  observe();
  onScroll();
}

function bindPage(){
  // programs tab highlight
  const tabs=main.querySelectorAll('.ptabs a');
  if(tabs.length)tabs[0].classList.add('on');
  if(tabs.length&&'IntersectionObserver' in window){
    const t=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){tabs.forEach(a=>a.classList.toggle('on',a.dataset.tab===e.target.id))}}),{rootMargin:'-45% 0px -50% 0px'});
    main.querySelectorAll('.svc').forEach(s=>t.observe(s));
  }
}

function setMenu(open){
  top.classList.toggle('menu-open',open);
  document.body.classList.toggle('lock',open||modal.classList.contains('open'));
  const b=top.querySelector('.burger');b.setAttribute('aria-expanded',String(open));b.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
}

function openModal(pick){
  lastFocus=document.activeElement;setMenu(false);
  sheet.classList.remove('sent');sheet.querySelector('form').reset();
  if(pick){const r=sheet.querySelector('input[name=p][value="'+pick+'"]');if(r)r.checked=true}
  modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('lock');
  setTimeout(()=>sheet.querySelector('.x').focus(),50);
}
function closeModal(){
  if(!modal.classList.contains('open'))return;
  modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.classList.remove('lock');
  lastFocus&&lastFocus.focus&&lastFocus.focus();
}
sheet.querySelector('form').addEventListener('submit',e=>{
  e.preventDefault();
  const f=e.target,tel=f.tel;
  if(!f.name.value.trim()){f.name.focus();f.name.style.borderColor='#c0392b';return}
  if(!/^[0-9\-\s]{9,}$/.test(tel.value.trim())){tel.focus();tel.style.borderColor='#c0392b';return}
  sheet.classList.add('sent');sheet.scrollTop=0;
});
sheet.addEventListener('input',e=>{if(e.target.style)e.target.style.borderColor=''});

function toast(msg){let t=document.querySelector('.toast');if(!t){t=document.createElement('div');t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2200)}

document.addEventListener('click',e=>{
  const inq=e.target.closest('[data-inquire]');if(inq){e.preventDefault();openModal(inq.dataset.inquire);return}
  if(e.target.closest('[data-close]')){closeModal();return}
  if(e.target.closest('.burger')){setMenu(!top.classList.contains('menu-open'));return}
  if(e.target.closest('[data-top]')){window.scrollTo({top:0,behavior:'smooth'});return}
  const cp=e.target.closest('[data-copy]');
  if(cp){const v=cp.dataset.copy;(navigator.clipboard?navigator.clipboard.writeText(v):Promise.reject()).then(()=>toast('주소를 복사했습니다'),()=>toast(v));return}
  const q=e.target.closest('.faq-q');
  if(q){const it=q.parentElement,o=!it.classList.contains('open');it.classList.toggle('open',o);q.setAttribute('aria-expanded',String(o));return}
  const a=e.target.closest('a[href^="#/"]');
  if(a&&a.getAttribute('href')===location.hash){e.preventDefault();render()}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeModal();setMenu(false)}
  if(e.key==='Tab'&&modal.classList.contains('open')){
    const f=[...sheet.querySelectorAll('button,a[href],input,textarea')].filter(x=>x.offsetParent);
    if(!f.length)return;const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  }
});

function onScroll(){
  const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;
  root.style.setProperty('--p',h>0?(y/h).toFixed(4):0);
  top.classList.toggle('scrolled',y>30);
  const hid=y>lastY&&y>500&&!top.classList.contains('menu-open');top.classList.toggle('hide',hid);document.body.classList.toggle('head-hidden',hid);
  if(quick)quick.classList.toggle('show',y>innerHeight*.6);
  lastY=y;
}
addEventListener('scroll',onScroll,{passive:true});
addEventListener('hashchange',render);
addEventListener('resize',()=>{if(innerWidth>1080)setMenu(false)});
render();
})();
