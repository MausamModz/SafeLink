document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        urlInput: document.getElementById('url-input'),
        generateButton: document.getElementById('generate-button'),
        safelinkOutput: document.getElementById('safelink-output'),
        safelinkText: document.getElementById('safelink-text'),
        copyButton: document.getElementById('copy-button'),
        shareToggle: document.getElementById('share-toggle'),
        toast: document.getElementById('toast'),
        timerDuration: document.getElementById('timer-duration'),
        headerTimerSection: document.getElementById('header-timer'),
        middleTimerSection: document.getElementById('middle-timer'),
        destinationSection: document.getElementById('destination'),
        submitButton: document.getElementById('submit-button')
    };

    let destinationUrl = '';
    let headerTime = 30;
    let middleTime = 30;
    let footerTime = 30;
    let activeToken = '';
    let safeLinkUrl = '';

    const showToast = (message, type = 'success') => {
        elements.toast.textContent = message;
        elements.toast.className = `toast ${type}`;
        elements.toast.style.display = 'block';
        setTimeout(() => {
            elements.toast.style.display = 'none';
        }, 3000);
    };

    const validateUrl = (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const encodeUrl = (url) => encodeURIComponent(btoa(url));
    const decodeUrl = (encodedUrl) => atob(decodeURIComponent(encodedUrl));

    const scrollToSection = (section) => {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const generateToken = () => {
        return Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
    };

    elements.generateButton.addEventListener('click', () => {
        const url = elements.urlInput.value.trim();
        const duration = parseInt(elements.timerDuration.value) || 30;

        if (!validateUrl(url)) {
            showToast('Please enter a valid URL', 'error');
            return;
        }

        const token = generateToken();
        const encodedUrl = encodeUrl(url);
        const safelink = `/safelink/?utm_token=${token}&url=${encodedUrl}&duration=${duration}&stage=header`;

        destinationUrl = url;
        headerTime = duration;
        middleTime = duration;
        footerTime = duration;
        activeToken = token;
        safeLinkUrl = safelink;

        elements.safelinkText.value = `https://freeprivacypolicygeneratortool.github.io${safelink}`;
        elements.safelinkOutput.style.display = 'block';
        elements.copyButton.style.display = 'block';
        elements.shareToggle.style.display = 'block';

        showToast('SafeLink generated!');
    });

    elements.copyButton.addEventListener('click', () => {
        elements.safelinkText.select();
        document.execCommand('copy');
        showToast('Link copied to clipboard!');
    });

    elements.shareToggle.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'SafeLink',
                text: 'Here is your SafeLink:',
                url: elements.safelinkText.value
            }).then(() => {
                showToast('Link shared successfully!');
            }).catch(() => {
                showToast('Error sharing link.', 'error');
            });
        } else {
            showToast('Web Share API not supported on this browser.', 'error');
        }
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

            // ✅ Clean URL from address bar
            window.history.replaceState({}, document.title, '/safelink/');
        }
    });

    elements.submitButton.addEventListener('click', () => {
        window.location.href = destinationUrl;
    });
});
=
