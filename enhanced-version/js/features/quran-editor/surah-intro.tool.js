/**
 * أداة مقدمات السور لمحرر فيديو القرآن
 * توفر واجهة برمجية لإنشاء وتخصيص مقدمات احترافية للسور القرآنية
 */

class SurahIntroTool {
  constructor() {
    this.templates = [];
    this.surahInfo = {};
    this.currentTemplate = null;
    this.customSettings = {
      duration: 5, // بالثواني
      showBasmala: true,
      showTranslation: true,
      animationStyle: 'fade'
    };
    this.initialized = false;
  }

  /**
   * تهيئة أداة مقدمات السور
   * @returns {Promise} وعد يتم حله عند اكتمال التهيئة
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // تحميل قوالب المقدمات
      this._initializeTemplates();
      
      // تحميل معلومات السور
      await this._loadSurahInfo();
      
      this.initialized = true;
      console.log('تم تهيئة أداة مقدمات السور بنجاح مع', this.templates.length, 'قالب');
    } catch (error) {
      console.error('خطأ في تهيئة أداة مقدمات السور:', error);
    }
    
    return this.initialized;
  }

  /**
   * الحصول على قائمة قوالب المقدمات المتاحة
   * @returns {Array} قائمة القوالب
   */
  getTemplates() {
    return this.templates;
  }

  /**
   * الحصول على معلومات سورة محددة
   * @param {number} surahNumber رقم السورة
   * @returns {Object|null} معلومات السورة أو null إذا لم يتم العثور عليها
   */
  getSurahInfo(surahNumber) {
    if (!this.initialized) {
      console.warn('أداة مقدمات السور غير مهيأة بعد');
      return null;
    }
    
    return this.surahInfo[surahNumber] || null;
  }

  /**
   * تعيين قالب المقدمة الحالي
   * @param {string} templateId معرف القالب
   * @returns {Object|null} معلومات القالب أو null إذا لم يتم العثور عليه
   */
  setTemplate(templateId) {
    if (!this.initialized) {
      console.warn('أداة مقدمات السور غير مهيأة بعد');
      return null;
    }
    
    const template = this.templates.find(t => t.id === templateId);
    if (template) {
      this.currentTemplate = template;
      console.log('تم تعيين قالب المقدمة:', template.name);
      return template;
    }
    
    console.warn('لم يتم العثور على قالب المقدمة:', templateId);
    return null;
  }

  /**
   * تعيين مدة المقدمة
   * @param {number} duration المدة بالثواني
   * @returns {boolean} نجاح العملية
   */
  setDuration(duration) {
    if (duration >= 3 && duration <= 15) {
      this.customSettings.duration = duration;
      console.log('تم تعيين مدة المقدمة:', duration, 'ثانية');
      return true;
    }
    
    console.warn('مدة المقدمة يجب أن تكون بين 3 و 15 ثانية');
    return false;
  }

  /**
   * تفعيل أو تعطيل عرض البسملة
   * @param {boolean} show حالة العرض
   */
  setShowBasmala(show) {
    this.customSettings.showBasmala = Boolean(show);
    console.log('تم', this.customSettings.showBasmala ? 'تفعيل' : 'تعطيل', 'عرض البسملة');
  }

  /**
   * تفعيل أو تعطيل عرض الترجمة
   * @param {boolean} show حالة العرض
   */
  setShowTranslation(show) {
    this.customSettings.showTranslation = Boolean(show);
    console.log('تم', this.customSettings.showTranslation ? 'تفعيل' : 'تعطيل', 'عرض الترجمة');
  }

  /**
   * تعيين أسلوب الحركة
   * @param {string} style أسلوب الحركة ('fade', 'slide', 'zoom', 'reveal')
   * @returns {boolean} نجاح العملية
   */
  setAnimationStyle(style) {
    if (['fade', 'slide', 'zoom', 'reveal'].includes(style)) {
      this.customSettings.animationStyle = style;
      console.log('تم تعيين أسلوب الحركة:', style);
      return true;
    }
    
    console.warn('أسلوب الحركة غير صالح. الخيارات المتاحة: fade, slide, zoom, reveal');
    return false;
  }

  /**
   * إنشاء مقدمة لسورة محددة
   * @param {number} surahNumber رقم السورة
   * @param {HTMLElement} containerElement عنصر الحاوية
   * @returns {Promise<boolean>} وعد يتم حله بنجاح العملية
   */
  async createSurahIntro(surahNumber, containerElement) {
    if (!this.initialized) {
      console.warn('أداة مقدمات السور غير مهيأة بعد');
      return false;
    }
    
    try {
      // التحقق من وجود معلومات السورة
      const surahInfo = this.getSurahInfo(surahNumber);
      if (!surahInfo) {
        console.warn('لم يتم العثور على معلومات السورة:', surahNumber);
        return false;
      }
      
      // التحقق من وجود قالب
      if (!this.currentTemplate) {
        // استخدام القالب الافتراضي إذا لم يتم تعيين قالب
        this.currentTemplate = this.templates[0];
      }
      
      // إنشاء عناصر المقدمة
      await this._renderSurahIntro(surahInfo, containerElement);
      
      console.log('تم إنشاء مقدمة لسورة:', surahInfo.name);
      return true;
    } catch (error) {
      console.error('خطأ في إنشاء مقدمة السورة:', error);
      return false;
    }
  }

  /**
   * تهيئة قوالب المقدمات
   * @private
   */
  _initializeTemplates() {
    this.templates = [
      {
        id: 'classic',
        name: 'كلاسيكي',
        description: 'قالب كلاسيكي بخلفية إسلامية تقليدية',
        backgroundType: 'image',
        backgroundUrl: 'assets/templates/surah-intros/classic_bg.jpg',
        textStyle: {
          titleFont: 'Amiri',
          titleSize: '3em',
          titleColor: '#FFD700',
          infoFont: 'Tajawal',
          infoSize: '1.5em',
          infoColor: '#FFFFFF'
        }
      },
      {
        id: 'modern',
        name: 'عصري',
        description: 'قالب عصري بتصميم بسيط وأنيق',
        backgroundType: 'gradient',
        backgroundGradient: 'linear-gradient(135deg, #1A2980 0%, #26D0CE 100%)',
        textStyle: {
          titleFont: 'Cairo',
          titleSize: '3.5em',
          titleColor: '#FFFFFF',
          infoFont: 'Cairo',
          infoSize: '1.8em',
          infoColor: 'rgba(255, 255, 255, 0.9)'
        }
      },
      {
        id: 'animated',
        name: 'متحرك',
        description: 'قالب بخلفية متحركة وتأثيرات بصرية',
        backgroundType: 'video',
        backgroundUrl: 'assets/templates/surah-intros/animated_bg.mp4',
        textStyle: {
          titleFont: 'Scheherazade',
          titleSize: '4em',
          titleColor: '#FFFFFF',
          infoFont: 'Tajawal',
          infoSize: '2em',
          infoColor: '#FFFFFF'
        }
      },
      {
        id: 'minimalist',
        name: 'بسيط',
        description: 'قالب بسيط مع التركيز على المحتوى',
        backgroundType: 'color',
        backgroundColor: '#000000',
        textStyle: {
          titleFont: 'Lateef',
          titleSize: '4em',
          titleColor: '#FFFFFF',
          infoFont: 'Tajawal',
          infoSize: '1.8em',
          infoColor: '#CCCCCC'
        }
      },
      {
        id: 'calligraphy',
        name: 'خط عربي',
        description: 'قالب يركز على جمال الخط العربي',
        backgroundType: 'image',
        backgroundUrl: 'assets/templates/surah-intros/calligraphy_bg.jpg',
        textStyle: {
          titleFont: 'Aref Ruqaa',
          titleSize: '4.5em',
          titleColor: '#FFD700',
          infoFont: 'Amiri',
          infoSize: '2em',
          infoColor: '#FFFFFF'
        }
      },
      {
        id: 'nature',
        name: 'طبيعة',
        description: 'قالب بخلفيات طبيعية تعكس جمال الخلق',
        backgroundType: 'image',
        backgroundUrl: 'assets/templates/surah-intros/nature_bg.jpg',
        textStyle: {
          titleFont: 'Scheherazade',
          titleSize: '3.8em',
          titleColor: '#FFFFFF',
          infoFont: 'Tajawal',
          infoSize: '1.8em',
          infoColor: '#FFFFFF'
        }
      }
    ];
    
    // تعيين القالب الافتراضي
    if (this.templates.length > 0) {
      this.currentTemplate = this.templates[0];
    }
  }

  /**
   * تحميل معلومات السور
   * @returns {Promise} وعد يتم حله عند اكتمال التحميل
   * @private
   */
  async _loadSurahInfo() {
    try {
      // استدعاء API للحصول على معلومات السور
      const response = await fetch('https://api.alquran.cloud/v1/meta');
      const data = await response.json();
      
      if (!response.ok || data.code !== 200) {
        throw new Error(`فشل في تحميل معلومات السور: ${data.status || response.statusText}`);
      }
      
      // معالجة البيانات
      const surahs = data.data.surahs.references;
      this.surahInfo = {};
      
      for (const surah of surahs) {
        this.surahInfo[surah.number] = {
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          numberOfAyahs: surah.numberOfAyahs,
          revelationType: surah.revelationType
        };
      }
      
      // إضافة معلومات إضافية
      await this._addAdditionalSurahInfo();
      
      return true;
    } catch (error) {
      console.error('خطأ في تحميل معلومات السور:', error);
      
      // استخدام معلومات احتياطية في حالة فشل الاتصال بالـ API
      this._loadFallbackSurahInfo();
      
      return false;
    }
  }

  /**
   * إضافة معلومات إضافية للسور
   * @returns {Promise} وعد يتم حله عند اكتمال الإضافة
   * @private
   */
  async _addAdditionalSurahInfo() {
    // معلومات إضافية عن السور (يمكن تحميلها من API آخر أو قاعدة بيانات)
    const additionalInfo = {
      1: { // الفاتحة
        mainTheme: 'أصول الدين والعبادة',
        virtues: 'أعظم سورة في القرآن، وتسمى أم الكتاب وأم القرآن والسبع المثاني',
        period: 'مكية'
      },
      2: { // البقرة
        mainTheme: 'التشريع والأحكام',
        virtues: 'أطول سورة في القرآن، وفيها آية الكرسي أعظم آية في القرآن',
        period: 'مدنية'
      },
      // ... المزيد من المعلومات للسور الأخرى
    };
    
    // دمج المعلومات الإضافية مع المعلومات الأساسية
    for (const surahNumber in additionalInfo) {
      if (this.surahInfo[surahNumber]) {
        Object.assign(this.surahInfo[surahNumber], additionalInfo[surahNumber]);
      }
    }
    
    return true;
  }

  /**
   * تحميل معلومات احتياطية للسور
   * @private
   */
  _loadFallbackSurahInfo() {
    // معلومات أساسية للسور الأكثر شيوعاً
    this.surahInfo = {
      1: {
        number: 1,
        name: 'الفاتحة',
        englishName: 'Al-Faatiha',
        englishNameTranslation: 'The Opening',
        numberOfAyahs: 7,
        revelationType: 'Meccan',
        mainTheme: 'أصول الدين والعبادة',
        virtues: 'أعظم سورة في القرآن، وتسمى أم الكتاب وأم القرآن والسبع المثاني',
        period: 'مكية'
      },
      2: {
        number: 2,
        name: 'البقرة',
        englishName: 'Al-Baqara',
        englishNameTranslation: 'The Cow',
        numberOfAyahs: 286,
        revelationType: 'Medinan',
        mainTheme: 'التشريع والأحكام',
        virtues: 'أطول سورة في القرآن، وفيها آية الكرسي أعظم آية في القرآن',
        period: 'مدنية'
      },
      3: {
        number: 3,
        name: 'آل عمران',
        englishName: 'Aal-i-Imraan',
        englishNameTranslation: 'The Family of Imraan',
        numberOfAyahs: 200,
        revelationType: 'Medinan',
        mainTheme: 'الإيمان والتوحيد',
        virtues: 'تأتي مع سورة البقرة يوم القيامة كأنهما غمامتان تظلان صاحبهما',
        period: 'مدنية'
      },
      4: {
        number: 4,
        name: 'النساء',
        englishName: 'An-Nisaa',
        englishNameTranslation: 'The Women',
        numberOfAyahs: 176,
        revelationType: 'Medinan',
        mainTheme: 'التشريع الاجتماعي',
        virtues: 'تناولت أحكام المرأة والأسرة والمجتمع',
        period: 'مدنية'
      },
      36: {
        number: 36,
        name: 'يس',
        englishName: 'Yaseen',
        englishNameTranslation: 'Yaseen',
        numberOfAyahs: 83,
        revelationType: 'Meccan',
        mainTheme: 'التوحيد والبعث',
        virtues: 'قلب القرآن',
        period: 'مكية'
      },
      55: {
        number: 55,
        name: 'الرحمن',
        englishName: 'Ar-Rahmaan',
        englishNameTranslation: 'The Most Merciful',
        numberOfAyahs: 78,
        revelationType: 'Medinan',
        mainTheme: 'نعم الله على الإنسان',
        virtues: 'عروس القرآن',
        period: 'مدنية'
      },
      67: {
        number: 67,
        name: 'الملك',
        englishName: 'Al-Mulk',
        englishNameTranslation: 'The Sovereignty',
        numberOfAyahs: 30,
        revelationType: 'Meccan',
        mainTheme: 'قدرة الله وعظمته',
        virtues: 'المنجية من عذاب القبر',
        period: 'مكية'
      },
      112: {
        number: 112,
        name: 'الإخلاص',
        englishName: 'Al-Ikhlaas',
        englishNameTranslation: 'The Sincerity',
        numberOfAyahs: 4,
        revelationType: 'Meccan',
        mainTheme: 'التوحيد',
        virtues: 'تعدل ثلث القرآن',
        period: 'مكية'
      }
    };
    
    console.log('تم تحميل معلومات احتياطية للسور');
  }

  /**
   * عرض مقدمة السورة
   * @param {Object} surahInfo معلومات السورة
   * @param {HTMLElement} containerElement عنصر الحاوية
   * @returns {Promise} وعد يتم حله عند اكتمال العرض
   * @private
   */
  async _renderSurahIntro(surahInfo, containerElement) {
    // إفراغ الحاوية
    containerElement.innerHTML = '';
    
    // تعيين أسلوب الحاوية
    containerElement.style.position = 'relative';
    containerElement.style.width = '100%';
    containerElement.style.height = '100%';
    containerElement.style.overflow = 'hidden';
    containerElement.style.display = 'flex';
    containerElement.style.flexDirection = 'column';
    containerElement.style.justifyContent = 'center';
    containerElement.style.alignItems = 'center';
    containerElement.style.textAlign = 'center';
    containerElement.style.direction = 'rtl';
    
    // إنشاء خلفية المقدمة
    const backgroundElement = document.createElement('div');
    backgroundElement.className = 'surah-intro-background';
    backgroundElement.style.position = 'absolute';
    backgroundElement.style.top = '0';
    backgroundElement.style.left = '0';
    backgroundElement.style.width = '100%';
    backgroundElement.style.height = '100%';
    backgroundElement.style.zIndex = '1';
    
    // تطبيق خلفية القالب
    if (this.currentTemplate.backgroundType === 'image') {
      backgroundElement.style.backgroundImage = `url(${this.currentTemplate.backgroundUrl})`;
      backgroundElement.style.backgroundSize = 'cover';
      backgroundElement.style.backgroundPosition = 'center';
    } else if (this.currentTemplate.backgroundType === 'video') {
      const videoElement = document.createElement('video');
      videoElement.src = this.currentTemplate.backgroundUrl;
      videoElement.autoplay = true;
      videoElement.loop = true;
      videoElement.muted = true;
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
      backgroundElement.appendChild(videoElement);
    } else if (this.currentTemplate.backgroundType === 'gradient') {
      backgroundElement.style.background = this.currentTemplate.backgroundGradient;
    } else if (this.currentTemplate.backgroundType === 'color') {
      backgroundElement.style.backgroundColor = this.currentTemplate.backgroundColor;
    }
    
    // إضافة طبقة تعتيم للخلفية
    backgroundElement.style.boxShadow = 'inset 0 0 0 1000px rgba(0, 0, 0, 0.5)';
    
    // إنشاء حاوية المحتوى
    const contentElement = document.createElement('div');
    contentElement.className = 'surah-intro-content';
    contentElement.style.position = 'relative';
    contentElement.style.zIndex = '2';
    contentElement.style.padding = '20px';
    contentElement.style.maxWidth = '80%';
    
    // إضافة البسملة إذا كانت مفعلة
    if (this.customSettings.showBasmala && surahInfo.number !== 9) { // سورة التوبة لا تبدأ بالبسملة
      const basmalaElement = document.createElement('div');
      basmalaElement.className = 'surah-intro-basmala';
      basmalaElement.textContent = 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ';
      basmalaElement.style.fontFamily = 'Amiri, serif';
      basmalaElement.style.fontSize = '2em';
      basmalaElement.style.marginBottom = '20px';
      basmalaElement.style.color = '#FFFFFF';
      contentElement.appendChild(basmalaElement);
    }
    
    // إضافة اسم السورة
    const titleElement = document.createElement('h1');
    titleElement.className = 'surah-intro-title';
    titleElement.textContent = `سورة ${surahInfo.name}`;
    titleElement.style.fontFamily = `${this.currentTemplate.textStyle.titleFont}, serif`;
    titleElement.style.fontSize = this.currentTemplate.textStyle.titleSize;
    titleElement.style.color = this.currentTemplate.textStyle.titleColor;
    titleElement.style.margin = '0 0 10px 0';
    contentElement.appendChild(titleElement);
    
    // إضافة معلومات السورة
    const infoElement = document.createElement('div');
    infoElement.className = 'surah-intro-info';
    infoElement.style.fontFamily = `${this.currentTemplate.textStyle.infoFont}, sans-serif`;
    infoElement.style.fontSize = this.currentTemplate.textStyle.infoSize;
    infoElement.style.color = this.currentTemplate.textStyle.infoColor;
    
    // إضافة عدد الآيات ونوع السورة
    const basicInfoElement = document.createElement('p');
    basicInfoElement.textContent = `${surahInfo.numberOfAyahs} آية - ${surahInfo.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}`;
    basicInfoElement.style.margin = '10px 0';
    infoElement.appendChild(basicInfoElement);
    
    // إضافة الموضوع الرئيسي إذا كان متاحاً
    if (surahInfo.mainTheme) {
      const themeElement = document.createElement('p');
      themeElement.textContent = `الموضوع الرئيسي: ${surahInfo.mainTheme}`;
      themeElement.style.margin = '10px 0';
      infoElement.appendChild(themeElement);
    }
    
    // إضافة فضائل السورة إذا كانت متاحة
    if (surahInfo.virtues) {
      const virtuesElement = document.createElement('p');
      virtuesElement.textContent = `فضائلها: ${surahInfo.virtues}`;
      virtuesElement.style.margin = '10px 0';
      infoElement.appendChild(virtuesElement);
    }
    
    contentElement.appendChild(infoElement);
    
    // إضافة الترجمة إذا كانت مفعلة
    if (this.customSettings.showTranslation) {
      const translationElement = document.createElement('div');
      translationElement.className = 'surah-intro-translation';
      translationElement.textContent = `${surahInfo.englishName} (${surahInfo.englishNameTranslation})`;
      translationElement.style.fontFamily = 'Arial, sans-serif';
      translationElement.style.fontSize = '1.2em';
      translationElement.style.color = 'rgba(255, 255, 255, 0.8)';
      translationElement.style.marginTop = '20px';
      contentElement.appendChild(translationElement);
    }
    
    // إضافة العناصر إلى الحاوية
    containerElement.appendChild(backgroundElement);
    containerElement.appendChild(contentElement);
    
    // تطبيق تأثير الحركة
    await this._applyAnimationEffect(contentElement);
    
    // تعيين مدة المقدمة
    setTimeout(() => {
      // هنا يمكن إضافة كود لإنهاء المقدمة بعد انتهاء المدة المحددة
      console.log('انتهت مدة مقدمة السورة');
    }, this.customSettings.duration * 1000);
    
    return true;
  }

  /**
   * تطبيق تأثير الحركة
   * @param {HTMLElement} element العنصر
   * @returns {Promise} وعد يتم حله عند اكتمال التأثير
   * @private
   */
  async _applyAnimationEffect(element) {
    return new Promise(resolve => {
      // حفظ الخصائص الأصلية
      const originalTransition = element.style.transition;
      const originalOpacity = element.style.opacity;
      const originalTransform = element.style.transform;
      
      // تعيين الخصائص الأولية حسب نوع التأثير
      switch (this.customSettings.animationStyle) {
        case 'fade':
          element.style.opacity = '0';
          break;
        case 'slide':
          element.style.opacity = '0';
          element.style.transform = 'translateY(50px)';
          break;
        case 'zoom':
          element.style.opacity = '0';
          element.style.transform = 'scale(0.5)';
          break;
        case 'reveal':
          element.style.opacity = '0';
          element.style.clipPath = 'inset(100% 0 0 0)';
          break;
      }
      
      // تأخير قصير لضمان تطبيق الخصائص الأولية
      setTimeout(() => {
        // تعيين الانتقال
        element.style.transition = 'all 1.5s ease';
        
        // تطبيق التأثير
        switch (this.customSettings.animationStyle) {
          case 'fade':
            element.style.opacity = '1';
            break;
          case 'slide':
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            break;
          case 'zoom':
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
            break;
          case 'reveal':
            element.style.opacity = '1';
            element.style.clipPath = 'inset(0)';
            break;
        }
        
        // استعادة الخصائص الأصلية بعد اكتمال التأثير
        setTimeout(() => {
          element.style.transition = originalTransition;
          resolve(true);
        }, 1500);
      }, 10);
    });
  }
}

export default SurahIntroTool;
