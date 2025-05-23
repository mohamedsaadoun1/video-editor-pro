/**
 * أداة التفسير المتكامل لمحرر فيديو القرآن
 * توفر واجهة برمجية للتعامل مع تفاسير الآيات القرآنية
 */

class TafseerIntegrationTool {
  constructor() {
    this.tafseerSources = [];
    this.currentTafseer = null;
    this.displayMode = 'summary'; // 'summary' أو 'detailed'
    this.displayStyle = 'subtitle'; // 'subtitle' أو 'separate'
    this.initialized = false;
  }

  /**
   * تهيئة أداة التفسير المتكامل
   * @returns {Promise} وعد يتم حله عند اكتمال التهيئة
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // تحميل مصادر التفسير
      await this._loadTafseerSources();
      
      this.initialized = true;
      console.log('تم تهيئة أداة التفسير المتكامل بنجاح مع', this.tafseerSources.length, 'مصدر تفسير');
    } catch (error) {
      console.error('خطأ في تهيئة أداة التفسير المتكامل:', error);
    }
    
    return this.initialized;
  }

  /**
   * الحصول على قائمة مصادر التفسير المتاحة
   * @returns {Array} قائمة مصادر التفسير
   */
  getTafseerSources() {
    return this.tafseerSources;
  }

  /**
   * تعيين مصدر التفسير الحالي
   * @param {string} tafseerSourceId معرف مصدر التفسير
   * @returns {Object|null} معلومات مصدر التفسير أو null إذا لم يتم العثور عليه
   */
  setTafseerSource(tafseerSourceId) {
    if (!this.initialized) {
      console.warn('أداة التفسير المتكامل غير مهيأة بعد');
      return null;
    }
    
    const tafseerSource = this.tafseerSources.find(source => source.id === tafseerSourceId);
    if (tafseerSource) {
      this.currentTafseer = tafseerSource;
      console.log('تم تعيين مصدر التفسير:', tafseerSource.name);
      return tafseerSource;
    }
    
    console.warn('لم يتم العثور على مصدر التفسير:', tafseerSourceId);
    return null;
  }

  /**
   * تعيين وضع عرض التفسير
   * @param {string} mode وضع العرض ('summary' أو 'detailed')
   * @returns {boolean} نجاح العملية
   */
  setDisplayMode(mode) {
    if (['summary', 'detailed'].includes(mode)) {
      this.displayMode = mode;
      console.log('تم تعيين وضع عرض التفسير:', mode);
      return true;
    }
    
    console.warn('وضع عرض التفسير غير صالح. الخيارات المتاحة: summary, detailed');
    return false;
  }

  /**
   * تعيين أسلوب عرض التفسير
   * @param {string} style أسلوب العرض ('subtitle' أو 'separate')
   * @returns {boolean} نجاح العملية
   */
  setDisplayStyle(style) {
    if (['subtitle', 'separate'].includes(style)) {
      this.displayStyle = style;
      console.log('تم تعيين أسلوب عرض التفسير:', style);
      return true;
    }
    
    console.warn('أسلوب عرض التفسير غير صالح. الخيارات المتاحة: subtitle, separate');
    return false;
  }

  /**
   * الحصول على تفسير آية
   * @param {number} surahNumber رقم السورة
   * @param {number} verseNumber رقم الآية
   * @returns {Promise<Object|null>} وعد يتم حله بمعلومات التفسير أو null في حالة الفشل
   */
  async getVerseTafseer(surahNumber, verseNumber) {
    if (!this.initialized) {
      console.warn('أداة التفسير المتكامل غير مهيأة بعد');
      return null;
    }
    
    if (!this.currentTafseer) {
      console.warn('لم يتم تعيين مصدر تفسير');
      return null;
    }
    
    try {
      // بناء رابط API التفسير
      const apiUrl = `https://api.quran-tafseer.com/v1/tafseer/${this.currentTafseer.id}/${surahNumber}/${verseNumber}`;
      
      // استدعاء API
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`فشل في الحصول على التفسير: ${data.detail || response.statusText}`);
      }
      
      // معالجة البيانات حسب وضع العرض
      let tafseerText = data.text;
      if (this.displayMode === 'summary' && tafseerText.length > 300) {
        tafseerText = tafseerText.substring(0, 300) + '...';
      }
      
      return {
        surah: surahNumber,
        verse: verseNumber,
        tafseerSource: this.currentTafseer.name,
        tafseerText: tafseerText,
        fullText: data.text
      };
    } catch (error) {
      console.error('خطأ في الحصول على تفسير الآية:', error);
      
      // استخدام بيانات احتياطية في حالة فشل الاتصال بالـ API
      return this._getFallbackTafseer(surahNumber, verseNumber);
    }
  }

  /**
   * إنشاء عنصر HTML لعرض التفسير
   * @param {Object} tafseerData بيانات التفسير
   * @returns {HTMLElement} عنصر HTML
   */
  createTafseerElement(tafseerData) {
    if (!tafseerData) return null;
    
    const tafseerElement = document.createElement('div');
    tafseerElement.className = 'tafseer-container';
    
    // إضافة عنوان التفسير
    const titleElement = document.createElement('h4');
    titleElement.className = 'tafseer-title';
    titleElement.textContent = `تفسير ${tafseerData.tafseerSource}`;
    
    // إضافة نص التفسير
    const textElement = document.createElement('p');
    textElement.className = 'tafseer-text';
    textElement.textContent = tafseerData.tafseerText;
    
    // إضافة زر "عرض المزيد" إذا كان هناك نص كامل
    if (tafseerData.fullText && tafseerData.tafseerText !== tafseerData.fullText) {
      const moreButton = document.createElement('button');
      moreButton.className = 'tafseer-more-btn';
      moreButton.textContent = 'عرض المزيد';
      moreButton.addEventListener('click', () => {
        textElement.textContent = tafseerData.fullText;
        moreButton.style.display = 'none';
      });
      
      tafseerElement.appendChild(titleElement);
      tafseerElement.appendChild(textElement);
      tafseerElement.appendChild(moreButton);
    } else {
      tafseerElement.appendChild(titleElement);
      tafseerElement.appendChild(textElement);
    }
    
    // تطبيق أسلوب العرض
    if (this.displayStyle === 'subtitle') {
      tafseerElement.style.fontSize = '0.9em';
      tafseerElement.style.opacity = '0.9';
      tafseerElement.style.padding = '10px';
      tafseerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      tafseerElement.style.borderRadius = '5px';
      tafseerElement.style.margin = '10px 0';
    } else if (this.displayStyle === 'separate') {
      tafseerElement.style.fontSize = '1em';
      tafseerElement.style.padding = '15px';
      tafseerElement.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      tafseerElement.style.color = '#333';
      tafseerElement.style.borderRadius = '8px';
      tafseerElement.style.margin = '20px 0';
      tafseerElement.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
    
    return tafseerElement;
  }

  /**
   * تحميل مصادر التفسير
   * @returns {Promise} وعد يتم حله عند اكتمال التحميل
   * @private
   */
  async _loadTafseerSources() {
    try {
      // استدعاء API للحصول على قائمة مصادر التفسير
      const response = await fetch('https://api.quran-tafseer.com/v1/tafseer');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`فشل في تحميل مصادر التفسير: ${response.statusText}`);
      }
      
      this.tafseerSources = data.map(source => ({
        id: source.id,
        name: source.name,
        language: source.language,
        author: source.author,
        book_name: source.book_name
      }));
      
      // تعيين مصدر التفسير الافتراضي
      if (this.tafseerSources.length > 0) {
        // البحث عن تفسير ابن كثير كافتراضي
        const ibnKathir = this.tafseerSources.find(source => source.name.includes('ابن كثير'));
        this.currentTafseer = ibnKathir || this.tafseerSources[0];
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في تحميل مصادر التفسير:', error);
      
      // استخدام مصادر تفسير احتياطية في حالة فشل الاتصال بالـ API
      this._loadFallbackTafseerSources();
      
      return false;
    }
  }

  /**
   * تحميل مصادر تفسير احتياطية
   * @private
   */
  _loadFallbackTafseerSources() {
    this.tafseerSources = [
      {
        id: 1,
        name: 'تفسير ابن كثير',
        language: 'ar',
        author: 'ابن كثير',
        book_name: 'تفسير القرآن العظيم'
      },
      {
        id: 2,
        name: 'تفسير السعدي',
        language: 'ar',
        author: 'عبد الرحمن بن ناصر السعدي',
        book_name: 'تيسير الكريم الرحمن في تفسير كلام المنان'
      },
      {
        id: 3,
        name: 'تفسير الطبري',
        language: 'ar',
        author: 'ابن جرير الطبري',
        book_name: 'جامع البيان في تأويل القرآن'
      },
      {
        id: 4,
        name: 'تفسير القرطبي',
        language: 'ar',
        author: 'القرطبي',
        book_name: 'الجامع لأحكام القرآن'
      },
      {
        id: 5,
        name: 'تفسير البغوي',
        language: 'ar',
        author: 'البغوي',
        book_name: 'معالم التنزيل'
      }
    ];
    
    // تعيين مصدر التفسير الافتراضي
    this.currentTafseer = this.tafseerSources[0]; // ابن كثير
    
    console.log('تم تحميل مصادر تفسير احتياطية');
  }

  /**
   * الحصول على تفسير احتياطي
   * @param {number} surahNumber رقم السورة
   * @param {number} verseNumber رقم الآية
   * @returns {Object} بيانات التفسير الاحتياطي
   * @private
   */
  _getFallbackTafseer(surahNumber, verseNumber) {
    // هذه مجرد بيانات احتياطية للتوضيح
    // في التطبيق الحقيقي، يمكن استخدام قاعدة بيانات محلية للتفاسير
    
    const fallbackTafseerData = {
      1: { // سورة الفاتحة
        1: 'بسم الله الرحمن الرحيم: افتتح الله تعالى كتابه العزيز بالبسملة؛ تنبيهاً للعباد على أنه ينبغي لهم أن يبدؤوا أمورهم كلها بها.',
        2: 'الحمد لله رب العالمين: الثناء على الله تعالى بصفات الكمال، وبما أنعم به وتفضل، والرب هو المالك المتصرف، والعالمين جمع عالم، وهو كل ما سوى الله تعالى.',
        3: 'الرحمن الرحيم: اسمان من أسماء الله تعالى، مشتقان من الرحمة، والرحمن أشد مبالغة من الرحيم؛ لأنه دال على صفة ذاتية لله تعالى، والرحيم دال على الفعل المتعلق بالمرحوم.',
        4: 'مالك يوم الدين: أي المتصرف وحده في يوم الجزاء والحساب، وهو يوم القيامة.',
        5: 'إياك نعبد وإياك نستعين: أي نخصك وحدك بالعبادة والاستعانة، فلا نعبد غيرك، ولا نتوكل إلا عليك.',
        6: 'اهدنا الصراط المستقيم: أي دلنا وأرشدنا وثبتنا على الطريق الواضح المستقيم، وهو الإسلام.',
        7: 'صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين: أي طريق من أنعمت عليهم من النبيين والصديقين والشهداء والصالحين، غير طريق من غضبت عليهم كاليهود، ولا طريق الضالين كالنصارى.'
      },
      2: { // سورة البقرة
        1: 'الم: هذا من المتشابه الذي استأثر الله بعلمه، وقيل: هي حروف مقطعة افتتح الله بها بعض السور؛ لبيان إعجاز القرآن.',
        2: 'ذلك الكتاب لا ريب فيه هدى للمتقين: أي هذا القرآن لا شك فيه أنه من عند الله، وهو هداية للمتقين الذين يخافون الله ويجتنبون معاصيه.',
        3: 'الذين يؤمنون بالغيب ويقيمون الصلاة ومما رزقناهم ينفقون: أي يصدقون بما غاب عنهم مما أخبرهم الله به، ويؤدون الصلاة بأركانها وشروطها، وينفقون مما أعطاهم الله من المال.',
        4: 'والذين يؤمنون بما أنزل إليك وما أنزل من قبلك وبالآخرة هم يوقنون: أي يصدقون بالقرآن وبالكتب السماوية السابقة، ويوقنون بالبعث والحساب والجنة والنار.',
        5: 'أولئك على هدى من ربهم وأولئك هم المفلحون: أي هؤلاء المتصفون بالصفات السابقة على نور وبصيرة من ربهم، وهم الفائزون بالمطلوب، الناجون من المرهوب.'
      }
    };
    
    // التحقق من وجود تفسير للآية المطلوبة
    if (fallbackTafseerData[surahNumber] && fallbackTafseerData[surahNumber][verseNumber]) {
      const tafseerText = fallbackTafseerData[surahNumber][verseNumber];
      
      // معالجة النص حسب وضع العرض
      let displayText = tafseerText;
      if (this.displayMode === 'summary' && tafseerText.length > 300) {
        displayText = tafseerText.substring(0, 300) + '...';
      }
      
      return {
        surah: surahNumber,
        verse: verseNumber,
        tafseerSource: this.currentTafseer ? this.currentTafseer.name : 'تفسير ابن كثير',
        tafseerText: displayText,
        fullText: tafseerText
      };
    }
    
    // إذا لم يتم العثور على تفسير للآية المطلوبة
    return {
      surah: surahNumber,
      verse: verseNumber,
      tafseerSource: this.currentTafseer ? this.currentTafseer.name : 'تفسير ابن كثير',
      tafseerText: 'لم يتم العثور على تفسير لهذه الآية.',
      fullText: 'لم يتم العثور على تفسير لهذه الآية.'
    };
  }
}

export default TafseerIntegrationTool;
