function handleScroll() {
  // 1024px 이상에서만 작동
  if ($(window).width() < 1024) return;

  const scrollTop = $(window).scrollTop();
  const windowHeight = $(window).height();

  // sec-left 안의 섹션 active 처리
  $('.sec-left .sec').not('.no-transition').each(function() {
    const $section = $(this);
    const offsetTop = $section.offset().top;
    const sectionHeight = $section.outerHeight();

    if (scrollTop + windowHeight * 0.5 > offsetTop && scrollTop < offsetTop + sectionHeight) {
      $section.addClass('active');
    } else {
      $section.removeClass('active');
    }
  });

  // 첫 섹션 active 처리
  const $firstSection = $('.sec1-content-swiper');
  if (scrollTop === 0) {
    $firstSection.addClass('active');
  } else {
    $firstSection.removeClass('active');
  }
}
$(document).ready(function() {
  // 처음 로드 시 1024 이상이면 실행
  if ($(window).width() >= 1024 && $(window).scrollTop() === 0) {
    $('.sec1-content-swiper').addClass('active');
  }

  // 스크롤 이벤트 등록
  $(window).on('scroll', handleScroll);

  // 리사이즈 시에도 체크 (해상도 변경 시 반영)
  $(window).on('resize', function() {
    if ($(window).width() < 1024) {
      // 1024 미만이면 active 전부 제거
      $('.sec-left .sec, .sec1-content-swiper').removeClass('active');
    } else {
      handleScroll();
    }
  });
});
