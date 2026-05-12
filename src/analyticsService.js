import posthog from 'posthog-js';

const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';

export const initAnalytics = () => {
    if (!posthogKey) return;

    posthog.init(posthogKey, {
        api_host: posthogHost,
        capture_pageview: true,
    });
};

export const trackEvent = (eventName, properties = {}) => {
    if (!posthogKey) return;
    posthog.capture(eventName, properties);
};
