// 인증 관련 기능
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // 페이지 로드 시 로그인 상태 확인
        this.checkLoginStatus();
        
        // 탭 전환 이벤트
        this.initAuthTabs();
        
        // 로그인 폼 제출
        this.initLoginForm();
        
        // 회원가입 폼 제출
        this.initSignupForm();
        
        // 로그아웃 이벤트
        this.initLogout();
    }

    // 로그인 상태 확인
    checkLoginStatus() {
        const userData = localStorage.getItem('ashop_user');
        
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateUI();
            } catch (e) {
                localStorage.removeItem('ashop_user');
            }
        }
    }

    // 탭 전환 초기화
    initAuthTabs() {
        const tabs = document.querySelectorAll('.auth-tab');
        const forms = document.querySelectorAll('.auth-form');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // 모든 탭 비활성화
                tabs.forEach(t => t.classList.remove('active'));
                forms.forEach(f => f.classList.remove('active'));
                
                // 선택한 탭 활성화
                tab.classList.add('active');
                document.getElementById(`${tabId}Form`).classList.add('active');
            });
        });
    }

    // 로그인 폼 초기화
    initLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // 유효성 검사
            if (!this.validateEmail(email)) {
                this.showError('loginEmail', '유효한 이메일을 입력해주세요.');
                return;
            }
            
            if (!password || password.length < 6) {
                this.showError('loginPassword', '비밀번호를 6자 이상 입력해주세요.');
                return;
            }
            
            try {
                // 실제로는 서버로 요청
                const user = await this.login(email, password);
                
                if (user) {
                    this.showMessage('로그인되었습니다!', 'success');
                    this.updateUI();
                    closeLoginModal();
                } else {
                    this.showMessage('이메일 또는 비밀번호가 틀렸습니다.', 'error');
                }
            } catch (error) {
                console.error('로그인 오류:', error);
                this.showMessage('로그인 중 오류가 발생했습니다.', 'error');
            }
        });
    }

    // 회원가입 폼 초기화
    initSignupForm() {
        const signupForm = document.getElementById('signupForm');
        if (!signupForm) return;

        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('signupName').value;
            const phone = document.getElementById('signupPhone').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // 유효성 검사
            if (!name || name.trim().length < 2) {
                this.showError('signupName', '성명을 2자 이상 입력해주세요.');
                return;
            }
            
            if (!this.validatePhone(phone)) {
                this.showError('signupPhone', '올바른 핸드폰번호 형식(010-1234-5678)으로 입력해주세요.');
                return;
            }
            
            if (!this.validateEmail(email)) {
                this.showError('signupEmail', '유효한 이메일을 입력해주세요.');
                return;
            }
            
            if (!password || password.length < 6) {
                this.showError('signupPassword', '비밀번호를 6자 이상 입력해주세요.');
                return;
            }
            
            if (password !== confirmPassword) {
                this.showError('confirmPassword', '비밀번호가 일치하지 않습니다.');
                return;
            }
            
            if (!agreeTerms) {
                this.showMessage('약관에 동의해주세요.', 'error');
                return;
            }
            
            try {
                // 실제로는 서버로 요청
                const user = await this.signup({ name, phone, email, password });
                
                if (user) {
                    this.showMessage('회원가입이 완료되었습니다!', 'success');
                    this.updateUI();
                    closeLoginModal();
                }
            } catch (error) {
                console.error('회원가입 오류:', error);
                this.showMessage('회원가입 중 오류가 발생했습니다.', 'error');
            }
        });
    }

    // 로그인 처리 (데모용)
    async login(email, password) {
        // 실제로는 서버 API 호출
        // 데모용으로 localStorage 사용
        
        // 이미 저장된 사용자 확인
        const users = JSON.parse(localStorage.getItem('ashop_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const userData = {
                id: user.id,
                name: user.name,
                phone: user.phone,
                email: user.email,
                loggedIn: true,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('ashop_user', JSON.stringify(userData));
            this.currentUser = userData;
            
            // Google Sheets에도 저장 (선택사항)
            await this.saveUserDataToSheets(userData, '로그인');
            
            return userData;
        }
        
        // 데모용 계정 (초기 테스트용)
        if (email === 'test@ashop.com' && password === '123456') {
            const userData = {
                id: 'demo_001',
                name: '테스트사용자',
                phone: '010-1234-5678',
                email: 'test@ashop.com',
                loggedIn: true,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('ashop_user', JSON.stringify(userData));
            this.currentUser = userData;
            
            return userData;
        }
        
        return null;
    }

    // 회원가입 처리 (데모용)
    async signup(userData) {
        // 사용자 목록 가져오기
        const users = JSON.parse(localStorage.getItem('ashop_users') || '[]');
        
        // 이메일 중복 확인
        if (users.some(u => u.email === userData.email)) {
            throw new Error('이미 가입된 이메일입니다.');
        }
        
        // 새 사용자 추가
        const newUser = {
            id: 'user_' + Date.now(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('ashop_users', JSON.stringify(users));
        
        // 로그인 상태로 설정
        const loginData = {
            id: newUser.id,
            name: newUser.name,
            phone: newUser.phone,
            email: newUser.email,
            loggedIn: true,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('ashop_user', JSON.stringify(loginData));
        this.currentUser = loginData;
        
        // Google Sheets에 저장
        await this.saveUserDataToSheets(loginData, '회원가입');
        
        return loginData;
    }

    // 로그아웃 초기화
    initLogout() {
        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
    }

    // 로그아웃 처리
    logout() {
        localStorage.removeItem('ashop_user');
        this.currentUser = null;
        this.updateUI();
        this.showMessage('로그아웃되었습니다.', 'success');
    }

    // UI 업데이트
    updateUI() {
        const loginLink = document.getElementById('loginLink');
        const userInfo = document.querySelector('.user-info');
        const userName = document.querySelector('.user-name');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (this.currentUser && this.currentUser.loggedIn) {
            // 로그인 상태
            if (loginLink) loginLink.style.display = 'none';
            if (userInfo) userInfo.style.display = 'flex';
            
            if (userName) {
                userName.textContent = this.currentUser.name || this.currentUser.email.split('@')[0];
            }
            
            if (userAvatar) {
                const name = this.currentUser.name || this.currentUser.email;
                userAvatar.textContent = name.charAt(0).toUpperCase();
                
                // 아바타 색상 생성
                const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];
                const colorIndex = name.charCodeAt(0) % colors.length;
                userAvatar.style.backgroundColor = colors[colorIndex];
            }
        } else {
            // 로그아웃 상태
            if (loginLink) loginLink.style.display = 'block';
            if (userInfo) userInfo.style.display = 'none';
        }
    }

    // Google Sheets에 사용자 데이터 저장
    async saveUserDataToSheets(userData, action) {
        try {
            const timestamp = new Date().toLocaleString('ko-KR');
            const payload = {
                formType: '사용자계정',
                timestamp: timestamp,
                action: action,
                userId: userData.id,
                userName: userData.name,
                userPhone: userData.phone,
                userEmail: userData.email
            };
            
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            console.log(`${action} 데이터가 Google Sheets에 저장되었습니다.`);
        } catch (error) {
            console.error('Google Sheets 저장 오류:', error);
        }
    }

    // 유효성 검사
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePhone(phone) {
        const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
        return phoneRegex.test(phone);
    }

    // 에러 표시
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = field.parentElement.querySelector('.error-message');
        
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        }
        
        field.focus();
    }

    // 메시지 표시
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message--${type}`;
        messageDiv.innerHTML = `
            <div class="form-message-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="form-message-close">&times;</button>
        `;
        
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            z-index: 10000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        // 닫기 버튼
        const closeBtn = messageDiv.querySelector('.form-message-close');
        closeBtn.addEventListener('click', () => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        });
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 5000);
    }
}

// 전역 함수
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // 폼 초기화
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => form.reset());
        
        // 에러 메시지 숨기기
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
        });
    }
}

// 모달 열기/닫기 함수는 main.js에서 정의됨

// 페이지 로드 시 인증 매니저 초기화
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
});

// 글로벌 접근
window.AuthManager = AuthManager;
window.closeLoginModal = closeLoginModal;
