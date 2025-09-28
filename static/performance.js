// Performance optimization utilities for smooth UX
class PerformanceOptimizer {
    constructor() {
        this.rafId = null;
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        // Optimize animations based on device capabilities
        this.optimizeForDevice();
        
        // Throttle scroll events
        this.throttleScrollEvents();
        
        // Preload critical resources
        this.preloadResources();
        
        // Monitor performance
        this.monitorPerformance();
    }

    optimizeForDevice() {
        const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                              navigator.deviceMemory <= 2;
        
        if (isLowEndDevice || this.isReducedMotion) {
            document.documentElement.classList.add('reduced-animations');
        }
    }

    throttleScrollEvents() {
        let ticking = false;
        
        const updateScrollEffects = () => {
            // Update scroll-based animations
            this.updateParallaxEffects();
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        }, { passive: true });
    }

    updateParallaxEffects() {
        const scrollY = window.pageYOffset;
        const elements = document.querySelectorAll('[data-parallax]');
        
        elements.forEach(element => {
            const speed = element.dataset.parallax || 0.5;
            const yPos = -(scrollY * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    preloadResources() {
        // Preload critical CSS animations
        const style = document.createElement('style');
        style.textContent = `
            .reduced-animations * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }

    monitorPerformance() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'measure' && entry.duration > 16) {
                        console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['measure'] });
        }
    }

    // Smooth animation utilities
    static easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Optimized animation function
    static animateValue(element, start, end, duration, callback) {
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = PerformanceOptimizer.easeOutCubic(progress);
            
            const current = start + (end - start) * easedProgress;
            
            if (callback) callback(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
}

// Initialize performance optimizer
const performanceOptimizer = new PerformanceOptimizer();

// Export for use in other scripts
window.PerformanceOptimizer = PerformanceOptimizer;