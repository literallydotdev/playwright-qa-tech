document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const popup = document.createElement('div');
    popup.className = 'popup-modal';
    popup.innerHTML = `
      <div class="popup-content">
        <div class="popup-icon">🎯</div>
        <h3 class="popup-title">Welcome to QA Testing Platform</h3>
        <p>This is a test popup to verify modal interactions and user experience testing capabilities.</p>
        <button class="close-btn">Continue Testing</button>
      </div>
    `;
    document.body.appendChild(popup);

    // Add click outside to close functionality
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.remove();
      }
    });

    // Add escape key to close functionality
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        popup.remove();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    document.querySelector('.close-btn').addEventListener('click', () => {
      popup.remove();
      document.removeEventListener('keydown', handleEscape);
    });
  }, Math.random() * 5000 + 2000); // Popup appears randomly between 2-7 seconds
});
