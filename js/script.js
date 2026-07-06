document.addEventListener('DOMContentLoaded',function(){
  const navToggle=document.querySelector('.nav-toggle');
  const nav=document.getElementById('nav');
  navToggle.addEventListener('click',()=>{
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.style.display = nav.style.display === 'block' ? '' : 'block';
  });
});
