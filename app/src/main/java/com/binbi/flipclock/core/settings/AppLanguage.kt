package com.binbi.flipclock.core.settings

import java.util.Locale

enum class AppLanguage(
    val id: String,
    val label: String,
    val nativeLabel: String,
    val localeTag: String,
) {
    AUTO("auto", "Auto", "Auto", ""),
    ZH("zh", "Chinese", "中文", "zh-CN"),
    EN("en", "English", "English", "en-US"),
    JA("ja", "Japanese", "日本語", "ja-JP"),
    KO("ko", "Korean", "한국어", "ko-KR"),
    FR("fr", "French", "Français", "fr-FR"),
    DE("de", "German", "Deutsch", "de-DE"),
    ES("es", "Spanish", "Español", "es-ES"),
    PT("pt", "Portuguese", "Português", "pt-BR"),
    RU("ru", "Russian", "Русский", "ru-RU"),
    AR("ar", "Arabic", "العربية", "ar-SA");

    companion object {
        val selectable: List<AppLanguage> = entries.toList()

        fun fromId(id: String?): AppLanguage = selectable.firstOrNull { it.id == id } ?: AUTO
    }
}

fun resolveAppLanguage(
    storedLanguage: String,
    systemLocale: Locale = Locale.getDefault(),
): AppLanguage {
    val explicit = AppLanguage.fromId(storedLanguage)
    if (explicit != AppLanguage.AUTO) {
        return explicit
    }
    val systemCode = systemLocale.language.lowercase(Locale.ROOT)
    return AppLanguage.selectable.firstOrNull { it.id == systemCode } ?: AppLanguage.EN
}

fun appLocale(language: AppLanguage, systemLocale: Locale = Locale.getDefault()): Locale =
    when (language) {
        AppLanguage.AUTO -> systemLocale
        else -> Locale.forLanguageTag(language.localeTag)
    }

fun defaultSignatureFor(language: AppLanguage): String =
    when (language) {
        AppLanguage.AUTO -> "Flip Clock"
        AppLanguage.ZH -> "翻页时钟"
        AppLanguage.EN -> "Flip Clock"
        AppLanguage.JA -> "フリップクロック"
        AppLanguage.KO -> "플립 시계"
        AppLanguage.FR -> "Horloge flip"
        AppLanguage.DE -> "Flip-Uhr"
        AppLanguage.ES -> "Reloj flip"
        AppLanguage.PT -> "Relógio flip"
        AppLanguage.RU -> "Перекидные часы"
        AppLanguage.AR -> "ساعة فليب"
    }

fun labelFor(language: AppLanguage, key: String): String {
    val index = when (language) {
        AppLanguage.ZH -> 0
        AppLanguage.EN -> 1
        AppLanguage.JA -> 2
        AppLanguage.KO -> 3
        AppLanguage.FR -> 4
        AppLanguage.DE -> 5
        AppLanguage.ES -> 6
        AppLanguage.PT -> 7
        AppLanguage.RU -> 8
        AppLanguage.AR -> 9
        AppLanguage.AUTO -> 1
    }

    return labels[key]?.get(index) ?: labels[key]?.get(1) ?: key
}

private val labels: Map<String, List<String>> = mapOf(
    "clock" to listOf("时钟", "Clock", "時計", "시계", "Horloge", "Uhr", "Reloj", "Relógio", "Часы", "ساعة"),
    "timer" to listOf("计时", "Timer", "タイマー", "타이머", "Minuteur", "Timer", "Temporizador", "Timer", "Таймер", "مؤقت"),
    "stopwatch" to listOf("秒表", "Stopwatch", "ストップウォッチ", "스톱워치", "Chrono", "Stoppuhr", "Cronómetro", "Cronômetro", "Секундомер", "ساعة توقيت"),
    "countdown" to listOf("倒数", "Countdown", "カウントダウン", "카운트다운", "Compte à rebours", "Countdown", "Cuenta atrás", "Contagem", "Обратный отсчёт", "عد تنازلي"),
    "focus" to listOf("专注", "Focus", "集中", "집중", "Focus", "Fokus", "Enfoque", "Foco", "Фокус", "تركيز"),
    "settings" to listOf("设置", "Settings", "設定", "설정", "Réglages", "Einstellungen", "Ajustes", "Configurações", "Настройки", "إعدادات"),
    "back" to listOf("返回", "Back", "戻る", "뒤로", "Retour", "Zurück", "Volver", "Voltar", "Назад", "رجوع"),
    "theme" to listOf("主题", "Theme", "テーマ", "테마", "Thème", "Design", "Tema", "Tema", "Тема", "السمة"),
    "time_format" to listOf("时间格式", "Time Format", "時刻形式", "시간 형식", "Format", "Zeitformat", "Formato", "Formato", "Формат", "صيغة الوقت"),
    "show_seconds" to listOf("显示秒", "Show Seconds", "秒を表示", "초 표시", "Secondes", "Sekunden", "Segundos", "Segundos", "Секунды", "إظهار الثواني"),
    "signature" to listOf("签名", "Signature", "署名", "서명", "Signature", "Signatur", "Firma", "Assinatura", "Подпись", "توقيع"),
    "signature_placeholder" to listOf("输入自定义签名...", "Enter a custom signature...", "署名を入力...", "서명을 입력...", "Entrez une signature...", "Signatur eingeben...", "Escribe una firma...", "Digite uma assinatura...", "Введите подпись...", "أدخل توقيعاً..."),
    "language" to listOf("语言", "Language", "言語", "언어", "Langue", "Sprache", "Idioma", "Idioma", "Язык", "اللغة"),
    "timezone" to listOf("时区", "Timezone", "タイムゾーン", "시간대", "Fuseau", "Zeitzone", "Zona horaria", "Fuso", "Часовой пояс", "المنطقة الزمنية"),
    "auto" to listOf("自动", "Auto", "自動", "자동", "Auto", "Auto", "Auto", "Auto", "Авто", "تلقائي"),
    "detected" to listOf("检测到", "Detected", "検出", "감지됨", "Détecté", "Erkannt", "Detectado", "Detectado", "Определён", "تم الاكتشاف"),
    "paper_desk" to listOf("Paper Desk", "Paper Desk", "Paper Desk", "Paper Desk", "Paper Desk", "Paper Desk", "Paper Desk", "Paper Desk", "Paper Desk", "Paper Desk"),
    "classic_black" to listOf("经典黑", "Classic Black", "クラシックブラック", "클래식 블랙", "Noir classique", "Klassisch Schwarz", "Negro clásico", "Preto clássico", "Классический чёрный", "أسود كلاسيكي"),
    "pure_black" to listOf("纯黑夜间", "Pure Black", "ピュアブラック", "퓨어 블랙", "Noir pur", "Tiefschwarz", "Negro puro", "Preto puro", "Чистый чёрный", "أسود خالص"),
    "no_target" to listOf("未选择目标", "No target", "対象なし", "선택된 목표 없음", "Aucune cible", "Kein Ziel", "Sin objetivo", "Sem alvo", "Нет цели", "لا يوجد هدف"),
    "days" to listOf("天", "days", "日", "일", "jours", "Tage", "días", "dias", "дней", "يوم"),
    "title" to listOf("标题", "Title", "タイトル", "제목", "Titre", "Titel", "Título", "Título", "Название", "العنوان"),
    "date_hint" to listOf("日期", "Date", "日付", "날짜", "Date", "Datum", "Fecha", "Data", "Дата", "التاريخ"),
    "add" to listOf("添加", "Add", "追加", "추가", "Ajouter", "Hinzufügen", "Añadir", "Adicionar", "Добавить", "إضافة"),
    "start" to listOf("开始", "Start", "開始", "시작", "Démarrer", "Start", "Iniciar", "Iniciar", "Старт", "بدء"),
    "pause" to listOf("暂停", "Pause", "停止", "일시정지", "Pause", "Pause", "Pausa", "Pausar", "Пауза", "إيقاف"),
    "reset" to listOf("重置", "Reset", "リセット", "재설정", "Réinitialiser", "Zurücksetzen", "Reiniciar", "Redefinir", "Сброс", "إعادة"),
    "lap" to listOf("计圈", "Lap", "ラップ", "랩", "Tour", "Runde", "Vuelta", "Volta", "Круг", "لفة"),
    "skip" to listOf("跳过", "Skip", "スキップ", "건너뛰기", "Passer", "Überspringen", "Saltar", "Pular", "Пропустить", "تخطي"),
    "timer_complete" to listOf("计时结束", "Timer complete", "タイマー完了", "타이머 완료", "Minuteur terminé", "Timer fertig", "Temporizador completo", "Timer concluído", "Таймер завершён", "اكتمل المؤقت"),
    "focus_ready" to listOf("阶段完成", "Session ready", "セッション完了", "세션 완료", "Session prête", "Phase bereit", "Sesión lista", "Sessão pronta", "Сессия завершена", "اكتملت الجلسة"),
)
