/**
 * S.C. KOLIE Portfolio - Unified Technical Engine
 * Architecture: Cyber-Premium
 */

// --- EMAIL CONFIGURATION (contact form) -----------------------------------
// This site is a static frontend (no server/build step), so the contact
// form sends messages using EmailJS (https://www.emailjs.com — free tier
// available). To activate it:
//   1. Create an EmailJS account and an Email Service connected to
//      kseverin189@gmail.com.
//   2. Create an Email Template with variables: user_name, user_email,
//      subject, message.
//   3. Copy your Public Key, Service ID and Template ID below.
// Note: EmailJS's "Public Key" is designed to be used in client-side code
// (like a payment provider's "publishable key") — it is not a secret.
// Actual sending is restricted on EmailJS's side to the allowed
// origins/domains configured in your EmailJS account, so no private
// credential is ever exposed in this file.
const EMAILJS_CONFIG = {
    PUBLIC_KEY: "0otH246Dum7oO7ohI",
    SERVICE_ID: "service_5mlw0ia",
    TEMPLATE_ID: "template_nql415d",
    TO_EMAIL: "kseverin189@gmail.com"
};

function isEmailConfigured() {
    return Object.entries(EMAILJS_CONFIG)
        .filter(([key]) => key !== "TO_EMAIL")
        .every(([, value]) => value && !value.startsWith("YOUR_"));
}

document.addEventListener('DOMContentLoaded', () => {
    initSplashScreen();
    initGlobalShader();
    initHeroOrb();
    initTypingEffect();
    initScrollReveal();
    initFormHandling();
    
    // Set dynamic year in footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// --- 1. INTRO SPLASH SCREEN ---
function initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    const loadingItems = document.querySelectorAll('.loading-item');
    const percentEl = document.getElementById('loading-percent');
    const authSuccess = document.getElementById('auth-success');
    const mainContent = document.getElementById('main-content');
    
    if (!splash) return;

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 5) + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            showAuthSuccess();
        }
        percentEl.textContent = progress.toString().padStart(2, '0') + '%';
        
        // Show loading items progressively
        if (progress > 20) loadingItems[0].classList.add('active');
        if (progress > 45) loadingItems[1].classList.add('active');
        if (progress > 70) loadingItems[2].classList.add('active');
        if (progress > 90) loadingItems[3].classList.add('active');
    }, 50);

    function showAuthSuccess() {
        authSuccess.classList.remove('hidden');
        setTimeout(() => {
            splash.classList.add('hidden');
            mainContent.classList.remove('opacity-0');
            document.body.style.overflow = 'auto'; // Re-enable scroll
        }, 1500);
    }
}

// --- 2. GLOBAL BACKGROUND SHADER ---
function initGlobalShader() {
    const canvas = document.getElementById('shader-canvas-ANIMATION_2');
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    function syncSize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
        }
    }
    window.addEventListener('resize', syncSize);
    syncSize();

    const vs = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const fs = `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;

        float network(vec2 uv, float speed) {
            vec2 grid = fract(uv * 10.0 + u_time * speed) - 0.5;
            float line = smoothstep(0.48, 0.5, abs(grid.x)) + smoothstep(0.48, 0.5, abs(grid.y));
            return line * 0.1;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution.xy;
            vec3 color = vec3(0.02, 0.05, 0.1); // Base Navy
            
            float g = network(uv, 0.05);
            color += vec3(0.0, 0.85, 1.0) * g;
            
            float pulse = sin(u_time * 0.5) * 0.5 + 0.5;
            color += vec3(0.0, 0.85, 1.0) * 0.02 * pulse;

            gl_FragColor = vec4(color, 1.0);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_resolution');

    function render(t) {
        gl.uniform1f(uTime, t * 0.001);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

// --- 3. THREE.JS HERO ORB ---
function initHeroOrb() {
    const container = document.getElementById('threejs-container-ANIMATION_3');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1, 15);
    const material = new THREE.MeshPhongMaterial({
        color: 0x00D9FF,
        wireframe: true,
        transparent: true,
        opacity: 0.4
    });
    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    const light = new THREE.PointLight(0x00D9FF, 2, 50);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x102030));

    camera.position.z = 3;

    function animate() {
        requestAnimationFrame(animate);
        orb.rotation.y += 0.003;
        orb.rotation.x += 0.001;
        const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
        orb.scale.set(scale, scale, scale);
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });

    animate();
}

// --- 4. TERMINAL TYPING EFFECT ---
function initTypingEffect() {
    const text = "initialisation du système : activation du module cybersécurité... accès autorisé. analyse de l'infrastructure et du réseau... build 24.0.1 opérationnel.";
    let index = 0;
    const typingText = document.getElementById('typing-text');
    if (!typingText) return;

    function type() {
        if (index < text.length) {
            typingText.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, 30);
        }
    }
    setTimeout(type, 3000); // Wait for splash
}

// --- 5. SCROLL REVEAL ---
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section').forEach(section => {
        observer.observe(section);
    });
}

// --- 6. DRAWER TOGGLE ---
window.toggleDrawer = function() {
    const drawer = document.getElementById('drawer');
    if (drawer) drawer.classList.toggle('-translate-x-full');
}

// --- 7. CERTIFICATIONS VIEW TOGGLE
window.toggleCertificationsView = function() {
    const grid = document.getElementById('certifications-grid');
    const section = document.getElementById('certifications');
    
    if (!grid || !section) return;
    
    // Toggle between grid and expanded view
    if (grid.classList.contains('expanded-view')) {
        grid.classList.remove('expanded-view');
        grid.style.gridTemplateColumns = '';
        section.classList.remove('expanded-section');
    } else {
        grid.classList.add('expanded-view');
        grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
        section.classList.add('expanded-section');
    }
}

// --- 7.5. CERTIFICATION IMAGE MODAL
window.openCertificationModal = function(imgSrc, title) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('cert-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cert-modal';
        modal.className = 'fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 hidden';
        modal.innerHTML = `
            <button onclick="closeCertificationModal()" class="absolute top-4 right-4 text-white hover:text-secondary-fixed transition-colors">
                <span class="material-symbols-outlined text-4xl">close</span>
            </button>
            <img id="cert-modal-img" class="max-w-full max-h-[90vh] object-contain rounded-lg" src="" alt="">
            <p id="cert-modal-title" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white font-bold text-lg bg-black/50 px-4 py-2 rounded-full"></p>
        `;
        document.body.appendChild(modal);
    }
    
    // Set content
    document.getElementById('cert-modal-img').src = imgSrc;
    document.getElementById('cert-modal-title').textContent = title;
    
    // Show modal
    modal.classList.remove('hidden');
}

window.closeCertificationModal = function() {
    const modal = document.getElementById('cert-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// --- 8. FORM HANDLING ---
function initFormHandling() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    if (window.emailjs && isEmailConfigured()) {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }

    const fields = {
        user_name: { el: form.querySelector('#user_name'), validate: validateName },
        user_email: { el: form.querySelector('#user_email'), validate: validateEmail },
        subject: { el: form.querySelector('#subject'), validate: validateRequired },
        message: { el: form.querySelector('#message'), validate: validateMessage }
    };

    const submitBtn = document.getElementById('submit-btn');
    const submitIcon = document.getElementById('submit-icon');
    const submitLabel = document.getElementById('submit-label');
    const statusEl = document.getElementById('form-status');

    // Live validation as the user types/leaves a field
    Object.values(fields).forEach(({ el, validate }) => {
        if (!el) return;
        el.addEventListener('blur', () => showFieldError(el, validate(el.value)));
        el.addEventListener('input', () => {
            if (!el.closest('.space-y-1').querySelector('.field-error').classList.contains('hidden')) {
                showFieldError(el, validate(el.value));
            }
        });
    });

    function validateRequired(value) {
        return value.trim().length > 0 ? '' : 'Ce champ est requis.';
    }

    function validateName(value) {
        if (!value.trim()) return 'Veuillez indiquer votre nom.';
        if (value.trim().length < 2) return 'Le nom est trop court.';
        return '';
    }

    function validateEmail(value) {
        if (!value.trim()) return 'Veuillez indiquer votre email.';
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(value.trim()) ? '' : 'Adresse email invalide.';
    }

    function validateMessage(value) {
        if (!value.trim()) return 'Veuillez écrire un message.';
        if (value.trim().length < 10) return 'Votre message est trop court (10 caractères min.).';
        return '';
    }

    function showFieldError(el, errorMessage) {
        const errorEl = el.closest('.space-y-1').querySelector('.field-error');
        if (!errorEl) return true === !errorMessage;
        if (errorMessage) {
            errorEl.textContent = errorMessage;
            errorEl.classList.remove('hidden');
            el.classList.add('border-red-500/70');
        } else {
            errorEl.textContent = '';
            errorEl.classList.add('hidden');
            el.classList.remove('border-red-500/70');
        }
        return !errorMessage;
    }

    function setStatus(message, type) {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.classList.remove('text-red-400', 'text-secondary-fixed', 'text-on-surface-variant');
        statusEl.classList.add(
            type === 'error' ? 'text-red-400' : type === 'success' ? 'text-secondary-fixed' : 'text-on-surface-variant'
        );
    }

    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        submitIcon.textContent = isLoading ? 'sync' : 'send';
        submitIcon.classList.toggle('animate-spin', isLoading);
        submitLabel.textContent = isLoading ? 'TRANSMISSION...' : 'ENVOYER_MESSAGE';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        setStatus('', 'idle');

        // Validate every field; block submission on the first failure
        let isValid = true;
        Object.values(fields).forEach(({ el, validate }) => {
            if (!el) return;
            const error = validate(el.value);
            if (!showFieldError(el, error)) isValid = false;
        });

        // Basic protection against malformed / suspicious input (e.g. raw HTML/script injection)
        const suspiciousPattern = /<script|<\/script|javascript:/i;
        const allValues = Object.values(fields).map(({ el }) => el?.value || '').join(' ');
        if (suspiciousPattern.test(allValues)) {
            setStatus("Votre message contient du contenu non autorisé.", 'error');
            return;
        }

        if (!isValid) {
            setStatus('Veuillez corriger les champs en surbrillance.', 'error');
            return;
        }

        if (!window.emailjs || !isEmailConfigured()) {
            console.warn('[Contact form] EmailJS is not configured yet — see EMAILJS_CONFIG in script.js.');
            setStatus("Le formulaire n'est pas encore configuré. Merci de me contacter directement à kseverin189@gmail.com.", 'error');
            return;
        }

        setLoading(true);

        const templateParams = {
            user_name: fields.user_name.el.value.trim(),
            user_email: fields.user_email.el.value.trim(),
            subject: fields.subject.el.value.trim(),
            message: fields.message.el.value.trim(),
            to_email: EMAILJS_CONFIG.TO_EMAIL
        };

        emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, templateParams)
            .then(() => {
                setStatus('Message transmis avec succès ! Je reviens vers vous rapidement.', 'success');
                form.reset();
            })
            .catch((err) => {
                console.error('[Contact form] EmailJS send failed:', err);
                setStatus("Échec de l'envoi. Merci de réessayer ou de m'écrire directement à kseverin189@gmail.com.", 'error');
            })
            .finally(() => {
                setLoading(false);
            });
    });
}