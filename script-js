// Fetch and display advanced structures dynamically
fetch('samples/advanced-structures.json')
  .then(response => response.json())
  .then(data => {
    const container = document.getElementById('categories');
    container.innerHTML = ''; // clear before loading

    if (!data.AdvancedStructures) {
      container.innerHTML = '<p style="color:#c26a45;">⚠️ No structures found in JSON file.</p>';
      return;
    }

    data.AdvancedStructures.forEach(section => {
      const block = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = section.category;
      block.appendChild(summary);

      const list = document.createElement('ul');
      section.examples.forEach(example => {
        const li = document.createElement('li');
        li.textContent = example;
        list.appendChild(li);
      });

      block.appendChild(list);
      container.appendChild(block);
    });
  })
  .catch(err => {
    console.error('Error loading structures:', err);
    document.getElementById('categories').innerHTML = '<p style="color:#c26a45;">Error loading data.</p>';
  });

// Future use: toggle buttons (currently placeholders for navigation)
document.querySelectorAll('.toggle-button').forEach(button => {
  button.addEventListener('click', () => {
    alert(`Feature "${button.textContent}" coming soon!`);
  });
});
