// ashop - Main JavaScript
// DOM 요소
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close-modal');
const loginLink = document.getElementById('loginLink');
const logoutBtn = document.querySelector('.btn-logout');

// 모바일 메뉴 토글
menuToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    }
});

// 로그인 링크 클릭
loginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    openLoginModal();
});

// 닫기 버튼 클릭
closeModal?.addEventListener('click', closeLoginModal);

// 모달 바깥 클릭 시 닫기
loginModal?.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeLoginModal();
    }
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLoginModal();
    }
});

// 모달 열기 함수
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // 탭 초기화: 로그인 탭 활성화
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');
        
        tabs.forEach((tab, index) => {
            tab.classList.remove('active');
            forms[index].classList.remove('active');
        });
        
        if (tabs[0]) tabs[0].classList.add('active');
        if (forms[0]) forms[0].classList.add('active');
        
        // 폼 초기화
        const formsInModal = modal.querySelectorAll('form');
        formsInModal.forEach(form => {
            form.reset();
            // 에러 메시지 숨기기
            const errorMessages = form.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.classList.remove('show'));
        });
    }
}

// 모달 닫기 함수
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// 스크롤 시 헤더 스타일 변경
window.addEventListener('scroll', () => {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 50) {
        header?.style.setProperty('box-shadow', '0 5px 20px rgba(0, 0, 0, 0.1)');
    } else {
        header?.style.setProperty('box-shadow', 'var(--shadow)');
    }
});

// 부드러운 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        // #으로 시작하는 내부 링크만 처리
        if (href.startsWith('#')) {
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // 헤더 높이 고려
                const headerHeight = document.querySelector('.main-header')?.offsetHeight || 0;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // 모바일 메뉴 닫기
                if (navMenu?.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    const icon = menuToggle?.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            }
        }
    });
});

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('ashop 웹사이트 로드 완료');
    
    // 현재 활성 메뉴 표시
    const currentPath = window.location.hash;
    if (currentPath) {
        const activeLink = document.querySelector(`.nav-link[href="${currentPath}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
});

// 글로벌 함수로 노출
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
