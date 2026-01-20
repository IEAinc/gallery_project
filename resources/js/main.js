/* 함수 주석
* 1. [공통] 사이드바 (function, 실행문)
* 2. [공통] 셀렉트박스 (function)
* 3. [공통] 모달 관련 함수 (function, 실행문)
* 4. [공통] button/a 중복클릭 방지 (function, 실행문)
* 5. [대관안내 페이지] 탭 관련 함수
* 6. [인트로 페이지] 모달 title 업데이트 관련 함수
* 7. [인터렉션] - 이미지 확대/축소 관련 (미래서울관/인트로 모달)
*   7-1. 이미지 확대
*   7-2. 이미지 스크롤 이벤트
*  */
/* [변수 모음] */
/* a. 언어 설정 관련 */
const selectOptions1 = [
  { value: '한국어',  tag: 'button' },
  { value: 'ENGLISH',  tag: 'button' }
];
/* b. 인터렉션 관련 변수 모음 */
let expandEventInstances = {}; // 이벤트 저장용
let lastIsWide = null;
let resizeTimer = null;
/*-----------------------------------------------------------------------------------------------------*/
/* 1. [공통]사이드바 */
// 사이드바 열기
function openSideBar() {
  /* 1. 사이드바 */
  const $dimOverlay = $('#dim-overlay'); // Dim 처리 요소
  const $sidebar = $('.sidebar'); // 사이드바 메뉴
  const breakpoint = 1024; // PC와 모바일을 구분할 기준 너비

  if ($(window).width() < breakpoint) {
    removeMobileNavInert();
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
        .not('header nav')
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
  setMobileNavInert();
}
function setMobileNavInert() {
  const nav = document.querySelector('header nav');
  nav.setAttribute('inert', '');
}
function removeMobileNavInert() {
  const nav = document.querySelector('header nav');
  nav.removeAttribute('inert');
}
// -------- 사이드바 열고 닫기 관련 함수 모음 -----------
// 포커스 트랩 함수
function trapFocus(container) {

  function getFocusableElements() {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.offsetParent !== null);
  }

  // 첫 로드시 첫 요소에 포커스
  const initialFocusable = getFocusableElements();
  if (initialFocusable.length === 0) return;
  initialFocusable[0].focus();

  function handleKeydown(e) {
    if (e.key === 'Tab') {
      const focusableElements = getFocusableElements();
      const firstEl = focusableElements[0];
      const lastEl = focusableElements[focusableElements.length - 1];

      // Shift + Tab (역방향)
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
        return;
      }

      // Tab (정방향)
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }

    if (e.key === 'Escape') {
      closeSideBar();
    }
  }

  document.addEventListener('keydown', handleKeydown);
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
    $('body > *')
      .not($sidebar)
      .not($sidebar.parents())
      .not($dimOverlay)
      .not('.modal[style*="display: block"]')
      .not('header nav')  // 모바일 nav
      .removeAttr('inert');
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

/* 3. [공통]모달 관련 함수 */
// 모달 크기 조정 및 회전 처리
const PC_MODAL_WIDTH_MAP = {
  xxxs: '358px',
  xxs: '400px',
  xxs2: '560px',
  xs: '560px',
  sm: '600px',
  lg: '1520px',
  default: '800px'
};
// 디바이스 타입 판단
function getDeviceType() {
  const w = window.innerWidth;
  if (w <= 650) return 'mobile';
  if (w >= 651 && w <= 1200) return 'tablet';
  return 'pc';
}
// 실제 뷰포트 높이 계산 (safe area)
function getSafeViewportHeight() {
  const test = document.createElement('div');
  test.style.position = 'fixed';
  test.style.height = '100vh';
  test.style.width = '0';
  test.style.top = '0';
  document.documentElement.appendChild(test);
  const vh = test.offsetHeight;
  document.documentElement.removeChild(test);
  return vh;
}
// modal-content 초기화
function resetModalContent(content) {
  content.style.width = '';
  content.style.maxWidth = '';
  content.style.height = '';
  content.style.transform = '';
  content.style.transformOrigin = '';
  content.style.padding = '';
  content.style.borderRadius = '';
  const modalBody = content.querySelector('.modal-body');
  if (modalBody) {
    modalBody.style.height = '';
    modalBody.style.maxHeight = '';
    modalBody.style.overflow = '';
    modalBody.style.webkitOverflowScrolling = '';
  }
}
/* [모달] 높이 계산 방식에 따른 정리 */
// 1. multiple-ver 높이 계산
function applyMultipleModalStyle(modalContents, deviceType) {
  if (!modalContents.length) return;
  const weights = Array.from(modalContents).map(c => c.dataset.multiType === 'long' ? 2 : 1);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const safeAreaHeight = getSafeViewportHeight();

  let maxTotalHeight = safeAreaHeight * 0.8;
  let padding = 16;
  let buttonHeight = 20;

  if (deviceType === 'mobile') {
    maxTotalHeight -= modalContents.length * (buttonHeight + padding);
    maxTotalHeight = maxTotalHeight - 20
  } else if (deviceType === 'tablet') {
    maxTotalHeight -= modalContents.length * (buttonHeight + padding); // tablet 예외
    maxTotalHeight = maxTotalHeight - 20
  }

  modalContents.forEach((content, idx) => {
    const weight = weights[idx];
    const contentHeight = (maxTotalHeight * weight) / totalWeight;

    if (deviceType === 'mobile' || deviceType === 'tablet') {
      content.style.width = deviceType === 'tablet' ? 'calc(100% - 40px)' : '100%';
      content.style.maxWidth = '100%';
      content.style.height = 'auto';
    } else if (deviceType === 'pc') {
      const maxWidth = Object.keys(PC_MODAL_WIDTH_MAP).find(cls => content.classList.contains(cls)) || 'default';
      content.style.width = '100%';
      content.style.maxWidth = PC_MODAL_WIDTH_MAP[maxWidth];
      content.style.height = 'auto';
    }

    const modalBody = content.querySelector('.modal-body');
    if (modalBody) {
      modalBody.style.height = deviceType === 'pc' ? 'auto' : `${contentHeight}px`;
      modalBody.style.overflow = 'auto';
      modalBody.style.maxHeight = deviceType === 'pc' ? '100%' : '';
    }
  });
}
// 2. intro 페이지에서 사용하는 모달창 관련 스타일 적용
function applyNormalModalStyle(modalContents, deviceType) {
  if (!modalContents.length) return;
  const safeAreaHeight = getSafeViewportHeight();
  modalContents.forEach((content) => {
    if (deviceType === 'mobile') {
      content.style.width = '100%';
      content.style.maxWidth = 'calc(100% - 40px)';
      content.style.height = (safeAreaHeight - 40) + 'px';
    } else if ( deviceType === 'tablet') {
      content.style.width = '100%';
      content.style.maxWidth = 'calc(100% - 40px)';
      content.style.height = (safeAreaHeight - 40) + 'px';
    }
  })

}
// 모달 적용 main 함수
function adjustModalSize(modalId, options = {}) {
  if (!document.body.classList.contains('no-scroll')) {
    document.body.classList.add('no-scroll');
  }

  const modal = document.getElementById(modalId);
  if (!modal) return;
  const modalContents = modal.querySelectorAll('.modal-content');
  modalContents.forEach(resetModalContent);
  const modalType = modal.dataset.modalType || '';
  const deviceType = getDeviceType();
  if (modalType === 'multiple-modal-ver') {
    applyMultipleModalStyle(modalContents, deviceType);
  } else if (modalType === 'normal-ver') {
    applyNormalModalStyle(modalContents, deviceType);
  }
}

// -------- 모달 띄우기 함수 ------------
// 현재 열린 모달들을 스택으로 관리
let modalStack = []; // 모달 스택
function showModal(modalId, options = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const overlay = document.getElementById('overlay');
  const currentOpenModal = modalStack.length > 0
    ? document.getElementById(modalStack[modalStack.length - 1])
    : null;

  const isMultipleModal = modal.dataset.modalType === 'multiple-modal-ver';

  // 1. 기존 열려 있는 모달 비활성화
  if (currentOpenModal && !isMultipleModal) {
    currentOpenModal.setAttribute('aria-hidden', 'true');
    currentOpenModal.style.zIndex = '100001';
  }
  document.body.classList.add('no-scroll');

  // 2. 사이드바 상태 관리
  const sidebar = document.querySelector('.sidebar.active');
  if (sidebar) removeInertFromSideBar(sidebar);

  
  // 3. 위치 조정
  if (window.innerWidth > 1200 && options.absolute && options.triggerElement) {
    const rect = options.triggerElement.getBoundingClientRect();
    modal.style.position = 'absolute';
    modal.style.left = `${rect.left}px`;
    modal.style.top = `${rect.bottom + window.scrollY}px`;
  } else {
    modal.style.position = '';
    modal.style.left = '';
    modal.style.top = '';
  }

  // 4. 오버레이
  if (modal.classList.contains('no-dim')) {
    if (modal.id === 'modal-virtualKeyboard') {
      overlay?.classList.add('transparent');
    }
    overlay?.classList.add('active');
  }

  // 5. 탭 높이 업데이트
  const tabWraps = modal.querySelectorAll('.tab-wrap');
  if (tabWraps.length > 0) {
    const tabManager = new TabManager();
    setTimeout(() => tabManager.updateHeight(modalId), 0);
  }

  // 6. 포커스 트랩 & 크기 조정
  adjustModalSize(modalId, options);
  handleFocusTrap(modal);

  modalStack.forEach((id) => adjustModalSize(id));

  // [위치 이동] 2. multiple-modal-ver 여부에 따라 분기
  if (isMultipleModal) {
    // ---- 다중 모달 구조 ----
    modal.style.display = 'block';
    modal.style.zIndex = '100002';

    // 내부 콘텐츠 전부 열기 (혹은 options.targetId 지정 시 특정 것만)
    const allContents = modal.querySelectorAll('.modal-content');
    if (options.targetId) {
      allContents.forEach(c => c.style.display = 'none'); // 다른 건 닫기
      const targetContent = modal.querySelector(`#${options.targetId}`);
      if (targetContent) targetContent.style.display = 'block';
    } else {
      allContents.forEach((c, i) => {
        c.style.display = 'block';
        c.style.zIndex = 100003 + i;
      });
    }

    modal.setAttribute('aria-hidden', 'false');
    modalStack.push(modalId);
  } else {
    // ---- 일반 모달 ----
    modal.style.display = 'block';
    modal.style.zIndex = '100002';
    modal.setAttribute('aria-hidden', 'false');
    modalStack.push(modalId);
  }
  // [위치 이동] 4. 모달별 개별 처리
  if (modalId === 'modal_intro_swiper') {
    const preloadImages = () => {
      const images = document.querySelectorAll('#modal_intro_swiper img');
      let loaded = 0;
      return new Promise(resolve => {
        if (images.length === 0) return resolve();
        images.forEach(img => {
          const done = () => (++loaded === images.length && resolve());
          img.complete ? done() : (img.onload = done, img.onerror = done);
        });
      });
    };
    preloadImages().then(() => {
      const facilitySwiper = new Swiper(".facility-swiper", {
        slidesPerView: 1,
        loop: false,
        navigation: {
          nextEl: ".facility-swiper .swiper-button-next",
          prevEl: ".facility-swiper .swiper-button-prev"
        },
        virtualTranslate: true,
        effect: "fade",
        autoHeight: true,
        fadeEffect: { crossFade: true },
        on: {
          init: function () { this.update(); },
          slideChange: function () {
            const activeSlide = this.slides[this.activeIndex];
            updateFacilityTitle(modalId, activeSlide.dataset.facility);
          }
        }
      });
      updateFacilityTitle(modalId, 'b1');
    });
  } else if (modalId === 'modal_intro_space') {
    handleResizeInModal('event1');
    window.addEventListener("resize", () => handleResizeInModal('event1'));
  }
}
// 모달 안 focus 가능한 영역 확인 코드 : 최상단 모달에서만 tab키를 눌러도 반응해야하는게 목적
const handleFocusTrap = (modal) => {
  const getFocusableElements = () => {
    return Array.from(
      modal.querySelectorAll(`
        button:not([disabled]),
        [href]:not([aria-hidden="true"]),
        input:not([disabled]):not([type="hidden"]),
        select:not([disabled]),
        textarea:not([disabled]),
        [tabindex]:not([tabindex="-1"]),
        .custom-select .select-list[aria-hidden="false"] li button,
        .custom-select .select-list[aria-hidden="false"] li a
      `)
    ).filter((el) => {
      // const style = window.getComputedStyle(el);
      return isVisible(el);
    });
  };
  // 모달별 isEnforcingFocus 상태를 추가
  if (!modal._isEnforcingFocus) {
    modal._isEnforcingFocus = false;
  }

  const enforceFocus = (e) => {
    const isTopModal = modalStack[modalStack.length - 1] === modal.id;
    const activeElement = document.activeElement;

    if (!isTopModal || modal._isEnforcingFocus) return;

    if (!modal.contains(e.target)) {
      e.preventDefault();
      modal._isEnforcingFocus = true;

      if (activeElement && activeElement.closest('.custom-select')) {
        activeElement.focus(); // select 열려있는 경우 그대로 유지
      } else {
        const firstFocusable = getFocusableElements()[0];
        firstFocusable?.focus(); // 최신 요소 기준으로
      }

      setTimeout(() => {
        modal._isEnforcingFocus = false;
      }, 0);
    }
  };

  const keydownHandler = (e) => {
    if (e.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const currentIndex = focusableElements.indexOf(document.activeElement);
    if (currentIndex === -1) {
      requestAnimationFrame(() => {
        focusableElements[0]?.focus();
      });
      return;
    }

    e.preventDefault();

    let nextIndex;
    if (e.shiftKey) {
      nextIndex = currentIndex - 1 < 0 ? focusableElements.length - 1 : currentIndex - 1;
    } else {
      nextIndex = currentIndex + 1 >= focusableElements.length ? 0 : currentIndex + 1;
    }

    requestAnimationFrame(() => {
      focusableElements[nextIndex]?.focus();
    });
  };

  // 기존 이벤트 제거
  if (modal._enforceFocusHandler) {
    document.removeEventListener('focus', modal._enforceFocusHandler, true);
    document.removeEventListener('keydown', modal._keydownHandler, true);
  }

  // 새 이벤트 등록
  document.addEventListener('focus', enforceFocus, true);
  document.addEventListener('keydown', keydownHandler, true);

  // 핸들러 참조 저장
  modal._enforceFocusHandler = enforceFocus;
  modal._keydownHandler = keydownHandler;

  // 모달 열릴 때 첫 포커스
  setTimeout(() => {
    const firstFocusable = getFocusableElements()[0];
    firstFocusable?.focus();
  }, 0);
};
function isVisible(el) {
  if (!el) return false;
  if (el === document.body) return true;

  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  return isVisible(el.parentElement);
}
// 모달 숨기기 함수
function hideModal(modalId, focusId) {
  const modal = document.getElementById(modalId);
  const focus = document.getElementById(focusId);
  if (!modal) return;

  // ✅ 1. multiple-modal-ver 여부 확인
  const parentModal = modal.closest('.modal');
  const isMultipleModal = parentModal && parentModal.dataset.modalType === 'multiple-modal-ver';

  if (isMultipleModal && modal.classList.contains('modal-content')) {
    // ---- 내부 .modal-content 닫기 ----
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    // 내부 콘텐츠가 전부 닫혔는지 체크
    const visibleContents = parentModal.querySelectorAll('.modal-content[style*="display: block"], .modal-content:not([style])');
    if (visibleContents.length === 0) {
      // 부모 모달 닫기
      parentModal.style.display = 'none';
      parentModal.setAttribute('aria-hidden', 'true');

      // 스택에서 부모 ID 제거
      modalStack = modalStack.filter(id => id !== parentModal.id);
    }

  } else {
    // ---- 일반 모달 닫기 ----
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    modalStack = modalStack.filter(id => id !== modalId);
  }

  // ✅ 2. 포커스 트랩 해제
  const modalTarget = isMultipleModal ? parentModal : modal;
  if (modalTarget && modalTarget._enforceFocusHandler) {
    document.removeEventListener('focus', modalTarget._enforceFocusHandler, true);
    document.removeEventListener('keydown', modalTarget._keydownHandler, true);
    delete modalTarget._enforceFocusHandler;
    delete modalTarget._keydownHandler;
  }

  // ✅ 3. 이전 모달 복원
  const prevModalId = modalStack[modalStack.length - 1];
  if (prevModalId) {
    const prevModal = document.getElementById(prevModalId);
    if (prevModal) {
      prevModal.setAttribute('aria-hidden', 'false');
      handleFocusTrap(prevModal);
      requestAnimationFrame(() => {
        const firstFocusable = prevModal.querySelector(
          'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      });
    }
  } else {
    // ✅ 4. 모든 모달 닫힘 → 사이드바 복원
    const sidebar = document.querySelector('.sidebar.active');
    if (sidebar) {
      sidebar.setAttribute('aria-hidden', 'false');
      removeInertFromSideBar(sidebar);
      trapFocus(sidebar);
      requestAnimationFrame(() => {
        const firstFocusable = sidebar.querySelector(
          'button, [href], input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      });
    }
  }

  // ✅ 5. body 스크롤 복원
  if (modalStack.length === 0 && !document.querySelector('.sidebar')?.classList.contains('active')) {
    document.body.classList.remove('no-scroll');
  }
  // 팝업창 닫힌 후 focus될 요소 고르기
  if (focusId) {
    const targetEl = document.getElementById(focusId);
    if (targetEl instanceof HTMLElement) {
      // requestAnimationFrame으로 다음 화면 리페인트 시점에 포커스
      requestAnimationFrame(() => {
        targetEl.focus();
      });
    }
  }
}
/* 4. [공통] button/a 중복클릭 방지 (function, 실행문) */
// 클릭 방지 메서드
function applyClickInterval(elements, delay) {
  elements.forEach((element) => {
    // 클릭 방지 관리 상태 초기화
    element._clickBlocked = false;

    // 새로운 핸들러 등록
    element.__applyClickHandler__ = function (callback) {
      if (this._clickBlocked) {
        console.log("연타 방지 중: 클릭 무시됨");
        return; // 상태가 블록된 경우 클릭 차단
      }

      console.log("동작 실행: 정상적으로 클릭 동작 호출");
      this._clickBlocked = true;
      setTimeout(() => {
        this._clickBlocked = false; // block 해제
        console.log("연타 방지 해제: 다시 클릭 가능");
      }, delay);

      // 콜백 함수 실행 (실제 동작)
      if (typeof callback === "function") {
        callback();
      }
    };
  });
}
/* 5. 탭 관련 함수  ->  */
class TabManager {
  constructor(tabSwiperLists, lang = 'ko') {
    this.isMobile = window.innerWidth <= 1024;
    this.tabSwiperLists = tabSwiperLists;
    this.lang = lang;

    this.scaleStep = 0.15;
    this.mainSwiper = null;

    this.init();
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 1024;
    });
  }

  /* ---------------- init ---------------- */
  init() {
    this.initTabs();
    this.initSwiper();
  }

  /* ---------------- tabs ---------------- */
  initTabs() {
    const tabs = document.querySelectorAll('[role="tab"]');

    tabs.forEach((tab, index) => {
      tab.dataset.slide = index;

      tab.addEventListener('click', () => {
        this.activateTab(tab);
      });

      tab.addEventListener('keydown', e => {
        let newIndex = null;
        if (e.key === 'ArrowRight') newIndex = (index + 1) % tabs.length;
        if (e.key === 'ArrowLeft') newIndex = (index - 1 + tabs.length) % tabs.length;
        if (newIndex === null) return;

        e.preventDefault();
        tabs[newIndex].focus();
        this.activateTab(tabs[newIndex]);
      });
    });

    // 초기 활성 탭
    this.activateTab(tabs[0], false);
  }

  activateTab(selectedTab, moveSlide = true) {
    const tabs = document.querySelectorAll('[role="tab"]');

    tabs.forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    selectedTab.classList.add('active');
    selectedTab.setAttribute('aria-selected', 'true');
    selectedTab.tabIndex = 0;

    if (moveSlide && this.mainSwiper) {
      const index = Number(selectedTab.dataset.slide);
      this.mainSwiper.slideToLoop(index);
    }
  }

  /* ---------------- swiper ---------------- */
  initSwiper() {
    const panel = document.querySelector('[role="tabpanel"]');
    if (!panel) return;

    const swiperEl = panel.querySelector('.banner-swiper');
    if (!swiperEl) return;

    const list = this.tabSwiperLists.panel1;
    const txt = this.lang === 'en' ? 'Rental Reservation' : '대관 예약하기';
    const $wrapper = $(swiperEl).find('.swiper-wrapper');

    // 슬라이드 생성
    $wrapper.empty();
    list.forEach(item => {
      $wrapper.append(`
        <div class="swiper-slide">
          <div class="banner-swipe-box">
            <div class="img-box">
              <img src="../../resources/images/sub-page/space-rental/${item.img.pc}" alt="">
            </div>
            <div class="text">
              <span>${item.contents}</span>
              <p>${item.title}</p>
            </div>
            <div class="btn-wrap">
              <a href="${item.link}" class="btn size-md bg-green link">${txt}</a>
            </div>
          </div>
        </div>
      `);
    });

    const loopEnabled = list.length >= 3;

    this.mainSwiper = new Swiper(swiperEl, {
      slidesPerView: 'auto',
      centeredSlides: true,
      loop: loopEnabled,
      loopedSlides: loopEnabled ? Math.min(list.length, 7) : 0,
      grabCursor: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        0: { spaceBetween: 30 },
        650: { spaceBetween: 60 },
      },
      on: {
        init: swiper => {
          swiper.update();
          if (loopEnabled) swiper.slideToLoop(0, 0);
        },
        slideChange: swiper => {
          const index = swiper.realIndex;
          const tab = document.querySelector(`[role="tab"][data-slide="${index}"]`);
          if (tab) this.activateTab(tab, false);
        },
        progress: swiper => {
          const zIndexMax = swiper.slides.length;

          swiper.slides.forEach(slide => {
            const p = slide.progress;
            const abs = Math.abs(p);
            const sign = abs === 0 ? 0 : Math.sign(p);
            const translate = `${sign * this.getTranslateOffset(abs) * 100}%`;
            const scale = this.getSlideScale(p);
            const zIndex = zIndexMax - Math.abs(Math.round(p));

            slide.style.transform = `translateX(${translate}) scale(${scale})`;
            slide.style.zIndex = zIndex;
            slide.style.opacity = abs > 3 ? '0' : '1';
          });
        }
      }
    });
  }

  /* ---------------- swiper effect ---------------- */
  getSlideScale(progress) {
    return 1 - Math.abs(progress) * this.scaleStep;
  }

  getTranslateOffsetStep(progress, depth = 0) {
    if (progress < 1 || depth > 20) return 0;
    return 1 - this.getSlideScale(progress) +
      this.getTranslateOffsetStep(progress - 1, depth + 1);
  }

  getTranslateOffset(progress, depth = 0) {
    if (progress < 1 || depth > 20) return 0;
    return (1 - this.getSlideScale(progress)) * 0.5 +
      this.getTranslateOffsetStep(progress - 1, depth + 1);
  }
}

/* 6. intro 페이지 */
function updateFacilityTitle(modalId, facility) {
  // 현재 모달 안의 h3만 선택
  const titleEl = document.querySelector(`#${modalId} .title-wrap .tit h3`);
  if (!titleEl) return;

  const titleMap = {
    b1: {
      span: 'B1',
      text: '서울의 비전과 가치를 시민과 함께하는<br class="mo-only"/> 서울시 대표공간'
    },
    b2: {
      span: 'B2',
      text: '다양한 형태의 회의실로 시민참여·교육행사,<br class="mo-only"/> 시정회의 공간으로 탈바꿈'
    }
  };

  const { span, text } = titleMap[facility] || {};
  titleEl.innerHTML = `<span>${span}</span>${text}`;
  const modal = document.getElementById(modalId);
  const modalBody = modal.querySelector('.modal-body');
  // 모달 body 클래스 교체
  modalBody.classList.remove('flow-ver', 'flow-ver2');
  if (facility === 'b1') {
    modalBody.classList.add('flow-ver');
  } else if (facility === 'b2') {
    modalBody.classList.add('flow-ver2');
  }
}

/* 7. [인터렉션] - 이미지 확대/축소 관련 (미래서울관/인트로 모달)  */
/* 7-1. 이미지 확대 */
function initImageExpandEvent(eventName) {
  const boxes = document.querySelectorAll(`[data-expand-event="${eventName}"] .img-box`);
  if (!boxes.length) return;

  // 모든 박스 비활성화 후 첫 번째 활성화
  boxes.forEach(b => b.classList.remove("active"));
  boxes[0].classList.add("active");

  expandEventInstances[eventName] = [];

  let currentActive = boxes[0];

  boxes.forEach(box => {
    const listener = () => {
      if (box === currentActive) return; // 동일한 박스면 무시 (덜컥 방지)

      // 기존 애니메이션 중단
      boxes.forEach(b => gsap.killTweensOf(b));

      // 모든 박스 축소
      boxes.forEach(b => {
        if (b !== box) {
          gsap.to(b, {
            width: 360,
            scale: 1,
            duration: 0
          });
          gsap.to(b.querySelector("img"), { scale: 1});
          b.classList.remove("active");
        }
      });

      // 현재 활성화 박스 확대
      currentActive = box;
      box.classList.add("active");

      gsap.to(box, {
        width: "100%",
        duration: 0
      });
      gsap.to(box.querySelector("img"), { scale: 1.05, duration: 0.7 });

      // // desc 애니메이션
      const desc = box.querySelector(".desc-box");
      if (desc) {
        gsap.to(desc, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.1 });
      }
    };

    box.addEventListener("mouseenter", listener);
    expandEventInstances[eventName].push({ el: box, listener });
  });
}
function resetImageBoxes(boxes) {
  boxes.forEach((b, i) => {
    // 클래스 초기화
    b.classList.remove("active");
    if (i === 0) b.classList.add("active");

    // GSAP 인라인 스타일 초기화
    gsap.set(b, { clearProps: "all" });
    // ✅ 명시적으로 width 100%, border-radius 원복
    // gsap.set(b, { width: "100%", borderRadius: "40px" });
    const img = b.querySelector("img");
    if (img) gsap.set(img, { clearProps: "all" });
    const desc = b.querySelector(".desc-box");
    if (desc) gsap.set(desc, { clearProps: "all" });
  });
}
function destroyImageExpandEvent(eventName) {
  const instances = expandEventInstances[eventName];
  const boxes = document.querySelectorAll(`[data-expand-event="${eventName}"] .img-box`);
  
  // 초기화면
  if (!instances && boxes.length === 0) {
    console.log(`[${eventName}] 관련 이벤트나 요소 없음 → destroy 스킵`);
    return;
  }

  // 이벤트 제거
  if (instances) {
    instances.forEach(({ el, listener }) => {
      el.removeEventListener("mouseenter", listener);
    });
    console.log('destroy-확인중', instances)
    delete expandEventInstances[eventName];
  }

  // 초기 상태 복원
  if (boxes.length) {
    resetImageBoxes(boxes);
    console.log(`expand 이벤트 제거됨, 초기화 완료 (${eventName})`);
  }
  // destroy 후 전체 img-box에 active 추가
  // boxes.forEach(box => box.classList.add("active"));
}
function handleResizeInModal(eventId) {
  const w = window.innerWidth;
  const isWide = w >= 1024;

  // 상태 변화가 없으면 실행하지 않음 (불필요한 초기화 방지)
  // lastIsWide가 아직 설정되지 않았다면 초기화 (처음 한 번만)
  if (lastIsWide === null) lastIsWide = isWide;

  // 디바운스 처리 (리사이즈 중에는 잠시 대기)
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    console.log('리사이즈 감지:', w);

    if (isWide) {
      console.log('1400 이상 → 이벤트 재적용');
      destroyImageExpandEvent(eventId);
      setTimeout(() => initImageExpandEvent(eventId), 50);
    } else {
      console.log('1400 미만 → 이벤트 제거');
      destroyImageExpandEvent(eventId);
      // boxes.forEach(box => box.classList.add("active"));
      const boxes = document.querySelectorAll(`[data-expand-event="${eventId}"] .img-box`);
      boxes.forEach(box => box.classList.add("active"));
    }

    lastIsWide = isWide;
  }, 100);
}
function handleResize(eventId) {
  const w = window.innerWidth;
  const isWide = w >= 1024;


  // 상태 변화가 없으면 실행하지 않음 (불필요한 초기화 방지)
  // lastIsWide가 아직 설정되지 않았다면 초기화 (처음 한 번만)
  if (lastIsWide === null) lastIsWide = isWide;

  // 디바운스 처리 (리사이즈 중에는 잠시 대기)
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (isWide) {
      destroyImageExpandEvent(eventId);
      setTimeout(() => initImageExpandEvent(eventId), 50);
    } else {
      destroyImageExpandEvent(eventId);
      // boxes.forEach(box => box.classList.add("active"));
      const boxes = document.querySelectorAll(`[data-expand-event="${eventId}"] .img-box`);
      boxes.forEach(box => box.classList.add("active"));
    }
    lastIsWide = isWide;
  }, 100);
}
/* 7-2. 이미지 스크롤 이벤트 */
function destroySpaceHistory(eventId) {
  const gallery = document.querySelector(`[data-scroll-event="${eventId}"]`);
  if (!gallery) return;
  // ScrollTrigger 제거
  if (gallery.scrollTriggerInstance) {
    gallery.scrollTriggerInstance.kill();
    gallery.scrollTriggerInstance = null;
  }

  // active 클래스 제거
  const items = gallery.querySelectorAll(".history-item");
  const images = gallery.querySelectorAll(".image-item");
  const imgBoxes = gallery.querySelectorAll(".img-box");

  items.forEach(el => el.classList.remove("active"));
  images.forEach(el => el.classList.remove("active"));
  imgBoxes.forEach(el => el.classList.remove("active"));
}
function initSpaceHistory(eventId) {
  const gallery = document.querySelector(`[data-scroll-event="${eventId}"]`);
  if (!gallery) return;

  const items = gallery.querySelectorAll(".history-item");
  const images = gallery.querySelectorAll(".image-item");
  const imgBoxes = gallery.querySelectorAll(".img-box");
  const btnUp = gallery.querySelector(".history-controls .ico-up:not(.rotate)");
  const btnDown = gallery.querySelector(".history-controls .ico-up.rotate");

  let current = -1;

  gallery.scrollTriggerInstance = ScrollTrigger.create({
    trigger: gallery,
    start: "top top",
    end: () => `+=${items.length * 50}%`,
    pin: true,
    scrub: true,
    onEnter: () => showSlide(0),
    onUpdate: self => {
      const progress = self.progress;
      const totalSlides = items.length;
      const currentSlide = Math.floor(progress * (totalSlides - 1));
      showSlide(currentSlide);
      updateBar(progress);
    },
    onLeave: () => resetGallery(),
    onEnterBack: () => showSlide(current),
    onLeaveBack: () => resetGallery(),
    pinSpacing: true,
    fastScrollEnd: true
  });

  function showSlide(index) {
    if (index < 0) index = 0;
    if (index >= items.length) index = items.length - 1;
    if (index === current) return;
    current = index;

    items.forEach((el, i) => el.classList.toggle("active", i === index));
    images.forEach((el, i) => el.classList.toggle("active", i === index));
    imgBoxes.forEach((el, i) => el.classList.toggle("active", i === index)); // 첫 번째 active 포함

    // 스크롤 이동
    const galleryInner = gallery.querySelector(".gallery-inner");
    const activeItem = items[index];
    if (galleryInner && activeItem) {
      const scrollTop = activeItem.offsetTop - galleryInner.clientHeight / 2 + activeItem.clientHeight / 2;
      galleryInner.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }

  function updateBar(progress) {
    const bar = gallery.querySelector(".history-scroll .bar");
    if (bar) {
      gsap.to(bar, { height: `${progress * 100}%`, duration: 0.2, ease: "power1.out" });
    }
  }

  function resetGallery() {
    const scrollGallery = gallery.querySelector(".scroll-gallery");
    if (scrollGallery) {
      scrollGallery.style.height = "auto";
      scrollGallery.style.overflowY = "visible";
    }
  }

  btnUp.addEventListener("click", () => {
    showSlide(current - 1);
    updateProgressManually();
  });

  btnDown.addEventListener("click", () => {
    showSlide(current + 1);
    updateProgressManually();
  });

  function updateProgressManually() {
    const totalSlides = items.length;
    const progress = current / (totalSlides - 1);
    updateBar(progress);
  }
  items.forEach((item, index) => item.addEventListener("click", () => {
    showSlide(index)
    updateProgressManually()
  }));

  // 초기 상태: 첫 번째 요소 active
  showSlide(0);
}
/*  ----------------------------------------------------------- */
/* ----------------------------------------------------------- */
// 실행함수
document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------------------------------------------- */
  // 인트로 페이지에선 실행시킬 필요 없어 조건 추가.
  if (!document.body.classList.contains("intro")) {
    /* [공통] 언어 설정관련 */
    const isEnglish = window.location.hostname.includes('eng') || window.location.pathname.includes('/eng');
    const initialLangIndex = isEnglish ? 1 : 0;
    initializeCustomSelect(
    document.querySelector('.custom-select[data-options="1"]'),
    selectOptions1,
    { initialValue: selectOptions1[initialLangIndex].value }
    );
    /* 1. 헤더 관련 */
    /* -------------------------------------- */
    /* 1-1. [PC] 헤더 열기 */
    const header = document.querySelector("header");
    const nav = document.querySelector("nav");
    const navItems = document.querySelectorAll("nav > ul > li");
    const subMenus = document.querySelectorAll("nav > ul > li > ul");

    // hover 또는 focus 시 전체 열기
    navItems.forEach(li => {
      li.addEventListener("mouseenter", () => {
        subMenus.forEach(ul => ul.style.display = "block");
        header.classList.add("active");
      });

      li.addEventListener("focusin", () => {
        subMenus.forEach(ul => ul.style.display = "block");
        header.classList.add("active");
      });
    });

    // nav 영역 벗어나면 닫기
    nav.addEventListener("mouseleave", () => {
      subMenus.forEach(ul => ul.style.display = "none");
      header.classList.remove("active");
    });

    // focusout 예외 처리
    nav.addEventListener("focusout", (e) => {
      if (!e.relatedTarget || !e.relatedTarget.closest("nav")) {
        subMenus.forEach(ul => ul.style.display = "none");
        header.classList.remove("active");
      }
    });

    /* -------------------------------------- */
    /* 1-2. [Mobile] 사이드바 accordion */
    const accordion = document.querySelector(".accordion-nav-list");

    if (accordion) {
      accordion.addEventListener("click", (e) => {
        // 클릭된 요소가 button 또는 button 내부인지 체크
        const btn = e.target.closest("button");
        if (!btn) return;

        // button이 반드시 accordion의 직접 자식 li 안에 있어야 함
        const li = btn.closest("li");
        if (!li || !li.parentElement.classList.contains("accordion-nav-list")) return;

        const currentUl = btn.nextElementSibling;

        // 이미 열려 있으면 무시
        if (li.classList.contains("active")) return;

        // 다른 메뉴 닫기
        accordion.querySelectorAll(":scope > li").forEach(otherLi => {
          if (otherLi !== li) {
            otherLi.classList.remove("active");
            const otherBtn = otherLi.querySelector(":scope > button");
            const otherUl = otherLi.querySelector(":scope > ul");
            if (otherBtn) otherBtn.classList.remove("active");
            if (otherUl) otherUl.style.display = "none";
          }
        });

        // 현재 메뉴 열기
        li.classList.add("active");
        btn.classList.add("active");
        if (currentUl) currentUl.style.display = "block";
      });
    }


    /* -------------------------------------- */
    /* 언어 선택 버튼 */
    const headerLangBtns = document.querySelectorAll("header .tab-wrap button");

    headerLangBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        headerLangBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        console.log(`현재 선택된 언어: ${btn.textContent.trim()}`);
      });
    });
    /* ------------------------------------------------------------------- */
  }
  /* ------------------------------------------------------------------- */
  /* [추가] 사이드바 리사이즈시 강제 닫기 */
  let lastWindowWidth = window.innerWidth;
  const breakpoint = 1024;

  // 첫 로드시에 모바일일 경우
  if(lastWindowWidth < breakpoint) {
    setMobileNavInert();
  }

  // 리사이즈 이벤트
  let isMobileSidebar = window.innerWidth < breakpoint;

  window.addEventListener('resize', () => {
    const currentIsMobile = window.innerWidth < breakpoint;

    // 상태가 변할 때만 실행됨
    if (isMobileSidebar !== currentIsMobile) {
      if (isMobileSidebar && !currentIsMobile) {
        closeSideBar();        // 모바일 → PC
        removeMobileNavInert();
      } else {
        setMobileNavInert();   // PC → 모바일
      }
    }

    // 상태 저장
    isMobileSidebar = currentIsMobile;
  });
  /* 3. 모달 관련 함수 */
  const mobileMedia = window.matchMedia("(max-width: 650px)");
  let isMobile = mobileMedia.matches;

  const handleResize = () => {
    if (modalStack.length === 0) return;

    const currentIsMobile = mobileMedia.matches;

    modalStack.forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (!modal) return;

      if (modal.id === "modal-virtualKeyboard") {
        hideModal(modal.id);
        return;
      }
      adjustModalSize(modal.id);
    });

    // mobile <-> PC state 바뀐 경우
    if (isMobile !== currentIsMobile) {
      isMobile = currentIsMobile;
    }

    // body no-scroll 유지
    document.body.classList.add('no-scroll');
  };

  window.addEventListener("resize", handleResize);
  mobileMedia.addEventListener("change", handleResize);

  /* ------------------------------------------------------------------- */
  /* 모달 dim 클릭하여 닫기 */
  window.addEventListener("click", (event) => {
    const overlay = document.getElementById("overlay");
    const modals = document.querySelectorAll(".modal");
    const body = document.body;

    // 1) overlay 클릭 시 최상단 모달 닫기
    if (event.target === overlay) {
      const topModalId = modalStack[modalStack.length - 1];
      const topModal = document.getElementById(topModalId);

      if (topModal?.dataset.modalType !== "multiple-modal-ver") {
        topModal.style.display = "none";
        modalStack.pop();
        if (modalStack.length === 0) body.classList.remove("no-scroll");
        overlay.classList.remove("active", "transparent");
      }
      return;
    }

    // 2) 일반 모달 dim 클릭 시 닫기
    modals.forEach(modal => {
      if (event.target === modal) {
        if (modal.dataset.modalType === "multiple-modal-ver") return;
        modal.style.display = "none";
        modalStack.pop();
        if (modalStack.length === 0) body.classList.remove("no-scroll");
      }
    });
  });

  /* ------------------------------------------------------------------- */
  /* 4. 버튼 중복 클릭 방지 */
  const btns = document.querySelectorAll("button");
  applyClickInterval(btns, 1000);
});
