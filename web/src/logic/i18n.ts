export type Lang = 'zh' | 'en' | 'ja' | 'ko' | 'fr' | 'de' | 'es' | 'pt' | 'ru' | 'ar';

export const supportedLangs: { id: Lang; label: string; native: string }[] = [
  { id: 'zh', label: '中文', native: '中文' },
  { id: 'en', label: 'English', native: 'English' },
  { id: 'ja', label: '日本語', native: '日本語' },
  { id: 'ko', label: '한국어', native: '한국어' },
  { id: 'fr', label: 'Français', native: 'Français' },
  { id: 'de', label: 'Deutsch', native: 'Deutsch' },
  { id: 'es', label: 'Español', native: 'Español' },
  { id: 'pt', label: 'Português', native: 'Português' },
  { id: 'ru', label: 'Русский', native: 'Русский' },
  { id: 'ar', label: 'العربية', native: 'العربية' },
];

export function resolveLang(settingsLang: string): Lang {
  if (settingsLang !== 'auto') {
    const found = supportedLangs.find((l) => l.id === settingsLang);
    if (found) return found.id;
  }
  const nav = navigator.language.slice(0, 2).toLowerCase();
  const match = supportedLangs.find((l) => l.id === nav);
  return match?.id ?? 'zh';
}

export const weekdays: Record<Lang, string[]> = {
  zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  ja: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  ko: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  pt: ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
  ru: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'],
  ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
};

// UI text translations
type TextKey = 'clock' | 'timer' | 'stopwatch' | 'countdown' | 'focus' | 'settings'
  | 'start' | 'pause' | 'reset' | 'lap' | 'back'
  | 'theme' | 'timeFormat' | 'h24' | 'h12' | 'showSeconds' | 'signature'
  | 'signaturePlaceholder' | 'language' | 'timezone' | 'detected' | 'close'
  | 'timerGuide' | 'timerGuideTop' | 'timerGuideBot'
  | 'timeUp' | 'restart'
  | 'focusMode' | 'shortBreak' | 'longBreak' | 'completed' | 'focusDone' | 'breakDone'
  | 'day' | 'customDate' | 'datePlaceholder'
  | 'scrollUp' | 'scrollDown' | 'tapHint'
  | 'newyear' | 'valentine' | 'christmas' | 'nye';

const ui: Record<Lang, Record<TextKey, string>> = {
  zh: {
    clock: '时钟', timer: '计时', stopwatch: '秒表', countdown: '倒数', focus: '专注', settings: '设置',
    start: '开始', pause: '暂停', reset: '重置', lap: '计圈', back: '返回',
    theme: '主题', timeFormat: '时间格式', h24: '24 小时', h12: '12 小时',
    showSeconds: '显示秒', signature: '签名', signaturePlaceholder: '输入自定义签名...',
    language: '语言', timezone: '时区', detected: '检测到', close: '返回',
    timerGuide: '计时器操作指引', timerGuideTop: '点击上半区 +1', timerGuideBot: '点击下半区 −1',
    timeUp: '时间到！', restart: '重新开始',
    focusMode: '专注', shortBreak: '短休息', longBreak: '长休息', completed: '完成',
    focusDone: '专注完成！休息一下', breakDone: '休息结束，继续专注！',
    day: '天', customDate: '自定义', datePlaceholder: '选择日期...',
    scrollUp: '滚轮上滚 +1', scrollDown: '滚轮下滚 −1', tapHint: '轻触切换',
    newyear: '元旦', valentine: '情人节', christmas: '圣诞节', nye: '除夕',
  },
  en: {
    clock: 'Clock', timer: 'Timer', stopwatch: 'Stopwatch', countdown: 'Countdown', focus: 'Focus', settings: 'Settings',
    start: 'Start', pause: 'Pause', reset: 'Reset', lap: 'Lap', back: 'Back',
    theme: 'Theme', timeFormat: 'Time Format', h24: '24-Hour', h12: '12-Hour',
    showSeconds: 'Show Seconds', signature: 'Signature', signaturePlaceholder: 'Enter signature...',
    language: 'Language', timezone: 'Timezone', detected: 'Detected', close: 'Back',
    timerGuide: 'Timer Controls', timerGuideTop: 'Tap top half ＋1', timerGuideBot: 'Tap bottom half −1',
    timeUp: 'Time\'s up!', restart: 'Restart',
    focusMode: 'Focus', shortBreak: 'Short Break', longBreak: 'Long Break', completed: 'Done',
    focusDone: 'Focus done! Take a break', breakDone: 'Break over, back to focus!',
    day: 'd', customDate: 'Custom', datePlaceholder: 'Pick a date...',
    scrollUp: 'Scroll up ＋1', scrollDown: 'Scroll down −1', tapHint: 'Tap to toggle',
    newyear: "New Year's Day", valentine: "Valentine's Day", christmas: 'Christmas', nye: "New Year's Eve",
  },
  ja: {
    clock: '時計', timer: 'タイマー', stopwatch: 'ストップウォッチ', countdown: 'カウントダウン', focus: '集中', settings: '設定',
    start: '開始', pause: '停止', reset: 'リセット', lap: 'ラップ', back: '戻る',
    theme: 'テーマ', timeFormat: '時刻形式', h24: '24時間', h12: '12時間',
    showSeconds: '秒を表示', signature: '署名', signaturePlaceholder: '署名を入力...',
    language: '言語', timezone: 'タイムゾーン', detected: '検出', close: '戻る',
    timerGuide: 'タイマー操作', timerGuideTop: '上半分タップ ＋1', timerGuideBot: '下半分タップ −1',
    timeUp: '時間です！', restart: '再開',
    focusMode: '集中', shortBreak: '小休憩', longBreak: '長休憩', completed: '完了',
    focusDone: '集中完了！休憩しましょう', breakDone: '休憩終了、集中に戻ろう！',
    day: '日', customDate: 'カスタム', datePlaceholder: '日付を選択...',
    scrollUp: '上スクロール ＋1', scrollDown: '下スクロール −1', tapHint: 'タップ切替',
    newyear: '元旦', valentine: 'バレンタイン', christmas: 'クリスマス', nye: '大晦日',
  },
  ko: {
    clock: '시계', timer: '타이머', stopwatch: '스톱워치', countdown: '카운트다운', focus: '집중', settings: '설정',
    start: '시작', pause: '일시정지', reset: '초기화', lap: '랩', back: '뒤로',
    theme: '테마', timeFormat: '시간 형식', h24: '24시간', h12: '12시간',
    showSeconds: '초 표시', signature: '서명', signaturePlaceholder: '서명 입력...',
    language: '언어', timezone: '시간대', detected: '감지됨', close: '뒤로',
    timerGuide: '타이머 조작', timerGuideTop: '상단 탭 ＋1', timerGuideBot: '하단 탭 −1',
    timeUp: '시간 종료!', restart: '재시작',
    focusMode: '집중', shortBreak: '짧은 휴식', longBreak: '긴 휴식', completed: '완료',
    focusDone: '집중 완료! 휴식하세요', breakDone: '휴식 종료, 다시 집중!',
    day: '일', customDate: '사용자 지정', datePlaceholder: '날짜 선택...',
    scrollUp: '위로 스크롤 ＋1', scrollDown: '아래로 스크롤 −1', tapHint: '탭 전환',
    newyear: '새해 첫날', valentine: '밸런타인데이', christmas: '크리스마스', nye: '새해 전날',
  },
  fr: {
    clock: 'Horloge', timer: 'Minuteur', stopwatch: 'Chrono', countdown: 'Compte à rebours', focus: 'Focus', settings: 'Réglages',
    start: 'Démarrer', pause: 'Pause', reset: 'Réinitialiser', lap: 'Tour', back: 'Retour',
    theme: 'Thème', timeFormat: 'Format', h24: '24h', h12: '12h',
    showSeconds: 'Secondes', signature: 'Signature', signaturePlaceholder: 'Votre signature...',
    language: 'Langue', timezone: 'Fuseau', detected: 'Détecté', close: 'Retour',
    timerGuide: 'Contrôles', timerGuideTop: 'Haut ＋1', timerGuideBot: 'Bas −1',
    timeUp: 'Temps écoulé!', restart: 'Relancer',
    focusMode: 'Focus', shortBreak: 'Pause courte', longBreak: 'Pause longue', completed: 'Fini',
    focusDone: 'Focus terminé! Pause', breakDone: 'Pause finie, au travail!',
    day: 'j', customDate: 'Personnalisé', datePlaceholder: 'Choisir une date...',
    scrollUp: 'Défiler haut ＋1', scrollDown: 'Défiler bas −1', tapHint: 'Tapoter',
    newyear: 'Nouvel An', valentine: 'Saint-Valentin', christmas: 'Noël', nye: 'Saint-Sylvestre',
  },
  de: {
    clock: 'Uhr', timer: 'Timer', stopwatch: 'Stoppuhr', countdown: 'Countdown', focus: 'Fokus', settings: 'Einstellungen',
    start: 'Start', pause: 'Pause', reset: 'Zurücksetzen', lap: 'Runde', back: 'Zurück',
    theme: 'Design', timeFormat: 'Zeitformat', h24: '24h', h12: '12h',
    showSeconds: 'Sekunden', signature: 'Signatur', signaturePlaceholder: 'Signatur eingeben...',
    language: 'Sprache', timezone: 'Zeitzone', detected: 'Erkannt', close: 'Zurück',
    timerGuide: 'Steuerung', timerGuideTop: 'Oben tippen ＋1', timerGuideBot: 'Unten tippen −1',
    timeUp: 'Zeit abgelaufen!', restart: 'Neustart',
    focusMode: 'Fokus', shortBreak: 'Kurze Pause', longBreak: 'Lange Pause', completed: 'Fertig',
    focusDone: 'Fokus fertig! Pause machen', breakDone: 'Pause vorbei, weiter!',
    day: 'T', customDate: 'Benutzerdefiniert', datePlaceholder: 'Datum wählen...',
    scrollUp: 'Hochscrollen ＋1', scrollDown: 'Runterscrollen −1', tapHint: 'Tippen',
    newyear: 'Neujahr', valentine: 'Valentinstag', christmas: 'Weihnachten', nye: 'Silvester',
  },
  es: {
    clock: 'Reloj', timer: 'Temporizador', stopwatch: 'Cronómetro', countdown: 'Cuenta atrás', focus: 'Enfoque', settings: 'Ajustes',
    start: 'Iniciar', pause: 'Pausa', reset: 'Reiniciar', lap: 'Vuelta', back: 'Volver',
    theme: 'Tema', timeFormat: 'Formato', h24: '24h', h12: '12h',
    showSeconds: 'Segundos', signature: 'Firma', signaturePlaceholder: 'Tu firma...',
    language: 'Idioma', timezone: 'Zona horaria', detected: 'Detectado', close: 'Volver',
    timerGuide: 'Controles', timerGuideTop: 'Arriba ＋1', timerGuideBot: 'Abajo −1',
    timeUp: '¡Tiempo!', restart: 'Reiniciar',
    focusMode: 'Enfoque', shortBreak: 'Descanso corto', longBreak: 'Descanso largo', completed: 'Hecho',
    focusDone: '¡Enfoque completado! Descansa', breakDone: '¡Descanso terminado!',
    day: 'd', customDate: 'Personalizado', datePlaceholder: 'Elegir fecha...',
    scrollUp: 'Desplazar arriba ＋1', scrollDown: 'Desplazar abajo −1', tapHint: 'Tocar',
    newyear: 'Año Nuevo', valentine: 'San Valentín', christmas: 'Navidad', nye: 'Nochevieja',
  },
  pt: {
    clock: 'Relógio', timer: 'Timer', stopwatch: 'Cronômetro', countdown: 'Contagem', focus: 'Foco', settings: 'Configurações',
    start: 'Iniciar', pause: 'Pausar', reset: 'Redefinir', lap: 'Volta', back: 'Voltar',
    theme: 'Tema', timeFormat: 'Formato', h24: '24h', h12: '12h',
    showSeconds: 'Segundos', signature: 'Assinatura', signaturePlaceholder: 'Sua assinatura...',
    language: 'Idioma', timezone: 'Fuso', detected: 'Detectado', close: 'Voltar',
    timerGuide: 'Controles', timerGuideTop: 'Topo ＋1', timerGuideBot: 'Base −1',
    timeUp: 'Tempo esgotado!', restart: 'Recomeçar',
    focusMode: 'Foco', shortBreak: 'Pausa curta', longBreak: 'Pausa longa', completed: 'Pronto',
    focusDone: 'Foco concluído! Descanse', breakDone: 'Pausa encerrada!',
    day: 'd', customDate: 'Personalizado', datePlaceholder: 'Escolher data...',
    scrollUp: 'Rolar p/cima ＋1', scrollDown: 'Rolar p/baixo −1', tapHint: 'Tocar',
    newyear: 'Ano Novo', valentine: 'Dia dos Namorados', christmas: 'Natal', nye: 'Véspera de Ano Novo',
  },
  ru: {
    clock: 'Часы', timer: 'Таймер', stopwatch: 'Секундомер', countdown: 'Обратный отсчёт', focus: 'Фокус', settings: 'Настройки',
    start: 'Старт', pause: 'Пауза', reset: 'Сброс', lap: 'Круг', back: 'Назад',
    theme: 'Тема', timeFormat: 'Формат', h24: '24ч', h12: '12ч',
    showSeconds: 'Секунды', signature: 'Подпись', signaturePlaceholder: 'Ваша подпись...',
    language: 'Язык', timezone: 'Часовой пояс', detected: 'Определён', close: 'Назад',
    timerGuide: 'Управление', timerGuideTop: 'Верх ＋1', timerGuideBot: 'Низ −1',
    timeUp: 'Время вышло!', restart: 'Заново',
    focusMode: 'Фокус', shortBreak: 'Короткий перерыв', longBreak: 'Длинный перерыв', completed: 'Готово',
    focusDone: 'Фокус завершён! Отдых', breakDone: 'Перерыв окончен!',
    day: 'д', customDate: 'Своя дата', datePlaceholder: 'Выбрать дату...',
    scrollUp: 'Прокрутка вверх ＋1', scrollDown: 'Прокрутка вниз −1', tapHint: 'Нажать',
    newyear: 'Новый год', valentine: 'День Валентина', christmas: 'Рождество', nye: 'Канун Нового года',
  },
  ar: {
    clock: 'ساعة', timer: 'مؤقت', stopwatch: 'ساعة توقيت', countdown: 'عد تنازلي', focus: 'تركيز', settings: 'إعدادات',
    start: 'بدء', pause: 'إيقاف', reset: 'إعادة', lap: 'لفة', back: 'رجوع',
    theme: 'السمة', timeFormat: 'صيغة الوقت', h24: '24 ساعة', h12: '12 ساعة',
    showSeconds: 'إظهار الثواني', signature: 'توقيع', signaturePlaceholder: 'أدخل توقيعك...',
    language: 'اللغة', timezone: 'المنطقة الزمنية', detected: 'تم الاكتشاف', close: 'رجوع',
    timerGuide: 'عناصر التحكم', timerGuideTop: 'النصف العلوي ＋1', timerGuideBot: 'النصف السفلي −1',
    timeUp: 'انتهى الوقت!', restart: 'إعادة',
    focusMode: 'تركيز', shortBreak: 'استراحة قصيرة', longBreak: 'استراحة طويلة', completed: 'تم',
    focusDone: 'اكتمل التركيز! استرح', breakDone: 'انتهت الاستراحة!',
    day: 'يوم', customDate: 'مخصص', datePlaceholder: 'اختر تاريخاً...',
    scrollUp: 'تمرير لأعلى ＋1', scrollDown: 'تمرير لأسفل −1', tapHint: 'انقر',
    newyear: 'رأس السنة', valentine: 'عيد الحب', christmas: 'عيد الميلاد', nye: 'ليلة رأس السنة',
  },
};

export function t(lang: Lang, key: TextKey): string {
  return ui[lang]?.[key] ?? ui.zh[key] ?? key;
}
