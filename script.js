/**
 * Sévérin Cécé KOLIE - Portfolio
 * Interactive Script: Hero Terminal Typing Engine, Scroll Reveal, Mobile Drawer, Modal, Contact Form
 */

// EmailJS optional fallback configuration
const EMAILJS_CONFIG = {
    PUBLIC_KEY: "YOUR_EMAILJS_PUBLIC_KEY",
    SERVICE_ID: "YOUR_EMAILJS_SERVICE_ID",
    TEMPLATE_ID: "YOUR_EMAILJS_TEMPLATE_ID",
    TO_EMAIL: "kseverin189@gmail.com"
};

function isEmailConfigured() {
    return Object.entries(EMAILJS_CONFIG)
        .filter(([key]) => key !== "TO_EMAIL")
        .every(([, value]) => value && !value.startsWith("YOUR_"));
}

document.addEventListener('DOMContentLoaded', () => {
    initHeroTerminal();
    initScrollReveal();
    initMobileNav();
    initCertModal();
    initContactForm();
    initDynamicYear();
});

/* ==========================================================================
   1. HERO TERMINAL TYPING ENGINE & SEAMLESS LOOP
   ========================================================================== */
function initHeroTerminal() {
    const terminalBody = document.getElementById('hero-terminal-body');
    if (!terminalBody) return;

    // Terminal script sequence (Linux sysadmin / cyber flavor in French)
    const sequence = [
        {
            type: 'cmd',
            prompt: 'kolie@secops:~$',
            command: 'whoami'
        },
        {
            type: 'output',
            lines: [
                { prefix: '>', text: 'Sévérin Cécé KOLIE', highlight: 'text-neonCyan font-semibold' },
                { prefix: '>', text: 'Junior Cybersécurité & Administration système, réseaux', highlight: 'text-white font-medium' }
            ]
        },
        {
            type: 'cmd',
            prompt: 'kolie@secops:~$',
            command: 'cat profile.txt'
        },
        {
            type: 'output',
            lines: [
                { prefix: '>', text: 'Focus : Pentest Windows & Linux server offensive sécurité', highlight: 'text-neonGreen' },
                { prefix: '>', text: 'Spécialité : Active Directory, GPO, Hardening, Virtualisation ESXi & Réseaux', highlight: 'text-gray-300' }
            ]
        },
        {
            type: 'cmd',
            prompt: 'kolie@secops:~$',
            command: 'systemctl is-active secops'
        },
        {
            type: 'output',
            lines: [
                { prefix: '✓', text: 'Opérationnel — Disponible pour opportunités & projets', highlight: 'text-neonGreen font-semibold' }
            ]
        }
    ];

    // Reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        renderStaticTerminal(terminalBody, sequence);
        return;
    }

    let activeTimeout = null;
    let isPaused = false;

    function renderStaticTerminal(container, seq) {
        container.innerHTML = '';
        seq.forEach(step => {
            if (step.type === 'cmd') {
                const line = document.createElement('div');
                line.className = 'leading-relaxed text-xs sm:text-sm break-words';
                line.innerHTML = `<span class="text-neonGreen font-semibold select-none mr-2">${escapeHtml(step.prompt)}</span><span class="text-white font-medium">${escapeHtml(step.command)}</span>`;
                container.appendChild(line);
            } else if (step.type === 'output') {
                const outContainer = document.createElement('div');
                outContainer.className = 'space-y-1 text-xs sm:text-sm pl-1';
                step.lines.forEach(l => {
                    const p = document.createElement('p');
                    p.className = 'flex items-start text-gray-200';
                    p.innerHTML = `<span class="text-neonCyan mr-2 font-bold select-none">${escapeHtml(l.prefix)}</span><span class="${l.highlight}">${escapeHtml(l.text)}</span>`;
                    outContainer.appendChild(p);
                });
                container.appendChild(outContainer);
            }
        });
        const finalPrompt = document.createElement('div');
        finalPrompt.className = 'pt-1 leading-relaxed text-xs sm:text-sm';
        finalPrompt.innerHTML = `<span class="text-neonGreen font-semibold select-none mr-2">kolie@secops:~$</span><span class="w-2.5 h-4 bg-neonGreen inline-block align-middle animate-cursor shadow-[0_0_8px_#00ff66]"></span>`;
        container.appendChild(finalPrompt);
    }

    function runAnimationCycle() {
        if (isPaused) return;
        terminalBody.innerHTML = '';

        let stepIndex = 0;

        function nextStep() {
            if (isPaused) return;

            if (stepIndex >= sequence.length) {
                // Animation finished: append final prompt with blinking cursor
                const finalPrompt = document.createElement('div');
                finalPrompt.className = 'pt-1 leading-relaxed text-xs sm:text-sm';
                finalPrompt.innerHTML = `<span class="text-neonGreen font-semibold select-none mr-2">kolie@secops:~$</span><span class="w-2.5 h-4 bg-neonGreen inline-block align-middle animate-cursor shadow-[0_0_8px_#00ff66]"></span>`;
                terminalBody.appendChild(finalPrompt);

                // Hold visible terminal for 5.5s so user can read, then cleanly loop
                activeTimeout = setTimeout(() => {
                    runAnimationCycle();
                }, 5500);
                return;
            }

            const current = sequence[stepIndex];
            stepIndex++;

            if (current.type === 'cmd') {
                typeCommand(current.prompt, current.command, () => {
                    activeTimeout = setTimeout(nextStep, 250);
                });
            } else if (current.type === 'output') {
                renderOutput(current.lines, () => {
                    activeTimeout = setTimeout(nextStep, 500);
                });
            }
        }

        function typeCommand(promptText, cmdText, doneCallback) {
            const cmdRow = document.createElement('div');
            cmdRow.className = 'leading-relaxed text-xs sm:text-sm break-words';

            const promptSpan = document.createElement('span');
            promptSpan.className = 'text-neonGreen font-semibold select-none mr-2 inline';
            promptSpan.textContent = promptText;

            const cmdSpan = document.createElement('span');
            cmdSpan.className = 'text-white font-medium inline';

            const cursorSpan = document.createElement('span');
            cursorSpan.className = 'w-2 h-3.5 bg-neonGreen inline-block ml-1 align-middle animate-cursor shadow-[0_0_6px_#00ff66]';

            cmdRow.appendChild(promptSpan);
            cmdRow.appendChild(cmdSpan);
            cmdRow.appendChild(cursorSpan);
            terminalBody.appendChild(cmdRow);

            let charIndex = 0;

            function typeNextChar() {
                if (isPaused) return;

                if (charIndex < cmdText.length) {
                    cmdSpan.textContent += cmdText.charAt(charIndex);
                    charIndex++;
                    // Natural typing cadence variation (35ms - 75ms)
                    const delay = 35 + Math.floor(Math.random() * 40);
                    activeTimeout = setTimeout(typeNextChar, delay);
                } else {
                    cursorSpan.remove();
                    doneCallback();
                }
            }

            activeTimeout = setTimeout(typeNextChar, 100);
        }

        function renderOutput(lines, doneCallback) {
            const outContainer = document.createElement('div');
            outContainer.className = 'space-y-1 text-xs sm:text-sm pl-1';

            lines.forEach(lineData => {
                const p = document.createElement('p');
                p.className = 'flex items-start text-gray-200';
                p.innerHTML = `<span class="text-neonCyan mr-2 font-bold select-none">${escapeHtml(lineData.prefix)}</span><span class="${lineData.highlight}">${escapeHtml(lineData.text)}</span>`;
                outContainer.appendChild(p);
            });

            terminalBody.appendChild(outContainer);
            doneCallback();
        }

        nextStep();
    }

    // Page Visibility handling: pause when user navigates away, resume when returning
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isPaused = true;
            if (activeTimeout) clearTimeout(activeTimeout);
        } else {
            isPaused = false;
            runAnimationCycle();
        }
    });

    runAnimationCycle();
}

/* ==========================================================================
   2. SCROLL REVEAL & PROGRESSIVE TIMELINE ANIMATION
   ========================================================================== */
function initScrollReveal() {
    const revealItems = document.querySelectorAll('.scroll-reveal, .timeline-entry');
    if (!revealItems.length) return;

    if (!('IntersectionObserver' in window)) {
        revealItems.forEach(item => item.classList.add('in-view'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealItems.forEach(item => observer.observe(item));
}

/* ==========================================================================
   3. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-menu-close');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-drawer-overlay');
    const navLinks = document.querySelectorAll('.mobile-nav-link');

    if (!toggleBtn || !drawer || !overlay) return;

    function openDrawer() {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    navLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer.classList.contains('active')) {
            closeDrawer();
        }
    });
}

/* ==========================================================================
   4. CERTIFICATE IMAGE MODAL
   ========================================================================== */
function initCertModal() {
    let modal = document.getElementById('cert-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cert-modal';
        modal.className = 'cert-modal-overlay hidden';
        modal.innerHTML = `
            <div class="cert-modal-content">
                <button type="button" class="cert-modal-close" id="cert-modal-close-btn" aria-label="Fermer la certification">✕</button>
                <img id="cert-modal-img" src="" alt="Certification Sévérin Cécé KOLIE" />
                <div id="cert-modal-title" class="cert-modal-title"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) window.closeCertificationModal();
        });

        document.getElementById('cert-modal-close-btn').addEventListener('click', () => {
            window.closeCertificationModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                window.closeCertificationModal();
            }
        });
    }
}

window.openCertificationModal = function(imgSrc, title) {
    const modal = document.getElementById('cert-modal');
    const modalImg = document.getElementById('cert-modal-img');
    const modalTitle = document.getElementById('cert-modal-title');
    if (!modal || !modalImg || !modalTitle) return;

    modalImg.src = imgSrc;
    modalImg.alt = title;
    modalTitle.textContent = title;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

window.closeCertificationModal = function() {
    const modal = document.getElementById('cert-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
};

/* ==========================================================================
   5. CONTACT FORM & SECURITY SANITIZATION
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    if (window.emailjs && isEmailConfigured()) {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }

    const fields = {
        user_name: { el: document.getElementById('user_name'), validate: val => (!val.trim() ? 'Veuillez renseigner votre nom.' : val.trim().length < 2 ? 'Nom trop court.' : '') },
        user_email: { el: document.getElementById('user_email'), validate: val => (!val.trim() ? 'Veuillez renseigner votre email.' : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? 'Adresse email invalide.' : '') },
        subject: { el: document.getElementById('subject'), validate: val => '' },
        message: { el: document.getElementById('message'), validate: val => (!val.trim() ? 'Veuillez écrire votre message.' : val.trim().length < 10 ? 'Message trop court (10 caractères min.).' : '') }
    };

    const submitBtn = document.getElementById('submit-btn');
    const submitLabel = document.getElementById('submit-label');
    const statusEl = document.getElementById('form-status');

    // Live validation
    Object.values(fields).forEach(({ el, validate }) => {
        if (!el) return;
        const errContainer = el.parentElement.querySelector('.field-error');
        el.addEventListener('input', () => {
            if (errContainer && !errContainer.classList.contains('hidden')) {
                const error = validate(el.value);
                if (!error) {
                    errContainer.textContent = '';
                    errContainer.classList.add('hidden');
                    el.classList.remove('border-red-500/80');
                }
            }
        });
        el.addEventListener('blur', () => {
            const error = validate(el.value);
            if (errContainer) {
                if (error) {
                    errContainer.textContent = error;
                    errContainer.classList.remove('hidden');
                    el.classList.add('border-red-500/80');
                } else {
                    errContainer.textContent = '';
                    errContainer.classList.add('hidden');
                    el.classList.remove('border-red-500/80');
                }
            }
        });
    });

    function setStatus(msg, type) {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.className = 'text-xs font-mono min-h-[1.25rem] transition-colors ' +
            (type === 'error' ? 'text-red-400' : type === 'success' ? 'text-neonGreen' : 'text-gray-400');
    }

    function setStatusHtml(htmlStr, type) {
        if (!statusEl) return;
        statusEl.innerHTML = htmlStr;
        statusEl.className = 'text-xs font-mono min-h-[1.25rem] transition-colors ' +
            (type === 'error' ? 'text-red-400' : type === 'success' ? 'text-neonGreen' : 'text-gray-400');
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        setStatus('', 'idle');

        let isValid = true;
        Object.values(fields).forEach(({ el, validate }) => {
            if (!el) return;
            const error = validate(el.value);
            const errContainer = el.parentElement.querySelector('.field-error');
            if (error) {
                isValid = false;
                if (errContainer) {
                    errContainer.textContent = error;
                    errContainer.classList.remove('hidden');
                    el.classList.add('border-red-500/80');
                }
            }
        });

        // Anti-injection check
        const suspiciousPattern = /<script|<\/script|javascript:/i;
        const combined = Object.values(fields).map(f => f.el?.value || '').join(' ');
        if (suspiciousPattern.test(combined)) {
            setStatus("Format de message non autorisé.", 'error');
            return;
        }

        if (!isValid) {
            setStatus('Veuillez renseigner correctement les champs requis.', 'error');
            return;
        }

        // Set loading state
        submitBtn.disabled = true;
        submitLabel.textContent = 'TRANSMISSION_EN_COURS...';

        const rawSubject = fields.subject.el.value.trim() || 'Contact depuis Portfolio';
        const payload = {
            name: fields.user_name.el.value.trim(),
            email: fields.user_email.el.value.trim(),
            _subject: `[Portfolio] ${rawSubject}`,
            _replyto: fields.user_email.el.value.trim(),
            message: fields.message.el.value.trim(),
            _template: 'table',
            _captcha: 'false'
        };

        try {
            // Primary Transport: FormSubmit AJAX endpoint to kseverin189@gmail.com
            const res = await fetch('https://formsubmit.co/ajax/kseverin189@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            let data = null;
            try { data = await res.json(); } catch (_) {}

            if (res.ok && data && (data.success === 'true' || data.success === true)) {
                setStatus('✓ Message transmis avec succès ! Je reviens vers vous rapidement.', 'success');
                form.reset();
                return;
            } else if (data && data.message && data.message.toLowerCase().includes('activation')) {
                setStatus('✓ Message envoyé ! (Note : un email d\'activation unique FormSubmit a été envoyé sur kseverin189@gmail.com).', 'success');
                form.reset();
                return;
            }

            // Secondary Transport: serverless /api/send-email if deployed with backend
            const serverlessRes = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_name: payload.name,
                    user_email: payload.email,
                    subject: rawSubject,
                    message: payload.message
                })
            }).catch(() => null);

            if (serverlessRes && serverlessRes.ok) {
                setStatus('✓ Message transmis avec succès ! Je reviens vers vous rapidement.', 'success');
                form.reset();
                return;
            }

            // Tertiary Transport: EmailJS fallback if client keys configured
            if (window.emailjs && isEmailConfigured()) {
                await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
                    user_name: payload.name,
                    user_email: payload.email,
                    subject: rawSubject,
                    message: payload.message,
                    to_email: EMAILJS_CONFIG.TO_EMAIL
                });
                setStatus('✓ Message transmis avec succès ! Je reviens vers vous rapidement.', 'success');
                form.reset();
                return;
            }

            throw new Error('All transports failed');
        } catch (err) {
            // Direct mailto fallback link so message is never lost
            const mailtoUrl = `mailto:kseverin189@gmail.com?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent('Nom: ' + payload.name + '\nEmail: ' + payload.email + '\n\nMessage:\n' + payload.message)}`;
            setStatusHtml(`Transmission réseau indisponible. <a class="underline text-neonGreen hover:text-white" href="${mailtoUrl}">Cliquez ici pour envoyer via votre messagerie</a>.`, 'error');
        } finally {
            submitBtn.disabled = false;
            submitLabel.textContent = 'ENVOYER_MESSAGE';
        }
    });
}

/* ==========================================================================
   6. UTILITIES
   ========================================================================== */
function initDynamicYear() {
    const yearEls = document.querySelectorAll('.current-year');
    const year = new Date().getFullYear();
    yearEls.forEach(el => {
        el.textContent = year;
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}