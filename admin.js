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
        const attachment = item.attachment_url
            ? `<a href="${item.attachment_url}" target="_blank" style="color:red">Xem File</a>`
            : 'Không';

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
