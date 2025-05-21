const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
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

const headerTimerSection = document.getElementById('header-timer');
const middleTimerSection = document.getElementById('middle-timer');
const destinationSection = document.getElementById('destination-section');
const headerTimerCount = document.getElementById('header-timer-count');
const middleTimerCount = document.getElementById('middle-timer-count');
const footerTimerCount = document.getElementById('footer-timer-count');
const headerProgressBar = document.getElementById('header-progress-bar');
const middleProgressBar = document.getElementById('middle-progress-bar');
const footerProgressBar = document.getElementById('footer-progress-bar');
const headerTimerMessage = document.getElementById('header-timer-message');
const middleTimerMessage = document.getElementById('middle-timer-message');
const footerTimerMessage = document.getElementById('footer-timer-message');
const headerTimerText = document.getElementById('header-timer-text');
const middleTimerText = document.getElementById('middle-timer-text');
const footerTimerText = document.getElementById('footer-timer-text');
const headerProgressContainer = document.getElementById('header-progress-container');
const middleProgressContainer = document.getElementById('middle-progress-container');
const footerProgressContainer = document.getElementById('footer-progress-container');
const headerSpinner = document.getElementById('header-spinner');
const middleSpinner = document.getElementById('middle-spinner');
const footerSpinner = document.getElementById('footer-spinner');
const robotButton = document.getElementById('robot-button');
const verifyButton = document.getElementById('verify-button');
const readyButton = document.getElementById('ready-button');
const destinationLink = document.getElementById('destination-link');
const safelinkOutput = document.getElementById('safelink-text');
const copyButton = document.getElementById('copy-button');
const errorMessage = document.getElementById('error-message');
const toast = document.getElementById('toast');

function generateToken() {
    const timestamp = Date.now().toString(36);
    return Math.random().toString(36).substr(2, 10) + timestamp;
}

function validateUrl(url) {
    const regex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    if (!regex.test(url)) {
        console.warn(`Invalid URL attempt: ${url}`);
        return false;
    }
    return true;
}

function isTokenExpired(token) {
    const timestamp = parseInt(token.slice(-13), 36);
    return Date.now() - timestamp > TOKEN_EXPIRY_MS;
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.style.background = type === 'error' ? '#dc2626' : '#1e40af';
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function updateAnalytics(key) {
    analytics[key]++;
    console.log(`Analytics: ${key} = ${analytics[key]}`);
}

function encodeUrl(url) {
    return btoa(url);
}

function decodeUrl(encodedUrl) {
    try {
        return atob(encodedUrl);
    } catch (e) {
        console.warn(`Invalid Base64 URL: ${encodedUrl}`);
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
    safelinkOutput.textContent = safeLinkUrl;
}

function generateSafeLink() {
    const urlInput = document.getElementById('destination-url').value.trim();
    const timerDuration = parseInt(document.getElementById('timer-duration').value);
    if (!validateUrl(urlInput)) {
        showToast('Please enter a valid URL (e.g., https://example.com)', 'error');
        return;
    }
    destinationUrl = urlInput;
    activeToken = generateToken();
    headerTime = timerDuration;
    middleTime = timerDuration;
    footerTime = timerDuration;
    updateQueryParams('header');
    copyButton.style.display = 'inline-block';
    updateAnalytics('linksCreated');
    headerTimerSection.style.display = 'block';
    headerTimerMessage.textContent = 'Click "I\'m not a Robot" to start verification.';
    showToast('SafeLink generated successfully!');
}

function startHeaderTimer() {
    if (headerInterval) clearInterval(headerInterval);
    robotButton.style.display = 'none';
    headerSpinner.style.display = 'block';
    setTimeout(() => {
        headerSpinner.style.display = 'none';
        headerTimerText.style.display = 'block';
        headerProgressContainer.style.display = 'block';
        headerTimerMessage.textContent = 'Please wait for the first timer to complete.';
    }, 300);
    headerInterval = setInterval(() => {
        if (headerTime > 0) {
            headerTime--;
            headerTimerCount.textContent = headerTime;
            const progress = ((parseInt(new URLSearchParams(window.location.search).get('duration')) - headerTime) / parseInt(new URLSearchParams(window.location.search).get('duration'))) * 100;
            headerProgressBar.style.width = `${progress}%`;
        } else {
            clearInterval(headerInterval);
            headerTimerSection.style.display = 'none';
            middleTimerSection.style.display = 'block';
            middleTimerMessage.textContent = 'Click "Verify" to continue verification.';
            updateQueryParams('middle');
        }
    }, 1000);
}

function startMiddleTimer() {
    if (middleInterval) clearInterval(middleInterval);
    verifyButton.style.display = 'none';
    middleSpinner.style.display = 'block';
    setTimeout(() => {
        middleSpinner.style.display = 'none';
        middleTimerText.style.display = 'block';
        middleProgressContainer.style.display = 'block';
        middleTimerMessage.textContent = 'Please wait for the second timer to complete.';
    }, 300);
    middleInterval = setInterval(() => {
        if (middleTime > 0) {
            middleTime--;
            middleTimerCount.textContent = middleTime;
            const progress = ((parseInt(new URLSearchParams(window.location.search).get('duration')) - middleTime) / parseInt(new URLSearchParams(window.location.search).get('duration'))) * 100;
            middleProgressBar.style.width = `${progress}%`;
        } else {
            clearInterval(middleInterval);
            middleTimerSection.style.display = 'none';
            destinationSection.style.display = 'block';
            footerTimerMessage.textContent = 'Click "I\'m Ready" to start the final timer.';
            updateQueryParams('footer');
        }
    }, 1000);
}

function startFooterTimer() {
    if (footerInterval) clearInterval(footerInterval);
    readyButton.style.display = 'none';
    footerSpinner.style.display = 'block';
    setTimeout(() => {
        footerSpinner.style.display = 'none';
        footerTimerText.style.display = 'block';
        footerProgressContainer.style.display = 'block';
        footerTimerMessage.textContent = 'Please wait for the final timer to complete.';
    }, 300);
    footerInterval = setInterval(() => {
        if (footerTime > 0) {
            footerTime--;
            footerTimerCount.textContent = footerTime;
            const progress = ((parseInt(new URLSearchParams(window.location.search).get('duration')) - footerTime) / parseInt(new URLSearchParams(window.location.search).get('duration'))) * 100;
            footerProgressBar.style.width = `${progress}%`;
        } else {
            clearInterval(footerInterval);
            footerTimerText.style.display = 'none';
            footerProgressContainer.style.display = 'none';
            footerTimerMessage.textContent = 'Click below to visit your destination!';
            if (destinationUrl) {
                destinationLink.href = destinationUrl;
                destinationLink.classList.add('visible');
                updateAnalytics('linksCompleted');
                showToast('Verification complete! Ready to visit your URL.');
            } else {
                showToast('Error: Destination URL is unavailable.', 'error');
            }
        }
    }, 1000);
}

robotButton.addEventListener('click', startHeaderTimer);
verifyButton.addEventListener('click', startMiddleTimer);
readyButton.addEventListener('click', startFooterTimer);

destinationLink.addEventListener('click', (e) => {
    if (!destinationUrl) {
        e.preventDefault();
        showToast('Error: No valid destination URL found.', 'error');
    }
});

copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText('https://freeprivacypolicygeneratortool.github.io' + safeLinkUrl).then(() => {
        showToast('SafeLink copied to clipboard!');
        copyButton.textContent = 'Copied!';
        setTimeout(() => {
            copyButton.textContent = 'Copy SafeLink';
        }, 1500);
    }).catch(() => {
        showToast('Failed to copy SafeLink.', 'error');
    });
});

// High contrast mode toggle
document.querySelector('.contrast-toggle').addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
});

// Keyboard navigation
document.querySelectorAll('.cta-button, .copy-button, .destination-link, .contrast-toggle').forEach(button => {
    button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            button.click();
        }
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    if (anchor.id !== 'destination-link') {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            const headerOffset = document.querySelector('header').offsetHeight;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    }
});

// Nav link active state
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 60) {
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

// Load SafeLink from query parameters
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('utm_token');
    const encodedUrl = urlParams.get('url');
    const duration = parseInt(urlParams.get('duration'));
    const stage = urlParams.get('stage');

    if (token && encodedUrl && duration && stage) {
        if (isTokenExpired(token)) {
            showToast('SafeLink has expired.', 'error');
            return;
        }
        const decodedUrl = decodeUrl(encodedUrl);
        if (!validateUrl(decodedUrl)) {
            showToast('Invalid destination URL in SafeLink.', 'error');
            return;
        }
        destinationUrl = decodedUrl;
        headerTime = duration;
        middleTime = duration;
        footerTime = duration;
        activeToken = token;
        safeLinkUrl = `/safelink/?${urlParams.toString()}`;
        safelinkOutput.textContent = safeLinkUrl;
        copyButton.style.display = 'inline-block';
        document.getElementById('timer-duration').value = duration;
        if (stage === 'header') {
            headerTimerSection.style.display = 'block';
            headerTimerMessage.textContent = 'Click "I\'m not a Robot" to start verification.';
        } else if (stage === 'middle') {
            headerTimerSection.style.display = 'none';
            middleTimerSection.style.display = 'block';
            middleTimerMessage.textContent = 'Click "Verify" to continue verification.';
        } else if (stage === 'footer') {
            headerTimerSection.style.display = 'none';
            middleTimerSection.style.display = 'none';
            destinationSection.style.display = 'block';
            footerTimerMessage.textContent = 'Click "I\'m Ready" to start the final timer.';
        }
    }
});