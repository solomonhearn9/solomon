document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.hero-overlay-icon');
    const navOverlay = document.querySelector('.nav-overlay');
    const navPanel = document.querySelector('.nav-panel');
    const navLinks = document.querySelectorAll('.nav-panel-link');
    let lastFocusedElement = null;

    if (navToggle && navOverlay && navPanel) {
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
    }

    const servicesSection = document.querySelector('.services-section');
    if (!servicesSection) {
        return;
    }

    const servicesCard = servicesSection.querySelector('.services-card');
    const expertLabel = servicesSection.querySelector('.expert-label');
    const serviceItems = Array.from(servicesSection.querySelectorAll('.services-list .service-item'));
    if (!servicesCard || !expertLabel || serviceItems.length === 0) {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let servicesTimeline = null;
    let resizeHandler = null;
    let itemOffsets = [];

    const calculateOffsets = () => {
        const baseline = serviceItems[0].offsetTop;
        itemOffsets = serviceItems.map((item) => item.offsetTop - baseline);
    };

    const applyLabelTransform = (offset) => {
        if (window.gsap) {
            window.gsap.set(expertLabel, { y: offset });
        } else {
            expertLabel.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
    };

    const setActiveService = (index) => {
        serviceItems.forEach((item, idx) => {
            item.classList.toggle('is-active', idx === index);
        });
    };

    const teardownServicesAnimation = () => {
        if (servicesTimeline) {
            servicesTimeline.scrollTrigger?.kill();
            servicesTimeline.kill();
            servicesTimeline = null;
        }

        if (resizeHandler) {
            window.removeEventListener('resize', resizeHandler);
            resizeHandler = null;
        }
    };

    const activateStaticState = (index = 0) => {
        teardownServicesAnimation();
        calculateOffsets();
        applyLabelTransform(itemOffsets[index] || 0);
        setActiveService(index);
    };

    const initServicesAnimation = () => {
        teardownServicesAnimation();

        if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion.matches) {
            activateStaticState();
            return;
        }

        const { gsap } = window;
        const { ScrollTrigger } = window;

        gsap.registerPlugin(ScrollTrigger);

        calculateOffsets();
        const totalSteps = Math.max(serviceItems.length - 1, 1);
        applyLabelTransform(itemOffsets[0] || 0);
        setActiveService(0);

        servicesTimeline = gsap.timeline({
            defaults: { duration: 1, ease: 'power2.out' },
            scrollTrigger: {
                id: 'services-scroll',
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
                    setActiveService(clampedIndex);
                },
                onRefresh: () => {
                    calculateOffsets();
                    const progress = servicesTimeline?.scrollTrigger?.progress || 0;
                    const activeIndex = Math.min(serviceItems.length - 1, Math.max(0, Math.round(progress * totalSteps)));
                    applyLabelTransform(itemOffsets[activeIndex] || 0);
                    setActiveService(activeIndex);
                }
            }
        });

        serviceItems.slice(1).forEach((_, index) => {
            servicesTimeline.to(expertLabel, {
                y: () => itemOffsets[index + 1] || 0
            });
        });

        let resizeFrame = null;
        resizeHandler = () => {
            if (resizeFrame) {
                cancelAnimationFrame(resizeFrame);
            }

            resizeFrame = requestAnimationFrame(() => {
                calculateOffsets();
                const progress = servicesTimeline?.scrollTrigger?.progress || 0;
                const activeIndex = Math.min(serviceItems.length - 1, Math.max(0, Math.round(progress * totalSteps)));
                applyLabelTransform(itemOffsets[activeIndex] || 0);
                ScrollTrigger.refresh();
            });
        };

        window.addEventListener('resize', resizeHandler);
    };

    initServicesAnimation();

    const onMotionPreferenceChange = () => {
        initServicesAnimation();
    };

    if (typeof prefersReducedMotion.addEventListener === 'function') {
        prefersReducedMotion.addEventListener('change', onMotionPreferenceChange);
    } else if (typeof prefersReducedMotion.addListener === 'function') {
        prefersReducedMotion.addListener(onMotionPreferenceChange);
    }

    if (!window.gsap || !window.ScrollTrigger) {
        window.addEventListener('load', initServicesAnimation, { once: true });
    }
});
