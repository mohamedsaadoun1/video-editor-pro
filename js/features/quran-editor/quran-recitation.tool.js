/**
 * تنفيذ أداة التلاوات المتقدمة لمحرر فيديو القرآن
 * يوفر واجهة برمجية للتعامل مع تلاوات القرآن من قراء مختلفين وبروايات متعددة
 */

class QuranRecitationTool {
  constructor() {
    this.reciters = [];
    this.currentReciter = null;
    this.currentNarration = 'hafs'; // الرواية الافتراضية: حفص عن عاصم
    this.playbackRate = 1.0;
    this.audioElement = null;
    this.verseTimings = [];
    this.onVerseChangeCallback = null;
    this.initialized = false;
  }

  /**
   * تهيئة أداة التلاوات
   * @returns {Promise} وعد يتم حله عند اكتمال التهيئة
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // تحميل قائمة القراء من API
      const recitersResponse = await fetch('https://api.alquran.cloud/v1/edition/format/audio');
      const recitersData = await recitersResponse.json();
      
      if (recitersData.code === 200 && recitersData.data) {
        this.reciters = recitersData.data
          .filter(reciter => reciter.type === 'versebyverse')
          .map(reciter => ({
            id: reciter.identifier,
            name: reciter.englishName,
            arabicName: reciter.name,
            language: reciter.language,
            narration: this._extractNarration(reciter.identifier)
          }));
        
        // تعيين القارئ الافتراضي
        if (this.reciters.length > 0) {
          this.currentReciter = this.reciters[0];
        }
        
        this.initialized = true;
        console.log('تم تهيئة أداة التلاوات بنجاح مع', this.reciters.length, 'قارئ');
      } else {
        throw new Error('فشل في تحميل قائمة القراء');
      }
    } catch (error) {
      console.error('خطأ في تهيئة أداة التلاوات:', error);
      // استخدام قائمة احتياطية من القراء في حالة فشل الاتصال بالـ API
      this._loadFallbackReciters();
      this.initialized = true;
    }
    
    // إنشاء عنصر الصوت
    this.audioElement = new Audio();
    this.audioElement.addEventListener('timeupdate', this._handleTimeUpdate.bind(this));
    
    return this.initialized;
  }

  /**
   * الحصول على قائمة القراء المتاحين
   * @returns {Array} قائمة القراء
   */
  getReciters() {
    return this.reciters;
  }

  /**
   * الحصول على قائمة الروايات المتاحة
   * @returns {Array} قائمة الروايات
   */
  getNarrations() {
    return [
      { id: 'hafs', name: 'حفص عن عاصم', description: 'الرواية الأكثر انتشاراً في العالم الإسلامي' },
      { id: 'warsh', name: 'ورش عن نافع', description: 'منتشرة في شمال وغرب أفريقيا' },
      { id: 'qaloon', name: 'قالون عن نافع', description: 'منتشرة في ليبيا وتونس' },
      { id: 'shouba', name: 'شعبة عن عاصم', description: 'إحدى الروايات المعتمدة عن عاصم' },
      { id: 'doori', name: 'الدوري عن أبي عمرو', description: 'إحدى الروايات المشهورة في السودان' }
    ];
  }

  /**
   * تعيين القارئ الحالي
   * @param {string} reciterId معرف القارئ
   * @returns {boolean} نجاح العملية
   */
  setReciter(reciterId) {
    const reciter = this.reciters.find(r => r.id === reciterId);
    if (reciter) {
      this.currentReciter = reciter;
      console.log('تم تعيين القارئ:', reciter.arabicName);
      return true;
    }
    return false;
  }

  /**
   * تعيين الرواية الحالية
   * @param {string} narrationId معرف الرواية
   */
  setNarration(narrationId) {
    const narrations = this.getNarrations();
    if (narrations.some(n => n.id === narrationId)) {
      this.currentNarration = narrationId;
      console.log('تم تعيين الرواية:', narrationId);
      return true;
    }
    return false;
  }

  /**
   * ضبط سرعة التلاوة
   * @param {number} rate سرعة التلاوة (0.5 إلى 2.0)
   */
  setPlaybackRate(rate) {
    if (rate >= 0.5 && rate <= 2.0) {
      this.playbackRate = rate;
      if (this.audioElement) {
        this.audioElement.playbackRate = rate;
      }
      console.log('تم ضبط سرعة التلاوة:', rate);
      return true;
    }
    return false;
  }

  /**
   * تشغيل تلاوة آية محددة
   * @param {number} surahNumber رقم السورة
   * @param {number} verseNumber رقم الآية
   * @returns {Promise} وعد يتم حله عند بدء التشغيل
   */
  async playVerse(surahNumber, verseNumber) {
    if (!this.initialized || !this.currentReciter) {
      await this.initialize();
    }
    
    try {
      // بناء رابط الصوت
      const audioUrl = this._buildAudioUrl(surahNumber, verseNumber);
      
      // تحميل توقيتات الآية إذا كانت متاحة
      await this._loadVerseTimings(surahNumber, verseNumber);
      
      // تعيين مصدر الصوت وتشغيله
      this.audioElement.src = audioUrl;
      this.audioElement.playbackRate = this.playbackRate;
      
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        await playPromise;
        console.log('بدأ تشغيل الآية:', surahNumber + ':' + verseNumber);
      }
      
      return true;
    } catch (error) {
      console.error('خطأ في تشغيل الآية:', error);
      return false;
    }
  }

  /**
   * إيقاف التلاوة الحالية
   */
  stopPlayback() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      console.log('تم إيقاف التلاوة');
    }
  }

  /**
   * تعيين دالة رد النداء عند تغير الآية أثناء التلاوة
   * @param {Function} callback دالة رد النداء
   */
  onVerseChange(callback) {
    this.onVerseChangeCallback = callback;
  }

  /**
   * استخراج نوع الرواية من معرف القارئ
   * @param {string} identifier معرف القارئ
   * @returns {string} نوع الرواية
   * @private
   */
  _extractNarration(identifier) {
    if (identifier.includes('warsh')) return 'warsh';
    if (identifier.includes('qaloon')) return 'qaloon';
    if (identifier.includes('shouba')) return 'shouba';
    if (identifier.includes('doori')) return 'doori';
    return 'hafs'; // الافتراضي
  }

  /**
   * تحميل قائمة احتياطية من القراء في حالة فشل الاتصال بالـ API
   * @private
   */
  _loadFallbackReciters() {
    this.reciters = [
      { id: 'ar.alafasy', name: 'Mishari Rashid al-`Afasy', arabicName: 'مشاري راشد العفاسي', language: 'ar', narration: 'hafs' },
      { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit Abdul Samad', arabicName: 'عبد الباسط عبد الصمد', language: 'ar', narration: 'hafs' },
      { id: 'ar.minshawi', name: 'Mohamed Siddiq al-Minshawi', arabicName: 'محمد صديق المنشاوي', language: 'ar', narration: 'hafs' },
      { id: 'ar.hudhaify', name: 'Ali Al-Hudhaify', arabicName: 'علي الحذيفي', language: 'ar', narration: 'hafs' }
    ];
    
    if (this.reciters.length > 0) {
      this.currentReciter = this.reciters[0];
    }
    
    console.log('تم تحميل قائمة احتياطية من القراء');
  }

  /**
   * بناء رابط الصوت للآية
   * @param {number} surahNumber رقم السورة
   * @param {number} verseNumber رقم الآية
   * @returns {string} رابط الصوت
   * @private
   */
  _buildAudioUrl(surahNumber, verseNumber) {
    if (!this.currentReciter) return '';
    
    // استخدام API مناسب حسب القارئ والرواية
    return `https://cdn.islamic.network/quran/audio/128/${this.currentReciter.id}/${surahNumber}${verseNumber}.mp3`;
  }

  /**
   * تحميل توقيتات الآية إذا كانت متاحة
   * @param {number} surahNumber رقم السورة
   * @param {number} verseNumber رقم الآية
   * @returns {Promise} وعد يتم حله عند اكتمال التحميل
   * @private
   */
  async _loadVerseTimings(surahNumber, verseNumber) {
    // هذه الدالة ستقوم بتحميل توقيتات الكلمات داخل الآية إذا كانت متاحة
    // لاستخدامها في تمييز الكلمات أثناء التلاوة
    
    try {
      // هذا مثال افتراضي، في التطبيق الحقيقي سيتم استدعاء API مناسب
      this.verseTimings = [
        { word: 0, startTime: 0, endTime: 1.2 },
        { word: 1, startTime: 1.3, endTime: 2.1 },
        // ... المزيد من التوقيتات
      ];
      
      return true;
    } catch (error) {
      console.error('خطأ في تحميل توقيتات الآية:', error);
      this.verseTimings = [];
      return false;
    }
  }

  /**
   * معالجة تحديث الوقت أثناء التشغيل
   * @private
   */
  _handleTimeUpdate() {
    if (!this.audioElement || !this.onVerseChangeCallback || this.verseTimings.length === 0) return;
    
    const currentTime = this.audioElement.currentTime;
    
    // البحث عن الكلمة الحالية بناءً على الوقت
    for (const timing of this.verseTimings) {
      if (currentTime >= timing.startTime && currentTime <= timing.endTime) {
        this.onVerseChangeCallback({
          wordIndex: timing.word,
          currentTime: currentTime
        });
        break;
      }
    }
  }
}

export default QuranRecitationTool;
