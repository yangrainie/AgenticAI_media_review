let mediaData = [];

// 初始化：載入資料
async function init() {
    try {
        const response = await fetch('data.json');
        mediaData = await response.json();
        renderCards(mediaData);
        setupEventListeners();
    } catch (error) {
        console.error('Error loading data:', error);
        // 如果 data.json 不存在，提供一些引導或空狀態
        document.getElementById('mediaGrid').innerHTML = '<p>暫無資料，請先執行 scripts/build_data.py 生成 data.json。</p>';
    }
}

// 渲染卡片
function renderCards(data) {
    const grid = document.getElementById('mediaGrid');
    grid.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        // 加上類別與子類別的 class 名稱，方便 CSS 套用顏色
        card.className = `card ${item.category} ${item.subcategory || ''}`;

        // 判斷是否為 Podcast 或無封面圖片
        const hasCover = item.cover_image && item.category !== 'podcast';
        const coverHtml = hasCover 
            ? `<img src="${item.cover_image}" alt="${item.title}" class="card-cover">`
            : `<div class="card-cover-placeholder ${item.subcategory || ''}">
                <span>${getCategoryName(item.category)}</span>
               </div>`;

        card.innerHTML = `
            ${coverHtml}
            <div class="card-info">
                <span class="category-tag ${item.subcategory || ''}">${getCategoryName(item.category)}</span>
                <h3 class="card-title">${item.title}</h3>
                <p class="card-meta">${item.author_or_director}</p>
                <div class="card-rating">${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</div>
                <div class="card-tags">
                    ${item.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                </div>
            </div>
        `;
        card.onclick = () => showDetail(item);
        grid.appendChild(card);
    });
}

function getCategoryName(cat) {
    const names = { 'book': '書籍', 'movie': '影視', 'podcast': 'Podcast' };
    return names[cat] || cat;
}

// 顯示詳情彈窗
function showDetail(item) {
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    
    // 1. 處理封面/佔位塊
    const hasCover = item.cover_image && item.category !== 'podcast';
    const coverHtml = hasCover 
        ? `<img src="${item.cover_image}" alt="${item.title}" class="modal-cover">`
        : `<div class="modal-cover-placeholder ${item.subcategory || ''}">${getCategoryName(item.category)}</div>`;

    // 2. 判斷類別：如果類別是 podcast，就渲染完整 Markdown 內文
    if (item.category === 'podcast') {
        const fullContentHtml = item.content ? marked.parse(item.content) : '<p>（暫無內文）</p>';
        
        modalBody.innerHTML = `
            <div class="modal-header">
                ${coverHtml}
                <div class="modal-info">
                    <h2>${item.title}</h2>
                    <p><strong>類別：</strong>${getCategoryName(item.category)}</p>
                    <p><strong>講者/節目：</strong>${item.author_or_director}</p>
                    <p><strong>評分：</strong>${'★'.repeat(item.rating)}${'☆'.repeat(5-item.rating)}</p>
                    <p><strong>標籤：</strong>${item.tags ? item.tags.join(', ') : ''}</p>
                </div>
            </div>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <div class="modal-markdown-content">
                ${fullContentHtml}
            </div>
        `;
    } else {
        // 3. 其他類別（書籍、影視）維持原本的欄位結構
        modalBody.innerHTML = `
            <div class="modal-header">
                ${coverHtml}
                <div class="modal-info">
                    <h2>${item.title}</h2>
                    <p><strong>類別：</strong>${getCategoryName(item.category)}</p>
                    <p><strong>作者/導演：</strong>${item.author_or_director}</p>
                    <p><strong>評分：</strong>${'★'.repeat(item.rating)}</p>
                    <p><strong>標籤：</strong>${item.tags.join(', ')}</p>
                </div>
            </div>
            <div class="modal-quote">
                ${item.quote || '（無金句紀錄）'}
            </div>
            <div class="modal-section">
                <h3>核心摘要</h3>
                <p>${item.summary || '（尚未填寫）'}</p>
            </div>
            <div class="modal-section">
                <h3>觀後心得與推薦</h3>
                <p>${item.thoughts || '（尚未填寫）'}</p>
            </div>
        `;
    }
    
    modal.style.display = 'block';
}

// 設置事件監聽
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const closeBtn = document.querySelector('.close-btn');
    const modal = document.getElementById('detailModal');

    // 搜尋功能
    searchInput.addEventListener('input', (e) => {
        filterData();
    });

    // 分類篩選
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterData();
        });
    });

    // 關閉彈窗
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = 'none';
    };
}

function filterData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const activeCategory = document.querySelector('.filter-btn.active').dataset.category;

    const filtered = mediaData.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm) || 
                              item.author_or_director.toLowerCase().includes(searchTerm) ||
                              item.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        
        return matchesSearch && matchesCategory;
    });

    renderCards(filtered);
}

document.addEventListener('DOMContentLoaded', init);
