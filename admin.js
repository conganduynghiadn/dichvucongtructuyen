const SUPABASE_URL = 'https://ihaazciiotecnityaqrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYWF6Y2lpb3RlY25pdHlhcXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNTg0NDEsImV4cCI6MjA4NTYzNDQ0MX0.Hu0xpsc70ZswlQCsm9_exqTdLLqjfzzF072XrNYwK0g';

let supabaseClient;
const ADMIN_PASS = 'Duynghia@2026'; // Mật khẩu đơn giản

document.addEventListener('DOMContentLoaded', () => {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        alert('Lỗi: Không tải được thư viện Supabase');
    }

    // Check login state
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        showDashboard();
    }
});

function checkLogin() {
    const pass = document.getElementById('passwordInput').value;
    if (pass === ADMIN_PASS) {
        sessionStorage.setItem('isLoggedIn', 'true');
        showDashboard();
    } else {
        document.getElementById('errorMsg').style.display = 'block';
    }
}

function showDashboard() {
    document.getElementById('loginOverlay').style.display = 'none';
    document.getElementById('mainDashboard').style.display = 'block';
    fetchData();
}

async function fetchData() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Đang tải...</td></tr>';

    try {
        const { data, error } = await supabaseClient
            .from('feedback')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        renderTable(data);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="color:red">Lỗi: ${err.message}</td></tr>`;
    }
}

function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Chưa có dữ liệu</td></tr>';
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        const created = new Date(item.created_at).toLocaleString('vi-VN');

        let attachment = 'Không';
        if (item.attachment_url) {
            const url = item.attachment_url;
            const isBase64Image = url.startsWith('data:image');
            const isUrlImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i.test(url) ||
                (url.includes('supabase.co/storage') && !url.endsWith('.pdf') && !url.endsWith('.doc') && !url.endsWith('.docx'));

            if (isBase64Image || isUrlImage) {
                // Show inline thumbnail for all images (Base64 or URL)
                attachment = `<img src="${url}" class="thumb-img" onclick="openLightbox(this.src)" title="Click để xem full" onerror="this.outerHTML='<a href=&quot;${url}&quot; target=&quot;_blank&quot; class=&quot;attachment-link&quot;><i class=&quot;fas fa-external-link-alt&quot;></i> Xem File</a>'">`;
            } else if (url.startsWith('data:')) {
                // Base64 non-image file (PDF, etc)
                attachment = `<a href="${url}" download class="attachment-link"><i class="fas fa-download"></i> Tải file</a>`;
            } else {
                // Other URL (PDF, doc, etc)
                attachment = `<a href="${url}" target="_blank" class="attachment-link"><i class="fas fa-external-link-alt"></i> Xem File</a>`;
            }
        }

        tr.innerHTML = `
            <td>${created}</td>
            <td><strong>${item.full_name || ''}</strong></td>
            <td>${item.phone_number || ''}</td>
            <td>${item.procedure_type || ''}</td>
            <td>${item.notes || ''}</td>
            <td>${attachment}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ===== Lightbox =====
function openLightbox(src) {
    let overlay = document.getElementById('imgLightbox');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'imgLightbox';
        overlay.innerHTML = `
            <div class="lightbox-backdrop" onclick="closeLightbox()"></div>
            <div class="lightbox-content">
                <img id="lightboxImg" src="" alt="Ảnh đính kèm">
                <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    document.getElementById('lightboxImg').src = src;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const overlay = document.getElementById('imgLightbox');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}
