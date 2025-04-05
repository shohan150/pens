const animatedEls = document.querySelectorAll("[data-animation]");

const observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		const animation = entry.target.getAttribute("data-animation");

		if (entry.isIntersecting) {
			entry.target.classList.add("animated", `${animation}`);
		} else {
			entry.target.classList.remove("animated", `${animation}`);
		}
	});
});

animatedEls.forEach((el) => observer.observe(el));
