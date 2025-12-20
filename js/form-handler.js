// Google Sheets 연동을 위한 폼 핸들러
class FormHandler {
    constructor() {
        this.googleScriptUrl = 'https://script.google.com/macros/s/AKfycbxKeEtnfDPSuZunaw8nYVBWA9WnDeEwHi_G4zu6g_KlhLCisq8kmAiZeVs1l4N4yhS6/exec';
        this.initContactForm();
        this.initEstimateForm();
    }

    // 문의하기 폼 초기화
    initContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            // 유효성 검사
            if (!this.validateContactForm(data)) {
                return;
            }
            
            try {
                await this.submitToGoogleSheets('문의하기', data);
                this.showSuccessMessage('문의가 성공적으로 제출되었습니다. 빠른 시일 내에 연락드리겠습니다.');
                contactForm.reset();
            } catch (error) {
                this.showErrorMessage('문의 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
                console.error('문의 폼 제출 오류:', error);
            }
        });
    }

    // 견적 신청 폼 초기화
    initEstimateForm() {
        const estimateForm = document.getElementById('estimateForm');
        if (!estimateForm) return;

        estimateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(estimateForm);
            const data = Object.fromEntries(formData.entries());
            
            // 추가적인 견적 폼 데이터 처리
            data['견적유형'] = this.getEstimateType(data);
            data['예상예산'] = this.getBudgetRange(data);
            
            try {
                await this.submitToGoogleSheets('견적신청', data);
                this.showSuccessMessage('견적 신청이 완료되었습니다. 24시간 내에 상담 연락드리겠습니다.');
                estimateForm.reset();
            } catch (error) {
                this.showErrorMessage('견적 신청 중 오류가 발생했습니다. 다시 시도해주세요.');
                console.error('견적 폼 제출 오류:', error);
            }
        });
    }

    // Google Sheets로 데이터 전송
    async submitToGoogleSheets(formType, data) {
        const timestamp = new Date().toLocaleString('ko-KR');
        const payload = {
            formType: formType,
            timestamp: timestamp,
            ...data
        };

        const response = await fetch(this.googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        // no-cors 모드에서는 response를 읽을 수 없으므로
        // 항상 성공으로 간주하고 실제 에러 처리는 Google Apps Script에서
        return true;
    }

    // 문의 폼 유효성 검사
    validateContactForm(data) {
        const { name, email, phone, message } = data;
        
        if (!name || name.trim().length < 2) {
            this.showErrorMessage('이름을 정확히 입력해주세요.');
            return false;
        }
        
        if (!this.isValidEmail(email)) {
            this.showErrorMessage('유효한 이메일 주소를 입력해주세요.');
            return false;
        }
        
        if (!this.isValidPhone(phone)) {
            this.showErrorMessage('유효한 전화번호를 입력해주세요.');
            return false;
        }
        
        if (!message || message.trim().length < 10) {
            this.showErrorMessage('문의 내용을 10자 이상 입력해주세요.');
            return false;
        }
        
        return true;
    }

    // 견적 유형 추출
    getEstimateType(data) {
        const services = [];
        if (data.website === 'on') services.push('웹사이트 제작');
        if (data.branding === 'on') services.push('브랜딩');
        if (data.marketing === 'on') services.push('마케팅');
        
        return services.length > 0 ? services.join(', ') : '기타';
    }

    // 예산 범위 추출
    getBudgetRange(data) {
        const budget = data.budget;
        if (!budget) return '미정';
        
        const ranges = {
            'under500': '500만원 미만',
            '500-1000': '500만원 - 1000만원',
            '1000-3000': '1000만원 - 3000만원',
            'over3000': '3000만원 이상'
        };
        
        return ranges[budget] || budget;
    }

    // 이메일 유효성 검사
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 전화번호 유효성 검사
    isValidPhone(phone) {
        const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
        return phoneRegex.test(phone);
    }

    // 성공 메시지 표시
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    // 에러 메시지 표시
    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    // 메시지 표시 공통 함수
    showMessage(message, type = 'info') {
        // 기존 메시지 제거
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 새 메시지 생성
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message--${type}`;
        messageDiv.innerHTML = `
            <div class="form-message-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="form-message-close">&times;</button>
        `;
        
        // 메시지 스타일
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
        
        // 닫기 버튼 이벤트
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

// CSS 애니메이션 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .form-message-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .form-message-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .form-message-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// 폼 템플릿 HTML (필요시 추가)
const formTemplates = {
    contactForm: `
        <form id="contactForm" class="contact-form">
            <div class="form-group">
                <label for="name">이름 *</label>
                <input type="text" id="name" name="name" required>
            </div>
            
            <div class="form-group">
                <label for="company">회사명</label>
                <input type="text" id="company" name="company">
            </div>
            
            <div class="form-group">
                <label for="email">이메일 *</label>
                <input type="email" id="email" name="email" required>
            </div>
            
            <div class="form-group">
                <label for="phone">전화번호 *</label>
                <input type="tel" id="phone" name="phone" placeholder="010-1234-5678" required>
            </div>
            
            <div class="form-group">
                <label for="service">관심 서비스</label>
                <select id="service" name="service">
                    <option value="">선택해주세요</option>
                    <option value="website">웹사이트 제작</option>
                    <option value="branding">브랜드 디자인</option>
                    <option value="marketing">마케팅 컨설팅</option>
                    <option value="consulting">전략 컨설팅</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="message">문의 내용 *</label>
                <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            
            <button type="submit" class="btn-primary">
                <i class="fas fa-paper-plane"></i> 문의 보내기
            </button>
        </form>
    `,
    
    estimateForm: `
        <form id="estimateForm" class="estimate-form">
            <div class="form-section">
                <h4>기본 정보</h4>
                <div class="form-group">
                    <label for="estimateName">담당자 이름 *</label>
                    <input type="text" id="estimateName" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="estimateCompany">회사명 *</label>
                    <input type="text" id="estimateCompany" name="company" required>
                </div>
                
                <div class="form-group">
                    <label for="estimateEmail">이메일 *</label>
                    <input type="email" id="estimateEmail" name="email" required>
                </div>
            </div>
            
            <div class="form-section">
                <h4>프로젝트 정보</h4>
                <div class="form-group">
                    <label>필요한 서비스 *</label>
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" name="website"> 웹사이트 제작/리뉴얼
                        </label>
                        <label>
                            <input type="checkbox" name="branding"> 브랜드 디자인
                        </label>
                        <label>
                            <input type="checkbox" name="marketing"> 디지털 마케팅
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="projectDesc">프로젝트 설명 *</label>
                    <textarea id="projectDesc" name="projectDesc" rows="4" required></textarea>
                </div>
                
                <div class="form-group">
                    <label for="budget">예상 예산 *</label>
                    <select id="budget" name="budget" required>
                        <option value="">선택해주세요</option>
                        <option value="under500">500만원 미만</option>
                        <option value="500-1000">500만원 - 1000만원</option>
                        <option value="1000-3000">1000만원 - 3000만원</option>
                        <option value="over3000">3000만원 이상</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="timeline">예상 일정</label>
                    <input type="text" id="timeline" name="timeline" placeholder="예: 3개월 이내">
                </div>
            </div>
            
            <div class="form-section">
                <h4>추가 정보</h4>
                <div class="form-group">
                    <label for="reference">참고사이트 (URL)</label>
                    <input type="url" id="reference" name="reference" placeholder="https://example.com">
                </div>
                
                <div class="form-group">
                    <label for="additionalInfo">기타 요청사항</label>
                    <textarea id="additionalInfo" name="additionalInfo" rows="3"></textarea>
                </div>
            </div>
            
            <button type="submit" class="btn-primary">
                <i class="fas fa-calculator"></i> 무료 견적 신청
            </button>
        </form>
    `
};

// 폼 핸들러 초기화
document.addEventListener('DOMContentLoaded', () => {
    new FormHandler();
    
    // 폼이 있는 페이지에서 폼 템플릿 삽입
    const contactSection = document.getElementById('contact');
    const estimateSection = document.getElementById('estimate');
    
    if (contactSection) {
        contactSection.innerHTML += formTemplates.contactForm;
    }
    
    if (estimateSection) {
        estimateSection.innerHTML += formTemplates.estimateForm;
    }
});

// Google Apps Script 연동 테스트
async function testGoogleSheetsConnection() {
    try {
        const testData = {
            formType: '연동테스트',
            timestamp: new Date().toLocaleString('ko-KR'),
            test: 'success'
        };
        
        const response = await fetch('https://script.google.com/macros/s/AKfycbxKeEtnfDPSuZunaw8nYVBWA9WnDeEwHi_G4zu6g_KlhLCisq8kmAiZeVs1l4N4yhS6/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('Google Sheets 연동 테스트 완료');
        return true;
    } catch (error) {
        console.error('Google Sheets 연동 테스트 실패:', error);
        return false;
    }
}

// 글로벌 접근을 위한 export
window.FormHandler = FormHandler;
window.testGoogleSheetsConnection = testGoogleSheetsConnection;
