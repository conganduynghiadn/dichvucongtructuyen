
const ADMIN_PASS = 'Duynghia@2026'; // Mật khẩu đơn giản

// Initial dummy data if localStorage is empty
const DUMMY_DATA = [
    {
        id: 1,
        created_at: new Date().toISOString(),
        full_name: 'Nguyễn Văn A',
        phone_number: '0901234567',
        procedure_type: 'Đăng ký thường trú',
        notes: 'Hồ sơ đầy đủ',
        attachment_url: 'https://via.placeholder.com/150'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // Initialize data if not present
    if (!localStorage.getItem('feedback_data')) {
        localStorage.setItem('feedback_data', JSON.stringify(DUMMY_DATA));
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

function fetchData() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Đang tải...</td></tr>';

    try {
        const storedData = localStorage.getItem('feedback_data');
        const data = storedData ? JSON.parse(storedData) : [];
        
        // Sort by created_at desc
        data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        renderTable(data);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="color:red">Lỗi: ${err.message}</td></tr>`;
    }
}

function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Chưa có dữ liệu</td></tr>';
        return;
    }

    data.forEach(item => {
        const tr = document.createElement('tr');
        const created = new Date(item.created_at).toLocaleString('vi-VN');
        
        let attachmentHtml = 'Không có ảnh';
        if (item.attachment_url) {
            attachmentHtml = `<img src="${item.attachment_url}" alt="Ảnh đính kèm" style="max-height: 100px; max-width: 150px; border-radius: 4px; border: 1px solid #ddd;">`;
        }

        tr.innerHTML = `
            <td>${created}</td>
            <td><strong>${item.full_name || ''}</strong></td>
            <td>${item.phone_number || ''}</td>
            <td>${item.procedure_type || ''}</td>
            <td>${item.notes || ''}</td>
            <td>${attachmentHtml}</td>
            <td>
                <button onclick="openEditModal(${item.id})" style="padding: 5px 10px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">Sửa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Edit Modal Functions
function openEditModal(id) {
    const storedData = localStorage.getItem('feedback_data');
    const data = storedData ? JSON.parse(storedData) : [];
    const item = data.find(x => x.id === id);

    if (item) {
        document.getElementById('editId').value = item.id;
        document.getElementById('editName').value = item.full_name || '';
        document.getElementById('editImage').value = item.attachment_url || '';
        
        document.getElementById('editModal').style.display = 'flex';
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function saveEdit() {
    const id = parseInt(document.getElementById('editId').value);
    const newImageUrl = document.getElementById('editImage').value;

    const storedData = localStorage.getItem('feedback_data');
    let data = storedData ? JSON.parse(storedData) : [];
    
    const index = data.findIndex(x => x.id === id);
    if (index !== -1) {
        data[index].attachment_url = newImageUrl;
        localStorage.setItem('feedback_data', JSON.stringify(data));
        
        alert('Cập nhật thành công!');
        closeEditModal();
        fetchData();
    } else {
        alert('Không tìm thấy hồ sơ!');
    }
}
