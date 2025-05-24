// SafeLink Timer Redirect Script
// Author: Jaydatt Mahendra Khodave

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
    urlInput: document.getElementById('destination-url'),
    timerDurationInput: document.getElementById('timer-duration')
};

function generateToken() {
    return Math.random().toString(36).substr(2, 10) + Date.now().toString(36);
}

function validateUrl(url) {
    const regex = /^(https?:\/\/)((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|localhost)(\/[\w\-@:%_\+.~#?,&//=]*)?$/;
    return regex.test(url.trim());
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
        console.error('Encoding failed:', e);
        return '';
    }
}

function decodeUrl(encodedUrl) {
    try {
        return atob(encodedUrl);
    } catch (e) {
        console.error('Decoding failed:', e);
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
    history.replaceState({}, '', safeLinkUrl);
    elements.safelinkText.value = `https://freeprivacypolicygeneratortool.github.io${safeLinkUrl}`;
}

function generateSafeLink() {
    const url = elements.urlInput.value;
    const timerDuration = parseInt(elements.timerDurationInput.value);

    if (!validateUrl(url)) return showError('Enter a valid URL');

    destinationUrl = url.trim();
    activeToken = generateToken();
    headerTime = middleTime = footerTime = timerDuration;

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
    navigator.clipboard?.writeText(text)
        .then(() => showToast('URL is Copied'))
        .catch(err => fallbackCopy(text));
}

function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('URL is Copied');
    } catch {
        showToast('Copy Failed', 'error');
    }
    document.body.removeChild(textarea);
}

function toggleShare() {
    elements.socialShare.style.display = elements.socialShare.style.display === 'flex' ? 'none' : 'flex';
}

function shareOn(platform) {
    const text = encodeURIComponent(`Check out this SafeLink: ${elements.safelinkText.value}`);
    const urls = {
        twitter: `https://twitter.com/intent/tweet?text=${text}`,
        whatsapp: `https://api.whatsapp.com/send?text=${text}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${text}`
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
    showToast(`Shared on ${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
}

function scrollToSection(section) {
    const offset = 70;
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
}

function startTimer(section, timeKey, intervalRef, nextSection, queryStage) {
    if (intervalRef) clearInterval(intervalRef);

    elements[`${section}Spinner`].style.display = 'block';
    elements[`${section}Button`].style.display = 'none';

    setTimeout(() => {
        elements[`${section}Spinner`].style.display = 'none';
        elements[`${section}TimerText`].style.display = 'block';
    }, 300);

    intervalRef = setInterval(() => {
        if (window[timeKey] > 0) {
            window[timeKey]--;
            elements[`${section}TimerCount`].textContent = window[timeKey];
        } else {
            clearInterval(intervalRef);
            elements[`${section}TimerText`].style.display = 'none';
            elements[`${section}TimerSection`].classList.remove('active');
            elements[`${section}TimerSection`].style.display = 'none';

            if (nextSection) {
                elements[`${nextSection}TimerSection`].style.display = 'block';
                elements[`${nextSection}TimerSection`].classList.add('active');
                updateQueryParams(queryStage);
                scrollToSection(elements[`${nextSection}TimerSection`]);
            } else {
                if (destinationUrl) {
                    elements.destinationLink.href = destinationUrl;
                    elements.destinationLink.classList.add('visible');
                    updateAnalytics('linksCompleted');
                    showToast('Ready to visit');
                } else {
                    showToast('No URL found', 'error');
                }
            }
        }
    }, 1000);

    return intervalRef;
}

elements.robotButton.onclick = () => headerInterval = startTimer('header', 'headerTime', headerInterval, 'middle', 'middle');
elements.verifyButton.onclick = () => middleInterval = startTimer('middle', 'middleTime', middleInterval, 'footer', 'footer');
elements.readyButton.onclick = () => footerInterval = startTimer('footer', 'footerTime', footerInterval, null, 'final');

elements.copyButton.onclick = copySafeLink;
elements.shareToggle.onclick = toggleShare;

document.getElementById('generate-button').onclick = generateSafeLink;
document.getElementById('share-twitter').onclick = () => shareOn('twitter');
document.getElementById('share-whatsapp').onclick = () => shareOn('whatsapp');
document.getElementById('share-linkedin').onclick = () => shareOn('linkedin');

document.addEventListener('DOMContentLoaded', () => {
    elements.urlInput.focus();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('utm_token');
    const encodedUrl = urlParams.get('url');
    const duration = parseInt(urlParams.get('duration')) || 30;
    const stage = urlParams.get('stage');

    if (token && encodedUrl && stage) {
        const decodedUrl = decodeUrl(encodedUrl);
        if (!validateUrl(decodedUrl)) return showToast('Invalid URL', 'error');

        destinationUrl = decodedUrl;
        activeToken = token;
        headerTime = middleTime = footerTime = duration;
        safeLinkUrl = `/safelink/?${urlParams.toString()}`;

        elements.safelinkText.value = `https://freeprivacypolicygeneratortool.github.io${safeLinkUrl}`;
        elements.safelinkOutput.style.display = 'block';
        elements.copyButton.style.display = 'block';
        elements.shareToggle.style.display = 'block';
        elements.timerDurationInput.value = duration;

        if (stage === 'header') {
            elements.headerTimerSection.style.display = 'block';
            elements.headerTimerSection.classList.add('active');
            scrollToSection(elements.headerTimerSection);
        } else if (stage === 'middle') {
            elements.middleTimerSection.style.display = 'block';
            elements.middleTimerSection.classList.add('active');
            scrollToSection(elements.middleTimerSection);
        } else if (stage === 'footer') {
            elements.destinationSection.style.display = 'block';
            elements.destinationSection.classList.add('active');
            scrollToSection(elements.destinationSection);
        }
    }
});
