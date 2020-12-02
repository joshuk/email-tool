const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

window.addEventListener('resize', () => {
    ctx.canvas.width = pageWidth = window.innerWidth;
    ctx.canvas.height = pageHeight = window.innerHeight;
});

window.dispatchEvent(new Event('resize'));