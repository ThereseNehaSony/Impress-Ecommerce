// let items = document.querySelectorAll('.carousel .carousel-item')

// 		items.forEach((el) => {
// 			const minPerSlide = 4
// 			let next = el.nextElementSibling
// 			for (var i=1; i<minPerSlide; i++) {
// 				if (!next) {
//             // wrap carousel by using first child
//             next = items[0]
//         }
//         let cloneChild = next.cloneNode(true)
//         el.appendChild(cloneChild.children[0])
//         next = next.nextElementSibling
//     }
// })

$('.carousel .carousel-item').each(function () {
    var minPerSlide = 4;
    var next = $(this).next();
    if (!next.length) {
    next = $(this).siblings(':first');
    }
    next.children(':first-child').clone().appendTo($(this));
    
    for (var i = 0; i < minPerSlide; i++) { next=next.next(); if (!next.length) { next=$(this).siblings(':first'); } next.children(':first-child').clone().appendTo($(this)); } });

    


    // JavaScript to handle navigation to Impress Kids section on another page
document.addEventListener("DOMContentLoaded", function() {
    const impressKidsLink = document.getElementById('impressKidsLink');
  
    // Check if the "Impress Kids" link exists on the current page
    if (impressKidsLink) {
      impressKidsLink.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default link behavior
  
        // Redirect to the index page with the specific section ID appended to the URL
        window.location.href = '/index#impressKidsSection';
      });
    }
  });
  


   
   


