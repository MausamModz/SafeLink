// Updated SafeLink Timer Script with Clean URL Loading
// Author: Jaydatt Khodave

let headerTime = 30;
let middleTime = 30;
let footerTime = 30;
let destinationUrl = '';
let activeToken = '';
let safeLinkUrl = '';
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
    const pattern = /^(https?:\/\/)(([a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})(\/[\w\-\.~!$&'()*+,;=:@%]*)*$/;
    return pattern.test(url.trim());
}

function showToast(message, type = 'success') {
    elements.toast.textContent = message;
    elements.toast.style.backgroundColor = type === 'error' ? '#dc2626' : '#1e40af';
    elements.toast.classList.add('visible');
    setTimeout(() => elements.toast.classList.remove('visible'), 2000);
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.add('visible');
    setTimeout(() => elements.errorMessage.classList.remove('visible'), 2000);
}

function updateAnalytics(type) {
    if (type in analytics) analytics[type]++;
    elements.linksCreated.textContent = analytics.linksCreated;
    elements.linksCompleted.textContent = analytics.linksCompleted;
}

function encodeUrl(url) {
    try {
        return btoa(url);
    } catch {
        return '';
    }
}

function decodeUrl(str) {
    try {
        return atob(str);
    } catch {
        return '';
    }
}

function updateCleanUrl() {
    const cleanUrl = `${location.origin}/safelink/${activeToken}`;
    history.replaceState({}, '', cleanUrl);
}

function generateSafeLink() {
    const url = elements.urlInput.value.trim();
    const duration = parseInt(document.getElementById('timer-duration').value);

    if (!validateUrl(url)) return showError('Enter a valid URL');

    destinationUrl = url;
    activeToken = generateToken();
    headerTime = middleTime = footerTime = duration;
    updateCleanUrl();

    elements.safelinkText.value = `${location.origin}/safelink/${activeToken}`;
    elements.safelinkOutput.style.display = 'block';
    elements.copyButton.style.display = 'block';
    elements.shareToggle.style.display = 'block';
    updateAnalytics('linksCreated');
    elements.headerTimerSection.style.display = 'block';
    scrollToSection(elements.headerTimerSection);
    showToast('SafeLink created');
}

function copySafeLink() {
    const link = elements.safelinkText.value;
    navigator.clipboard.writeText(link).then(() => showToast('URL copied')).catch(() => showToast('Copy failed', 'error'));
}

function scrollToSection(el) {
    window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
}

function startTimer(section, time, onFinish) {
    let interval = setInterval(() => {
        if (time > 0) {
            section.querySelector('.timer-count').textContent = --time;
        } else {
            clearInterval(interval);
            section.style.display = 'none';
            onFinish();
        }
    }, 1000);
    return interval;
}

function startHeaderTimer() {
    elements.robotButton.style.display = 'none';
    elements.headerSpinner.style.display = 'block';
    setTimeout(() => {
        elements.headerSpinner.style.display = 'none';
        elements.headerTimerText.style.display = 'block';
        headerInterval = startTimer(elements.headerTimerSection, headerTime, () => {
            elements.middleTimerSection.style.display = 'block';
            scrollToSection(elements.middleTimerSection);
        });
    }, 300);
}

function startMiddleTimer() {
    elements.verifyButton.style.display = 'none';
    elements.middleSpinner.style.display = 'block';
    setTimeout(() => {
        elements.middleSpinner.style.display = 'none';
        elements.middleTimerText.style.display = 'block';
        middleInterval = startTimer(elements.middleTimerSection, middleTime, () => {
            elements.destinationSection.style.display = 'block';
            scrollToSection(elements.destinationSection);
        });
    }, 300);
}

function startFooterTimer() {
    elements.readyButton.style.display = 'none';
    elements.footerSpinner.style.display = 'block';
    setTimeout(() => {
        elements.footerSpinner.style.display = 'none';
        elements.footerTimerText.style.display = 'block';
        footerInterval = startTimer(elements.destinationSection, footerTime, () => {
            if (destinationUrl) {
                elements.destinationLink.href = destinationUrl;
                elements.destinationLink.classList.add('visible');
                updateAnalytics('linksCompleted');
                showToast('Ready to visit');
            }
        });
    }, 300);
}

// Event listeners
elements.robotButton.addEventListener('click', startHeaderTimer);
elements.verifyButton.addEventListener('click', startMiddleTimer);
elements.readyButton.addEventListener('click', startFooterTimer);
elements.destinationLink.addEventListener('click', e => {
    if (!destinationUrl) e.preventDefault();
});

document.querySelectorAll('.copy-button').forEach(btn => btn.addEventListener('click', copySafeLink));
document.getElementById('generate-btn').addEventListener('click', generateSafeLink);

window.addEventListener('DOMContentLoaded', () => {
    elements.urlInput.focus();
    const urlParams = new URLSearchParams(window.location.search);
    const encoded = urlParams.get('url');
    const token = urlParams.get('utm_token');
    const duration = parseInt(urlParams.get('duration')) || 30;

    if (encoded && token) {
        const decoded = decodeUrl(encoded);
        if (!validateUrl(decoded)) return showToast('Invalid URL', 'error');

        destinationUrl = decoded;
        activeToken = token;
        headerTime = middleTime = footerTime = duration;
        elements.safelinkText.value = `${location.origin}/safelink/${token}`;
        elements.safelinkOutput.style.display = 'block';
        elements.copyButton.style.display = 'block';
        elements.shareToggle.style.display = 'block';
    }
});
