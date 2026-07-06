document.addEventListener('DOMContentLoaded',function(){
  const navToggle=document.querySelector('.nav-toggle');
  const nav=document.getElementById('nav');
  navToggle.addEventListener('click',()=>{
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.style.display = nav.style.display === 'block' ? '' : 'block';
  });

  // Contact form handling
  const form = document.getElementById('contact-form');
  if(form){
    const success = document.getElementById('contact-success');
    const submitBtn = form.querySelector('button[type="submit"]');
    const modal = document.getElementById('mailto-fallback');
    const modalTextarea = modal && modal.querySelector('.modal-textarea');
    const modalCopy = modal && modal.querySelector('.modal-copy');
    const modalOpen = modal && modal.querySelector('.modal-open');
    const modalClose = modal && modal.querySelector('.modal-close');

    function showModal(text, mailto){
      if(!modal) return;
      modalTextarea.value = text;
      modalOpen.href = mailto;
      modal.hidden = false;
      modal.setAttribute('aria-hidden','false');
    }

    function hideModal(){
      if(!modal) return;
      modal.hidden = true;
      modal.setAttribute('aria-hidden','true');
    }

    if(modalClose) modalClose.addEventListener('click', hideModal);
    if(modalCopy) modalCopy.addEventListener('click', async function(){
      try{ await navigator.clipboard.writeText(modalTextarea.value); modalCopy.textContent = 'Copied'; setTimeout(()=> modalCopy.textContent = 'Copy message', 1800);}catch(e){ alert('Copy failed — select and copy manually.'); }
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(submitBtn) submitBtn.disabled = true;
      const name = form.elements['name'].value.trim();
      const email = form.elements['email'].value.trim();
      const message = form.elements['message'].value.trim();
      if(!name || !email || !message){
        alert('Please complete all fields before sending.');
        if(submitBtn) submitBtn.disabled = false;
        return;
      }

      const subject = encodeURIComponent('Portfolio contact from ' + name);
      const bodyText = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
      const body = encodeURIComponent(bodyText);
      const mailto = `mailto:wahyu12345lbk@gmail.com?subject=${subject}&body=${body}`;
      // First, try to POST the message to the server to capture it.
      (async function(){
        try{
          const resp = await fetch('/api/messages', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name, email, message }) });
          const data = await resp.json();
          if(!resp.ok){ console.warn('Server capture failed', data); }
        }catch(err){ console.warn('Could not POST to server:', err); }

        // Then attempt to open mail client; if blocked, show fallback modal
        let opened = false;
        try{ const w = window.open(mailto, '_blank'); opened = !!w; if(w) w.focus(); }catch(err){ opened = false; }
        if(!opened) showModal(bodyText, mailto);

        // Show success state and reset
        if(success){ success.hidden = false; form.reset(); setTimeout(()=>{ success.hidden = true; }, 6000); }
        if(submitBtn) submitBtn.disabled = false;
      })();
    });
  }
  }
});
