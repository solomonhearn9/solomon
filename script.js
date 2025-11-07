document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.hero-overlay-icon');
    const navOverlay = document.querySelector('.nav-overlay');
    const navPanel = document.querySelector('.nav-panel');
    const navLinks = document.querySelectorAll('.nav-panel-link');
    let lastFocusedElement = null;

    if (!navToggle || !navOverlay || !navPanel) {
        return;
    }

    const openNav = () => {
        if (navOverlay.classList.contains('is-open')) {
            return;
        }

        lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        navOverlay.classList.add('is-open');
        navToggle.classList.add('is-active');
        document.body.classList.add('nav-open');
        navOverlay.setAttribute('aria-hidden', 'false');
        navToggle.setAttribute('aria-expanded', 'true');

        requestAnimationFrame(() => {
            navPanel.focus();
        });
    };

    const closeNav = () => {
        if (!navOverlay.classList.contains('is-open')) {
            return;
        }

        navOverlay.classList.remove('is-open');
        navToggle.classList.remove('is-active');
        document.body.classList.remove('nav-open');
        navOverlay.setAttribute('aria-hidden', 'true');
        navToggle.setAttribute('aria-expanded', 'false');

        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        } else {
            navToggle.focus();
        }
    };

    navToggle.addEventListener('click', () => {
        if (navOverlay.classList.contains('is-open')) {
            closeNav();
        } else {
            openNav();
        }
    });

    navOverlay.addEventListener('click', (event) => {
        if (!navPanel.contains(event.target)) {
            closeNav();
        }
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            closeNav();
        });
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeNav();
        }
    });

    const servicesSection = document.querySelector('.services-section');
    if (servicesSection && window.gsap && window.ScrollTrigger) {
        const { gsap } = window;
        const { ScrollTrigger } = window;

        gsap.registerPlugin(ScrollTrigger);

        const servicesCard = servicesSection.querySelector('.services-card');
        const expertLabel = servicesSection.querySelector('.expert-label');
        const serviceItems = gsap.utils.toArray('.services-list .service-item');

        if (servicesCard && expertLabel && serviceItems.length > 0) {
            const totalSteps = Math.max(serviceItems.length - 1, 1);
            let itemOffsets = [];

            const calculateOffsets = () => {
                const baseline = serviceItems[0].offsetTop;
                itemOffsets = serviceItems.map((item) => item.offsetTop - baseline);
            };

            calculateOffsets();

            const setInitialState = () => {
                const initialOffset = itemOffsets[0] || 0;
                gsap.set(expertLabel, { y: initialOffset });
                serviceItems.forEach((item, index) => {
                    item.classList.toggle('is-active', index === 0);
                });
            };

            ScrollTrigger.addEventListener('refreshInit', () => {
                calculateOffsets();
            });

            ScrollTrigger.addEventListener('refresh', () => {
                setInitialState();
            });

            setInitialState();

            const tl = gsap.timeline({
                defaults: { duration: 1, ease: 'power2.out' },
                scrollTrigger: {
                    trigger: servicesSection,
                    start: 'top top',
                    end: '+=300%',
                    scrub: true,
                    pin: servicesCard,
                    pinSpacing: true,
                    anticipatePin: 1,
                    snap: serviceItems.length > 1 ? {
                        snapTo: (value) => {
                            const step = 1 / totalSteps;
                            return Math.round(value / step) * step;
                        },
                        duration: { min: 0.1, max: 0.3 },
                        ease: 'power1.inOut'
                    } : false,
                    onUpdate: (self) => {
                        const stepFloat = self.progress * totalSteps;
                        const clampedIndex = Math.min(serviceItems.length - 1, Math.max(0, Math.round(stepFloat)));
                        serviceItems.forEach((item, idx) => {
                            item.classList.toggle('is-active', idx === clampedIndex);
                        });
                    }
                }
            });

            serviceItems.slice(1).forEach((_, index) => {
                tl.to(expertLabel, {
                    y: () => itemOffsets[index + 1] || 0
                });
            });

            let resizeFrame = null;
            window.addEventListener('resize', () => {
                if (resizeFrame) {
                    cancelAnimationFrame(resizeFrame);
                }
                resizeFrame = requestAnimationFrame(() => {
                    calculateOffsets();
                    setInitialState();
                    ScrollTrigger.refresh();
                });
            });
        }
    }
});
