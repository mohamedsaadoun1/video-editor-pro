/**
 * أداة الترجمة كلمة بكلمة لمحرر فيديو القرآن
 * توفر واجهة برمجية لعرض ترجمة وتفسير كل كلمة من الآيات القرآنية
 */

class WordByWordTranslationTool {
  constructor() {
    this.languages = [];
    this.currentLanguage = 'english';
    this.showGrammar = true;
    this.showTransliteration = true;
    this.displayMode = 'inline'; // 'inline' أو 'block'
    this.syncWithRecitation = true;
    this.initialized = false;
  }

  /**
   * تهيئة أداة الترجمة كلمة بكلمة
   * @returns {Promise} وعد يتم حله عند اكتمال التهيئة
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // تحميل اللغات المدعومة
      this._initializeLanguages();
      
      this.initialized = true;
      console.log('تم تهيئة أداة الترجمة كلمة بكلمة بنجاح مع', this.languages.length, 'لغة');
    } catch (error) {
      console.error('خطأ في تهيئة أداة الترجمة كلمة بكلمة:', error);
    }
    
    return this.initialized;
  }

  /**
   * الحصول على قائمة اللغات المدعومة
   * @returns {Array} قائمة اللغات
   */
  getLanguages() {
    return this.languages;
  }

  /**
   * تعيين اللغة الحالية
   * @param {string} languageCode رمز اللغة
   * @returns {boolean} نجاح العملية
   */
  setLanguage(languageCode) {
    if (!this.initialized) {
      console.warn('أداة الترجمة كلمة بكلمة غير مهيأة بعد');
      return false;
    }
    
    const language = this.languages.find(lang => lang.code === languageCode);
    if (language) {
      this.currentLanguage = languageCode;
      console.log('تم تعيين اللغة:', language.name);
      return true;
    }
    
    console.warn('لم يتم العثور على اللغة:', languageCode);
    return false;
  }

  /**
   * تفعيل أو تعطيل عرض الإعراب
   * @param {boolean} show حالة العرض
   */
  setShowGrammar(show) {
    this.showGrammar = Boolean(show);
    console.log('تم', this.showGrammar ? 'تفعيل' : 'تعطيل', 'عرض الإعراب');
  }

  /**
   * تفعيل أو تعطيل عرض النطق
   * @param {boolean} show حالة العرض
   */
  setShowTransliteration(show) {
    this.showTransliteration = Boolean(show);
    console.log('تم', this.showTransliteration ? 'تفعيل' : 'تعطيل', 'عرض النطق');
  }

  /**
   * تعيين وضع العرض
   * @param {string} mode وضع العرض ('inline' أو 'block')
   * @returns {boolean} نجاح العملية
   */
  setDisplayMode(mode) {
    if (['inline', 'block'].includes(mode)) {
      this.displayMode = mode;
      console.log('تم تعيين وضع العرض:', mode);
      return true;
    }
    
    console.warn('وضع العرض غير صالح. الخيارات المتاحة: inline, block');
    return false;
  }

  /**
   * تفعيل أو تعطيل مزامنة الترجمة مع التلاوة
   * @param {boolean} sync حالة المزامنة
   */
  setSyncWithRecitation(sync) {
    this.syncWithRecitation = Boolean(sync);
    console.log('تم', this.syncWithRecitation ? 'تفعيل' : 'تعطيل', 'مزامنة الترجمة مع التلاوة');
  }

  /**
   * الحصول على ترجمة كلمة بكلمة لآية
   * @param {number} surahNumber رقم السورة
   * @param {number} verseNumber رقم الآية
   * @returns {Promise<Object|null>} وعد يتم حله بمعلومات الترجمة أو null في حالة الفشل
   */
  async getWordByWordTranslation(surahNumber, verseNumber) {
    if (!this.initialized) {
      console.warn('أداة الترجمة كلمة بكلمة غير مهيأة بعد');
      return null;
    }
    
    try {
      // بناء رابط API الترجمة
      const apiUrl = `https://api.quranwbw.com/v1/quran/verse/${surahNumber}/${verseNumber}`;
      
      // استدعاء API
      const response = await fetch(apiUrl);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`فشل في الحصول على الترجمة: ${data.message || response.statusText}`);
      }
      
      // معالجة البيانات
      const words = data.words.map(word => ({
        position: word.position,
        arabicText: word.arabic_text,
        translation: word.translations[this.currentLanguage] || word.translations.english,
        transliteration: word.transliteration,
        grammar: {
          type: word.grammar.type,
          description: word.grammar.description
        }
      }));
      
      return {
        surah: surahNumber,
        verse: verseNumber,
        text: data.arabic_text,
        words: words
      };
    } catch (error) {
      console.error('خطأ في الحصول على ترجمة الآية كلمة بكلمة:', error);
      
      // استخدام بيانات احتياطية في حالة فشل الاتصال بالـ API
      return this._getFallbackTranslation(surahNumber, verseNumber);
    }
  }

  /**
   * إنشاء عنصر HTML لعرض الترجمة كلمة بكلمة
   * @param {Object} translationData بيانات الترجمة
   * @returns {HTMLElement} عنصر HTML
   */
  createWordByWordElement(translationData) {
    if (!translationData) return null;
    
    const containerElement = document.createElement('div');
    containerElement.className = 'word-by-word-container';
    containerElement.style.direction = 'rtl';
    containerElement.style.textAlign = 'center';
    containerElement.style.margin = '20px 0';
    
    // إنشاء عنصر للنص العربي الكامل
    const arabicTextElement = document.createElement('div');
    arabicTextElement.className = 'arabic-text';
    arabicTextElement.textContent = translationData.text;
    arabicTextElement.style.fontSize = '1.5em';
    arabicTextElement.style.marginBottom = '20px';
    arabicTextElement.style.fontFamily = 'Amiri, serif';
    containerElement.appendChild(arabicTextElement);
    
    // إنشاء حاوية للكلمات
    const wordsContainerElement = document.createElement('div');
    wordsContainerElement.className = 'words-container';
    wordsContainerElement.style.display = 'flex';
    wordsContainerElement.style.flexWrap = 'wrap';
    wordsContainerElement.style.justifyContent = 'center';
    wordsContainerElement.style.gap = '10px';
    
    // إضافة كل كلمة
    for (const word of translationData.words) {
      const wordElement = document.createElement('div');
      wordElement.className = 'word-item';
      wordElement.dataset.position = word.position;
      
      if (this.displayMode === 'inline') {
        wordElement.style.display = 'inline-block';
        wordElement.style.textAlign = 'center';
        wordElement.style.margin = '5px';
        wordElement.style.verticalAlign = 'top';
      } else {
        wordElement.style.display = 'flex';
        wordElement.style.flexDirection = 'column';
        wordElement.style.alignItems = 'center';
        wordElement.style.padding = '10px';
        wordElement.style.border = '1px solid #eee';
        wordElement.style.borderRadius = '5px';
        wordElement.style.minWidth = '100px';
      }
      
      // إضافة النص العربي
      const arabicElement = document.createElement('div');
      arabicElement.className = 'word-arabic';
      arabicElement.textContent = word.arabicText;
      arabicElement.style.fontSize = '1.3em';
      arabicElement.style.fontFamily = 'Amiri, serif';
      arabicElement.style.marginBottom = '5px';
      wordElement.appendChild(arabicElement);
      
      // إضافة الترجمة
      const translationElement = document.createElement('div');
      translationElement.className = 'word-translation';
      translationElement.textContent = word.translation;
      translationElement.style.fontSize = '0.9em';
      translationElement.style.color = '#555';
      wordElement.appendChild(translationElement);
      
      // إضافة النطق إذا كان مفعلاً
      if (this.showTransliteration && word.transliteration) {
        const transliterationElement = document.createElement('div');
        transliterationElement.className = 'word-transliteration';
        transliterationElement.textContent = word.transliteration;
        transliterationElement.style.fontSize = '0.8em';
        transliterationElement.style.color = '#777';
        transliterationElement.style.fontStyle = 'italic';
        wordElement.appendChild(transliterationElement);
      }
      
      // إضافة الإعراب إذا كان مفعلاً
      if (this.showGrammar && word.grammar) {
        const grammarElement = document.createElement('div');
        grammarElement.className = 'word-grammar';
        grammarElement.textContent = word.grammar.type;
        grammarElement.title = word.grammar.description;
        grammarElement.style.fontSize = '0.7em';
        grammarElement.style.color = '#999';
        grammarElement.style.marginTop = '3px';
        wordElement.appendChild(grammarElement);
      }
      
      wordsContainerElement.appendChild(wordElement);
    }
    
    containerElement.appendChild(wordsContainerElement);
    
    return containerElement;
  }

  /**
   * تمييز كلمة محددة أثناء التلاوة
   * @param {HTMLElement} containerElement عنصر الحاوية
   * @param {number} wordPosition موضع الكلمة
   * @returns {boolean} نجاح العملية
   */
  highlightWord(containerElement, wordPosition) {
    if (!containerElement) return false;
    
    try {
      // إزالة التمييز من جميع الكلمات
      const allWords = containerElement.querySelectorAll('.word-item');
      allWords.forEach(word => {
        word.style.backgroundColor = '';
        word.style.boxShadow = '';
      });
      
      // تمييز الكلمة المحددة
      const wordElement = containerElement.querySelector(`.word-item[data-position="${wordPosition}"]`);
      if (wordElement) {
        wordElement.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
        wordElement.style.boxShadow = '0 0 5px rgba(255, 215, 0, 0.5)';
        
        // التمرير إلى الكلمة إذا كانت خارج نطاق الرؤية
        wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('خطأ في تمييز الكلمة:', error);
      return false;
    }
  }

  /**
   * مزامنة الترجمة مع التلاوة
   * @param {HTMLElement} containerElement عنصر الحاوية
   * @param {Array} wordTimings توقيتات الكلمات
   * @returns {boolean} نجاح العملية
   */
  syncWithAudio(containerElement, wordTimings) {
    if (!this.syncWithRecitation || !containerElement || !wordTimings || !Array.isArray(wordTimings)) {
      return false;
    }
    
    try {
      // إنشاء مؤقتات لتمييز كل كلمة حسب توقيتها
      for (const timing of wordTimings) {
        setTimeout(() => {
          this.highlightWord(containerElement, timing.position);
        }, timing.startTime * 1000);
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في مزامنة الترجمة مع التلاوة:', error);
      return false;
    }
  }

  /**
   * تهيئة اللغات المدعومة
   * @private
   */
  _initializeLanguages() {
    this.languages = [
      {
        code: 'english',
        name: 'الإنجليزية',
        direction: 'ltr',
        nativeName: 'English'
      },
      {
        code: 'urdu',
        name: 'الأردية',
        direction: 'rtl',
        nativeName: 'اردو'
      },
      {
        code: 'hindi',
        name: 'الهندية',
        direction: 'ltr',
        nativeName: 'हिन्दी'
      },
      {
        code: 'indonesian',
        name: 'الإندونيسية',
        direction: 'ltr',
        nativeName: 'Bahasa Indonesia'
      },
      {
        code: 'turkish',
        name: 'التركية',
        direction: 'ltr',
        nativeName: 'Türkçe'
      },
      {
        code: 'french',
        name: 'الفرنسية',
        direction: 'ltr',
        nativeName: 'Français'
      },
      {
        code: 'german',
        name: 'الألمانية',
        direction: 'ltr',
        nativeName: 'Deutsch'
      },
      {
        code: 'spanish',
        name: 'الإسبانية',
        direction: 'ltr',
        nativeName: 'Español'
      },
      {
        code: 'russian',
        name: 'الروسية',
        direction: 'ltr',
        nativeName: 'Русский'
      },
      {
        code: 'chinese',
        name: 'الصينية',
        direction: 'ltr',
        nativeName: '中文'
      }
    ];
  }

  /**
   * الحصول على ترجمة احتياطية
   * @param {number} surahNumber رقم السورة
   * @param {number} verseNumber رقم الآية
   * @returns {Object} بيانات الترجمة الاحتياطية
   * @private
   */
  _getFallbackTranslation(surahNumber, verseNumber) {
    // هذه مجرد بيانات احتياطية للتوضيح
    // في التطبيق الحقيقي، يمكن استخدام قاعدة بيانات محلية للترجمات
    
    const fallbackData = {
      1: { // سورة الفاتحة
        1: {
          text: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
          words: [
            {
              position: 1,
              arabicText: 'بِسْمِ',
              translation: 'In the name of',
              transliteration: 'Bismi',
              grammar: {
                type: 'اسم مجرور',
                description: 'اسم مجرور وهو مضاف'
              }
            },
            {
              position: 2,
              arabicText: 'اللَّهِ',
              translation: 'Allah',
              transliteration: 'Allahi',
              grammar: {
                type: 'لفظ الجلالة',
                description: 'لفظ الجلالة مضاف إليه مجرور'
              }
            },
            {
              position: 3,
              arabicText: 'الرَّحْمَنِ',
              translation: 'the Most Gracious',
              transliteration: 'Ar-Rahmani',
              grammar: {
                type: 'صفة',
                description: 'صفة مجرورة'
              }
            },
            {
              position: 4,
              arabicText: 'الرَّحِيمِ',
              translation: 'the Most Merciful',
              transliteration: 'Ar-Rahimi',
              grammar: {
                type: 'صفة',
                description: 'صفة مجرورة'
              }
            }
          ]
        },
        2: {
          text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
          words: [
            {
              position: 1,
              arabicText: 'الْحَمْدُ',
              translation: 'All praise',
              transliteration: 'Al-hamdu',
              grammar: {
                type: 'مبتدأ',
                description: 'مبتدأ مرفوع'
              }
            },
            {
              position: 2,
              arabicText: 'لِلَّهِ',
              translation: 'is to Allah',
              transliteration: 'Lillahi',
              grammar: {
                type: 'جار ومجرور',
                description: 'جار ومجرور متعلقان بمحذوف خبر'
              }
            },
            {
              position: 3,
              arabicText: 'رَبِّ',
              translation: 'the Lord',
              transliteration: 'Rabbi',
              grammar: {
                type: 'بدل',
                description: 'بدل مجرور وهو مضاف'
              }
            },
            {
              position: 4,
              arabicText: 'الْعَالَمِينَ',
              translation: 'of the worlds',
              transliteration: 'Al-'alamina',
              grammar: {
                type: 'مضاف إليه',
                description: 'مضاف إليه مجرور وعلامة جره الياء'
              }
            }
          ]
        }
      }
    };
    
    // التحقق من وجود ترجمة للآية المطلوبة
    if (fallbackData[surahNumber] && fallbackData[surahNumber][verseNumber]) {
      return {
        surah: surahNumber,
        verse: verseNumber,
        text: fallbackData[surahNumber][verseNumber].text,
        words: fallbackData[surahNumber][verseNumber].words
      };
    }
    
    // إذا لم يتم العثور على ترجمة للآية المطلوبة، نقدم بيانات افتراضية
    return {
      surah: surahNumber,
      verse: verseNumber,
      text: 'لم يتم العثور على نص الآية',
      words: [
        {
          position: 1,
          arabicText: 'لم',
          translation: 'Not',
          transliteration: 'Lam',
          grammar: {
            type: 'حرف',
            description: 'حرف نفي وجزم'
          }
        },
        {
          position: 2,
          arabicText: 'يتم',
          translation: 'completed',
          transliteration: 'Yatim',
          grammar: {
            type: 'فعل',
            description: 'فعل مضارع مجزوم'
          }
        },
        {
          position: 3,
          arabicText: 'العثور',
          translation: 'finding',
          transliteration: 'Al-uthoor',
          grammar: {
            type: 'اسم',
            description: 'اسم مجرور'
          }
        },
        {
          position: 4,
          arabicText: 'على',
          translation: 'on',
          transliteration: 'Ala',
          grammar: {
            type: 'حرف',
            description: 'حرف جر'
          }
        },
        {
          position: 5,
          arabicText: 'الترجمة',
          translation: 'translation',
          transliteration: 'At-tarjama',
          grammar: {
            type: 'اسم',
            description: 'اسم مجرور'
          }
        }
      ]
    };
  }
}

export default WordByWordTranslationTool;
