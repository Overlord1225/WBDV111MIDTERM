document.addEventListener('DOMContentLoaded', () => {
    const heroImage = document.querySelector('.hero__img');
    
    // Parallax effect on scroll
    window.addEventListener('scroll', () => {
        let offset = window.pageYOffset;
        heroImage.style.transform = `scale(1.1) translateY(${offset * 0.15}px)`;
    });

    // Reveal animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
});