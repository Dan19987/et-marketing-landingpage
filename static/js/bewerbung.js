// Notification Funktion
function showNotification(title, message, type) {
    // Bestehende Benachrichtigung entfernen falls vorhanden
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Neue Benachrichtigung erstellen
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} fade-in`;
    notification.innerHTML = `
        <h3>${title}</h3>
        <p>${message}</p>
    `;
    
    // Zur Seite hinzufügen
    document.body.appendChild(notification);
    
    // Nach 5 Sekunden ausblenden
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

document.addEventListener('DOMContentLoaded', function() {
    const bewerbungForm = document.querySelector('.bewerbung-form');
    
    // CSRF-Token aus den Meta-Tags holen
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    
    bewerbungForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Button-Status aktualisieren
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Wird gesendet...';
        submitButton.disabled = true;
        
        // Formulardaten sammeln
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            vertrieb: document.querySelector('input[name="vertrieb"]:checked')?.value || 'Nicht angegeben',
            erfahrungen: document.getElementById('erfahrungen').value,
            teamfuehrung: document.querySelector('input[name="teamfuehrung"]:checked')?.value || 'Nicht angegeben',
            motivation: document.getElementById('motivation').value,
            startdatum: document.getElementById('startdatum').value,
            bemerkungen: document.getElementById('bemerkungen').value
        };
        
        try {
            const response = await fetch('/submit-bewerbung', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,  // CSRF-Token hinzugefügt
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Erfolg!', 'Ihre Bewerbung wurde erfolgreich gesendet. Sie erhalten in Kürze eine Bestätigung per E-Mail.', 'success');
                bewerbungForm.reset();
            } else {
                showNotification('Fehler', result.message || 'Beim Senden der Bewerbung ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.', 'error');
            }
        } catch (error) {
            console.error('Fehler beim Senden der Bewerbung:', error);
            showNotification('Fehler', 'Beim Senden der Bewerbung ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.', 'error');
        } finally {
            // Button wieder aktivieren
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
});