document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const popup = document.createElement('div');
    popup.className = 'popup-modal';
    popup.innerHTML = `
      <div class="popup-content">
        <p>This is an unexpected popup!</p>
        <button class="close-btn">Close</button>
      </div>
    `;
    document.body.appendChild(popup);

    document.querySelector('.close-btn').addEventListener('click', () => {
      popup.remove();
    });
  }, Math.random() * 5000 + 2000); // Popup appears randomly between 2-7 seconds
});
