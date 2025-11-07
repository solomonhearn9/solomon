document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.hero-overlay-icon');
    const navOverlay = document.querySelector('.nav-overlay');
    const navPanel = document.querySelector('.nav-panel');
    const navLinks = document.querySelectorAll('.nav-panel-link');
    let lastFocusedElement = null;

    if (navToggle && navOverlay && navPanel) {
        const navMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        const setNavRevealOrigin = () => {
            if (navMotionQuery.matches) {
                return;
            }

            const toggleRect = navToggle.getBoundingClientRect();
            const originX = toggleRect.left + toggleRect.width / 2;
            const originY = toggleRect.top + toggleRect.height / 2;

            navOverlay.style.setProperty('--nav-origin-x', `${originX}px`);
            navOverlay.style.setProperty('--nav-origin-y', `${originY}px`);
        };

        const handleNavResize = () => {
            if (navOverlay.classList.contains('is-open')) {
                setNavRevealOrigin();
            }
        };

        window.addEventListener('resize', handleNavResize);

        const openNav = () => {
            if (navOverlay.classList.contains('is-open')) {
                return;
            }

            lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
            setNavRevealOrigin();

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

    const expertLabel = servicesSection.querySelector('.expert-label');
    const serviceItems = Array.from(servicesSection.querySelectorAll('.services-list .service-item'));
    if (!expertLabel || serviceItems.length === 0) {
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
        applyLabelTransform(itemOffsets[0] || 0);
        setActiveService(0);

        const transitions = serviceItems.length - 1;
        if (transitions <= 0) {
            activateStaticState();
            return;
        }

        const progressProxy = { value: 0 };
        const scrollDistance = serviceItems.length * 100;
        const snapStep = 1 / transitions;

        servicesTimeline = gsap.to(progressProxy, {
            value: transitions,
            ease: 'none',
            scrollTrigger: {
                id: 'services-scroll',
                trigger: servicesSection,
                start: 'top top',
                end: `+=${scrollDistance}%`,
                scrub: true,
                pin: servicesSection,
                pinSpacing: true,
                anticipatePin: 1,
                snap: {
                    snapTo: (value) => Math.round(value / snapStep) * snapStep,
                    duration: { min: 0.18, max: 0.38 },
                    ease: 'power1.inOut'
                },
                onRefresh: () => {
                    calculateOffsets();
                    const progressValue = (servicesTimeline?.scrollTrigger?.progress || 0) * transitions;
                    const activeIndex = Math.min(serviceItems.length - 1, Math.max(0, Math.round(progressValue)));
                    const targetOffset = itemOffsets[activeIndex] || 0;
                    applyLabelTransform(targetOffset);
                    setActiveService(activeIndex);
                }
            },
            onUpdate: () => {
                const clampedValue = gsap.utils.clamp(0, transitions, progressProxy.value);
                const baseIndex = Math.floor(clampedValue);
                const nextIndex = Math.min(serviceItems.length - 1, baseIndex + 1);
                const segmentProgress = clampedValue - baseIndex;
                const startOffset = itemOffsets[baseIndex] || 0;
                const endOffset = itemOffsets[nextIndex] || startOffset;
                const interpolatedOffset = gsap.utils.interpolate(startOffset, endOffset, nextIndex === baseIndex ? 0 : segmentProgress);

                applyLabelTransform(interpolatedOffset);
                setActiveService(Math.min(serviceItems.length - 1, Math.round(clampedValue)));
            }
        });

        let resizeFrame = null;
        resizeHandler = () => {
            if (resizeFrame) {
                cancelAnimationFrame(resizeFrame);
            }

            resizeFrame = requestAnimationFrame(() => {
                calculateOffsets();
                const trigger = servicesTimeline?.scrollTrigger;
                if (trigger) {
                    const currentProgress = trigger.progress * transitions;
                    const baseIndex = Math.floor(currentProgress);
                    const nextIndex = Math.min(serviceItems.length - 1, baseIndex + 1);
                    const segmentProgress = currentProgress - baseIndex;
                    const startOffset = itemOffsets[baseIndex] || 0;
                    const endOffset = itemOffsets[nextIndex] || startOffset;
                    const interpolatedOffset = gsap.utils.interpolate(startOffset, endOffset, nextIndex === baseIndex ? 0 : segmentProgress);

                    applyLabelTransform(interpolatedOffset);
                    setActiveService(Math.min(serviceItems.length - 1, Math.round(currentProgress)));
                    trigger.refresh();
                }
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
