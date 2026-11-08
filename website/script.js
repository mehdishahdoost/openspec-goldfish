for (const button of document.querySelectorAll('[data-copy]')) {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const command = document.getElementById(button.dataset.copy);
    const feedback = document.getElementById('copy-feedback');
    try {
      await navigator.clipboard.writeText(command.textContent);
      feedback.textContent = 'Installation command copied.';
    } catch {
      feedback.textContent = 'Could not copy automatically. Select the command text to copy it manually.';
    }
  });
}
