// Auth Manager 개선
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // 페이지 로드 시 로그인 상태 확인
        this.checkLoginStatus();
        
        // 헤더 로그인 폼 이벤트
        this.initHeaderLogin();
        
        // 회원가입 링크 이벤트
        this.initSignupLinks();
        
        // 회원가입 폼 이벤트
        this.initSignupForm();
        
        // 로그아웃 이벤트
        this.initLogout();
        
        // 취소 버튼 이벤트 (추가)
        this.initCancelButtons();
        
        // 로그인 전환 링크 이벤트 (추가)
        this.initLoginSwitch();
    }

    checkLoginStatus() {
        const userData = localStorage.getItem('ashop_user');
        
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateUI();
            } catch (e) {
                console.error('사용자 데이터 파싱 오류:', e);
                localStorage.removeItem('ashop_user');
            }
        }
    }

    // 헤더 로그인 폼 초기화
    initHeaderLogin() {
        const headerLoginForm = document.querySelector('.header-login-form');
        if (!headerLoginForm) return;

        headerLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userId = document.getElementById('headerLoginId').value;
            const password = document.getElementById('headerLoginPassword').value;
            
            if (!userId || !password) {
                this.showMessage('아이디와 비밀번호를 입력해주세요.', 'error');
                return;
            }
            
            try {
                const user = await this.login(userId, password);
                
                if (user) {
                    this.showMessage(`${user.name}님, 환영합니다!`, 'success');
                    this.updateUI();
                    
                    // 폼 초기화
                    headerLoginForm.reset();
                } else {
                    // 로그인 실패 시 회원가입 모달 표시
                    this.showMessage('아이디 또는 비밀번호가 틀렸습니다. 회원가입을 진행해주세요.', 'error');
                    
                    // 2초 후 회원가입 모달 표시
                    setTimeout(() => {
                        this.openSignupModal();
                    }, 2000);
                }
            } catch (error) {
                console.error('로그인 오류:', error);
                this.showMessage('로그인 중 오류가 발생했습니다.', 'error');
            }
        });
    }

    // 회원가입 링크 초기화
    initSignupLinks() {
        const signupLinks = document.querySelectorAll('.signup-link, .signup-link-footer');
        signupLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSignupModal();
            });
        });
    }

    // 회원가입 모달 열기 (애니메이션 추가)
    openSignupModal() {
        const modal = document.getElementById('signupModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // 애니메이션을 위한 클래스 추가
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // 첫 번째 단계로 초기화
            this.resetSignupForm();
            
            // 첫 번째 입력 필드에 포커스
            setTimeout(() => {
                const firstInput = document.getElementById('signupUserId');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    // 회원가입 모달 닫기 (애니메이션 추가)
    closeSignupModal() {
        const modal = document.getElementById('signupModal');
        if (modal) {
            // 애니메이션 제거
            modal.classList.remove('show');
            
            // 애니메이션 완료 후 모달 숨기기
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // 폼 초기화
                this.resetSignupForm();
            }, 300);
        }
    }

    // 회원가입 폼 초기화
    initSignupForm() {
        const signupForm = document.getElementById('signupForm');
        if (!signupForm) return;

        // 다음 단계 버튼
        document.querySelectorAll('.btn-next-step').forEach(button => {
            button.addEventListener('click', (e) => {
                const nextStepId = e.target.getAttribute('data-next');
                this.goToSignupStep(nextStepId);
            });
        });

        // 이전 단계 버튼
        document.querySelectorAll('.btn-prev-step').forEach(button => {
            button.addEventListener('click', (e) => {
                const prevStepId = e.target.getAttribute('data-prev');
                this.goToSignupStep(prevStepId);
            });
        });

        // 전체 동의 체크박스
        const termAll = document.getElementById('termAll');
        if (termAll) {
            termAll.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                document.getElementById('termService').checked = isChecked;
                document.getElementById('termPrivacy').checked = isChecked;
                document.getElementById('termMarketing').checked = isChecked;
            });
        }

        // 폼 제출
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 1단계: 아이디, 비밀번호 검증
            const userId = document.getElementById('signupUserId').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!userId || userId.length < 4 || userId.length > 20) {
                this.showMessage('아이디는 4-20자로 입력해주세요.', 'error');
                return;
            }
            
            if (!password || password.length < 8) {
                this.showMessage('비밀번호는 8자 이상 입력해주세요.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                this.showMessage('비밀번호가 일치하지 않습니다.', 'error');
                return;
            }
            
            // 2단계: 개인정보 검증
            const name = document.getElementById('signupName').value;
            const phone = document.getElementById('signupPhone').value;
            const email = document.getElementById('signupEmail').value;
            
            if (!name || name.trim().length < 2) {
                this.showMessage('성명을 정확히 입력해주세요.', 'error');
                return;
            }
            
            if (!this.validatePhone(phone)) {
                this.showMessage('올바른 핸드폰번호 형식(010-1234-5678)으로 입력해주세요.', 'error');
                return;
            }
            
            if (!this.validateEmail(email)) {
                this.showMessage('유효한 이메일 주소를 입력해주세요.', 'error');
                return;
            }
            
            // 3단계: 약관 동의 검증
            if (!document.getElementById('termService').checked || 
                !document.getElementById('termPrivacy').checked) {
                this.showMessage('필수 약관에 동의해주세요.', 'error');
                return;
            }
            
            try {
                const userData = {
                    userId: userId,
                    name: name,
                    phone: phone,
                    email: email,
                    password: password,
                    company: document.getElementById('companyName').value || '',
                    marketingAgree: document.getElementById('termMarketing').checked
                };
                
                const user = await this.signup(userData);
                
                if (user) {
                    this.showMessage('회원가입이 완료되었습니다! 자동으로 로그인됩니다.', 'success');
                    this.closeSignupModal();
                    this.updateUI();
                }
            } catch (error) {
                console.error('회원가입 오류:', error);
                this.showMessage(error.message || '회원가입 중 오류가 발생했습니다.', 'error');
            }
        });
    }

    // 취소 버튼 초기화 (추가)
    initCancelButtons() {
        document.querySelectorAll('.btn-close-step').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeSignupModal();
            });
        });
    }

    // 로그인 전환 링크 초기화 (추가)
    initLoginSwitch() {
        const loginSwitchLinks = document.querySelectorAll('.switch-to-login');
        loginSwitchLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToLogin();
            });
        });
    }

    // 로그인으로 전환 (추가)
    switchToLogin() {
        // 회원가입 모달 닫기
        this.closeSignupModal();
        
        // 헤더 로그인 폼에 포커스
        setTimeout(() => {
            const loginIdInput = document.getElementById('headerLoginId');
            if (loginIdInput) {
                loginIdInput.focus();
                
                // 모바일 메뉴가 열려있다면 스크롤
                if (window.innerWidth <= 768) {
                    loginIdInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 350);
    }

    // 회원가입 단계 이동
    goToSignupStep(stepId) {
        const steps = document.querySelectorAll('.form-step');
        steps.forEach(step => step.classList.remove('active'));
        
        const targetStep = document.getElementById(stepId);
        if (targetStep) {
            targetStep.classList.add('active');
            
            // 진행바 업데이트
            const stepNumber = parseInt(stepId.replace('step', ''));
            const progress = (stepNumber / 3) * 100;
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }
            
            // 진행 단계 표시 업데이트
            const progressSteps = document.querySelectorAll('.progress-step');
            progressSteps.forEach((step, index) => {
                if (index < stepNumber) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
        }
    }

    // 회원가입 폼 초기화
    resetSignupForm() {
        this.goToSignupStep('step1');
        
        const form = document.getElementById('signupForm');
        if (form) {
            form.reset();
            
            // 체크박스 초기화
            const checkboxes = form.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        }
    }

    // 로그인 처리
    async login(userId, password) {
        // 저장된 사용자 확인
        const users = JSON.parse(localStorage.getItem('ashop_users') || '[]');
        const user = users.find(u => u.userId === userId && u.password === password);
        
        if (user) {
            const userData = {
                userId: user.userId,
                name: user.name,
                phone: user.phone,
                email: user.email,
                loggedIn: true,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('ashop_user', JSON.stringify(userData));
            this.currentUser = userData;
            
            // Google Sheets에 로그인 기록 저장
            await this.saveUserDataToSheets(userData, '로그인');
            
            return userData;
        }
        
        // 테스트 계정
        if (userId === 'test' && password === '12345678') {
            const userData = {
                userId: 'test',
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

    // 회원가입 처리
    async signup(userData) {
        const users = JSON.parse(localStorage.getItem('ashop_users') || '[]');
        
        // 아이디 중복 확인
        if (users.some(u => u.userId === userData.userId)) {
            throw new Error('이미 사용 중인 아이디입니다.');
        }
        
        // 이메일 중복 확인
        if (users.some(u => u.email === userData.email)) {
            throw new Error('이미 사용 중인 이메일입니다.');
        }
        
        // 새 사용자 추가
        const newUser = {
            id: 'user_' + Date.now(),
            ...userData,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('ashop_users', JSON.stringify(users));
        
        // 자동 로그인
        const loginData = {
            userId: newUser.userId,
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
        const userInfo = document.querySelector('.user-info');
        const loginFormContainer = document.querySelector('.login-form-container');
        
        if (this.currentUser && this.currentUser.loggedIn) {
            // 로그인 상태
            if (userInfo) {
                userInfo.style.display = 'flex';
                const userNameElement = document.querySelector('.user-name');
                if (userNameElement) {
                    userNameElement.textContent = this.currentUser.name;
                }
                
                const avatar = document.querySelector('.user-avatar');
                if (avatar) {
                    avatar.textContent = this.currentUser.name.charAt(0).toUpperCase();
                    
                    // 아바타 색상
                    const colors = ['#D4A76A', '#B8934F', '#9D6B53', '#1A1A2E', '#2D3047'];
                    const colorIndex = this.currentUser.name.charCodeAt(0) % colors.length;
                    avatar.style.background = colors[colorIndex];
                }
            }
            
            if (loginFormContainer) {
                loginFormContainer.style.display = 'none';
            }
        } else {
            // 로그아웃 상태
            if (userInfo) {
                userInfo.style.display = 'none';
            }
            
            if (loginFormContainer) {
                loginFormContainer.style.display = 'flex';
            }
        }
    }

    // Google Sheets에 저장
    async saveUserDataToSheets(userData, action) {
        try {
            const timestamp = new Date().toLocaleString('ko-KR');
            const payload = {
                formType: '사용자계정',
                timestamp: timestamp,
                action: action,
                userId: userData.userId,
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

    // 메시지 표시
    showMessage(message, type = 'info') {
        // 기존 메시지 제거
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message--${type}`;
        messageDiv.innerHTML = `
            <div class="form-message-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="form-message-close">&times;</button>
        `;
        
        // 스타일은 CSS에서 처리되도록 class만 추가
        document.body.appendChild(messageDiv);
        
        // 닫기 버튼 이벤트
        const closeBtn = messageDiv.querySelector('.form-message-close');
        closeBtn.addEventListener('click', () => {
            messageDiv.classList.add('hide');
            setTimeout(() => messageDiv.remove(), 300);
        });
        
        // 5초 후 자동 제거
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.classList.add('hide');
                setTimeout(() => messageDiv.remove(), 300);
            }
        }, 5000);
    }
}

// 글로벌 함수
function closeSignupModal() {
    const authManager = window.authManager;
    if (authManager) {
        authManager.closeSignupModal();
    }
}

// 페이지 로드 시 초기화
let authManager;

document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    window.authManager = authManager;
    
    // 모달 닫기 버튼 (X 버튼)
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            closeSignupModal();
        });
    });
    
    // 모달 바깥 클릭 시 닫기
    const signupModal = document.getElementById('signupModal');
    if (signupModal) {
        signupModal.addEventListener('click', (e) => {
            if (e.target === signupModal) {
                closeSignupModal();
            }
        });
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSignupModal();
        }
    });
});

// 글로벌 함수 노출
window.closeSignupModal = closeSignupModal;
