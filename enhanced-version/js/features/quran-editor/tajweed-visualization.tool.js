/**
 * أداة التجويد المرئي لمحرر فيديو القرآن
 * توفر واجهة برمجية لعرض وتلوين علامات التجويد في النص القرآني
 */

class TajweedVisualizationTool {
  constructor() {
    this.tajweedRules = [];
    this.colorScheme = 'default';
    this.customColors = {};
    this.educationalMode = false;
    this.initialized = false;
  }

  /**
   * تهيئة أداة التجويد المرئي
   * @returns {Promise} وعد يتم حله عند اكتمال التهيئة
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // تحميل قواعد التجويد
      await this._loadTajweedRules();
      
      // تهيئة مخططات الألوان
      this._initializeColorSchemes();
      
      this.initialized = true;
      console.log('تم تهيئة أداة التجويد المرئي بنجاح');
    } catch (error) {
      console.error('خطأ في تهيئة أداة التجويد المرئي:', error);
    }
    
    return this.initialized;
  }

  /**
   * تطبيق علامات التجويد على النص القرآني
   * @param {string} verseText نص الآية
   * @param {boolean} withExplanation إضافة شرح لقواعد التجويد
   * @returns {Object} كائن يحتوي على النص المُعلَّم وشرح القواعد
   */
  applyTajweedMarking(verseText, withExplanation = false) {
    if (!this.initialized) {
      console.warn('أداة التجويد المرئي غير مهيأة بعد');
      return { markedText: verseText, explanations: [] };
    }
    
    let markedText = verseText;
    const appliedRules = [];
    
    // تطبيق كل قاعدة من قواعد التجويد على النص
    for (const rule of this.tajweedRules) {
      const { pattern, color, name, description } = rule;
      const colorCode = this._getColorForRule(rule.type);
      
      // البحث عن الأنماط في النص وتطبيق التلوين
      let match;
      let tempText = markedText;
      let positions = [];
      
      const regex = new RegExp(pattern, 'g');
      while ((match = regex.exec(verseText)) !== null) {
        positions.push({ index: match.index, length: match[0].length });
        appliedRules.push({ type: rule.type, name, description });
      }
      
      // تطبيق التلوين من النهاية إلى البداية لتجنب مشاكل الإزاحة
      positions.sort((a, b) => b.index - a.index);
      for (const pos of positions) {
        const before = tempText.substring(0, pos.index);
        const highlighted = tempText.substring(pos.index, pos.index + pos.length);
        const after = tempText.substring(pos.index + pos.length);
        
        tempText = before + `<span class="tajweed-${rule.type}" style="color:${colorCode};">${highlighted}</span>` + after;
      }
      
      markedText = tempText;
    }
    
    // إعداد الشروحات إذا كان مطلوباً
    const explanations = withExplanation ? this._prepareExplanations(appliedRules) : [];
    
    return {
      markedText,
      explanations
    };
  }

  /**
   * تعيين مخطط الألوان
   * @param {string} schemeName اسم المخطط ('default', 'high-contrast', 'pastel', 'custom')
   * @returns {boolean} نجاح العملية
   */
  setColorScheme(schemeName) {
    if (['default', 'high-contrast', 'pastel', 'custom'].includes(schemeName)) {
      this.colorScheme = schemeName;
      console.log('تم تعيين مخطط الألوان:', schemeName);
      return true;
    }
    return false;
  }

  /**
   * تخصيص لون لقاعدة تجويد معينة
   * @param {string} ruleType نوع القاعدة
   * @param {string} colorCode كود اللون (مثل #FF0000)
   * @returns {boolean} نجاح العملية
   */
  setCustomColor(ruleType, colorCode) {
    if (this.tajweedRules.some(rule => rule.type === ruleType)) {
      this.customColors[ruleType] = colorCode;
      
      // تعيين المخطط إلى 'custom' تلقائياً
      this.colorScheme = 'custom';
      
      console.log('تم تخصيص لون لقاعدة:', ruleType, colorCode);
      return true;
    }
    return false;
  }

  /**
   * تفعيل أو تعطيل الوضع التعليمي
   * @param {boolean} enabled حالة التفعيل
   */
  setEducationalMode(enabled) {
    this.educationalMode = Boolean(enabled);
    console.log('تم', this.educationalMode ? 'تفعيل' : 'تعطيل', 'الوضع التعليمي');
  }

  /**
   * الحصول على قائمة قواعد التجويد المدعومة
   * @returns {Array} قائمة القواعد
   */
  getTajweedRules() {
    return this.tajweedRules.map(rule => ({
      type: rule.type,
      name: rule.name,
      description: rule.description,
      color: this._getColorForRule(rule.type)
    }));
  }

  /**
   * تحميل قواعد التجويد
   * @private
   */
  async _loadTajweedRules() {
    // في التطبيق الحقيقي، يمكن تحميل هذه القواعد من ملف خارجي أو API
    this.tajweedRules = [
      {
        type: 'ghunnah',
        name: 'غُنَّة',
        description: 'صوت يخرج من الخيشوم، مقداره حركتان',
        pattern: 'ّ?[نم]ّ?',
        examples: ['مِنْ', 'عَمَّ']
      },
      {
        type: 'ikhfa',
        name: 'إخفاء',
        description: 'إخفاء النون الساكنة أو التنوين عند حروف الإخفاء',
        pattern: '[ًٌٍْن]\\s*[تثجدذزسشصضطظفقك]',
        examples: ['مِنْ تَحْتِهَا', 'عَلِيمٌ حَكِيمٌ']
      },
      {
        type: 'idgham',
        name: 'إدغام',
        description: 'إدغام النون الساكنة أو التنوين في حروف (يرملون)',
        pattern: '[ًٌٍْن]\\s*[يرملون]',
        examples: ['مِنْ رَّبِّهِمْ', 'غَفُورٌ رَّحِيمٌ']
      },
      {
        type: 'iqlab',
        name: 'إقلاب',
        description: 'قلب النون الساكنة أو التنوين إلى ميم عند الباء',
        pattern: '[ًٌٍْن]\\s*ب',
        examples: ['مِنْ بَعْدِ', 'سَمِيعٌ بَصِيرٌ']
      },
      {
        type: 'idgham_shafawi',
        name: 'إدغام شفوي',
        description: 'إدغام الميم الساكنة في الميم',
        pattern: 'مْ\\s*م',
        examples: ['لَكُمْ مَا', 'لَهُمْ مِنْ']
      },
      {
        type: 'ikhfa_shafawi',
        name: 'إخفاء شفوي',
        description: 'إخفاء الميم الساكنة عند الباء',
        pattern: 'مْ\\s*ب',
        examples: ['هُمْ بِهِ', 'رَبَّهُمْ بِالْغَيْبِ']
      },
      {
        type: 'madd_2',
        name: 'مد طبيعي',
        description: 'مد بمقدار حركتين',
        pattern: '[َُِ][اوي]',
        examples: ['قَالَ', 'يَقُولُ', 'فِي']
      },
      {
        type: 'madd_4',
        name: 'مد متصل',
        description: 'مد بمقدار 4-5 حركات',
        pattern: '[َُِ][اوي]ء',
        examples: ['جَاءَ', 'سُوءَ', 'جِيءَ']
      },
      {
        type: 'madd_6',
        name: 'مد لازم',
        description: 'مد بمقدار 6 حركات',
        pattern: '[َُِ][اوي]ّ',
        examples: ['الضَّالِّينَ', 'دَابَّةٍ']
      },
      {
        type: 'qalqalah',
        name: 'قلقلة',
        description: 'اضطراب المخرج عند النطق بالحرف ساكناً',
        pattern: '[قطبجد]ْ',
        examples: ['يَخْلُقْ', 'أَحَطْتُ', 'يَبْغُونَ']
      }
    ];
  }

  /**
   * تهيئة مخططات الألوان
   * @private
   */
  _initializeColorSchemes() {
    this.colorSchemes = {
      'default': {
        'ghunnah': '#FF7F7F',      // أحمر فاتح
        'ikhfa': '#FFA500',        // برتقالي
        'idgham': '#32CD32',       // أخضر ليموني
        'iqlab': '#87CEEB',        // أزرق سماوي
        'idgham_shafawi': '#9370DB', // بنفسجي
        'ikhfa_shafawi': '#40E0D0', // فيروزي
        'madd_2': '#FFD700',       // ذهبي
        'madd_4': '#FF69B4',       // وردي
        'madd_6': '#FF4500',       // أحمر برتقالي
        'qalqalah': '#7B68EE'      // أزرق بنفسجي
      },
      'high-contrast': {
        'ghunnah': '#FF0000',      // أحمر
        'ikhfa': '#FF8C00',        // برتقالي داكن
        'idgham': '#008000',       // أخضر
        'iqlab': '#0000FF',        // أزرق
        'idgham_shafawi': '#800080', // أرجواني
        'ikhfa_shafawi': '#008B8B', // فيروزي داكن
        'madd_2': '#DAA520',       // ذهبي داكن
        'madd_4': '#C71585',       // فوشيا
        'madd_6': '#B22222',       // أحمر طوبي
        'qalqalah': '#4B0082'      // نيلي
      },
      'pastel': {
        'ghunnah': '#FFB6C1',      // وردي فاتح
        'ikhfa': '#FFDAB9',        // خوخي
        'idgham': '#98FB98',       // أخضر فاتح
        'iqlab': '#ADD8E6',        // أزرق فاتح
        'idgham_shafawi': '#D8BFD8', // أرجواني فاتح
        'ikhfa_shafawi': '#AFEEEE', // فيروزي فاتح
        'madd_2': '#FFFACD',       // أصفر ليموني فاتح
        'madd_4': '#FFBBFF',       // وردي فاتح
        'madd_6': '#FFA07A',       // سلموني فاتح
        'qalqalah': '#CCCCFF'      // أزرق بنفسجي فاتح
      }
    };
  }

  /**
   * الحصول على لون لقاعدة تجويد معينة
   * @param {string} ruleType نوع القاعدة
   * @returns {string} كود اللون
   * @private
   */
  _getColorForRule(ruleType) {
    // إذا كان المخطط مخصصاً وتم تعيين لون لهذه القاعدة
    if (this.colorScheme === 'custom' && this.customColors[ruleType]) {
      return this.customColors[ruleType];
    }
    
    // استخدام المخطط المحدد
    return this.colorSchemes[this.colorScheme][ruleType] || '#000000';
  }

  /**
   * إعداد شروحات لقواعد التجويد المطبقة
   * @param {Array} appliedRules القواعد المطبقة
   * @returns {Array} قائمة الشروحات
   * @private
   */
  _prepareExplanations(appliedRules) {
    // إزالة التكرار من القواعد المطبقة
    const uniqueRules = [];
    const ruleTypes = new Set();
    
    for (const rule of appliedRules) {
      if (!ruleTypes.has(rule.type)) {
        ruleTypes.add(rule.type);
        uniqueRules.push(rule);
      }
    }
    
    // إعداد الشروحات
    return uniqueRules.map(rule => ({
      type: rule.type,
      name: rule.name,
      description: rule.description,
      color: this._getColorForRule(rule.type)
    }));
  }
}

export default TajweedVisualizationTool;
