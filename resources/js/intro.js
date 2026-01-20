function handleScroll() {
  const scrollTop = $(window).scrollTop();
  const windowHeight = $(window).height();

  // 첫 섹션 active 처리
  const $firstSection = $('.sec1-content-swiper');
  if (scrollTop === 0) {
    $firstSection.addClass('active-motion');
  }

  // sec-left2 섹션의 요소들 순차 처리
  const $secLeft2 = $('.sec-left2');
  const secLeft2Offset = $secLeft2.offset().top;

  if (scrollTop + windowHeight * 0.7 > secLeft2Offset) {
    // title-block을 먼저 활성화
    setTimeout(() => {
      $secLeft2.find('.title-block').addClass('active-motion');
    }, 0);

    // img-box들을 순차적으로 활성화
    $secLeft2.find('.img-box').each(function(index) {
      setTimeout(() => {
        $(this).addClass('active-motion');
      }, 300 * (index + 1)); // 각 요소마다 300ms 딜레이를 줌
    });
  }

  // 다른 섹션들 active-motion 처리
  $('.sec-left .sec').not('.no-transition').each(function() {
    const $section = $(this);
    const offsetTop = $section.offset().top;
    const sectionHeight = $section.outerHeight();

    if (scrollTop + windowHeight * 0.5 > offsetTop && scrollTop < offsetTop + sectionHeight) {
      $section.addClass('active-motion');
    }
  });
}

$(document).ready(function() {
  $(window).on('scroll', handleScroll);
});