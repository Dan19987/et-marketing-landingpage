// static/js/scripts.js

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menü Toggling
    function toggleMobileMenu() {
        var menu = document.getElementById('mobile-menu');
        var hamburger = document.querySelector('.hamburger');
        menu.classList.toggle('open');
        hamburger.classList.toggle('open');
    }

    var hamburger = document.querySelector('.hamburger');
    hamburger.addEventListener('click', toggleMobileMenu);

    // Schließe das mobile Menü, wenn außerhalb geklickt wird
    document.addEventListener('click', function(event) {
        var menu = document.getElementById('mobile-menu');
        var hamburger = document.querySelector('.hamburger');
        var isClickInside = menu.contains(event.target) || hamburger.contains(event.target);

        if (!isClickInside && menu.classList.contains('open')) {
            menu.classList.remove('open');
            hamburger.classList.remove('open');
        }
    });

    // Submenu Toggling für Desktop Sidebar
    var submenuItems = document.querySelectorAll('.sidebar .submenu > a');
    submenuItems.forEach(function(item) {
        item.addEventListener('click', function(e) {
            e.preventDefault(); // Verhindert das Standardverhalten des Links
            var parent = this.parentElement;
            parent.classList.toggle('open'); // Toggle die 'open' Klasse

            // Aktualisiere ARIA-Attribute für Accessibility
            var expanded = parent.classList.contains('open');
            this.setAttribute('aria-expanded', expanded);

            console.log('Submenu geklickt:', this.textContent); // Debugging
        });
    });

    // Hintergrundbild ändern beim Klicken auf Sidebar-Links
    var sidebarLinks = document.querySelectorAll('.sidebar ul li a');

    sidebarLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            // Nur Links ohne Submenu berücksichtigen
            if (this.parentElement.classList.contains('submenu')) {
                return; // Wenn es sich um ein Submenu handelt, nichts tun
            }

            var animation = this.getAttribute('data-animation');
            if (animation) {
                // Bestimme den Bildpfad basierend auf dem data-animation
                var imageUrl = '/static/images/' + animation + '-bg.webp';

                // Überprüfe, ob das Bild existiert (optional, aber empfohlen)
                var img = new Image();
                img.onload = function() {
                    // Aktualisiere die CSS-Variable
                    document.documentElement.style.setProperty('--background-image', "url('" + imageUrl + "')");
                    console.log('Hintergrundbild geändert zu:', imageUrl);
                };
                img.onerror = function() {
                    console.error('Bild nicht gefunden:', imageUrl);
                };
                img.src = imageUrl;
            } 
            // Kein e.preventDefault(), damit die Links normal navigieren
        });
    });
});

// Funktion zum Überprüfen der Sichtbarkeit von Elementen
function checkVisibility() {
    const elements = document.querySelectorAll('.fade-in-up:not(.has-appeared)');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Element ist sichtbar, wenn es im sichtbaren Bereich ist
        const isVisible = (
            elementPosition.top < windowHeight - 100 && 
            elementPosition.bottom > 0
        );
        
        if (isVisible) {
            element.classList.add('is-visible');
            // Markiere das Element als "erschienen"
            element.classList.add('has-appeared');
        }
    });
}

// Event-Listener für Scroll und initiales Laden
document.addEventListener('DOMContentLoaded', function() {
    // Erste Prüfung beim Laden
    checkVisibility();
    
    // Prüfung beim Scrollen mit Performance-Optimierung
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(function() {
            checkVisibility();
        });
    });
});