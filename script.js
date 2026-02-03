/**
 * Công an xã Duy Nghĩa - Landing Page Scripts
 * Author: Trần Duy
 * Supabase Integration
 */

// ===========================================
// SUPABASE CONFIGURATION
// ===========================================
const SUPABASE_URL = 'https://ablxkfcrtyhogqjptqpi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFibHhrZmNydHlob2dxanB0cXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTUyMjIsImV4cCI6MjA4NTYzMTIyMn0.ZJw2GsGWYqWS0W5zkWkr7-r83VlgfzsvWoI3UaX5WSA';

// Initialize Supabase client
let supabaseClient = null;

function initSupabase() {
    try {
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase connected successfully!');
            return true;
        } else {
            console.error('❌ Supabase library not loaded');
            return false;
        }
    } catch (error) {
        console.error('❌ Supabase initialization error:', error);
        return false;
    }
}

// ===========================================
// MAIN INITIALIZATION
// ===========================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('📄 DOM loaded, initializing...');

    // Initialize Supabase
    initSupabase();

    // Initialize form
    initFeedbackForm();
    initSmoothScroll();
    initAnimations();

    console.log('✅ All initializations complete');
});

/**
 * Initialize Feedback Form
 */
function initFeedbackForm() {
    const form = document.getElementById('feedbackForm');

    if (!form) {
        console.error('❌ Form not found!');
        return;
    }

    console.log('📝 Form found, attaching event listener...');

    // Set default date to today
    const dateInput = document.getElementById('procedureDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    // Form submission handler - using onsubmit as backup
    form.onsubmit = async function (e) {
        e.preventDefault();
        e.stopPropagation();

        console.log('📤 Form submitted!');

        // Get form data
        const formData = {
            full_name: document.getElementById('fullName').value.trim(),
            phone_number: document.getElementById('phoneNumber').value.trim(),
            procedure_date: document.getElementById('procedureDate').value,
            procedure_type: document.getElementById('procedureType').value,
            notes: document.getElementById('notes').value.trim()
        };

        console.log('📋 Form data:', formData);

        // Validate form
        if (!validateForm(formData)) {
            return false;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';
        submitBtn.disabled = true;

        try {
            // Save to Supabase
            if (supabaseClient) {
                console.log('📡 Sending to Supabase...');

                const { data, error } = await supabaseClient
                    .from('feedback')
                    .insert([formData])
                    .select();

                if (error) {
                    console.error('❌ Supabase Error:', error);
                    alert('Có lỗi xảy ra: ' + error.message);
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return false;
                }

                console.log('✅ Saved to Supabase:', data);
            } else {
                console.warn('⚠️ Supabase not connected, logging to console only');
                console.log('=== PHẢN ÁNH MỚI ===');
                console.log('Họ và tên:', formData.full_name);
                console.log('Số điện thoại:', formData.phone_number);
                console.log('Ngày thực hiện:', formData.procedure_date);
                console.log('Thủ tục:', formData.procedure_type);
                console.log('Khó khăn, vướng mắc:', formData.notes || '(Không có)');
                console.log('====================');
            }

            // Show success message
            showSuccessMessage();

            // Reset form
            form.reset();

            // Reset date to today
            if (dateInput) {
                const today = new Date().toISOString().split('T')[0];
                dateInput.value = today;
            }

        } catch (error) {
            console.error('❌ Error:', error);
            alert('Có lỗi xảy ra. Vui lòng thử lại!');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }

        return false;
    };

    console.log('✅ Form event listener attached');
}

/**
 * Validate form data
 */
function validateForm(data) {
    if (!data.full_name) {
        alert('Vui lòng nhập họ và tên!');
        document.getElementById('fullName').focus();
        return false;
    }

    if (!data.phone_number) {
        alert('Vui lòng nhập số điện thoại!');
        document.getElementById('phoneNumber').focus();
        return false;
    }

    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(data.phone_number.replace(/[\s.-]/g, ''))) {
        alert('Số điện thoại không hợp lệ!');
        document.getElementById('phoneNumber').focus();
        return false;
    }

    if (!data.procedure_date) {
        alert('Vui lòng chọn ngày thực hiện thủ tục!');
        document.getElementById('procedureDate').focus();
        return false;
    }

    if (!data.procedure_type) {
        alert('Vui lòng chọn thủ tục!');
        document.getElementById('procedureType').focus();
        return false;
    }

    return true;
}

/**
 * Show success message
 */
function showSuccessMessage() {
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.id = 'successOverlay';
    overlay.innerHTML = `
        <div class="success-modal">
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Đã gửi phản ánh thành công!</h3>
            <p>Cảm ơn bạn đã gửi phản ánh. Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
            <button class="btn btn-primary" onclick="closeSuccessMessage()">
                <i class="fas fa-times"></i> Đóng
            </button>
        </div>
    `;

    // Add styles if not already added
    if (!document.getElementById('successStyles')) {
        const style = document.createElement('style');
        style.id = 'successStyles';
        style.textContent = `
            .success-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.3s ease;
            }
            
            .success-modal {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                max-width: 400px;
                margin: 1rem;
                animation: slideUp 0.3s ease;
            }
            
            .success-icon {
                font-size: 4rem;
                color: #4CAF50;
                margin-bottom: 1rem;
            }
            
            .success-modal h3 {
                color: #333;
                margin-bottom: 0.5rem;
            }
            
            .success-modal p {
                color: #666;
                margin-bottom: 1.5rem;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideUp {
                from { 
                    opacity: 0;
                    transform: translateY(20px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(overlay);
}

/**
 * Close success message
 */
function closeSuccessMessage() {
    const overlay = document.getElementById('successOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Make function globally accessible
window.closeSuccessMessage = closeSuccessMessage;

/**
 * Initialize smooth scrolling
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize animations on scroll
 */
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    document.querySelectorAll('.info-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(-30px)';
        card.style.transition = `all 0.5s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translate(0) !important;
        }
    `;
    document.head.appendChild(style);
}
