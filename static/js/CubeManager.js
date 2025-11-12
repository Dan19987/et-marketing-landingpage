class CubeManager {
    constructor(fallbackFunctions) {
        this.container = document.getElementById('3d-logo-container');
        this.fallbackActive = false;
        this.fallbackFunctions = fallbackFunctions;
        this.scale = window.devicePixelRatio || 1;
        this.isAnimating = false;
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
    }

    async initSpline() {
        try {
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }

            this.container.style.overflow = 'hidden';
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const splineViewer = document.createElement('spline-viewer');
            
            splineViewer.url = 'https://prod.spline.design/yvgMqt85Y1W21BIc/scene.splinecode';
            splineViewer.style.width = '150px';
            splineViewer.style.height = '150px';
            
            const attributes = {
                'enable-zoom': 'false',
                'camera-controls': 'false',
                'auto-rotate': '0',
                'loading': 'lazy',
                'camera-target': '0 0 0',
                'camera-orbit': '0deg 90deg 100%'
            };
            
            Object.entries(attributes).forEach(([key, value]) => {
                splineViewer.setAttribute(key, value);
            });

            // Neue Event-Listener für die Rotation
            splineViewer.addEventListener('load', () => {
                console.log('Spline viewer loaded');
                
                splineViewer.addEventListener('mousedown', (e) => {
                    this.isDragging = true;
                    const event = e.touches ? e.touches[0] : e;
                    this.previousMousePosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                });

                splineViewer.addEventListener('mousemove', (e) => {
                    if (!this.isDragging) return;
                    
                    const event = e.touches ? e.touches[0] : e;
                    const deltaMove = {
                        x: event.clientX - this.previousMousePosition.x,
                        y: event.clientY - this.previousMousePosition.y
                    };

                    if (splineViewer.application) {
                        const target = splineViewer.application.querySelector('Group2');
                        if (target) {
                            target.rotation.y += deltaMove.x * 0.01;
                            target.rotation.x += deltaMove.y * 0.01;
                        }
                    }

                    this.previousMousePosition = {
                        x: event.clientX,
                        y: event.clientY
                    };
                });

                splineViewer.addEventListener('mouseup', () => {
                    this.isDragging = false;
                });

                splineViewer.addEventListener('mouseleave', () => {
                    this.isDragging = false;
                });
            });

            splineViewer.addEventListener('error', (error) => {
                console.error('Spline loading error:', error);
                this.activateFallback();
            });

            this.container.appendChild(splineViewer);

        } catch (error) {
            console.error('Spline initialization error:', error);
            this.activateFallback();
        }
    }

    async init() {
        try {
            await this.initSpline();
        } catch (error) {
            console.warn('Spline konnte nicht geladen werden, verwende Fallback:', error);
            this.activateFallback();
        }
    }

    activateFallback() {
        if (!this.fallbackActive && this.fallbackFunctions?.init) {
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }
            this.fallbackFunctions.init();
            window.addEventListener('resize', this.fallbackFunctions.onWindowResize);
            this.fallbackActive = true;
        }
    }

    dispose() {
        if (this.fallbackActive) {
            window.removeEventListener('resize', this.fallbackFunctions.onWindowResize);
        }
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }
}

export default CubeManager;