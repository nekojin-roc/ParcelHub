import type { TranslationResource } from "@/i18n/locales/types";

const zh = {
  common: {
    actions: {
      cancel: "取消",
      close: "关闭",
      signOut: "退出登录",
    },
    packageStatus: { received: "已接收", notified: "已通知", pickedUp: "已取件" },
    storageBins: {
      uncategorized: {
        label: "未分类",
        description: "未指定储物箱的包裹",
      },
    },
    language: {
      selectorLabel: "语言",
      names: {
        en: "英语",
        zh: "中文",
        ja: "日语",
        fr: "法语",
        de: "德语",
      },
    },
    roles: {
      admin: "管理员",
      user: "用户",
    },
    status: {
      checkingAccess: "正在检查访问权限…",
      checkingSession: "正在检查会话…",
      loading: "加载中…",
    },
    values: { unknown: "未知" },
  },
  navigation: {
    dashboard: "控制面板",
    intake: "入库",
    myPackages: "我的包裹",
    packages: "包裹",
    pickup: "取件",
    recipients: "收件人",
    settings: "设置",
    users: "用户",
  },
  dashboard: {
    title: "控制面板",
    description: "当前代管包裹概览。",
    metrics: {
      waitingForPickup: "待取件",
      pickedUp: "已取件",
      totalPackages: "包裹总数",
      recipients: "收件人",
    },
    awaitingPickup: {
      title: "待取包裹",
      packageCount_one: "{{count}} 个包裹",
      packageCount_other: "{{count}} 个包裹",
    },
    empty: "暂无待取包裹，一切就绪！",
  },
  auth: {
    signInDescription: "登录以管理包裹和取件。", signUpDescription: "管理员由主机方提升；普通用户只能查看与自己关联的包裹。",
    signIn: "登录", createAccount: "创建账户", verificationSuccess: "您的邮箱已验证，可以正常登录。",
    verificationError: "此验证链接无效或已过期。", name: "姓名", referralCode: "邀请码",
    referralHelp: "创建第一个账户后必须填写。", email: "电子邮箱", password: "密码", forgotPassword: "忘记密码？",
    passwordHelp: "至少 8 个字符。", unableToContinue: "无法继续",
    forgot: {
      title: "重置密码", description: "输入账户邮箱，我们会发送一个一次性重置链接。",
      sent: "如果该邮箱对应账户，重置链接已发送。", send: "发送重置链接", back: "返回登录", error: "无法请求重置密码",
    },
    reset: {
      title: "设置新密码", updated: "您的密码已更新。", instructions: "新密码至少使用 8 个字符。",
      complete: "现有会话已退出。请使用新密码重新登录。", invalid: "此密码重置链接无效或已过期。请请求新链接后继续。",
      invalidShort: "此密码重置链接无效或已过期。", mismatch: "两次输入的密码不一致。", newPassword: "新密码",
      confirmPassword: "确认新密码", action: "重置密码", requestNew: "请求新的重置链接", error: "无法重置密码",
    },
  },
  myPackages: {
    title: "我的包裹", description: "查看为您保管的包裹。", recipientDescription: "{{name}} 的包裹状态。",
    loading: "正在加载您的包裹…", errorTitle: "无法加载包裹", noProfileTitle: "未关联收件人资料",
    noProfileDescription: "请联系管理员，将此账户关联到您的收件人资料。关联后，您的包裹会显示在这里。",
    metrics: { waiting: "待取件", pickedUp: "已取件", total: "包裹总数" },
    sections: { current: "当前包裹", history: "取件记录", empty: "您目前没有待取包裹。" },
    status: {
      received: { label: "已接收", description: "您的包裹已到达，正在准备取件。" },
      notified: { label: "可取件", description: "您的包裹已可领取。" },
      pickedUp: { label: "已取件", description: "此包裹已领取。" },
    },
    fields: { description: "描述", received: "接收时间", trackingNumber: "追踪号", storageLocation: "存放位置", pickedUp: "取件时间" },
    packageFallback: "包裹", photoAlt: "包裹 {{barcode}}",
  },
  intake: {
    title: "包裹入库",
    description: "选择登记新到包裹的方式。",
    actions: { start: "入库", manual: "手动入库", printLabel: "打印标签", nextPackage: "下一个包裹", complete: "完成入库" },
    manual: { title: "手动入库", description: "登记一个新到包裹。" },
    labelFirst: {
      title: "先贴标签入库",
      description: "先打印条码标签并贴到包裹上，然后填写详细信息。",
      packageDetailsTitle: "包裹详情",
      printedDescription: "标签已发送到打印机。请将其贴到包裹上，然后填写详细信息。",
      downloadedDescription: "标签 PDF 已下载。请打印并贴到包裹上，然后填写详细信息。",
      pdf: "PDF",
    },
    success: {
      title: "包裹已登记",
      logged: "{{recipientName}} 的包裹已登记。",
      loggedAndNotified: "{{recipientName}} 的包裹已登记并已通知收件人。",
      photoAlt: "包裹 {{barcode}}",
    },
    form: {
      recipient: { label: "收件人 *", placeholder: "选择收件人…" },
      description: { label: "描述", placeholder: "例如：手办、电子产品…" },
      orderNumber: { label: "订单号", placeholder: "例如：ORD-12345" },
      trackingNumber: { label: "承运商追踪号", placeholder: "例如：1Z999AA10123456784" },
      photo: { label: "包裹照片", helper: "可选。支持 JPEG、PNG 或 WebP，最大 5 MB。", selected: "已选择：{{fileName}}" },
      bin: { label: "储物箱", placeholder: "选择储物箱…" },
      notify: "向收件人发送邮件通知",
      submit: "登记包裹",
    },
    errors: {
      checkRecipients: "无法检查收件人。请刷新页面后重试。",
      recipientRequiredForIntake: "开始入库前，请先在“收件人”页面添加收件人。",
      recipientRequiredForLabel: "打印包裹标签前，请先在“收件人”页面添加收件人。",
      recipientRequiredForPackage: "添加包裹前，请先在“收件人”页面添加收件人。",
      photoType: "请选择 JPEG、PNG 或 WebP 图片。",
      photoSize: "照片大小不得超过 5 MB。",
      photoUpload: "包裹已保存，但照片上传失败。",
    },
    printWindowTitle: "标签：{{barcode}}",
  },
  pickup: {
    title: "包裹取件",
    description: "扫描或输入条码，将包裹标记为已领取。",
    modes: { manual: "手动 / 扫描枪", camera: "相机" },
    scanner: {
      barcodeLabel: "条码", placeholder: "扫描或输入条码…", submitLabel: "查询条码",
      tip: "提示：USB 条码扫描枪会直接在此输入。直接扫描即可！", cameraTip: "将相机对准条码标签。",
    },
    confirm: {
      title: "确认取件", description: "标记为已领取前，请核对详细信息。", barcode: "条码", recipient: "收件人",
      packageDescription: "描述", bin: "储物箱", received: "接收日期", collectedBy: "领取人（可选）",
      collectedByPlaceholder: "领取人的姓名", action: "确认取件",
    },
    success: { title: "包裹已领取", description: "{{recipientName}} 的包裹 {{barcode}} 已标记为已取件。", scanNext: "扫描下一个" },
    errors: {
      notFound: "未找到条码为“{{barcode}}”的包裹。", alreadyPickedUp: "此包裹已于 {{date}} 领取。",
      lookupFailed: "查询失败", camera: "无法访问相机，请检查权限。",
    },
  },
  packages: {
    title: "包裹", description: "查看和搜索所有已登记包裹。", searchPlaceholder: "搜索条码、描述、订单号…",
    filters: { active: "当前（待取）", all: "全部" }, empty: "未找到包裹。", noDescription: "无描述",
    orderNumber: "订单：{{orderNumber}}", bin: "储物箱 {{label}}",
  },
  recipients: {
    title: "收件人", description: "管理在您地址收取包裹的朋友。", add: "添加收件人",
    empty: "还没有收件人。添加第一位朋友即可开始。", deleteLabel: "删除 {{name}}", confirmDelete: "删除 {{name}}？",
    packageCount_one: "共 {{count}} 个包裹", packageCount_other: "共 {{count}} 个包裹",
    dialog: {
      title: "添加收件人", description: "添加一位在您地址收取包裹的朋友。", nameLabel: "姓名 *", namePlaceholder: "完整姓名",
      emailLabel: "电子邮箱 *", emailPlaceholder: "email@example.com", phoneLabel: "电话", phonePlaceholder: "+81-90-…",
      notesLabel: "备注", notesPlaceholder: "例如：希望周末取件",
    },
  },
  users: {
    title: "注册用户", description: "查看账户权限，并将每个账户关联到收件人资料。",
    referrals: {
      title: "邀请码", description: "为新账户生成一次性邀请码。已使用的邀请码会自动从列表中移除。", generate: "生成邀请码",
      loading: "正在加载有效邀请码…", empty: "没有有效邀请码。", active: "有效", generatedBy: "由 {{name}} 于 {{date}} 生成",
    },
    card: {
      emailVerified: "邮箱已验证", emailNotVerified: "邮箱未验证", registered: "注册于 {{date}}", linkedRecipient: "关联的收件人",
      notLinked: "未关联", selectorLabel: "与 {{name}} 关联的收件人", selectorPlaceholder: "选择收件人", saveLink: "保存关联",
    },
    errorTitle: "无法加载或更新注册用户", loadingTitle: "正在加载注册用户", loadingDescription: "正在获取账户和收件人资料…",
    emptyTitle: "没有注册用户", emptyDescription: "账户完成注册后会显示在这里。",
  },
  settings: {
    title: "设置", description: "配置储物箱和系统偏好。",
    bins: {
      title: "储物箱", description: "定义存放包裹的实际位置。", deleteLabel: "删除储物箱 {{label}}", confirmDelete: "删除储物箱“{{label}}”？", defaultBadge: "默认",
      labelPlaceholder: "标签（例如 A-1）", descriptionPlaceholder: "描述（例如 顶层货架）", addLabel: "添加储物箱",
    },
    email: {
      title: "邮件通知", description: "SMTP 设置通过服务器的 .env 文件配置。编辑 server/.env 可更改邮件服务商、发件人地址等。",
      current: "当前配置位于服务器端。更改 .env 值后请重启服务器。",
    },
  },
} satisfies TranslationResource;

export default zh;
