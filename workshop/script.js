(function() {
  'use strict';

  /* ─── REDUCED MOTION ─── */
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReduced.matches) {
    document.body.classList.add('reduce-motion');
  }
  prefersReduced.addEventListener('change', (e) => {
    document.body.classList.toggle('reduce-motion', e.matches);
  });

  /* ─── HEADER SCROLL STATE ─── */
  const header = document.querySelector('.ws-header');
  if (header) {
    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* ─── SCROLL REVEAL ─── */
  const revealEls = document.querySelectorAll('.ws-section .reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach((el) => observer.observe(el));
  }

  /* ─── SMOOTH SCROLL ─── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ═══════════════════════════════════════
     AI CAPABILITY AUDIT QUIZ
     ═══════════════════════════════════════ */
  const quiz = document.getElementById('quiz');
  if (quiz) {
    const questions = quiz.querySelectorAll('.quiz-question');
    const progressBar = document.getElementById('quiz-progress-bar');
    const resultEl = document.getElementById('quiz-result');
    const resultTitle = document.getElementById('quiz-result-title');
    const resultScore = document.getElementById('quiz-result-score');
    const resultText = document.getElementById('quiz-result-text');
    const resultRecs = document.getElementById('quiz-result-recs');
    const retakeBtn = document.getElementById('quiz-retake');
    const emailInput = document.getElementById('quiz-email');
    const phoneInput = document.getElementById('quiz-phone');
    const emailBtn = document.getElementById('quiz-email-btn');

    // Store answers
    const answers = {};
    const totalQs = questions.length; // 7
    let currentQ = 1;

    // n8n webhook (primary — update URL once Railway n8n is deployed)
    const N8N_WEBHOOK_URL = 'https://n8n.yourdomain.com/webhook/workshop-quiz';

    // Google Form config (fallback — still fires, no-cors)
    const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfeulW8QXhS2XYI-ZIXj01CunFclaJGIDl6S0ZJpKL1-uAkfA/formResponse';
    const ENTRY_IDS = {
      1: 'entry.1646956508',
      2: 'entry.2089935750',
      3: 'entry.1945997843',
      4: 'entry.502146189',
      5: 'entry.1401871249',
      6: 'entry.168774361',
      email: 'entry.2126477864',
      phone: 'entry.1929819026'
    };
    const VALUE_MAP = {
      1: { '1': '<5', '2': '5-10', '3': '10-20', '4': '20+' },
      2: { 'customer': 'Customer service', 'admin': 'Admin', 'finance': 'Finance', 'content': 'Content', 'other': 'Other' },
      3: { 'none': 'Never tried', 'tried': 'Tried but couldn\'t stick', 'occasional': 'Occasional', 'regular': 'Regular' },
      4: { 'retail': 'Retail/E-commerce', 'professional': 'Professional Services', 'tech': 'Tech/Fintech', 'nonprofit': 'NGO', 'other': 'Other' },
      5: { 'solo': 'Solo', 'small': '2-10', 'medium': '11-50', 'enterprise': '50+' },
      6: { 'time': 'Time wasted', 'errors': 'Errors', 'tools': 'Wrong tools', 'knowledge': 'Don\'t know how to apply' }
    };

    // Build payload for n8n
    const buildPayload = (email, phone) => {
      const q4Map = { 'retail': 'Retail/E-commerce', 'professional': 'Professional Services', 'tech': 'Tech/Fintech', 'nonprofit': 'NGO', 'other': 'Other' };
      const q5Map = { 'solo': 'Solo', 'small': '2-10', 'medium': '11-50', 'enterprise': '50+' };
      const q6Map = { 'time': 'Time wasted', 'errors': 'Errors', 'tools': 'Wrong tools', 'knowledge': 'Don\'t know how to apply' };
      return {
        email: email,
        phone: phone || '',
        industry: q4Map[answers['4']] || '',
        teamSize: q5Map[answers['5']] || '',
        frustration: q6Map[answers['6']] || '',
        leadName: email.split('@')[0] || 'Lead',
      };
    };

    // Submit to n8n webhook (fire-and-forget, no error thrown)
    const submitToN8n = (email, phone) => {
      fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(email, phone))
      }).catch(function() {});
    };

    // Submit to Google Forms (no-cors fallback)
    const submitToGoogleForm = (email, phone) => {
      var fd = new URLSearchParams();
      for (var q = 1; q <= 6; q++) {
        var val = answers[q];
        if (val && VALUE_MAP[q] && VALUE_MAP[q][val]) {
          fd.append(ENTRY_IDS[q], VALUE_MAP[q][val]);
        }
      }
      if (email) fd.append(ENTRY_IDS.email, email);
      if (phone && ENTRY_IDS.phone) fd.append(ENTRY_IDS.phone, phone);
      fetch(FORM_URL, { method: 'POST', mode: 'no-cors', body: fd }).catch(function() {});
    };

    // Result profiles
    const getResult = (answers) => {
      const hours = parseInt(answers['1']) || 1;
      const aiExp = answers['3'] || 'none';
      const frustration = answers['6'] || 'time';
      const industry = answers['4'] || 'other';

      let readiness = 0;
      if (hours >= 3) readiness += 2;
      if (hours >= 2) readiness += 1;
      if (aiExp === 'none' || aiExp === 'tried') readiness += 1;
      if (aiExp === 'regular') readiness -= 1;

      let profile, text, recs;

      if (readiness >= 3) {
        profile = 'High Potential, Low System';
        text = 'You\'re spending serious time on manual work and haven\'t found the right AI approach yet. That means the biggest gains are still sitting on the table — and you\'ll see dramatic results from even one or two automated workflows. The workshop is designed for exactly this.';
        recs = [
          'You\'ll start with the highest-impact workflow for your industry',
          'Bring a specific task — we\'ll automate it live',
          'The sales/operations track is likely your biggest win'
        ];
      } else if (readiness >= 2) {
        profile = 'Aware, Exploring';
        text = 'You know AI can help and you\'ve dabbled, but you haven\'t built anything systematic. The workshop bridges that gap — you\'ll leave with working automations, not just ideas.';
        recs = [
          'Pick the track that matches your biggest time sink',
          'The content/marketing track is great for quick wins',
          'Your peer match will help you spot patterns you missed'
        ];
      } else {
        profile = 'Ready to Start';
        text = 'You\'re already using AI in some form — but the workshop will take you from occasional use to systematic automation. You\'ll build workflows that run without you.';
        recs = [
          'The finance/admin track will save you the most hours',
          'Your peer will benefit from your AI familiarity',
          'Focus on automating the tasks you still do manually'
        ];
      }

      return { profile: profile, text: text, recs: recs, industry: industry };
    };

    const showQuestion = function(num) {
      questions.forEach(function(q) {
        q.classList.toggle('active', parseInt(q.dataset.q) === num);
      });
      var pct = ((num - 1) / totalQs) * 100;
      if (progressBar) progressBar.style.width = pct + '%';
      currentQ = num;
      if (num === 7 && emailInput) {
        setTimeout(function() { emailInput.focus(); }, 300);
      }
    };

    const showResult = function() {
      questions.forEach(function(q) { q.classList.remove('active'); });
      if (progressBar) progressBar.style.width = '100%';
      var result = getResult(answers);
      resultTitle.textContent = 'Your AI Automation Readiness';
      resultScore.textContent = result.profile;
      resultText.textContent = result.text;
      resultRecs.innerHTML = '';
      for (var i = 0; i < result.recs.length; i++) {
        var p = document.createElement('p');
        p.className = 'quiz-result-rec';
        p.innerHTML = '<strong>' + (i + 1) + '.</strong> ' + result.recs[i];
        resultRecs.appendChild(p);
      }
      resultEl.hidden = false;
    };

    // Handle option clicks (Q1–Q6)
    quiz.querySelectorAll('.quiz-opt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var qEl = btn.closest('.quiz-question');
        var qNum = parseInt(qEl.dataset.q);
        qEl.querySelectorAll('.quiz-opt').forEach(function(o) { o.classList.remove('selected'); });
        btn.classList.add('selected');
        answers[qNum] = btn.dataset.value;
        setTimeout(function() { showQuestion(qNum + 1); }, 250);
      });
    });

    // Handle email/phone submission (Q7)
    if (emailBtn && emailInput) {
      var submitEmail = function() {
        var email = emailInput.value.trim();
        if (!email || email.indexOf('@') === -1) {
          emailInput.focus();
          emailInput.style.borderColor = '#b58268';
          return;
        }
        emailInput.style.borderColor = '';
        answers[7] = email;
        var phone = phoneInput ? phoneInput.value.trim() : '';
        answers.phone = phone;

        // Fire both — n8n webhook (primary) and Google Form (fallback)
        submitToN8n(email, phone);
        submitToGoogleForm(email, phone);

        setTimeout(showResult, 300);
      };

      emailBtn.addEventListener('click', submitEmail);
      emailInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitEmail();
        }
      });
    }

    // Retake
    if (retakeBtn) {
      retakeBtn.addEventListener('click', function() {
        for (var k in answers) delete answers[k];
        quiz.querySelectorAll('.quiz-opt').forEach(function(o) { o.classList.remove('selected'); });
        if (emailInput) { emailInput.value = ''; emailInput.style.borderColor = ''; }
        if (phoneInput) { phoneInput.value = ''; }
        resultEl.hidden = true;
        showQuestion(1);
      });
    }

    showQuestion(1);
  }

})();
