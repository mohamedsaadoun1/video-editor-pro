/**
 * ملف تكامل الأصول الوسائطية مع محرر فيديو القرآن
 * يقوم هذا الملف بدمج جميع الأصول الوسائطية (صور، خلفيات، أصوات، خطوط) مع محرر فيديو القرآن
 */

// استيراد الأصول الوسائطية
const ASSETS_PATH = '../assets/';

// تعريف مسارات الأصول
const ASSETS = {
  // الخلفيات
  backgrounds: {
    islamic: [
      ASSETS_PATH + 'backgrounds/islamic/islamic_arabesque_pattern_dark.jpeg',
      ASSETS_PATH + 'backgrounds/islamic/mosque_interior_hassan_ii.jpeg'
    ],
    general: []
  },
  
  // الأصوات
  audio: {
    recitations: [
      ASSETS_PATH + 'audio/partial-quran-recitation-juz-amma.mp3'
    ],
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
  
  // الأيقونات
  icons: {}
};

/**
 * تحميل الخطوط العربية
 */
function loadArabicFonts() {
  ASSETS.fonts.arabic.forEach(font => {
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
 * تحميل الخلفيات الإسلامية
 */
function loadIslamicBackgrounds() {
  const backgroundsContainer = document.getElementById('islamic-backgrounds-container');
  if (!backgroundsContainer) return;
  
  ASSETS.backgrounds.islamic.forEach((bg, index) => {
    const bgElement = document.createElement('div');
    bgElement.className = 'background-item islamic';
    bgElement.style.backgroundImage = `url('${bg}')`;
    bgElement.dataset.bgPath = bg;
    bgElement.addEventListener('click', () => selectBackground(bg));
    backgroundsContainer.appendChild(bgElement);
  });
}

/**
 * تحميل التلاوات القرآنية
 */
function loadQuranRecitations() {
  const recitationsContainer = document.getElementById('quran-recitations-container');
  if (!recitationsContainer) return;
  
  ASSETS.audio.recitations.forEach((recitation, index) => {
    const recitationElement = document.createElement('div');
    recitationElement.className = 'recitation-item';
    recitationElement.innerHTML = `
      <audio src="${recitation}" controls></audio>
      <span>تلاوة ${index + 1}</span>
    `;
    recitationElement.dataset.recitationPath = recitation;
    recitationElement.addEventListener('click', () => selectRecitation(recitation));
    recitationsContainer.appendChild(recitationElement);
  });
}

/**
 * تشغيل مؤثر صوتي للواجهة
 */
function playUISound(soundType = 'click') {
  const sound = ASSETS.audio.effects[0]; // استخدام المؤثر الصوتي الأول كمؤثر افتراضي
  const audio = new Audio(sound);
  audio.play();
}

/**
 * اختيار خلفية
 */
function selectBackground(bgPath) {
  const editorCanvas = document.getElementById('quran-editor-canvas');
  if (!editorCanvas) return;
  
  editorCanvas.style.backgroundImage = `url('${bgPath}')`;
  playUISound('click');
  console.log(`تم اختيار الخلفية: ${bgPath}`);
}

/**
 * اختيار تلاوة
 */
function selectRecitation(recitationPath) {
  const audioPlayer = document.getElementById('quran-audio-player');
  if (!audioPlayer) return;
  
  audioPlayer.src = recitationPath;
  playUISound('click');
  console.log(`تم اختيار التلاوة: ${recitationPath}`);
}

/**
 * تهيئة تكامل الأصول
 */
function initAssetsIntegration() {
  loadArabicFonts();
  loadIslamicBackgrounds();
  loadQuranRecitations();
  
  // إضافة مستمعي الأحداث للأزرار
  document.querySelectorAll('.ui-button').forEach(button => {
    button.addEventListener('click', () => playUISound('click'));
  });
  
  console.log('تم تهيئة تكامل الأصول بنجاح');
}

// تصدير الدوال للاستخدام الخارجي
export {
  ASSETS,
  initAssetsIntegration,
  loadArabicFonts,
  loadIslamicBackgrounds,
  loadQuranRecitations,
  playUISound,
  selectBackground,
  selectRecitation
};
