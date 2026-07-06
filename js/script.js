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
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const name = form.elements['name'].value.trim();
      const email = form.elements['email'].value.trim();
      const message = form.elements['message'].value.trim();
      if(!name || !email || !message){
        // simple client-side validation
        alert('Please complete all fields before sending.');
        return;
      }

      // Compose mailto as fallback to send email via user's mail client
      const subject = encodeURIComponent('Portfolio contact from ' + name);
      const body = encodeURIComponent('Name: ' + name + "\nEmail: " + email + "\n\n" + message);
      const mailto = `mailto:wahyu12345lbk@gmail.com?subject=${subject}&body=${body}`;
      // Try opening mail client
      window.location.href = mailto;

      // Show success state in UI
      if(success){
        success.hidden = false;
        form.reset();
        setTimeout(()=>{ success.hidden = true; }, 6000);
      }
    });
  }
});
