import type { TranslationResource } from "@/i18n/locales/types";

const ja = {
  common: {
    actions: {
      cancel: "キャンセル",
      close: "閉じる",
      signOut: "ログアウト",
    },
    packageStatus: { received: "受け取り済み", notified: "通知済み", pickedUp: "引き渡し済み" },
    storageBins: {
      uncategorized: {
        label: "未分類",
        description: "保管ボックスが指定されていない荷物",
      },
    },
    language: {
      selectorLabel: "言語",
      names: {
        en: "英語",
        zh: "中国語",
        ja: "日本語",
        fr: "フランス語",
        de: "ドイツ語",
      },
    },
    roles: {
      admin: "管理者",
      user: "ユーザー",
    },
    status: {
      checkingAccess: "アクセス権を確認しています…",
      checkingSession: "セッションを確認しています…",
      loading: "読み込み中…",
    },
    values: { unknown: "不明" },
  },
  navigation: {
    dashboard: "ダッシュボード",
    intake: "受付",
    myPackages: "自分の荷物",
    packages: "荷物",
    pickup: "受け取り",
    recipients: "受取人",
    settings: "設定",
    users: "ユーザー",
  },
  dashboard: {
    title: "ダッシュボード",
    description: "お預かり中の荷物の概要です。",
    metrics: {
      waitingForPickup: "受け取り待ち",
      pickedUp: "受け取り済み",
      totalPackages: "荷物の合計",
      recipients: "受取人",
    },
    awaitingPickup: {
      title: "受け取り待ちの荷物",
      packageCount_one: "{{count}} 件の荷物",
      packageCount_other: "{{count}} 件の荷物",
    },
    empty: "受け取り待ちの荷物はありません。すべて完了です！",
  },
  auth: {
    signInDescription: "ログインして荷物の受付と引き渡しを管理します。", signUpDescription: "管理者への昇格はホストが行います。一般ユーザーには関連付けられた荷物だけが表示されます。",
    signIn: "ログイン", createAccount: "アカウント作成", verificationSuccess: "メールアドレスを確認しました。通常どおりログインできます。",
    verificationError: "この確認リンクは無効か、有効期限が切れています。", name: "氏名", referralCode: "紹介コード",
    referralHelp: "最初のアカウント作成後は必須です。", email: "メールアドレス", password: "パスワード", forgotPassword: "パスワードを忘れた場合",
    passwordHelp: "8 文字以上。", unableToContinue: "続行できません",
    forgot: {
      title: "パスワードをリセット", description: "アカウントのメールアドレスを入力すると、一回限りのリセットリンクを送信します。",
      sent: "そのアドレスのアカウントが存在する場合、リセットリンクを送信しました。", send: "リセットリンクを送信", back: "ログインに戻る", error: "パスワードのリセットを要求できません",
    },
    reset: {
      title: "新しいパスワードを設定", updated: "パスワードを更新しました。", instructions: "新しいパスワードは 8 文字以上にしてください。",
      complete: "既存のセッションからログアウトしました。新しいパスワードでもう一度ログインしてください。", invalid: "このパスワードリセットリンクは無効か、有効期限が切れています。新しいリンクを要求してください。",
      invalidShort: "このパスワードリセットリンクは無効か、有効期限が切れています。", mismatch: "パスワードが一致しません。", newPassword: "新しいパスワード",
      confirmPassword: "新しいパスワードを確認", action: "パスワードをリセット", requestNew: "新しいリセットリンクを要求", error: "パスワードをリセットできません",
    },
  },
  myPackages: {
    title: "自分の荷物", description: "お預かり中の荷物を確認できます。", recipientDescription: "{{name}} さんの荷物の状況。",
    loading: "荷物を読み込み中…", errorTitle: "荷物を読み込めません", noProfileTitle: "受取人プロフィールが関連付けられていません",
    noProfileDescription: "管理者に依頼して、このアカウントを受取人プロフィールに関連付けてください。完了すると荷物がここに表示されます。",
    metrics: { waiting: "受け取り待ち", pickedUp: "受け取り済み", total: "荷物の合計" },
    sections: { current: "現在の荷物", history: "受け取り履歴", empty: "受け取り待ちの荷物はありません。" },
    status: {
      received: { label: "受付済み", description: "荷物が到着し、受け取りの準備をしています。" },
      notified: { label: "受け取り可能", description: "荷物を受け取れます。" },
      pickedUp: { label: "受け取り済み", description: "この荷物は受け取り済みです。" },
    },
    fields: { description: "説明", received: "受付日時", trackingNumber: "追跡番号", storageLocation: "保管場所", pickedUp: "受け取り日時" },
    packageFallback: "荷物", photoAlt: "荷物 {{barcode}}",
  },
  intake: {
    title: "荷物の受付", description: "到着した荷物の登録方法を選択してください。",
    actions: { start: "受付", manual: "手動受付", printLabel: "ラベルを印刷", nextPackage: "次の荷物", complete: "受付を完了" },
    manual: { title: "手動受付", description: "新しく到着した荷物を登録します。" },
    labelFirst: {
      title: "ラベル先行受付", description: "先にバーコードラベルを印刷して荷物に貼り、その後に詳細を入力します。",
      packageDetailsTitle: "荷物の詳細", printedDescription: "ラベルをプリンターに送信しました。荷物に貼ってから詳細を入力してください。",
      downloadedDescription: "ラベルの PDF をダウンロードしました。印刷して荷物に貼ってから詳細を入力してください。", pdf: "PDF",
    },
    success: {
      title: "荷物を登録しました", logged: "{{recipientName}} さんの荷物を登録しました。",
      loggedAndNotified: "{{recipientName}} さんの荷物を登録し、通知しました。", photoAlt: "荷物 {{barcode}}",
    },
    form: {
      recipient: { label: "受取人 *", placeholder: "受取人を選択…" },
      description: { label: "説明", placeholder: "例：フィギュア、電子機器…" },
      orderNumber: { label: "注文番号", placeholder: "例：ORD-12345" },
      trackingNumber: { label: "配送追跡番号", placeholder: "例：1Z999AA10123456784" },
      photo: { label: "荷物の写真", helper: "任意。JPEG、PNG、WebP、最大 5 MB。", selected: "選択済み：{{fileName}}" },
      bin: { label: "保管ボックス", placeholder: "保管ボックスを選択…" },
      notify: "受取人にメール通知を送信", submit: "荷物を登録",
    },
    errors: {
      checkRecipients: "受取人を確認できません。ページを再読み込みしてもう一度お試しください。",
      recipientRequiredForIntake: "受付を始める前に、受取人ページで受取人を追加してください。",
      recipientRequiredForLabel: "ラベルを印刷する前に、受取人ページで受取人を追加してください。",
      recipientRequiredForPackage: "荷物を追加する前に、受取人ページで受取人を追加してください。",
      photoType: "JPEG、PNG、または WebP 画像を選択してください。", photoSize: "写真は 5 MB 以下にしてください。",
      photoUpload: "荷物は保存されましたが、写真をアップロードできませんでした。",
    },
    printWindowTitle: "ラベル：{{barcode}}",
  },
  pickup: {
    title: "荷物の引き渡し", description: "バーコードをスキャンまたは入力して、荷物を引き渡し済みにします。",
    modes: { manual: "手動 / スキャナー", camera: "カメラ" },
    scanner: {
      barcodeLabel: "バーコード", placeholder: "バーコードをスキャンまたは入力…", submitLabel: "バーコードを検索",
      tip: "ヒント：USB バーコードスキャナーはこの欄に直接入力します。そのままスキャンしてください。", cameraTip: "カメラをバーコードラベルに向けてください。",
    },
    confirm: {
      title: "引き渡しの確認", description: "引き渡し済みにする前に詳細を確認してください。", barcode: "バーコード", recipient: "受取人",
      packageDescription: "説明", bin: "保管ボックス", received: "受付日", collectedBy: "受取人名（任意）",
      collectedByPlaceholder: "受け取りに来た人の名前", action: "引き渡しを確定",
    },
    success: { title: "荷物を引き渡しました", description: "{{recipientName}} さんの {{barcode}} を引き渡し済みにしました。", scanNext: "次をスキャン" },
    errors: {
      notFound: "バーコード「{{barcode}}」の荷物が見つかりません。", alreadyPickedUp: "この荷物は {{date}} にすでに引き渡されています。",
      lookupFailed: "検索に失敗しました", camera: "カメラにアクセスできません。権限を確認してください。",
    },
  },
  packages: {
    title: "荷物", description: "登録済みの荷物を表示・検索します。", searchPlaceholder: "バーコード、説明、注文番号を検索…",
    filters: { active: "保管中（引き渡し待ち）", all: "すべて" }, empty: "荷物が見つかりません。", noDescription: "説明なし",
    orderNumber: "注文：{{orderNumber}}", bin: "保管場所 {{label}}",
  },
  recipients: {
    title: "受取人", description: "この住所で荷物を受け取る友人を管理します。", add: "受取人を追加",
    empty: "受取人はまだいません。最初の友人を追加してください。", deleteLabel: "{{name}} を削除", confirmDelete: "{{name}} を削除しますか？",
    packageCount_one: "合計 {{count}} 件", packageCount_other: "合計 {{count}} 件",
    dialog: {
      title: "受取人を追加", description: "この住所で荷物を受け取る友人を追加します。", nameLabel: "氏名 *", namePlaceholder: "氏名",
      emailLabel: "メールアドレス *", emailPlaceholder: "email@example.com", phoneLabel: "電話番号", phonePlaceholder: "+81-90-…",
      notesLabel: "メモ", notesPlaceholder: "例：週末の受け取りを希望",
    },
  },
  users: {
    title: "登録ユーザー", description: "アカウントのアクセス権を確認し、各アカウントを受取人プロフィールに関連付けます。",
    referrals: {
      title: "紹介コード", description: "新しいアカウント用の一回限りのコードを生成します。使用済みコードは自動的に一覧から消えます。",
      generate: "コードを生成", loading: "有効な紹介コードを読み込み中…", empty: "有効な紹介コードはありません。", active: "有効",
      generatedBy: "{{date}} に {{name}} が生成",
    },
    card: {
      emailVerified: "メール確認済み", emailNotVerified: "メール未確認", registered: "{{date}} に登録", linkedRecipient: "関連付けた受取人",
      notLinked: "未設定", selectorLabel: "{{name}} に関連付ける受取人", selectorPlaceholder: "受取人を選択", saveLink: "関連付けを保存",
    },
    errorTitle: "登録ユーザーを読み込みまたは更新できません", loadingTitle: "登録ユーザーを読み込み中",
    loadingDescription: "アカウントと受取人プロフィールを取得しています…", emptyTitle: "登録ユーザーはいません",
    emptyDescription: "登録を完了したアカウントがここに表示されます。",
  },
  settings: {
    title: "設定", description: "保管ボックスとシステム設定を構成します。",
    bins: {
      title: "保管ボックス", description: "荷物を保管する物理的な場所を定義します。", deleteLabel: "保管ボックス {{label}} を削除",
      confirmDelete: "保管ボックス「{{label}}」を削除しますか？", defaultBadge: "デフォルト", labelPlaceholder: "ラベル（例：A-1）",
      descriptionPlaceholder: "説明（例：上段の棚）", addLabel: "保管ボックスを追加",
    },
    email: {
      title: "メール通知", description: "SMTP 設定はサーバーの .env ファイルで構成します。メール事業者や送信元アドレスなどを変更するには server/.env を編集してください。",
      current: "現在の設定はサーバー側にあります。.env の値を変更した後はサーバーを再起動してください。",
    },
  },
} satisfies TranslationResource;

export default ja;
