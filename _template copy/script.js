if ("IntersectionObserver" in window) {
   // Detect when animation should be triggered
   const trigger = (entries, observer) => {
      entries.forEach((entry) => {
         if (entry.isIntersecting) {
            const dataTarget = entry.target;
            dataTarget.classList.add("visible");
            observer.unobserve(dataTarget);
         }
      });
   };

   // Configure the observer
   const options = {
      root: null,
      threshold: 0.35
   };

   // Create the animation observer
   const myObserver = new IntersectionObserver(trigger, options);
   const myAnimate = document.querySelectorAll(".animate");
   myAnimate.forEach((animate) => myObserver.observe(animate));
}
