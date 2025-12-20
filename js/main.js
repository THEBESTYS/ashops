// DOM 요소
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close-modal');
const loginLink = document.getElementById('loginLink');
const loginForm = document.querySelector('.login-form');
const logoutBtn = document.querySelector('.btn-logout');
const userInfo = document.querySelector('.user-info');
const githubLoginBtn = document.querySelector('.github-login');

// 모바일 메뉴 토글
menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// 로그인 링크 클릭
loginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    openLoginModal();
});

// 모달 열기
function openLoginModal() {
    loginModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// 모달 닫기
closeModal?.addEventListener('click', closeLoginModal);
loginModal?.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeLoginModal();
    }
});

function closeLoginModal() {
    loginModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 로그인 폼 제출
loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // 간단한 클라이언트 측 유효성 검사
    if (!email || !password) {
        alert('이메일과 비밀번호를 입력해주세요.');
        return;
    }
    
    // 실제로는 서버로 요청을 보내야 합니다
    // 여기서는 데모용으로 localStorage에 저장
    const user = {
        email: email,
        name: email.split('@')[0],
        loggedIn: true
    };
    
    localStorage.setItem('ashop_user', JSON.stringify(user));
    updateLoginUI();
    closeLoginModal();
    alert('로그인되었습니다!');
});

// GitHub 로그인
githubLoginBtn?.addEventListener('click', () => {
    // GitHub OAuth 리다이렉트
    const clientId = 'YOUR_GITHUB_CLIENT_ID'; // 실제 클라이언트 ID로 교체
    const redirectUri = encodeURIComponent(window.location.origin);
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user`;
    
    window.location.href = githubAuthUrl;
});

// 로그아웃
logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('ashop_user');
    updateLoginUI();
    alert('로그아웃되었습니다.');
});

// 로그인 상태 업데이트
function updateLoginUI() {
    const userData = JSON.parse(localStorage.getItem('ashop_user'));
    
    if (userData && userData.loggedIn) {
        // 로그인 상태일 때
        loginLink.style.display = 'none';
        userInfo.style.display = 'flex';
        
        const userName = userData.name || userData.email.split('@')[0];
        document.querySelector('.user-name').textContent = userName;
        
        // 아바타 초기
        const avatar = document.querySelector('.user-avatar');
        avatar.textContent = userName.charAt(0).toUpperCase();
        
        // 아바타 색상 생성
        const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];
        const colorIndex = userName.charCodeAt(0) % colors.length;
        avatar.style.backgroundColor = colors[colorIndex];
    } else {
        // 로그아웃 상태일 때
        loginLink.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

// 페이지 로드 시 로그인 상태 확인
document.addEventListener('DOMContentLoaded', () => {
    updateLoginUI();
    
    // GitHub OAuth 콜백 처리
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // GitHub OAuth 인증 코드가 있으면 처리
        handleGitHubCallback(code);
    }
});

// GitHub 콜백 처리 (데모용)
async function handleGitHubCallback(code) {
    // 실제로는 서버에서 처리해야 합니다
    console.log('GitHub OAuth code:', code);
    
    // 데모용: GitHub 사용자 정보 가져오기
    try {
        const user = {
            email: 'github_user@example.com',
            name: 'GitHub User',
            loggedIn: true,
            avatar: 'G'
        };
        
        localStorage.setItem('ashop_user', JSON.stringify(user));
        updateLoginUI();
        
        // URL에서 code 제거
        window.history.replaceState({}, document.title, window.location.pathname);
        
        alert('GitHub으로 로그인되었습니다!');
    } catch (error) {
        console.error('GitHub 로그인 오류:', error);
        alert('GitHub 로그인 중 오류가 발생했습니다.');
    }
}

// 스크롤 시 헤더 스타일 변경
window.addEventListener('scroll', () => {
    const header = document.querySelector('.main-header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'var(--shadow)';
    }
});
