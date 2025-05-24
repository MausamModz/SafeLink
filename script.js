let headerTime = 30;
let middleTime = 30;
let footerTime = 30;
let destinationUrl = '';
let safeLinkUrl = '';
let activeToken = '';
let headerInterval = null;
let middleInterval = null;
let footerInterval = null;
let analytics = { linksCreated: 0, linksCompleted: 0 };

const elements = {
    headerTimerSection: document.getElementById('header-timer'),
    middleTimerSection: document.getElementById('middle-timer'),
    destinationSection: document.getElementById('destination-section'),
    headerTimerCount: document.getElementById('header-timer-count'),
    middleTimerCount: document.getElementById('middle-timer-count'),
    footerTimerCount: document.getElementById('footer-timer-count'),
    headerTimerText: document.getElementById('header-timer-text'),
    middleTimerText: document.getElementById('middle-timer-text'),
    footerTimerText: document.getElementById('footer-timer-text'),
    headerSpinner: document.getElementById('header-spinner'),
    middleSpinner: document.getElementById('middle-spinner'),
    footerSpinner: document.getElementById('footer-spinner'),
    robotButton: document.getElementById('robot-button'),
    verifyButton: document.getElementById('verify-button'),
    readyButton: document.getElementById('ready-button'),
    destinationLink: document.getElementById('destination-link'),
    safelinkOutput: document.getElementById('safelink-output'),
    safelinkText: document.getElementById('safelink-text'),
    copyButton: document.getElementById('copy-button'),
    shareToggle: document.getElementById('share-toggle'),
    errorMessage: document.getElementById('error-message'),
    toast: document.getElementById('toast'),
    socialShare: document.getElementById('social-share'),
    linksCreated: document.getElementById('links-created'),
    linksCompleted: document.getElementById('links-completed'),
    urlInput: document.getElementById('destination-url')
};

function generateToken() {
    return Math.random().toString(36).substr(2, 10) + Date.now().toString(36);
}

function validateUrl(url) {
    url = url.trim();
    const regex = /^(https?:\/\/)((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|localhost)(\/[-a-zA-Z0-9@:%._\+~#?&//=]*)?$/;
    return regex.test(url);
}

function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.style.background = type === 'error' ? '#dc2626' : '#1e40af';
    elements.toast.classList.add('visible');
    setTimeout(() => elements.toast.classList.remove('visible'), 1800);
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.add('visible');
    setTimeout(() => elements.errorMessage.classList.remove('visible'), 2000);
}

function updateAnalytics(key) {
    analytics[key]++;
    elements.linksCreated.textContent = analytics.linksCreated;
    elements.linksCompleted.textContent = analytics.linksCompleted;
}

function encodeUrl(url) {
    try {
        return btoa(url);
    } catch (e) {
        console.error(`Failed to encode URL: ${url}`);
        return '';
    }
}

function decodeUrl(encodedUrl) {
    try {
        return atob(encodedUrl);
    } catch (e) {
        console.error(`Invalid Base64 URL: ${encodedUrl}`);
        return '';
    }
}

function updateQueryParams(stage) {
    const params = new URLSearchParams({
        utm_token: activeToken,
        url: encodeUrl(destinationUrl),
        duration: headerTime,
        stage
    });
    safeLinkUrl = `/safelink/?${params.toString()}`;
    window.history.replaceState({}, '', safeLinkUrl);
    elements.safelinkText.value = `https://freeprivacypolicygeneratortool.github.io${safeLinkUrl}`;
}

function generateSafeLink() {
    const url = elements.urlInput.value.trim();
    const timerDuration = parseInt(document.getElementById('timer-duration').value);
    if (!validateUrl(url)) {
        showError('Enter a valid URL');
        return;
    }
    destinationUrl = url;
    activeToken = generateToken();
    headerTime = timerDuration;
    middleTime = timerDuration;
    footerTime = timerDuration;
    updateQueryParams('header');
    elements.safelinkOutput.style.display = 'block';
    elements.copyButton.style.display = 'block';
    elements.shareToggle.style.display = 'block';
    updateAnalytics('linksCreated');
    elements.headerTimerSection.style.display = 'block';
    elements.headerTimerSection.classList.add('active');
    showToast('SafeLink created');
    scrollToSection(elements.headerTimerSection);
}

function copySafeLink() {
    const text = elements.safelinkText.value;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('URL is Copied');
        }).catch(err => {
            console.error('Clipboard API failed:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('URL is Copied');
    } catch (err) {
        console.error('Fallback copy failed:', err);
        showToast('Copy Failed', 'error');
    }
    document.body.removeChild(textarea);
}

function toggleShare() {
    elements.socialShare.style.display = elements.socialShare.style.display === 'flex' ? 'none' : 'flex';
}

function shareOnTwitter() {
    const text = encodeURIComponent(`Check out this SafeLink: ${elements.safelinkText.value}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    showToast('Shared on Twitter');
}

function shareOnWhatsApp() {
    const text = encodeURIComponent(`Check out this SafeLink: ${elements.safelinkText.value}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    showToast('Shared on WhatsApp');
}

function shareOnLinkedIn() {
    const url = encodeURIComponent(elements.safelinkText.value);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    showToast('Shared on LinkedIn');
}

function scrollToSection(section) {
    const headerOffset = 70;
    const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: sectionTop, behavior: 'smooth' });
}

function startHeaderTimer() {
    if (headerInterval) clearInterval(headerInterval);
    elements.robotButton.style.display = 'none';
    elements.headerSpinner.style.display = 'block';
    setTimeout(() => {
        elements.headerSpinner.style.display = 'none';
        elements.headerTimerText.style.display = 'block';
    }, 300);
    headerInterval = setInterval(() => {
        if (headerTime > 0) {
            headerTime--;
            elements.headerTimerCount.textContent = headerTime;
        } else {
            clearInterval(headerInterval);
            elements.headerTimerSection.style.display = 'none';
            elements.headerTimerSection.classList.remove('active');
            elements.middleTimerSection.style.display = 'block';
            elements.middleTimerSection.classList.add('active');
            updateQueryParams('middle');
            scrollToSection(elements.middleTimerSection);
        }
    }, 1000);
}

function startMiddleTimer() {
    if (middleInterval) clearInterval(middleInterval);
    elements.verifyButton.style.display = 'none';
    elements.middleSpinner.style.display = 'block';
    setTimeout(() => {
        elements.middleSpinner.style.display = 'none';
        elements.middleTimerText.style.display = 'block';
    }, 300);
    middleInterval = setInterval(() => {
        if (middleTime > 0) {
            middleTime--;
            elements.middleTimerCount.textContent = middleTime;
        } else {
            clearInterval(middleInterval);
            elements.middleTimerSection.style.display = 'none';
            elements.middleTimerSection.classList.remove('active');
            elements.destinationSection.style.display = 'block';
            elements.destinationSection.classList.add('active');
            updateQueryParams('footer');
            scrollToSection(elements.destinationSection);
        }
    }, 1000);
}

function startFooterTimer() {
    if (footerInterval) clearInterval(footerInterval);
    elements.readyButton.style.display = 'none';
    elements.footerSpinner.style.display = 'block';
    setTimeout(() => {
        elements.footerSpinner.style.display = 'none';
        elements.footerTimerText.style.display = 'block';
    }, 300);
    footerInterval = setInterval(() => {
        if (footerTime > 0) {
            footerTime--;
            elements.footerTimerCount.textContent = footerTime;
        } else {
            clearInterval(footerInterval);
            elements.footerTimerText.style.display = 'none';
            if (destinationUrl) {
                elements.destinationLink.href = destinationUrl;
                elements.destinationLink.classList.add('visible');
                updateAnalytics('linksCompleted');
                showToast('Ready to visit');
            } else {
                showToast('No URL found', 'error');
            }
        }
    }, 1000);
}

elements.robotButton.addEventListener('click', startHeaderTimer);
elements.verifyButton.addEventListener('click', startMiddleTimer);
elements.readyButton.addEventListener('click', startFooterTimer);

elements.destinationLink.addEventListener('click', (e) => {
    if (!destinationUrl) {
        e.preventDefault();
        showToast('No URL found', 'error');
    }
});

document.querySelectorAll('.cta-button, .copy-button, .destination-link, .share-button, .share-toggle').forEach(el => {
    el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            el.click();
        }
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.id !== 'destination-link') {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const headerOffset = 70;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        });
    }
});

window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 70) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

window.addEventListener('load', () => {
    elements.urlInput.focus();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('utm_token');
    const encodedUrl = urlParams.get('url');
    const duration = parseInt(urlParams.get('duration')) || 30;
    const stage = urlParams.get('stage');
    if (token && encodedUrl && duration && stage) {
        const decodedUrl = decodeUrl(encodedUrl);
        if (!validateUrl(decodedUrl)) {
            showToast('Invalid URL', 'error');
            return;
        }
        destinationUrl = decodedUrl;
        headerTime = duration;
        middleTime = duration;
        footerTime = duration;
        activeToken = token;
        safeLinkUrl = `/safelink/?${urlParams.toString()}`;
        elements.safelinkText.value = `https://freeprivacypolicygeneratortool.github.io${safeLinkUrl}`;
        elements.safelinkOutput.style.display = 'block';
        elements.copyButton.style.display = 'block';
        elements.shareToggle.style.display = 'block';
        document.getElementById('timer-duration').value = duration;
        if (stage === 'header') {
            elements.headerTimerSection.style.display = 'block';
            elements.headerTimerSection.classList.add('active');
            scrollToSection(elements.headerTimerSection);
        } else if (stage === 'middle') {
            elements.headerTimerSection.style.display = 'none';
            elements.middleTimerSection.style.display = 'block';
            elements.middleTimerSection.classList.add('active');
            scrollToSection(elements.middleTimerSection);
        } else if (stage === 'footer') {
            elements.headerTimerSection.style.display = 'none';
            elements.middleTimerSection.style.display = 'none';
            elements.destinationSection.style.display = 'block';
            elements.destinationSection.classList.add('active');
            scrollToSection(elements.destinationSection);
        }
    }
});

// [EXISTING CODE ABOVE OMITTED FOR BREVITY]

window.addEventListener('load', () => {
    elements.urlInput.focus();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('utm_token');
    const encodedUrl = urlParams.get('url');
    const duration = parseInt(urlParams.get('duration')) || 30;
    const stage = urlParams.get('stage');
    if (token && encodedUrl && duration && stage) {
        const decodedUrl = decodeUrl(encodedUrl);
        if (!validateUrl(decodedUrl)) {
            showToast('Invalid URL', 'error');
            return;
        }
        destinationUrl = decodedUrl;
        headerTime = duration;
        middleTime = duration;
        footerTime = duration;
        activeToken = token;
        safeLinkUrl = `/safelink/?${urlParams.toString()}`;
        elements.safelinkText.value = `https://freeprivacypolicygeneratortool.github.io${safeLinkUrl}`;
        elements.safelinkOutput.style.display = 'block';
        elements.copyButton.style.display = 'block';
        elements.shareToggle.style.display = 'block';
        document.getElementById('timer-duration').value = duration;
        if (stage === 'header') {
            elements.headerTimerSection.style.display = 'block';
            elements.headerTimerSection.classList.add('active');
            scrollToSection(elements.headerTimerSection);
        } else if (stage === 'middle') {
            elements.headerTimerSection.style.display = 'none';
            elements.middleTimerSection.style.display = 'block';
            elements.middleTimerSection.classList.add('active');
            scrollToSection(elements.middleTimerSection);
        } else if (stage === 'footer') {
            elements.headerTimerSection.style.display = 'none';
            elements.middleTimerSection.style.display = 'none';
            elements.destinationSection.style.display = 'block';
            elements.destinationSection.classList.add('active');
            scrollToSection(elements.destinationSection);
        }

        // ✅ Clean URL after load (remove UTM & encoded URL from address bar)
        window.history.replaceState({}, '', window.location.pathname);
    }
});
