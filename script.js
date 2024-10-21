document.addEventListener('DOMContentLoaded', () => {
   gsap.registerPlugin(CustomEase);
   CustomEase.create('hop', 'M0,0 C0.071,0.505 0.192,0.726 0.318,0.852 0.450,0.984 0.504,1 1,1');

   const sliderImages = document.querySelector('.slider__images');
   const sliderNumbers = document.querySelector('.slider__numbers');
   const sliderTitles = document.querySelector('.slider__titles');
   const sliderIndicators = document.querySelectorAll('.slider__indicators p');
   const sliderPreviews = document.querySelectorAll('.slider__previews .preview');
   const sliderPreview = document.querySelector('.slider__previews');

   let currentImage = 1;
   const totalSliders = 5;
   let indicatorRotation = 0;

   const updateCounterAndTitlePosition = () => {
      const counterY = -16 * (currentImage - 1);
      const titleY = -48 * (currentImage - 1);

      gsap.to(sliderNumbers, {
         y: counterY,
         duration: 1,
         ease: 'hop'
      });

      gsap.to(sliderTitles, {
         y: titleY,
         duration: 1,
         ease: 'hop'
      });
   }

   const updateActiveSliderPreview = () => {

      console.log('UPDATE')
      sliderPreviews.forEach(preview => {
         preview.classList.remove('active');
      });
      sliderPreviews[currentImage - 1].classList.add('active');
   }

   const sliderImagesLinks = [
      'https://welpix.b-cdn.net/wp-content/uploads/2021/04/watch-product-photography-with-black-feather.jpg',
      'https://www.diyphotography.net/wp-content/uploads/2018/03/pm_product_holga.jpg',
      'https://cgifurniture.com/wp-content/uploads/2023/03/3d-product-photography-post-production.jpeg',
      'https://www.ji9saw.com/singapore/wp-content/uploads/2022/08/issey-miyake-nuit-dissey.jpg',
      'https://scontent-atl3-2.xx.fbcdn.net/v/t39.30808-6/460728567_835650448770757_8847884534211032386_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=127cfc&_nc_ohc=lPSmhZQLP5EQ7kNvgHTrUiz&_nc_zt=23&_nc_ht=scontent-atl3-2.xx&_nc_gid=A3AlF5_mS27c377K4X0JMae&oh=00_AYB630GjE7mdS8XqfhbCdg_maRj0-jkyN8YjvaVmcQvoCA&oe=671B850D'
   ]

   const animateSlider = direction => {
      const currentSlider = document.querySelectorAll('.image')[document.querySelectorAll('.image').length - 1];

      const sliderImage = document.createElement('div');
      sliderImage.classList.add('image');

      const sliderImageElement = document.createElement('img');
      sliderImageElement.src = sliderImagesLinks[currentImage - 1];
      // sliderImageElement.src = 'https://welpix.b-cdn.net/wp-content/uploads/2021/04/watch-product-photography-with-black-feather.jpg';
      // slideImageElement.src = `./images/image${currentImage}.jpg`;
      gsap.set(sliderImageElement, { x: direction === 'left' ? -300 : 300 });

      sliderImage.appendChild(sliderImageElement);
      sliderImages.appendChild(sliderImage);

      gsap.to(currentSlider.querySelector('img'), {
         x: direction === 'left' ? 300 : -300,
         duration: 1.5,
         ease: 'power4.out'
      });

      gsap.fromTo(sliderImage, {
         clipPath: direction === 'left' ? 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' : 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)'
      }, {
         clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
         duration: 1.5,
         ease: 'power4.out'
      });

      gsap.to(sliderImageElement, {
         x: 0,
         duration: 1.5,
         ease: 'power4.out'
      });

      cleanupSliders();

      indicatorRotation += direction === 'left' ? -90 : 90;

      gsap.to(sliderIndicators, {
         rotate: indicatorRotation,
         duration: 1,
         ease: 'hop'
      });
   }

   document.addEventListener('click', (event) => {
      const sliderWidth = document.querySelector('.work').clientWidth;
      const clickPosition = event.clientX;

      if (sliderPreview.contains(event.target)) {
         const clickedPreview = event.target.closest('.preview');

         if (clickedPreview) {
            const clickedIndex = Array.from(sliderPreviews).indexOf(clickedPreview) + 1;

            if (clickedIndex !== currentImage) {
               if (clickedIndex < currentImage) {
                  currentImage = clickedIndex;
                  animateSlider('left');
               } else {
                  currentImage = clickedIndex;
                  animateSlider('right');
               }
               updateActiveSliderPreview();
               updateCounterAndTitlePosition();
            }
         }
         return;
      }

      if (clickPosition < sliderWidth / 2 && currentImage !== 1) {
         currentImage--;
         animateSlider('left');
      } else if (clickPosition > sliderWidth / 2 && currentImage !== totalSliders) {
         currentImage++;
         animateSlider('right');
      }

      updateActiveSliderPreview();
      updateCounterAndTitlePosition();
   });

   const cleanupSliders = () => {
      const imageElements = document.querySelectorAll('.slider__images .image');
      if (imageElements.length > totalSliders) {
         imageElements[0].remove();
      }

   }
});