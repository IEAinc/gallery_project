/* 1. [공통]사이드바 */
// 사이드바 열기
function openSideBar() {
  /* 1. 사이드바 */
  const $dimOverlay = $('#dim-overlay'); // Dim 처리 요소
  const $sidebar = $('.sidebar'); // 사이드바 메뉴
  const breakpoint = 1200; // PC와 모바일을 구분할 기준 너비

  if ($(window).width() < breakpoint) {
    $dimOverlay.addClass('active');
    $sidebar.addClass('active');
    $('body').addClass('no-scroll');

    // iOS VoiceOver 대응을 위한 추가 코드
    $sidebar.attr({
      'role': 'dialog',
      'aria-modal': 'true'
    });

    // 사이드바 외부 요소 비활성화 (inert 속성 사용)
    if ('inert' in HTMLElement.prototype) {
      // inert 속성에서 모달을 제외하여 설정
      $('body > *')
        .not($sidebar)
        .not($sidebar.parents())
        .not($dimOverlay)
        .not('.modal[style*="display: block"]') // 열린 모달은 inert 제외
        .attr('inert', '');
    } else {
      applyInertPolyfill();
    }

    trapFocus($sidebar[0]);
  }
}
// 사이드바 닫기
function closeSideBar() {
  removeActiveClasses();
}
// 상태 초기화 함수
function removeActiveClasses() {
  /* 1. 사이드바 */
  const $hamburgerBtn = $('.ico-hamburger'); // 햄버거 버튼
  const $dimOverlay = $('#dim-overlay'); // Dim 처리 요소
  const $sidebar = $('.sidebar'); // 사이드바 메뉴

  $dimOverlay.removeClass('active');
  $sidebar.removeClass('active');

  // 접근성 속성 및 inert 제거
  $sidebar.removeAttr('role aria-modal');

  if ('inert' in HTMLElement.prototype) {
    $('body > *').removeAttr('inert');
  } else {
    removeInertPolyfill();
  }

  if (!document.querySelector('.modal[style*="display: block"]')) {
    $('body').removeClass('no-scroll'); // 열린 모달이 없을 때만 스크롤 활성화
  }

  $hamburgerBtn.focus();
}
// inert 폴리필 함수
function applyInertPolyfill() {
  /* 1. 사이드바 */
  const $dimOverlay = $('#dim-overlay'); // Dim 처리 요소
  const $sidebar = $('.sidebar'); // 사이드바 메뉴

  // 사이드바와 햄버거 버튼을 제외한 모든 요소
  const elements = $('body > *').not($sidebar).not($sidebar.parents()).not($dimOverlay);

  elements.each(function() {
    $(this).attr('aria-hidden', 'true');

    // 요소 내의 모든 포커스 가능한 요소 비활성화
    $(this).find('a, button, input, select, textarea, [tabindex]').each(function() {
      if (!$(this).data('original-tabindex')) {
        $(this).data('original-tabindex', $(this).attr('tabindex') || null);
      }
      $(this).attr('tabindex', '-1');
    });
  });
}

// inert 폴리필 제거 함수
function removeInertPolyfill() {
  $('[aria-hidden="true"]').removeAttr('aria-hidden');

  // 원래 tabindex 복원
  $('[data-original-tabindex]').each(function() {
    const originalValue = $(this).data('original-tabindex');
    if (originalValue === null) {
      $(this).removeAttr('tabindex');
    } else {
      $(this).attr('tabindex', originalValue);
    }
    $(this).removeData('original-tabindex');
  });
}


/* 2. [공통] 셀렉트박스 */
// 초기화 함수
function initializeCustomSelect(selectElement, selectOptions, options = {}) {
  if (selectElement._initialized) {
    const list = selectElement.querySelector('.select-list');
    if (list) while (list.firstChild) list.removeChild(list.firstChild);

    const button = selectElement.querySelector('.select-toggle');
    if (button) {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
    }

    if (selectElement._documentClickHandler) {
      document.removeEventListener('click', selectElement._documentClickHandler);
    }
  }

  selectElement._initialized = true;

  const button = selectElement.querySelector('.select-toggle');
  const list = selectElement.querySelector('.select-list');
  const selectedText = button.querySelector('.selected-text');

  const {
    up = false,
    placeholder = selectElement.dataset.placeholder || '선택하세요',
    preventSelectionOnLink = false,
    initialValue = null,
  } = options;

  if (up) selectElement.classList.add('up');

  selectedText.textContent = placeholder;
  list.setAttribute('aria-hidden', 'true');

  selectOptions.forEach(opt => {
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.setAttribute('data-value', opt.value);

    const discountClass = opt.discount?.startsWith('-') ? 'c-red' : (opt.discount ? 'c-blue' : '');
    if (opt.tag === 'a') {
      li.innerHTML = `
        <a href="${opt.href}" target="_blank" class="flex-wrap gap-auto al-center" tabindex="0">
          <span class="txt-sm fw-medium">${opt.value}</span>
          ${opt.discount ? `<span class="txt-sm fw-medium ${discountClass} ml-4">${opt.discount}</span>` : ''}
        </a>
      `;
    } else if (opt.tag === 'button') {
      li.innerHTML = `
        <button type="button" class="flex-wrap gap-auto al-center" tabindex="0">
          <span class="txt-sm fw-medium">${opt.value}</span>
          ${opt.discount ? `<span class="txt-sm fw-medium ${discountClass} ml-4">${opt.discount}</span>` : ''}
        </button>
      `;
    }
    list.appendChild(li);
  });

  const items = list.querySelectorAll('li');

  const closeList = () => {
    list.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-expanded', 'false');
    selectElement.classList.remove('active');
  };

  const openList = () => {
    list.setAttribute('aria-hidden', 'false');
    button.setAttribute('aria-expanded', 'true');
    selectElement.classList.add('active');
  };

  const toggleList = () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    expanded ? closeList() : openList();
  };

  // ✨ focus 여부를 제어할 수 있게 변경
  const selectItem = (item, skipFocus = false) => {
    const selectedButton = item.querySelector('button');
    const selectedAnchor = item.querySelector('a');

    if (selectedButton) {
      const div = document.createElement('div');
      div.classList.add('selected-item');
      div.innerHTML = selectedButton.innerHTML;
      selectedText.innerHTML = '';
      selectedText.appendChild(div);
    } else if (selectedAnchor && !preventSelectionOnLink) {
      const div = document.createElement('div');
      div.classList.add('selected-item');
      div.innerHTML = selectedAnchor.innerHTML;
      selectedText.innerHTML = '';
      selectedText.appendChild(div);
    }

    items.forEach(i => i.setAttribute('aria-selected', 'false'));
    item.setAttribute('aria-selected', 'true');
    closeList();

    // ✨ 초기화 시에는 focus 안 줌
    if (!skipFocus) button.focus();
  };

  // 초기값 있을 때는 focus 없이 선택만
  if (initialValue !== null) {
    const initialItem = Array.from(items).find(item => item.dataset.value === initialValue);
    if (initialItem) {
      selectItem(initialItem, true);
    }
  }

  button.addEventListener('click', toggleList);

  items.forEach((item, index) => {
    item.addEventListener('keydown', e => {
      const isAnchor = !!item.querySelector('a');
      if ((e.key === 'Enter' || e.key === ' ') && isAnchor && !preventSelectionOnLink) {
        closeList();
        return;
      }

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          const prev = items[index - 1] || items[items.length - 1];
          prev.focus();
        } else {
          const next = items[index + 1] || items[0];
          next.focus();
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[index + 1] || items[0];
        next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[index - 1] || items[items.length - 1];
        prev.focus();
      } else if ((e.key === 'Enter' || e.key === ' ') && isAnchor) {
        if (preventSelectionOnLink) {
          closeList();
        } else {
          e.preventDefault();
          closeList();
        }
      } else if (e.key === 'Escape') {
        closeList();
        button.focus();
      }
    });

    item.addEventListener('click', () => {
      const isAnchor = !!item.querySelector('a');
      if (isAnchor && preventSelectionOnLink) {
        closeList();
        return;
      }

      // 클릭 시엔 focus 유지
      selectItem(item, false);
    });
  });

  const documentClickHandler = e => {
    if (!selectElement.contains(e.target)) closeList();
  };

  document.addEventListener('click', documentClickHandler);
  selectElement._documentClickHandler = documentClickHandler;

  return {
    destroy: () => {
      if (selectElement._documentClickHandler) {
        document.removeEventListener('click', selectElement._documentClickHandler);
      }
      selectElement._initialized = false;
    },
    update: newOptions => {
      const list = selectElement.querySelector('.select-list');
      if (list) {
        while (list.firstChild) list.removeChild(list.firstChild);
        initializeCustomSelect(selectElement, newOptions, options);
      }
    }
  };
}

/* [메인] 스와이퍼 */
function initFadeSwiper(swiperSelector, paginationSelector, options = {}) {
  // 기본 Swiper 옵션
  const defaultOptions = {
    loop: false,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    allowTouchMove: options.allowTouchMove !== undefined ? options.allowTouchMove : true
  };

  // 페이지네이션 관련 이벤트 핸들러
  const slideChangeHandler = function() {
    const currentIndex = this.activeIndex;

    // 페이지네이션이 있는 경우에만 처리
    if (paginationSelector) {
      const buttons = document.querySelectorAll(`${paginationSelector} .color-badge`);
      buttons.forEach((btn, i) => {
        const isActive = i === currentIndex;
        btn.classList.toggle('active', isActive);
        // green 클래스는 특정 스와이퍼에서만 사용
        if (swiperSelector.includes('sec-left4-swiper')) {
          btn.classList.toggle('green', isActive);
          btn.classList.toggle('line', !isActive);
        }
      });
    }

    // 연결된 서브 스와이퍼 처리
    if (options.linkedSwiper) {
      options.linkedSwiper.slideTo(currentIndex);
    }

    // 추가 콜백 실행
    if (options.on?.slideChange) {
      options.on.slideChange.call(this);
    }
  };

  // 최종 Swiper 옵션 병합
  const swiperOptions = {
    ...defaultOptions,
    ...options,
    on: {
      ...options.on,
      slideChange: slideChangeHandler
    }
  };

  // Swiper 인스턴스 생성
  const swiper = new Swiper(swiperSelector, swiperOptions);

  // 페이지네이션 버튼 이벤트 등록 (있는 경우에만)
  if (paginationSelector) {
    document.querySelectorAll(`${paginationSelector} .color-badge`).forEach((btn, index) => {
      btn.addEventListener('click', () => swiper.slideTo(index));
    });
  }

  return swiper;
}

// 실행함수
$(function() {
  /* 헤더열기 */
  const $header = $("header");
  const $nav = $("nav");
  const $navItems = $("nav > ul > li");
  const $subMenus = $("nav > ul > li > ul");

  // hover 또는 focus 시 전체 열기
  $navItems.on("mouseenter focusin", function() {
    $subMenus.stop(true, true).slideDown(200);
    $header.addClass("active");
  });

  // nav 영역 벗어나거나 focus 빠질 때 닫기
  $nav.on("mouseleave focusout", function(e) {
    // focusout의 경우 nav 내부 다른 li로 이동하면 닫히지 않도록 예외처리
    if (!$(e.relatedTarget).closest("nav").length) {
      $subMenus.stop(true, true).slideUp(200);
      $header.removeClass("active");
    }
  });

  /* 사이드바 관련 accordion */
  const $accordion = $(".accordion-nav-list");
  $accordion.on("click", "> li > button", function () {
    const $btn = $(this);
    const $li = $btn.parent();

    // 이미 활성화된 상태면 닫기
    if ($li.hasClass("active")) {
      $li.removeClass("active");
      $btn.removeClass("active");
      $btn.next("ul").slideUp(200);
      return;
    }

    // 다른 모든 메뉴 닫기
    $accordion.find("> li").removeClass("active").find("> button").removeClass("active");
    $accordion.find("> li > ul").slideUp(200);

    // 현재 클릭한 메뉴만 열기
    $li.addClass("active");
    $btn.addClass("active");
    $btn.next("ul").slideDown(200);
  });

  /* [공통]사이드바 */
  // 윈도우 리사이즈 이벤트
  $(window).on('resize', function () {
    if ($(window).width() >= 1200) {
      // PC 모드로 전환되면 초기화
      removeActiveClasses();
    }
  });
});