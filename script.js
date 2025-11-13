document.addEventListener('DOMContentLoaded', () => {
    const cursorMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointerFineQuery = window.matchMedia('(pointer: fine)');
    const desktopWidthQuery = window.matchMedia('(min-width: 1024px)');

    const cursorFollowerState = {
        element: null,
        rafId: null,
        targetX: window.innerWidth / 2,
        targetY: window.innerHeight / 2,
        currentX: window.innerWidth / 2,
        currentY: window.innerHeight / 2,
        isActive: false
    };

    const cursorFollowerHalfSize = 8;
    const cursorFollowerEasing = 0.18;

    const handlePointerMove = (event) => {
        if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
            return;
        }

        cursorFollowerState.targetX = event.clientX;
        cursorFollowerState.targetY = event.clientY;

        if (cursorFollowerState.element) {
            cursorFollowerState.element.classList.add('is-visible');
            cursorFollowerState.element.classList.remove('is-hidden');
        }
    };

    const handlePointerLeave = () => {
        if (cursorFollowerState.element) {
            cursorFollowerState.element.classList.add('is-hidden');
        }
    };

    const animateCursorFollower = () => {
        cursorFollowerState.currentX += (cursorFollowerState.targetX - cursorFollowerState.currentX) * cursorFollowerEasing;
        cursorFollowerState.currentY += (cursorFollowerState.targetY - cursorFollowerState.currentY) * cursorFollowerEasing;

        if (cursorFollowerState.element) {
            const translateX = cursorFollowerState.currentX - cursorFollowerHalfSize;
            const translateY = cursorFollowerState.currentY - cursorFollowerHalfSize;
            cursorFollowerState.element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
        }

        cursorFollowerState.rafId = requestAnimationFrame(animateCursorFollower);
    };

    const teardownCursorFollower = () => {
        if (!cursorFollowerState.isActive) {
            return;
        }

        cursorFollowerState.isActive = false;

        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerleave', handlePointerLeave);

        if (cursorFollowerState.rafId) {
            cancelAnimationFrame(cursorFollowerState.rafId);
            cursorFollowerState.rafId = null;
        }

        if (cursorFollowerState.element) {
            cursorFollowerState.element.remove();
            cursorFollowerState.element = null;
        }
    };

    const setupCursorFollower = () => {
        if (cursorFollowerState.isActive) {
            return;
        }

        if (!pointerFineQuery.matches || !desktopWidthQuery.matches || cursorMotionQuery.matches) {
            teardownCursorFollower();
            return;
        }

        const follower = document.createElement('div');
        follower.className = 'cursor-follower is-hidden';
        follower.setAttribute('aria-hidden', 'true');

        cursorFollowerState.element = follower;
        cursorFollowerState.isActive = true;
        cursorFollowerState.targetX = window.innerWidth / 2;
        cursorFollowerState.targetY = window.innerHeight / 2;
        cursorFollowerState.currentX = cursorFollowerState.targetX;
        cursorFollowerState.currentY = cursorFollowerState.targetY;

        document.body.appendChild(follower);

        cursorFollowerState.rafId = requestAnimationFrame(animateCursorFollower);

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerleave', handlePointerLeave);
    };

    const evaluateCursorFollower = () => {
        if (pointerFineQuery.matches && desktopWidthQuery.matches && !cursorMotionQuery.matches) {
            setupCursorFollower();
        } else {
            teardownCursorFollower();
        }
    };

    const addMediaQueryListener = (query, listener) => {
        if (typeof query.addEventListener === 'function') {
            query.addEventListener('change', listener);
        } else if (typeof query.addListener === 'function') {
            query.addListener(listener);
        }
    };

    addMediaQueryListener(pointerFineQuery, evaluateCursorFollower);
    addMediaQueryListener(desktopWidthQuery, evaluateCursorFollower);
    addMediaQueryListener(cursorMotionQuery, evaluateCursorFollower);

    evaluateCursorFollower();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const projectSequences = Array.from(document.querySelectorAll('.project-media--sequence'));
    let projectSequenceCleanups = [];

    const resetProjectSequences = () => {
        projectSequenceCleanups.forEach((cleanup) => {
            cleanup();
        });
        projectSequenceCleanups = [];
    };

    const fallbackProjectSequence = (images) => {
        images.forEach((img, index) => {
            img.style.opacity = index === 0 ? '1' : '0';
            img.style.transform = index === 0 ? 'scale(1)' : 'scale(1.08)';
        });

        return () => {
            images.forEach((img) => {
                img.style.removeProperty('opacity');
                img.style.removeProperty('transform');
            });
        };
    };

    const initProjectSequences = () => {
        resetProjectSequences();

        if (projectSequences.length === 0) {
            return;
        }

        if (prefersReducedMotion.matches || !window.gsap) {
            projectSequences.forEach((media) => {
                const images = Array.from(media.querySelectorAll('.project-sequence__image'));
                const cleanup = fallbackProjectSequence(images);
                if (cleanup) {
                    projectSequenceCleanups.push(cleanup);
                }
            });
            return;
        }

        const { gsap } = window;

        projectSequences.forEach((media) => {
            const images = Array.from(media.querySelectorAll('.project-sequence__image'));
            if (images.length <= 1) {
                const cleanup = fallbackProjectSequence(images);
                if (cleanup) {
                    projectSequenceCleanups.push(cleanup);
                }
                return;
            }

            images.forEach((img, index) => {
                gsap.set(img, {
                    autoAlpha: index === 0 ? 1 : 0,
                    scale: index === 0 ? 1 : 1.08
                });
            });

            const indices = images.map((_, idx) => idx);
            let currentIndex = 0;
            let pendingOrder = gsap.utils.shuffle(indices.slice(1));
            let pendingCall = null;
            let activeTween = null;
            let isPlaying = false;

            const selectNextIndex = () => {
                if (pendingOrder.length === 0) {
                    pendingOrder = gsap.utils.shuffle(
                        indices.filter((idx) => idx !== currentIndex)
                    );
                }

                const nextIndex = pendingOrder.shift();

                if (nextIndex === undefined || nextIndex === currentIndex) {
                    return selectNextIndex();
                }

                return nextIndex;
            };

            const stopPlayback = () => {
                isPlaying = false;
                if (pendingCall) {
                    pendingCall.kill();
                    pendingCall = null;
                }
                if (activeTween) {
                    activeTween.progress(1);
                    activeTween.kill();
                    activeTween = null;
                }
            };

            const scheduleNext = () => {
                if (!isPlaying) {
                    return;
                }

                if (pendingCall) {
                    pendingCall.kill();
                }

                pendingCall = gsap.delayedCall(3.2, () => {
                    const nextIndex = selectNextIndex();
                    const current = images[currentIndex];
                    const next = images[nextIndex];

                    if (activeTween) {
                        activeTween.kill();
                    }

                    activeTween = gsap
                        .timeline({ defaults: { ease: 'power2.inOut', duration: 1.35 } })
                        .to(current, { autoAlpha: 0, scale: 1.18 }, 0)
                        .fromTo(next, { autoAlpha: 0, scale: 1.02 }, { autoAlpha: 1, scale: 1 }, 0)
                        .eventCallback('onComplete', () => {
                            activeTween = null;
                        });

                    currentIndex = nextIndex;
                    scheduleNext();
                });
            };

            const startPlayback = () => {
                if (isPlaying) {
                    return;
                }

                isPlaying = true;
                scheduleNext();
            };

            const container = media.closest('.project-card') || media;
            let observer = null;

            if ('IntersectionObserver' in window) {
                observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                startPlayback();
                            } else {
                                stopPlayback();
                            }
                        });
                    },
                    { threshold: 0.4 }
                );

                observer.observe(container);

                const rect = container.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    startPlayback();
                }
            } else {
                startPlayback();
            }

            projectSequenceCleanups.push(() => {
                stopPlayback();
                if (activeTween) {
                    activeTween.kill();
                    activeTween = null;
                }
                if (pendingCall) {
                    pendingCall.kill();
                    pendingCall = null;
                }
                gsap.set(images, { clearProps: 'all' });
                if (observer) {
                    observer.disconnect();
                }
            });
        });
    };

    initProjectSequences();

    const servicesSection = document.querySelector('.services-section');
    const expertLabel = servicesSection?.querySelector('.expert-label') || null;
    const serviceItems = servicesSection
        ? Array.from(servicesSection.querySelectorAll('.services-list .service-item'))
        : [];
    let servicesTimeline = null;
    let resizeHandler = null;
    let itemOffsets = [];
    let currentScrollDistance = 0;

    const hasServiceAnimationPrereqs = () =>
        Boolean(servicesSection && expertLabel && serviceItems.length > 0);

    const calculateOffsets = () => {
        if (!hasServiceAnimationPrereqs()) {
            itemOffsets = [];
            return;
        }

        const baseline = serviceItems[0].offsetTop;
        const labelHalf = expertLabel.offsetHeight / 2;

        itemOffsets = serviceItems.map((item) => {
            const itemOffset = item.offsetTop - baseline;
            const itemCenterAdjustment = (item.offsetHeight / 2) - labelHalf;
            return itemOffset + itemCenterAdjustment;
        });
    };

    const computeScrollDistance = () => {
        if (!hasServiceAnimationPrereqs()) {
            return 0;
        }

        const finalOffset = itemOffsets[itemOffsets.length - 1] || 0;
        const tailHeight = serviceItems[serviceItems.length - 1]?.offsetHeight || 0;
        return Math.max(600, finalOffset + tailHeight + 120);
    };

    const applyLabelTransform = (offset) => {
        if (!expertLabel) {
            return;
        }

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
        if (!hasServiceAnimationPrereqs()) {
            return;
        }

        calculateOffsets();
        currentScrollDistance = computeScrollDistance();
        applyLabelTransform(itemOffsets[index] || 0);
        setActiveService(index);
    };

    const initServicesAnimation = () => {
        teardownServicesAnimation();

        if (!hasServiceAnimationPrereqs()) {
            return;
        }

        if (!window.gsap || !window.ScrollTrigger || prefersReducedMotion.matches) {
            activateStaticState();
            return;
        }

        const { gsap } = window;
        const { ScrollTrigger } = window;

        gsap.registerPlugin(ScrollTrigger);

        calculateOffsets();
        currentScrollDistance = computeScrollDistance();
        applyLabelTransform(itemOffsets[0] || 0);
        setActiveService(0);

        const transitions = serviceItems.length - 1;
        if (transitions <= 0) {
            activateStaticState();
            return;
        }

        const progressProxy = { value: 0 };
        const snapStep = 1 / transitions;

        servicesTimeline = gsap.to(progressProxy, {
            value: transitions,
            ease: 'none',
            scrollTrigger: {
                id: 'services-scroll',
                trigger: servicesSection,
                start: 'top top',
                end: () => `+=${currentScrollDistance}`,
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
                    currentScrollDistance = computeScrollDistance();
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
                currentScrollDistance = computeScrollDistance();
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
        initProjectSequences();
        initServicesAnimation();
    };

    if (typeof prefersReducedMotion.addEventListener === 'function') {
        prefersReducedMotion.addEventListener('change', onMotionPreferenceChange);
    } else if (typeof prefersReducedMotion.addListener === 'function') {
        prefersReducedMotion.addListener(onMotionPreferenceChange);
    }

    if (!window.gsap || !window.ScrollTrigger) {
        window.addEventListener('load', () => {
            initProjectSequences();
            initServicesAnimation();
        }, { once: true });
    }
});
