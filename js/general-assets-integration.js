/**
 * ملف تكامل الأصول الوسائطية مع محرر الفيديو العام
 * يقوم هذا الملف بدمج جميع الأصول الوسائطية (صور، خلفيات، أصوات، خطوط) مع محرر الفيديو العام
 */

// استيراد الأصول الوسائطية
const ASSETS_PATH = '../assets/';

// تعريف مسارات الأصول
const GENERAL_ASSETS = {
  // الخلفيات
  backgrounds: {
    general: []
  },
  
  // الأصوات
  audio: {
    effects: [
      ASSETS_PATH + 'effects/ui-pop-sound.mp3'
    ]
  },
  
  // الخطوط
  fonts: {
    arabic: [
      { name: 'Amiri', path: ASSETS_PATH + 'fonts/Amiri.zip' },
      { name: 'Cairo', path: ASSETS_PATH + 'fonts/Cairo.zip' }
    ]
  },
  
  // الفلاتر والتأثيرات
  filters: [
    { name: 'عادي', id: 'normal', preview: null },
    { name: 'سيبيا', id: 'sepia', preview: null },
    { name: 'أبيض وأسود', id: 'grayscale', preview: null },
    { name: 'تباين عالي', id: 'high-contrast', preview: null },
    { name: 'إشراق', id: 'brightness', preview: null },
    { name: 'تشبع', id: 'saturation', preview: null }
  ],
  
  // الانتقالات
  transitions: [
    { name: 'تلاشي', id: 'fade', preview: null },
    { name: 'مسح', id: 'wipe', preview: null },
    { name: 'تقسيم', id: 'split', preview: null },
    { name: 'دوران', id: 'rotate', preview: null },
    { name: 'تكبير', id: 'zoom', preview: null }
  ],
  
  // الأيقونات
  icons: {}
};

/**
 * تحميل الخطوط العربية
 */
function loadGeneralFonts() {
  GENERAL_ASSETS.fonts.arabic.forEach(font => {
    const fontFace = new FontFace(font.name, `url('${font.path}')`);
    fontFace.load().then(loadedFace => {
      document.fonts.add(loadedFace);
      console.log(`تم تحميل الخط ${font.name} بنجاح`);
    }).catch(error => {
      console.error(`فشل تحميل الخط ${font.name}:`, error);
    });
  });
}

/**
 * تحميل الفلاتر والتأثيرات
 */
function loadFiltersAndEffects() {
  const filtersContainer = document.getElementById('general-filters-container');
  if (!filtersContainer) return;
  
  GENERAL_ASSETS.filters.forEach(filter => {
    const filterElement = document.createElement('div');
    filterElement.className = 'filter-item';
    filterElement.innerHTML = `<span>${filter.name}</span>`;
    filterElement.dataset.filterId = filter.id;
    filterElement.addEventListener('click', () => applyFilter(filter.id));
    filtersContainer.appendChild(filterElement);
  });
}

/**
 * تحميل الانتقالات
 */
function loadTransitions() {
  const transitionsContainer = document.getElementById('general-transitions-container');
  if (!transitionsContainer) return;
  
  GENERAL_ASSETS.transitions.forEach(transition => {
    const transitionElement = document.createElement('div');
    transitionElement.className = 'transition-item';
    transitionElement.innerHTML = `<span>${transition.name}</span>`;
    transitionElement.dataset.transitionId = transition.id;
    transitionElement.addEventListener('click', () => applyTransition(transition.id));
    transitionsContainer.appendChild(transitionElement);
  });
}

/**
 * تطبيق فلتر
 */
function applyFilter(filterId) {
  const videoPreview = document.getElementById('general-video-preview');
  if (!videoPreview) return;
  
  // إزالة جميع الفلاتر السابقة
  videoPreview.className = 'video-preview';
  
  // إضافة الفلتر الجديد
  videoPreview.classList.add(`filter-${filterId}`);
  
  playUISound('click');
  console.log(`تم تطبيق الفلتر: ${filterId}`);
}

/**
 * تطبيق انتقال
 */
function applyTransition(transitionId) {
  const timelineElement = document.getElementById('general-timeline');
  if (!timelineElement) return;
  
  // إضافة علامة الانتقال على الخط الزمني
  const transitionMarker = document.createElement('div');
  transitionMarker.className = `transition-marker transition-${transitionId}`;
  transitionMarker.title = `انتقال: ${transitionId}`;
  timelineElement.appendChild(transitionMarker);
  
  playUISound('click');
  console.log(`تم تطبيق الانتقال: ${transitionId}`);
}

/**
 * تشغيل مؤثر صوتي للواجهة
 */
function playUISound(soundType = 'click') {
  const sound = GENERAL_ASSETS.audio.effects[0]; // استخدام المؤثر الصوتي الأول كمؤثر افتراضي
  const audio = new Audio(sound);
  audio.play();
}

/**
 * تهيئة تكامل الأصول للمحرر العام
 */
function initGeneralAssetsIntegration() {
  loadGeneralFonts();
  loadFiltersAndEffects();
  loadTransitions();
  
  // إضافة مستمعي الأحداث للأزرار
  document.querySelectorAll('.general-ui-button').forEach(button => {
    button.addEventListener('click', () => playUISound('click'));
  });
  
  console.log('تم تهيئة تكامل الأصول للمحرر العام بنجاح');
}

// تصدير الدوال للاستخدام الخارجي
export {
  GENERAL_ASSETS,
  initGeneralAssetsIntegration,
  loadGeneralFonts,
  loadFiltersAndEffects,
  loadTransitions,
  applyFilter,
  applyTransition,
  playUISound
};
