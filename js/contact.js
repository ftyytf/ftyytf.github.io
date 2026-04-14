(function(){
  'use strict';

  // FAQ accordion
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item){
    var question = item.querySelector('.faq-question');
    if(question){
      question.addEventListener('click', function(){
        var wasOpen = item.classList.contains('open');
        // Close all
        faqItems.forEach(function(fi){ fi.classList.remove('open'); });
        // Toggle current
        if(!wasOpen) item.classList.add('open');
      });
    }
  });

  // Contact form
  var form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(window.NX && window.NX.toast){
        window.NX.toast('Сообщение отправлено! Мы ответим в течение 30 минут.', 'success');
      } else {
        alert('Сообщение отправлено!');
      }
      form.reset();
    });
  }

})();


