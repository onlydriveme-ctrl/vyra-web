// ==========================================
// 1. SUPABASE CONFIGURATION
// ==========================================
// သင်၏ Supabase Credentials များကို ဒီနေရာတွင် အစားထိုးပါ
const SUPABASE_URL = 'sb_publishable_WP0jDIE-VvkcNtcbhb6A7A_JWwT2X2F';
const SUPABASE_KEY = 'sb_secret_EHeVVQ4N1ZUE2MJZw2oXMQ_JE7M3hdT';

// Supabase Client ဖန်တီးခြင်း
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. GLOBAL STATES & DOM SELECTORS
// ==========================================
let articles = [];
let selectedArticle = null;
let currentCategory = 'all';

// DOM Elements
const desktopList = document.getElementById('desktop-list');
const desktopDetail = document.getElementById('desktop-detail');
const mobileList = document.getElementById('mobile-list');
const mobileDetail = document.getElementById('mobile-detail');
const mobileDetailContent = document.getElementById('mobile-detail-content');
const mobileBackBtn = document.getElementById('mobile-back-btn');
const categorySelect = document.getElementById('category-select');
const drawerOverlay = document.getElementById('drawer-overlay');
const menuBtn = document.getElementById('menu-btn');
const closeDrawerBtn = document.getElementById('close-drawer-btn');
const themeBtn = document.getElementById('theme-btn');
const themeIcon = document.getElementById('theme-icon');
const mainHeader = document.getElementById('main-header');

// ==========================================
// 3. FETCH DATA FROM SUPABASE
// ==========================================
async function fetchArticlesFromSupabase() {
    // Loading State ပြသခြင်း
    desktopList.innerHTML = `<div class="text-center py-20 text-gray-400">Database မှ စာမူများ ဆွဲယူနေပါသည်...</div>`;
    mobileList.innerHTML = `<div class="text-center py-20 text-gray-400">Database မှ စာမူများ ဆွဲယူနေပါသည်...</div>`;

    try {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            // Category Label Format ပြုလုပ်ခြင်း
            articles = data.map(item => ({
                ...item,
                categoryName: getCategoryName(item.category),
                date: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sep 18, 2026',
                readTime: item.read_time || '3 min read'
            }));

            selectedArticle = articles[0]; // Default အဖြစ် ပထမဆုံး စာမူကို ရွေးမည်
            renderArticles();
        } else {
            desktopList.innerHTML = `<div class="text-center py-20 text-gray-400">ဆောင်းပါးများ မရှိသေးပါ။</div>`;
            mobileList.innerHTML = `<div class="text-center py-20 text-gray-400">ဆောင်းပါးများ မရှိသေးပါ။</div>`;
            desktopDetail.innerHTML = `<div class="text-center py-20 text-gray-400">No article selected</div>`;
        }
    } catch (err) {
        console.error('Supabase Error:', err);
        desktopList.innerHTML = `<div class="text-center py-20 text-red-400">Data ချိတ်ဆက်မှု အဆင်မပြေပါ။</div>`;
        mobileList.innerHTML = `<div class="text-center py-20 text-red-400">Data ချိတ်ဆက်မှု အဆင်မပြေပါ။</div>`;
    }
}

// Category Name Helper
function getCategoryName(cat) {
    switch (cat) {
        case 'ai': return 'AI & Technology';
        case 'web': return 'Web Development';
        case 'movies': return 'Entertainment';
        default: return 'General';
    }
}

// ==========================================
// 4. UI RENDER FUNCTIONS
// ==========================================
function renderArticles() {
    const filtered = currentCategory === 'all' 
        ? articles 
        : articles.filter(a => a.category === currentCategory);

    if (filtered.length === 0) {
        desktopList.innerHTML = `<div class="text-center text-gray-400 py-10">ဤ Category တွင် စာမူမရှိသေးပါ။</div>`;
        mobileList.innerHTML = `<div class="text-center text-gray-400 py-10">ဤ Category တွင် စာမူမရှိသေးပါ။</div>`;
        desktopDetail.innerHTML = `<div class="text-center text-gray-400 py-20">Select an article</div>`;
        return;
    }

    // Desktop Cards Render
    desktopList.innerHTML = filtered.map(art => `
        <div onclick="selectArticle(${art.id})" class="article-card ${selectedArticle && art.id === selectedArticle.id ? 'active border-purple-500 bg-purple-500/5' : ''} bg-white dark:bg-darkCard p-5 rounded-2xl border border-gray-200 dark:border-purple-500/20 cursor-pointer hover:border-purple-500/60 transition-all">
            <span class="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400">${art.categoryName}</span>
            <h3 class="font-bold text-base mt-2.5 mb-1.5 line-clamp-2 text-gray-900 dark:text-gray-100">${art.title}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">${art.excerpt || ''}</p>
            <div class="flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 dark:border-gray-800/80 pt-3">
                <span>${art.author || 'VYRA'}</span>
                <span>${art.readTime}</span>
            </div>
        </div>
    `).join('');

    // Mobile Cards Render
    mobileList.innerHTML = filtered.map(art => `
        <div onclick="openMobileArticle(${art.id})" class="bg-white dark:bg-darkCard p-5 rounded-2xl border border-gray-200 dark:border-purple-500/20 active:scale-[0.98] transition-all">
            <span class="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md bg-purple-500/10 text-purple-400">${art.categoryName}</span>
            <h3 class="font-bold text-base mt-2 mb-1 text-gray-900 dark:text-gray-100">${art.title}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">${art.excerpt || ''}</p>
            <div class="flex items-center justify-between text-[11px] text-gray-400">
                <span>${art.date}</span>
                <span>${art.readTime}</span>
            </div>
        </div>
    `).join('');

    renderDesktopDetail();
    if (window.lucide) lucide.createIcons();
}

function renderDesktopDetail() {
    if (!selectedArticle) {
        desktopDetail.innerHTML = `<div class="text-center text-gray-500 py-20">Select an article to view details</div>`;
        return;
    }
    desktopDetail.innerHTML = `
        <span class="text-xs font-bold px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 uppercase tracking-wider">${selectedArticle.categoryName}</span>
        <h1 class="text-2xl font-extrabold my-4 leading-snug text-gray-900 dark:text-gray-100">${selectedArticle.title}</h1>
        <div class="flex items-center justify-between pb-4 mb-6 border-b border-gray-200 dark:border-gray-800 text-xs text-gray-400">
            <div>By <span class="text-purple-400 font-semibold">${selectedArticle.author || 'VYRA'}</span> • ${selectedArticle.date}</div>
            <div>${selectedArticle.readTime}</div>
        </div>
        <div class="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
            ${selectedArticle.content || ''}
        </div>
    `;
}

// ==========================================
// 5. EVENT HANDLERS & ACTIONS
// ==========================================
function selectArticle(id) {
    selectedArticle = articles.find(a => a.id === id);
    renderArticles();
}

function openMobileArticle(id) {
    selectedArticle = articles.find(a => a.id === id);
    mobileDetailContent.innerHTML = `
        <span class="text-xs font-bold px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 uppercase tracking-wider">${selectedArticle.categoryName}</span>
        <h1 class="text-xl font-bold my-3 leading-snug text-gray-900 dark:text-gray-100">${selectedArticle.title}</h1>
        <div class="text-xs text-gray-400 mb-4 pb-3 border-b border-gray-800">By ${selectedArticle.author || 'VYRA'} • ${selectedArticle.date}</div>
        <div class="text-gray-700 dark:text-gray-300 text-sm leading-relaxed space-y-4">${selectedArticle.content || ''}</div>
    `;
    mobileList.classList.add('hidden');
    mobileDetail.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

mobileBackBtn.addEventListener('click', () => {
    mobileDetail.classList.add('hidden');
    mobileList.classList.remove('hidden');
});

categorySelect.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderArticles();
});

// Mobile Drawer Controls
menuBtn.addEventListener('click', () => drawerOverlay.classList.remove('hidden'));
closeDrawerBtn.addEventListener('click', () => drawerOverlay.classList.add('hidden'));
drawerOverlay.addEventListener('click', (e) => {
    if (e.target === drawerOverlay) drawerOverlay.classList.add('hidden');
});

function filterByMenu(cat) {
    currentCategory = cat;
    categorySelect.value = cat;
    drawerOverlay.classList.add('hidden');
    renderArticles();
}

// Theme Toggle Engine
let isDark = true;
themeBtn.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
        document.documentElement.classList.add('dark');
        themeIcon.setAttribute('data-lucide', 'moon');
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.setAttribute('data-lucide', 'sun');
    }
    if (window.lucide) lucide.createIcons();
});

// Dynamic Scroll Header Hide/Show
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    if (window.scrollY > lastScrollY && window.scrollY > 80) {
        mainHeader.style.transform = 'translateY(-100%)';
    } else {
        mainHeader.style.transform = 'translateY(0)';
    }
    lastScrollY = window.scrollY;
});

// ==========================================
// 6. INITIALIZATION
// ==========================================
fetchArticlesFromSupabase();
              
